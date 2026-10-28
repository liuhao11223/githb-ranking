import { getState } from './state.js'

const BASE = 'https://api.github.com'
const cache = new Map()
const inflight = new Map()
const CACHE_TTL = {
  search: 5 * 60 * 1000,
  repo: 10 * 60 * 1000,
  releases: 10 * 60 * 1000,
  commits: 5 * 60 * 1000,
}

const token = () => String(getState().config?.token || '').trim()

const headers = () => {
  const value = { accept: 'application/vnd.github+json', 'user-agent': 'githb-ranking-workbench', 'x-github-api-version': '2022-11-28' }
  const auth = token()
  if (auth) value.authorization = `Bearer ${auth}`
  return value
}

export class GithubError extends Error {
  constructor(message, status = 502) { super(message); this.status = status }
}

const clean = (value, limit = 400) => String(value ?? '').trim().slice(0, limit)

async function request(path, { ttl = CACHE_TTL.search, force = false } = {}) {
  const key = path
  if (!force) {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < ttl) return hit.value
  }
  const running = inflight.get(key)
  if (running) return running
  const task = (async () => {
    const response = await fetch(`${BASE}${path}`, { headers: headers(), signal: AbortSignal.timeout(25000) })
    if (response.status === 401 || response.status === 403) throw new GithubError('GitHub 接口限流或需要授权，可在工作台设置里填写个人访问令牌（只需 public_repo 读取权限）', 429)
    if (response.status === 404) throw new GithubError('在 GitHub 上找不到这个仓库', 404)
    if (!response.ok) throw new GithubError(`GitHub 接口返回 HTTP ${response.status} ${clean(response.statusText, 120)}`, response.status)
    const value = await response.json()
    cache.set(key, { value, at: Date.now() })
    return value
  })().finally(() => inflight.delete(key))
  inflight.set(key, task)
  return task
}

const daysAgo = (days) => {
  const date = new Date(Date.now() - days * 86400000)
  return date.toISOString().slice(0, 10)
}

export function mapRepo(item, extra = {}) {
  return {
    owner: item.owner?.login || '', repo: item.name || '',
    fullName: item.full_name || `${item.owner?.login || ''}/${item.name || ''}`,
    url: item.html_url || `https://github.com/${item.full_name}`,
    stars: item.stargazers_count || 0, forks: item.forks_count || 0,
    language: item.language || '', description: clean(item.description, 300),
    topics: Array.isArray(item.topics) ? item.topics.slice(0, 12) : [],
    pushedAt: item.pushed_at || '', createdAt: item.created_at || '', updatedAt: item.updated_at || '',
    openIssues: item.open_issues_count ?? 0, license: item.license?.spdx_id || '',
    archived: Boolean(item.archived), homepage: item.homepage || '',
    ...extra,
  }
}

async function search(query, sort = 'stars', perPage = 25) {
  const path = `/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${perPage}`
  const payload = await request(path, { ttl: CACHE_TTL.search })
  return Array.isArray(payload.items) ? payload.items : []
}

// 今日新晋：近 7 天新建、按 star 数排序。
export async function trendingNew() {
  return search(`created:>${daysAgo(7)}`, 'stars', 30)
}

// 本周热榜：已有一定规模且最近仍在活跃的仓库。
export async function trendingHot() {
  return search(`stars:>500 pushed:>${daysAgo(7)}`, 'stars', 30)
}

// DSH 插件排名：优先主题命中的仓库（topic:deepseek-harness / topic:dsh-plugin），
// 再补充关键词命中的仓库，按「相关性 + star 数」排序。
export async function dshPlugins() {
  const topicQueries = ['topic:deepseek-harness', 'topic:dsh-plugin']
  const keywordQueries = ['deepseek harness workbench in:name,description,readme', 'dsh workbench in:name,description,readme', 'deepseek harness plugin in:name,description,readme']
  const seen = new Map()
  const add = async (query, weight) => {
    try {
      for (const item of await search(query, 'stars', 20)) {
        const key = (item.full_name || '').toLowerCase()
        if (!key || seen.has(key)) continue
        seen.set(key, { item, weight })
      }
    } catch { /* 单个查询失败不影响整体 */ }
  }
  for (const query of topicQueries) await add(query, 2)
  for (const query of keywordQueries) await add(query, 1)
  const merged = [...seen.values()]
  merged.sort((a, b) => (b.weight - a.weight) || ((b.item.stargazers_count || 0) - (a.item.stargazers_count || 0)))
  return merged.slice(0, 40).map(({ item, weight }) => ({ ...item, _dshWeight: weight }))
}

export async function repoDetail(owner, repo) {
  const payload = await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { ttl: CACHE_TTL.repo })
  const [releases, tags] = await Promise.all([
    request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=10`, { ttl: CACHE_TTL.releases }).catch(() => []),
    request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tags?per_page=20`, { ttl: CACHE_TTL.releases }).catch(() => []),
  ])
  return {
    repo: mapRepo(payload),
    releases: (Array.isArray(releases) ? releases : []).map((item) => ({
      tag: item.tag_name || '', name: clean(item.name, 200), publishedAt: item.published_at || item.created_at || '',
      draft: Boolean(item.draft), prerelease: Boolean(item.prerelease), url: item.html_url || '',
      body: clean(item.body, 500),
    })),
    tags: (Array.isArray(tags) ? tags : []).slice(0, 20).map((item) => ({ name: item.name || '', zip: item.zipball_url || '' })),
  }
}

