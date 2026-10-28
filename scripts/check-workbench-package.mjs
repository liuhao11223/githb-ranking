import { readFile, access } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const problems = []
const notes = []
const must = (condition, label) => { if (!condition) problems.push(label); else notes.push(label) }
const exists = async (path) => access(path).then(() => true, () => false)

const read = async (path) => { try { return await readFile(path, 'utf8') } catch { return '' } }

const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const pkgJson = JSON.stringify(pkg, null, 2)

must(pkg.name === 'githb-ranking', 'package.json name 为 githb-ranking')
must(/^\d+\.\d+\.\d+$/.test(pkg.version || ''), `package.json version 为语义化版本（当前 ${pkg.version}）`)
must(pkg.type === 'module', 'package.json type 为 module')
must(pkg.main === './dsh/index.js', 'package.json main 指向 ./dsh/index.js')
must(pkg.license === 'MIT', 'package.json 声明 MIT 许可')
must(pkg.description && pkg.description.length > 10, 'package.json 有有效 description')

const exportsMap = pkg.exports || {}
must(typeof exportsMap['.'] === 'string', 'exports["."] 指向服务端入口')
must(typeof exportsMap['./client'] === 'string', 'exports["./client"] 指向客户端入口')
must(typeof exportsMap['./cordis.patch.yml'] === 'string', 'exports["./cordis.patch.yml"] 已声明')
must(typeof exportsMap['./package.json'] === 'string', 'exports["./package.json"] 已声明')

const dsh = pkg.dsh || {}
must(dsh.bundle?.patch === './cordis.patch.yml', 'dsh.bundle.patch 指向 cordis.patch.yml')
must(dsh.client?.platform === 'web', 'dsh.client.platform 为 web')
must(Array.isArray(dsh.client?.inject) && dsh.client.inject.includes('dsh-desktop-workbenches'), 'dsh.client.inject 包含 dsh-desktop-workbenches')

must(/^https:\/\/github\.com\/.+\/.+$/.test(pkg.repository?.url || ''), 'repository.url 是规范要求的 GitHub 地址')
must(Object.keys(pkg.peerDependencies || {}).some((key) => key === '@deepseek-ai/cordis'), 'peerDependencies 声明 @deepseek-ai/cordis')
must(pkg.dependencies?.['@deepseek-ai/schemastery'] === '*', '依赖 @deepseek-ai/schemastery')

for (const entry of [pkg.main, exportsMap['.'], exportsMap['./client'], dsh.bundle.patch]) {
  if (typeof entry !== 'string') continue
  const resolved = entry.replace(/^\.\//, '')
  must(await exists(join(root, resolved)), `产物存在 ${resolved}`)
}
must(await exists(join(root, 'dsh/index.js')), 'dsh/index.js 存在')
must(await exists(join(root, 'dsh/state.js')), 'dsh/state.js 存在')
must(await exists(join(root, 'dsh/github.js')), 'dsh/github.js 存在')
must(await exists(join(root, 'dsh/rankings.js')), 'dsh/rankings.js 存在')
must(await exists(join(root, 'lib/client.js')), 'lib/client.js 存在')
must(await exists(join(root, 'README.md')), 'README.md 存在')
must(await exists(join(root, 'LICENSE')), 'LICENSE 存在')

const patch = await read(join(root, 'cordis.patch.yml'))
must(patch.includes('- insert:'), 'cordis.patch.yml 使用 - insert: 插入语法')
must(patch.includes('id: githb-ranking'), 'cordis.patch.yml 声明 id: githb-ranking')
must(patch.includes('name: githb-ranking'), 'cordis.patch.yml 的 name 写的是 npm 包名')
must(patch.includes("dshHomePath('githb-ranking')"), 'cordis.patch.yml 通过 dshHomePath 提供数据目录')
must(patch.includes('root:'), 'cordis.patch.yml 提供 root 配置')

const client = await read(join(root, 'lib/client.js'))
must(client.includes('__ModuleLoader__'), '客户端是构建好的单文件模块（使用 __ModuleLoader__）')
must(client.includes('service.register({') || client.includes('register({'), '客户端调用 register() 注册工作台')
must(/title:\s*['"]/.test(client), 'register() 提供了 title')
const repoLiteral = client.match(/repository:\s*['"]([^'"]+)['"]/)
const repoConst = client.match(/(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=\s*['"](https:\/\/[^'"]+)['"]/s)
const repoValue = repoLiteral?.[1] || (client.includes(`repository: ${repoConst?.[1]}`) ? repoConst?.[2] : '')
must(/^https:\/\/github\.com\/.+\/.+$/.test(repoValue || ''), `register() 提供了规范 GitHub repository 地址（当前值 ${repoValue || '未找到'}）`)
must(client.includes('desktopWorkbenches'), '客户端注入 desktopWorkbenches')
must(!client.includes("id: 'githb-ranking'") || /register\(\{\s*\n?\s*title/.test(client), '新包未在 register({id}) 里声明 id（按规范新包不要填 id）')
must(client.includes('customFrame: true'), '客户端声明 customFrame 整页业务布局')
must(client.includes('<header') || client.includes("'header'") || client.includes('createElement("header"'), '根节点首子元素是语义化 header')
must(client.includes('--dsh-frame-leading-clearance'), 'header 预留 --dsh-frame-leading-clearance 避让宿主公共入口')
must(client.includes('inject: [\'desktopWorkbenches\']') || client.includes('inject:["desktopWorkbenches"]'), '客户端 apply 声明 inject desktopWorkbenches')

const server = await read(join(root, 'dsh/index.js'))
must(server.includes('export const name'), '服务端导出 name')
must(server.includes('export const Config'), '服务端导出 Config（Schemastery schema）')
must(server.includes('Schema.object'), '服务端 Config 使用 Schemastery Schema.object')
must(server.includes('/api/githb-ranking'), '服务端使用自有前缀 /api/githb-ranking')
must(server.includes('desktopWorkbenchOwnership'), '服务端注入 desktopWorkbenchOwnership 判断会话归属')

for (const file of ['dsh/index.js', 'dsh/state.js', 'dsh/github.js', 'dsh/rankings.js', 'lib/client.js', 'tests/state.test.mjs', 'scripts/check-workbench-package.mjs', 'scripts/smoke-live.mjs']) {
  try { execFileSync(process.execPath, ['--check', join(root, file)], { stdio: 'pipe' }); notes.push(`${file} 语法检查通过`) }
  catch (error) { problems.push(`${file} 语法检查失败：${String(error.stderr || error.message).split('\n')[0]}`) }
}

console.log('=== githb-ranking 工作台包校验 ===')
if (problems.length) {
  console.log(`\n[FAIL] ${problems.length} 项未通过：`)
  for (const problem of problems) console.log(`  ✗ ${problem}`)
  process.exit(1)
}
console.log(`\n[PASS] 全部 ${notes.length} 项检查通过`)
console.log(`包目录：${relative(process.cwd(), root) || '.'}`)