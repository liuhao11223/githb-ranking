import Schema from '@deepseek-ai/schemastery'
import { load, getState, save, recordSnapshot, starsDelta, pushEvent, limits } from './state.js'
import * as github from './github.js'
import { buildRankings } from './rankings.js'

export const name = 'githb-ranking'
export const inject = ['webServer', 'desktopWorkbenchOwnership']
export const Config = Schema.object({
  root: Schema.string().required(),
})

const BASE = '/api/githb-ranking'
const clean = (value, limit = 400) => String(value ?? '').trim().slice(0, limit)

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(payload))
}
const jsonError = (res, status, message) => json(res, status, { error: clean(message, 800) })

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) { size += chunk.length; if (size > 64 * 1024) throw new Error('请求内容过大'); chunks.push(chunk) }
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new Error('请求 JSON 格式无效') }
}

const rankingsCache = { value: null, at: 0 }
const RANKINGS_TTL = 60 * 1000

const ownerMap = async (ctx) => {
  try {
    const data = await ctx.desktopWorkbenchOwnership.read()
    return data?.sessionBindings || {}
  } catch { return {} }
}

function parseRepo(text) {
  const value = clean(text, 200).replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '')
  const parts = value.split('/').filter(Boolean)
  if (parts.length < 2) return null
  return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] }
}