// README 文件名识别：README.md / README.zh-CN.md / README.en.md / readme.markdown 等。
const README_NAME_RE = /^readme(\.[a-z0-9-]+)?(\.md|\.markdown)?$/i
// 语言切换的排序优先级：中文优先，默认其次，英文最后。
const variantRank = (name) => (/readme\.[a-z0-9-]*(zh|cn|-zh|-cn)[a-z0-9-]*\./i.test(name) ? 0 : /readme\.en\./i.test(name) ? 2 : 1)

async function rawFile(owner, repo, path) {
  const key = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map((segment) => encodeURIComponent(segment)).join('/')}?ref=HEAD`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL.repo) return hit.value
  const text = await fetch(`${BASE}${key}`, {
    headers: { ...headers(), accept: 'application/vnd.github.raw+json' },
    signal: AbortSignal.timeout(25000),
  }).then(async (response) => {
    if (response.status === 404) return ''
    if (response.status === 401 || response.status === 403) throw new GithubError('GitHub 接口限流或需要授权，可在工作台设置里填写个人访问令牌（只需 public_repo 读取权限）', 429)
    if (!response.ok) throw new GithubError(`GitHub 接口返回 HTTP ${response.status} ${clean(response.statusText, 120)}`, response.status)
    return response.text()
  })
  cache.set(key, { value: text, at: Date.now() })
  return text
}

// 仓库 README（自述文件）的原始 Markdown 文本；path 为空时取 GitHub 认定的默认 README，没有则返回空字符串。
export async function readme(owner, repo, path = '') {
  if (path) return rawFile(owner, repo, path)
  const key = `/repos/${owner}/${repo}/readme`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL.repo) return hit.value
  const text = await fetch(`${BASE}${key}`, {
    headers: { ...headers(), accept: 'application/vnd.github.raw+json' },
    signal: AbortSignal.timeout(25000),
  }).then(async (response) => {
    if (response.status === 404) return ''
    if (response.status === 401 || response.status === 403) throw new GithubError('GitHub 接口限流或需要授权，可在工作台设置里填写个人访问令牌（只需 public_repo 读取权限）', 429)
    if (!response.ok) throw new GithubError(`GitHub 接口返回 HTTP ${response.status} ${clean(response.statusText, 120)}`, response.status)
    return response.text()
  })
  cache.set(key, { value: text, at: Date.now() })
  return text
}

async function listDir(owner, repo, dirPath) {
  const path = dirPath
    ? `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${dirPath.split('/').map((segment) => encodeURIComponent(segment)).join('/')}?ref=HEAD`
    : `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents?ref=HEAD`
  const payload = await request(path, { ttl: CACHE_TTL.repo }).catch(() => [])
  return Array.isArray(payload) ? payload : []
}

// 仓库里可切换的 README 版本：根目录 + docs/documentation 下的 readme* 文件，返回 { default, variants:[{name,path}] }。
export async function readmeVariants(owner, repo) {
  const key = `variants:${owner}/${repo}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL.repo) return hit.value
  const found = []
  const seen = new Set()
  const push = (entry) => {
    if (entry?.type === 'file' && README_NAME_RE.test(entry.name || '') && !seen.has(entry.path)) { seen.add(entry.path); found.push({ name: entry.name, path: entry.path }) }
  }
  const dirs = []
  for (const entry of await listDir(owner, repo, '')) {
    push(entry)
    if (entry?.type === 'dir' && /^(docs|documentation)$/i.test(entry.name || '')) dirs.push(entry)
  }
  for (const dir of dirs) { for (const entry of await listDir(owner, repo, dir.path)) push(entry) }
  let defaultPath = ''
  try {
    const meta = await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`, { ttl: CACHE_TTL.repo })
    defaultPath = meta?.path || ''
  } catch { defaultPath = '' }
  found.sort((a, b) => variantRank(a.name) - variantRank(b.name))
  const value = { default: defaultPath, variants: found }
  cache.set(key, { value, at: Date.now() })
  return value
}

// 某个作者的公开仓库，按 star 数排序（用于订阅作者的变化检测）。
export async function authorRepos(login, perPage = 10) {
  const payload = await request(`/users/${encodeURIComponent(clean(login, 200))}/repos?sort=stars&order=desc&per_page=${perPage}`, { ttl: CACHE_TTL.repo }).catch(() => [])
  return (Array.isArray(payload) ? payload : []).filter((item) => !item.fork).map((item) => mapRepo(item))
}

export async function repoCommits(owner, repo, perPage = 10) {
  const payload = await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`, { ttl: CACHE_TTL.commits }).catch(() => [])
  return (Array.isArray(payload) ? payload : []).map((item) => ({
    sha: item.sha || '', shortSha: (item.sha || '').slice(0, 7),
    message: clean((item.commit?.message || '').split('\n')[0], 160),
    author: item.commit?.author?.name || item.author?.login || '', date: item.commit?.author?.date || item.commit?.committer?.date || '',
    url: item.html_url || '',
  }))
}

export function clearCache() { cache.clear() }