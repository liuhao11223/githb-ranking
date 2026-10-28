// 临时验证脚本：用真实结构 README 片段测试新的 GitHub 风格 Markdown 渲染器
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const code = readFileSync(join(here, '..', 'lib', 'client.js'), 'utf8')

const windowStub = { __ModuleLoader__: { load: () => {} } }
const moduleStub = { exports: {} }
const e = (tag, props, ...kids) => ({ tag, props, kids: kids.flat(2) })
globalThis.React = { createElement: e }
const fn = new Function('window', 'module', 'exports', `${code}\n;React=globalThis.React;globalThis.__T={renderMarkdown:renderMarkdown,renderInline:renderInline}`)
fn(windowStub, moduleStub, moduleStub.exports)
const { renderMarkdown } = globalThis.__T

const sample = process.argv[2] ? readFileSync(process.argv[2], 'utf8') : `# Demo Tool
A sample project with rich markup.

## Features
- Fast \`parser\` with **small footprint**
- Multi-language support
  1. nested ordered step
  2. second step
- [x] task done
- [ ] task pending

> A quoted note about usage.

| Package | Version | Note |
| --- | --- | --- |
| core | 1.2.3 | stable |

\`\`\`js
const x = 1
console.log(x)
\`\`\`

---

### Usage
![screenshot](docs/ui.png)
See [the docs](https://example.com).

#### Notes
It is *italic*, ~~struck~~ and _underscore_.
`

const out = renderMarkdown(sample, { owner: 'o', repo: 'r' })
const walk = (n, depth, acc) => {
  if (!n || typeof n !== 'object') return
  acc.push(`${'  '.repeat(depth)}${n.tag || typeof n}`)
  if (n.kids) for (const k of n.kids) walk(k, depth + 1, acc)
}
const acc = []
walk({ tag: 'root', kids: out }, 0, acc)
console.log(acc.join('\n'))

const flat = []
const all = (n) => { if (n && typeof n === 'object') { flat.push(n.tag); if (n.kids) n.kids.forEach(all) } }
out.forEach(all)
const need = ['h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'th', 'td', 'pre', 'code', 'strong', 'em', 'del', 'a', 'img', 'hr', 'p']
const missing = need.filter((t) => !flat.includes(t))
console.log('\nmissing tags:', missing.length ? missing.join(',') : 'none')
process.exitCode = missing.length ? 1 : 0