export function apply(ctx, config) {
  const root = config.root
  const ready = load(root)

  ctx.effect(async () => {
    await ready
    ctx.webServer.register({ kind: 'prefix', path: BASE, handler })
  }, 'githb-ranking: api')

  async function runCheck(state, map) {
    const report = { checked: 0, changes: 0, errors: [] }
    for (const item of state.subscriptions) {
      if (!item.enabled) continue
      const ownerKey = map[item.id] || 'local'
      report.checked += 1
      try {
        const found = await scan(item, ownerKey)
        if (found) { report.changes += found; await save() }
      } catch (error) {
        report.errors.push(`${item.name}: ${clean(error?.message || '检查失败', 120)}`)
      }
    }
    return report
  }

  async function scan(item, ownerKey) {
    if (item.type === 'repo') {
      const detail = await github.repoDetail(item.owner, item.repo)
      const commits = await github.repoCommits(item.owner, item.repo, 1)
      const latestRelease = detail.releases.find((release) => !release.draft) || null
      const latestCommit = commits[0] || null
      let created = 0
      if (latestRelease && (!item.lastRelease || latestRelease.tag !== item.lastRelease.tag)) {
        if (item.lastRelease) {
          pushEvent({ subId: item.id, ownerKey, kind: 'release', title: `「${item.name}」发布新版本 ${latestRelease.tag}`, detail: clean(latestRelease.name || latestRelease.tag, 200), url: latestRelease.url || item.url })
          created += 1
        }
        item.lastRelease = { tag: latestRelease.tag, date: latestRelease.publishedAt, name: latestRelease.name }
      }
      if (latestCommit && (!item.lastCommit || latestCommit.sha !== item.lastCommit.sha)) {
        if (item.lastCommit) {
          pushEvent({ subId: item.id, ownerKey, kind: 'commit', title: `「${item.name}」有新提交`, detail: latestCommit.message, url: latestCommit.url })
          created += 1
        }
        item.lastCommit = { sha: latestCommit.sha, date: latestCommit.date, message: latestCommit.message }
      }
      item.lastCheckedAt = new Date().toISOString()
      return created
    }

    const items = await github.authorRepos(item.name)
    const digest = items.map((repo) => `${repo.fullName}:${repo.stars}:${repo.pushedAt}`).join('|')
    let created = 0
    if (item.baseline && digest !== item.baseline) {
      const top = items[0]
      const title = top ? `「${item.name}」的仓库榜出现变化，当前第一是 ${top.fullName}（${top.stars}★）` : `「${item.name}」的公开仓库信息有更新`
      pushEvent({ subId: item.id, ownerKey, kind: 'author', title, detail: clean(top?.description || top?.fullName || '', 200), url: top?.url || item.url })
      created += 1
    }
    item.baseline = digest
    item.lastCheckedAt = new Date().toISOString()
    return created
  }

  async function handler(req, res) {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    const path = url.pathname.slice(BASE.length).replace(/\/+$/, '') || '/'
    try {
      await ready
      const method = req.method || 'GET'
      const query = url.searchParams
      const state = getState()

      if (path === '/rankings' && method === 'GET') {
        if (rankingsCache.value && Date.now() - rankingsCache.at < RANKINGS_TTL) return json(res, 200, rankingsCache.value)
        const payload = await buildRankings()
        await save()
        rankingsCache.value = payload
        rankingsCache.at = Date.now()
        return json(res, 200, payload)
      }

      if (path === '/repo' && method === 'GET') {
        const owner = clean(query.get('owner'), 200)
        const repo = clean(query.get('repo'), 200)
        if (!owner || !repo) return jsonError(res, 400, '缺少仓库参数')
        const detail = await github.repoDetail(owner, repo)
        const [commits, variants, readmeText] = await Promise.all([
          github.repoCommits(owner, repo, 8),
          github.readmeVariants(owner, repo).catch(() => ({ default: '', variants: [] })),
          github.readme(owner, repo).catch(() => ''),
        ])
        recordSnapshot(detail.repo.fullName, detail.repo.stars, detail.repo.forks)
        await save()
        return json(res, 200, { ...detail, commits, readme: readmeText, readmeDefault: variants.default, readmeVariants: variants.variants, starsDeltaToday: starsDelta(detail.repo.fullName), snapshots: state.snapshots[detail.repo.fullName.toLowerCase()] || [] })
      }

      if (path === '/readme' && method === 'GET') {
        const owner = clean(query.get('owner'), 200)
        const repo = clean(query.get('repo'), 200)
        const filePath = clean(query.get('path'), 200)
        if (!owner || !repo) return jsonError(res, 400, '缺少仓库参数')
        if (!filePath || filePath.includes('..') || filePath.startsWith('/')) return jsonError(res, 400, '请选择仓库自述文件')
        const text = await github.readme(owner, repo, filePath)
        return json(res, 200, { path: filePath, text })
      }

      if (path === '/subscriptions' && method === 'GET') {
        return json(res, 200, { subscriptions: state.subscriptions, events: state.events.slice(0, 80), lastCheckAt: state.lastCheckAt })
      }

      if (path === '/subscriptions' && method === 'POST') {
        const body = await readJson(req)
        const type = body.type === 'author' ? 'author' : 'repo'
        const name = clean(body.name, 200)
        if (!name) return jsonError(res, 400, '请填写仓库或作者名称')
        const exists = state.subscriptions.find((item) => item.type === type && item.name.toLowerCase() === name.toLowerCase())
        if (exists) return json(res, 409, { error: '这个对象已经在追踪里了' })
        if (state.subscriptions.length >= limits.MAX_SUBSCRIPTIONS) return jsonError(res, 400, `追踪数量已达上限（${limits.MAX_SUBSCRIPTIONS}）`)
        const parsed = type === 'repo' ? parseRepo(name) : null
        if (type === 'repo' && !parsed) return jsonError(res, 400, '仓库格式应为 owner/repo 或 GitHub 仓库地址')
        const item = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, name,
          owner: parsed?.owner || '', repo: parsed?.repo || '',
          url: type === 'repo' ? `https://github.com/${parsed.owner}/${parsed.repo}` : `https://github.com/${name}`,
          createdAt: new Date().toISOString(), lastCheckedAt: '', enabled: true,
          baseline: null, lastRelease: null, lastCommit: null,
        }
        state.subscriptions.unshift(item)
        await save()
        return json(res, 200, { subscription: item })
      }

      const match = path.match(/^\/subscriptions\/([^/]+)$/)
      if (match && method === 'DELETE') {
        const id = decodeURIComponent(match[1])
        const before = state.subscriptions.length
        state.subscriptions = state.subscriptions.filter((item) => item.id !== id)
        if (state.subscriptions.length === before) return jsonError(res, 404, '没有找到这条追踪')
        await save()
        return json(res, 200, { removed: true })
      }

      if (path === '/check' && method === 'POST') {
        const map = await ownerMap(ctx)
        const report = await runCheck(state, map)
        state.lastCheckAt = new Date().toISOString()
        await save()
        return json(res, 200, report)
      }

      if (path === '/events/read' && method === 'POST') {
        state.events = state.events.map((item) => ({ ...item, read: true }))
        await save()
        return json(res, 200, { ok: true })
      }

      if (path === '/config' && method === 'POST') {
        const body = await readJson(req)
        if (body.token !== undefined) {
          state.config.token = clean(body.token, 400)
          github.clearCache()
        }
        if (body.theme === 'light' || body.theme === 'dark') state.config.theme = body.theme
        await save()
        return json(res, 200, { token: state.config.token ? '已设置' : '未设置', theme: state.config.theme || 'dark' })
      }

      if (path === '/config' && method === 'GET') {
        return json(res, 200, { token: state.config.token ? '已设置（不显示内容）' : '未设置', theme: state.config.theme || 'dark' })
      }

      return jsonError(res, 404, '未知接口')
    } catch (error) {
      const status = error instanceof github.GithubError ? error.status : 500
      return jsonError(res, status, error?.message || '服务端发生错误')
    }
  }
}