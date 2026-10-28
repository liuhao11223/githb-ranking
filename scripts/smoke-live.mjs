// 无宿主环境下的服务端业务冒烟测试：直接调用真实 GitHub 公开接口，验证榜单与订阅链路可用。
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { load, getState, save, recordSnapshot, starsDelta } from '../dsh/state.js'
import { buildRankings } from '../dsh/rankings.js'
import { repoDetail, repoCommits, readme, readmeVariants } from '../dsh/github.js'

const root = await mkdtemp(join(tmpdir(), 'githb-smoke-'))
await load(root)

const started = Date.now()
const rankings = await buildRankings()
console.log(`buildRankings 耗时 ${Date.now() - started}ms`)
for (const key of ['new', 'hot', 'dsh']) {
  const list = rankings[key] || []
  console.log(`\n[${key}] 数量=${list.length}  errors=${rankings.errors.length}`)
  console.log(list.slice(0, 5).map((item) => `  #${item.rank} ${item.fullName}  ${item.stars}★  今日+${item.starsDeltaToday}  语言=${item.language || '-'}`).join('\n'))
}

const top = (rankings.new || [])[0] || (rankings.hot || [])[0]
try {
  if (top) {
    const detail = await repoDetail(top.owner, top.repo)
  const commits = await repoCommits(top.owner, top.repo, 5)
  recordSnapshot(detail.repo.fullName, detail.repo.stars, detail.repo.forks)
  await save()
  console.log(`\n[详情] ${detail.repo.fullName}`)
  console.log(`  stars=${detail.repo.stars}  forks=${detail.repo.forks}  今日+${starsDelta(detail.repo.fullName)}  最近更新=${detail.repo.pushedAt}`)
  console.log(`  最近发布=${detail.releases.length} 条，最新=${detail.releases[0]?.tag || '无'}`)
  console.log(`  最近提交=${commits.length} 条，最新=${commits[0]?.shortSha || '无'} ${commits[0]?.message || ''}`)
  console.log(`  Star 快照天数=${(getState().snapshots[detail.repo.fullName.toLowerCase()] || []).length}`)
  const readmeText = await readme(top.owner, top.repo)
  console.log(`  README=${readmeText.length ? `${readmeText.length} 字符，首行="${(readmeText.split('\n')[0] || '').slice(0, 60)}"` : '无 README'}`)
  const variants = await readmeVariants(top.owner, top.repo)
  console.log(`  README 版本=${variants.variants.length ? variants.variants.map((item) => item.name).join(' / ') : '无'}，默认=${variants.default || '（无）'}`)
  const probe = await readmeVariants('krahets', 'hello-algo').catch(() => ({ variants: [], default: '' }))
  console.log(`  [多语言探测] hello-algo 版本=${probe.variants.length ? probe.variants.map((item) => item.name).join(' / ') : '无'}，默认=${probe.default || '（无）'}`)
  const zhPath = probe.variants.find((item) => /zh/i.test(item.name))
  if (zhPath) { const zhText = await readme('krahets', 'hello-algo', zhPath.path); console.log(`  [多语言探测] 切到 ${zhPath.name}：${zhText.length} 字符，首行="${(zhText.split('\n')[0] || '').slice(0, 40)}"`) }
  }
} catch (error) {
  console.log(`\n[警告] 详情与自述探测被跳过：${error?.message || error}`)
}

console.log('\nSMOKE OK')