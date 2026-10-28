const TITLE = 'GitHub 排名'
const REPOSITORY = 'https://github.com/liuhao11223/githb-ranking'
const PKG = 'githb-ranking'

// React 由宿主的共享基线提供，工厂执行时注入到模块作用域。
let React = null

const css = String.raw`
.gr-root{display:flex;flex-direction:column;height:100%;width:100%;min-width:0;background:#0f1115;color:#e6e8eb;font-family:ui-sans-serif,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;font-size:13px;line-height:1.45}
.gr-root *{box-sizing:border-box}
.gr-header{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #23262d;background:#14161b;flex:none;min-height:52px;padding-left:calc(14px + var(--dsh-frame-leading-clearance,0px))}
.gr-header[data-window-drag="true"]{-webkit-app-region:drag}
.gr-brand{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#fff;white-space:nowrap}
.gr-brand .gr-logo{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);display:inline-flex;align-items:center;justify-content:center;font-size:13px}
.gr-tabs{display:flex;gap:4px;background:#0b0d11;border:1px solid #23262d;border-radius:9px;padding:3px}
.gr-tab{border:0;background:transparent;color:#9aa3ad;padding:5px 11px;border-radius:7px;cursor:pointer;font-size:12.5px;white-space:nowrap}
.gr-tab:hover{color:#e6e8eb}
.gr-tab.on{background:#23262d;color:#fff;font-weight:600}
.gr-actions{margin-left:auto;display:flex;align-items:center;gap:8px}
html[data-platform=darwin] .gr-actions{-webkit-app-region:no-drag}
.gr-btn{border:1px solid #2b2f37;background:#1a1d23;color:#c7ccd3;padding:5px 11px;border-radius:7px;cursor:pointer;font-size:12.5px;white-space:nowrap}
.gr-btn:hover{background:#23262d;color:#fff}
.gr-btn.primary{background:#7c5cff;border-color:#7c5cff;color:#fff}
.gr-btn.primary:hover{background:#6a49f0}
.gr-btn.danger{border-color:#5a2a2a;color:#ff8f8f;background:#2a1616}
.gr-btn:disabled{opacity:.5;cursor:default}
.gr-main{flex:1;min-height:0;overflow:auto;padding:14px}
.gr-panel{max-width:1180px;margin:0 auto}
.gr-subtabs{display:flex;gap:6px;margin-bottom:12px}
.gr-sub{background:transparent;border:1px solid transparent;color:#9aa3ad;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12.5px}
.gr-sub:hover{color:#e6e8eb}
.gr-sub.on{border-color:#7c5cff;color:#dcd3ff;background:rgba(124,92,255,.08)}
.gr-list{display:flex;flex-direction:column;gap:8px}
.gr-row{display:grid;grid-template-columns:34px minmax(0,1fr) 132px 104px auto;gap:12px;align-items:center;background:#16181d;border:1px solid #23262d;border-radius:10px;padding:10px 12px;cursor:pointer;transition:border-color .12s}
.gr-row:hover{border-color:#3a3f49}
.gr-rank{font-size:15px;font-weight:700;color:#7c5cff;text-align:center}
.gr-rank.top{color:#f5c76b}
.gr-name{min-width:0}
.gr-name .gr-repo{color:#fff;font-weight:600;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gr-name .gr-desc{color:#8b939d;font-size:12px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gr-meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:12px}
.gr-stars{color:#ffd76b;font-weight:600;white-space:nowrap}
.gr-delta{color:#4dd6a0;font-size:11.5px;white-space:nowrap}
.gr-delta.zero{color:#6b7280}
.gr-lang{display:flex;align-items:center;gap:6px;color:#9aa3ad;font-size:12px;white-space:nowrap;overflow:hidden}
.gr-dot{width:8px;height:8px;border-radius:50%;background:#6b7280;flex:none}
.gr-star{background:transparent;border:1px solid #2b2f37;color:#c7ccd3;border-radius:7px;padding:4px 9px;cursor:pointer;font-size:12px;white-space:nowrap}
.gr-star:hover{border-color:#7c5cff;color:#dcd3ff}
.gr-state{padding:26px 18px;text-align:center;color:#8b939d;font-size:13px}
.gr-state .gr-title{color:#c7ccd3;font-size:14px;margin-bottom:6px}
.gr-note{font-size:12px;color:#6b7280;margin:0 0 12px;line-height:1.6}
.gr-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.gr-card{background:#16181d;border:1px solid #23262d;border-radius:10px;padding:12px}
.gr-card h3{margin:0 0 6px;font-size:13.5px;color:#fff;font-weight:600;word-break:break-word}
.gr-card .gr-line{font-size:12px;color:#8b939d;word-break:break-word}
.gr-card .gr-when{font-size:11.5px;color:#6b7280;margin-top:6px}
.gr-tag{display:inline-block;font-size:11px;padding:1px 6px;border-radius:5px;background:#23262d;color:#9aa3ad;margin-right:5px;vertical-align:middle}
.gr-tag.release{background:#243040;color:#8fc1ff}
.gr-tag.commit{background:#2a2436;color:#c9a6ff}
.gr-tag.author{background:#243628;color:#8fe0a8}
.gr-detail-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.gr-detail-head .gr-repo{font-size:18px;font-weight:700;color:#fff;word-break:break-word}
.gr-back{border:0;background:transparent;color:#9aa3ad;cursor:pointer;font-size:13px;padding:2px 4px}
.gr-back:hover{color:#fff}
.gr-stats{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}
.gr-stat{flex:1 1 130px;min-width:120px;background:#16181d;border:1px solid #23262d;border-radius:10px;padding:10px 12px}
.gr-stat .k{font-size:11.5px;color:#8b939d}
.gr-stat .v{font-size:17px;font-weight:700;color:#fff;margin-top:2px}
.gr-chart{display:flex;align-items:flex-end;gap:3px;height:88px;padding:8px 0}
.gr-bar{flex:1 1 0;min-width:5px;background:#7c5cff;border-radius:3px 3px 0 0;min-height:2px}
.gr-bar.baseline{background:#3a3f49}
.gr-chart-labels{display:flex;justify-content:space-between;font-size:11px;color:#6b7280;margin-top:4px}
.gr-section{background:#16181d;border:1px solid #23262d;border-radius:10px;padding:12px;margin-bottom:12px}
.gr-section h4{margin:0 0 10px;font-size:13px;color:#e6e8eb;font-weight:600}
.gr-release{display:flex;flex-direction:column;gap:4px;padding:8px 0;border-bottom:1px solid #23262d}
.gr-release:last-child{border-bottom:0}
.gr-release .r1{color:#fff;font-weight:600;font-size:12.5px}
.gr-release .r2{font-size:12px;color:#8b939d;word-break:break-word}
.gr-form{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.gr-input{flex:1 1 260px;min-width:200px;background:#0b0d11;border:1px solid #2b2f37;color:#e6e8eb;border-radius:8px;padding:8px 10px;font-size:13px}
.gr-input:focus{outline:0;border-color:#7c5cff}
.gr-event{border-left:2px solid #7c5cff;padding:8px 10px;margin-bottom:8px;background:#14161b;border-radius:0 8px 8px 0}
.gr-event .e1{color:#e6e8eb;font-size:12.5px;font-weight:600}
.gr-event .e2{color:#8b939d;font-size:12px;margin-top:2px;word-break:break-word}
.gr-event .e3{color:#6b7280;font-size:11px;margin-top:4px}
.gr-seg{display:flex;gap:6px;align-items:center;justify-content:space-between;background:#16181d;border:1px solid #23262d;border-radius:10px;padding:10px 12px;margin-bottom:8px}
.gr-seg .s1{color:#fff;font-weight:600;font-size:13px}
.gr-seg .s2{color:#8b939d;font-size:12px;margin-top:2px}
.gr-seg .s3{color:#6b7280;font-size:11px;margin-top:3px}
.gr-seg-main{flex:1 1 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;cursor:pointer;padding:2px 0;border-radius:6px}
.gr-seg-main:hover .s1{color:#fff}
.gr-seg-main:focus-visible{outline:2px solid #8fc1ff;outline-offset:2px}
.gr-seg-open{color:#8fc1ff;font-size:11.5px;flex-shrink:0}
.gr-footer{color:#6b7280;font-size:11.5px;margin-top:14px;line-height:1.6}
.gr-overview{background:#16181d;border:1px solid #23262d;border-radius:10px;padding:14px;margin-bottom:12px}
.gr-overview .gr-desc{color:#c7ccd3;font-size:12.5px;line-height:1.7;word-break:break-word;margin:0}
.gr-topics{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.gr-topic{background:rgba(124,92,255,.1);border:1px solid rgba(124,92,255,.25);color:#c9bbff;border-radius:6px;padding:2px 8px;font-size:11.5px}
.gr-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px 18px;margin-top:12px;padding-top:12px;border-top:1px solid #23262d}
.gr-fact{display:flex;flex-direction:column;gap:2px;min-width:0}
.gr-fact .k{font-size:11px;color:#6b7280}
.gr-fact .v{font-size:12.5px;color:#d7dbe1;word-break:break-word}
.gr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px}
.gr-grid .gr-stat{flex:none;min-width:0}
.gr-release .r3{font-size:12px;color:#9aa3ad;line-height:1.6;word-break:break-word;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gr-versions{display:flex;flex-wrap:wrap;gap:6px}
.gr-versions span{background:#1a1d23;border:1px solid #2b2f37;color:#c7ccd3;border-radius:6px;padding:2px 8px;font-size:11.5px}
.gr-sec-head{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;background:transparent;border:0;padding:0;margin:0 0 8px;cursor:pointer;color:inherit;font:inherit}
.gr-sec-title{font-size:13px;color:#e6e8eb;font-weight:600}
.gr-caret{font-size:11px;color:#8b939d;transition:transform .15s ease}
.gr-caret.open{transform:rotate(180deg)}
.gr-sec-head:hover .gr-sec-title{color:#fff}
.gr-sec-line{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.gr-sec-line h4{margin:0}
.gr-range{display:flex;gap:4px;flex-shrink:0}
.gr-btn.sm{padding:2px 9px;font-size:11.5px;border-radius:6px}
.gr-btn.sm.on{background:#2b3442;border-color:#8fc1ff;color:#fff}
.gr-chart-note{font-size:11px;color:#6b7280;margin-top:6px}
.gr-readme{font-size:14px;line-height:1.7;color:#c7ccd3;word-break:break-word}
.gr-readme>*:first-child{margin-top:0!important}
.gr-readme>*:last-child{margin-bottom:0!important}
.gr-readme h1,.gr-readme h2,.gr-readme h3,.gr-readme h4,.gr-readme h5,.gr-readme h6{margin:22px 0 12px;font-weight:600;color:#fff;line-height:1.35}
.gr-readme h1{font-size:28px;padding-bottom:8px;border-bottom:1px solid #23262d}
.gr-readme h2{font-size:22px;padding-bottom:6px;border-bottom:1px solid #23262d}
.gr-readme h3{font-size:18px}
.gr-readme h4{font-size:15px}
.gr-readme h5{font-size:14px}
.gr-readme h6{font-size:13px;color:#8b939d}
.gr-readme p{margin:10px 0}
.gr-readme ul,.gr-readme ol{margin:10px 0;padding-left:2em}
.gr-readme li{margin:4px 0}
.gr-readme li>ul,.gr-readme li>ol{margin:4px 0}
.gr-readme .gr-task{display:inline-flex;align-items:center;gap:7px;cursor:default}
.gr-readme .gr-task input{margin:0;accent-color:#7c5cff}
.gr-readme blockquote{margin:12px 0;padding:2px 16px;color:#8b939d;border-left:4px solid #2b2f37}
.gr-readme blockquote p{margin:4px 0}
.gr-readme hr{height:1px;border:0;background:#23262d;margin:20px 0}
.gr-readme code{font-family:ui-monospace,SFMono-Regular,"Cascadia Code",Consolas,Menlo,monospace;font-size:12.5px;background:#0b0d11;border:1px solid #23262d;border-radius:5px;padding:1px 6px;color:#c9bbff}
.gr-readme pre{background:#0b0d11;border:1px solid #23262d;border-radius:8px;padding:14px 16px;overflow:auto;margin:12px 0;font-size:12.5px;line-height:1.6}
.gr-readme pre code{background:transparent;border:0;padding:0;color:#d7dbe1;display:block;white-space:pre}
.gr-readme a{color:#8fc1ff;text-decoration:none}
.gr-readme a:hover{text-decoration:underline}
.gr-readme img{display:block;max-width:100%;max-height:420px;width:auto;height:auto;object-fit:contain;margin:14px auto;border-radius:6px;border:1px solid rgba(128,128,128,.14)}
.gr-readme table{display:block;width:max-content;max-width:100%;overflow:auto;border-collapse:collapse;margin:14px 0;font-size:13px;line-height:1.5}
.gr-readme table th,.gr-readme table td{padding:7px 13px;border:1px solid #23262d}
.gr-readme table th{background:#14161b;color:#e6e8eb;font-weight:600;text-align:left}

.gr-root.gr-compact .gr-row{grid-template-columns:30px minmax(0,1fr) auto;grid-template-rows:auto auto}
.gr-root.gr-compact .gr-meta{grid-column:2/3;flex-direction:row;gap:10px;justify-content:flex-start;align-items:center}
.gr-root.gr-compact .gr-star{grid-column:3/4;grid-row:1/2}
.gr-root.gr-compact .gr-lang{display:none}
.gr-root.gr-compact .gr-header{gap:8px}
.gr-root.gr-compact .gr-brand{font-size:14px}
.gr-root.gr-narrow .gr-header{flex-wrap:wrap}
.gr-root.gr-narrow .gr-tabs{order:3;flex:1 1 100%;justify-content:flex-start;overflow-x:auto}
.gr-root.gr-theme-light{background:#f5f6f8;color:#1f2328}
.gr-root.gr-theme-light .gr-header{background:#ffffff;border-bottom-color:#e5e7eb}
.gr-root.gr-theme-light .gr-brand{color:#1f2328}
.gr-root.gr-theme-light .gr-tabs{background:#eceef1;border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-tab{color:#57606a}
.gr-root.gr-theme-light .gr-tab:hover{color:#1f2328}
.gr-root.gr-theme-light .gr-tab.on{background:#ffffff;color:#111111;font-weight:600}
.gr-root.gr-theme-light .gr-btn{border-color:#d0d5db;background:#ffffff;color:#2c333b}
.gr-root.gr-theme-light .gr-btn:hover{background:#f0f2f5;color:#111111}
.gr-root.gr-theme-light .gr-btn.primary{background:#7c5cff;border-color:#7c5cff;color:#ffffff}
.gr-root.gr-theme-light .gr-btn.primary:hover{background:#6a49f0}
.gr-root.gr-theme-light .gr-btn.danger{border-color:#f0b4b4;color:#c0392b;background:#fdecec}
.gr-root.gr-theme-light .gr-sub{color:#57606a}
.gr-root.gr-theme-light .gr-sub:hover{color:#1f2328}
.gr-root.gr-theme-light .gr-sub.on{border-color:#7c5cff;color:#5b3fd4;background:rgba(124,92,255,.08)}
.gr-root.gr-theme-light .gr-row{background:#ffffff;border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-row:hover{border-color:#c9ced5}
.gr-root.gr-theme-light .gr-rank.top{color:#b5770a}
.gr-root.gr-theme-light .gr-name .gr-repo{color:#1f2328}
.gr-root.gr-theme-light .gr-name .gr-desc{color:#57606a}
.gr-root.gr-theme-light .gr-stars{color:#b5770a}
.gr-root.gr-theme-light .gr-delta{color:#1a9e6f}
.gr-root.gr-theme-light .gr-lang{color:#57606a}
.gr-root.gr-theme-light .gr-star{border-color:#d0d5db;color:#2c333b}
.gr-root.gr-theme-light .gr-star:hover{border-color:#7c5cff;color:#5b3fd4}
.gr-root.gr-theme-light .gr-state{color:#57606a}
.gr-root.gr-theme-light .gr-state .gr-title{color:#2c333b}
.gr-root.gr-theme-light .gr-card{background:#ffffff;border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-card h3{color:#1f2328}
.gr-root.gr-theme-light .gr-card .gr-line{color:#57606a}
.gr-root.gr-theme-light .gr-tag{background:#e9ecf0;color:#57606a}
.gr-root.gr-theme-light .gr-tag.release{background:#dbe9f7;color:#1f6fb5}
.gr-root.gr-theme-light .gr-tag.commit{background:#e8dff5;color:#6b3fa8}
.gr-root.gr-theme-light .gr-tag.author{background:#daf0e1;color:#1f7a44}
.gr-root.gr-theme-light .gr-detail-head .gr-repo{color:#1f2328}
.gr-root.gr-theme-light .gr-back{color:#57606a}
.gr-root.gr-theme-light .gr-back:hover{color:#1f2328}
.gr-root.gr-theme-light .gr-stat{background:#ffffff;border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-stat .k{color:#57606a}
.gr-root.gr-theme-light .gr-stat .v{color:#1f2328}
.gr-root.gr-theme-light .gr-bar.baseline{background:#c4c9d1}
.gr-root.gr-theme-light .gr-section{background:#ffffff;border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-section h4{color:#1f2328}
.gr-root.gr-theme-light .gr-release{border-bottom-color:#e5e7eb}
.gr-root.gr-theme-light .gr-release .r1{color:#1f2328}
.gr-root.gr-theme-light .gr-release .r2{color:#57606a}
.gr-root.gr-theme-light .gr-release .r3{color:#57606a}
.gr-root.gr-theme-light .gr-input{background:#ffffff;border-color:#d0d5db;color:#1f2328}
.gr-root.gr-theme-light .gr-event{background:#fbfbfd}
.gr-root.gr-theme-light .gr-event .e1{color:#1f2328}
.gr-root.gr-theme-light .gr-event .e2{color:#57606a}
.gr-root.gr-theme-light .gr-seg{background:#ffffff;border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-seg .s1{color:#1f2328}
.gr-root.gr-theme-light .gr-seg .s2{color:#57606a}
.gr-root.gr-theme-light .gr-seg-main:hover .s1{color:#111111}
.gr-root.gr-theme-light .gr-seg-open{color:#1f6fb5}
.gr-root.gr-theme-light .gr-overview{background:#ffffff;border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-overview .gr-desc{color:#2c333b}
.gr-root.gr-theme-light .gr-topic{color:#5b3fd4}
.gr-root.gr-theme-light .gr-facts{border-top-color:#e5e7eb}
.gr-root.gr-theme-light .gr-fact .v{color:#1f2328}
.gr-root.gr-theme-light .gr-sec-title{color:#1f2328}
.gr-root.gr-theme-light .gr-caret{color:#57606a}
.gr-root.gr-theme-light .gr-sec-head:hover .gr-sec-title{color:#111111}
.gr-root.gr-theme-light .gr-btn.sm.on{background:#e3ecfa;border-color:#8fc1ff;color:#1a3f6b}
.gr-root.gr-theme-light .gr-readme{color:#2c333b}
.gr-root.gr-theme-light .gr-readme h1,
.gr-root.gr-theme-light .gr-readme h2,
.gr-root.gr-theme-light .gr-readme h3,
.gr-root.gr-theme-light .gr-readme h4,
.gr-root.gr-theme-light .gr-readme h5,
.gr-root.gr-theme-light .gr-readme h6{color:#1f2328}
.gr-root.gr-theme-light .gr-readme h1,
.gr-root.gr-theme-light .gr-readme h2{border-bottom-color:#e5e7eb}
.gr-root.gr-theme-light .gr-readme h6{color:#57606a}
.gr-root.gr-theme-light .gr-readme blockquote{color:#57606a;border-left-color:#d0d5db}
.gr-root.gr-theme-light .gr-readme hr{background:#e5e7eb}
.gr-root.gr-theme-light .gr-readme code{background:#f0f2f5;border-color:#d0d5db;color:#5b3fd4}
.gr-root.gr-theme-light .gr-readme pre{background:#f0f2f5;border-color:#d0d5db}
.gr-root.gr-theme-light .gr-readme pre code{color:#2c333b}
.gr-root.gr-theme-light .gr-readme a{color:#1f6fb5}
.gr-root.gr-theme-light .gr-readme table th,
.gr-root.gr-theme-light .gr-readme table td{border-color:#e5e7eb}
.gr-root.gr-theme-light .gr-readme table th{background:#f0f2f5;color:#1f2328}
`

function mountStyle() {
  if (mountStyle.done) return
  mountStyle.done = true
  const tag = document.createElement('style')
  tag.setAttribute('data-githb-ranking', '1')
  tag.textContent = css
  document.head.appendChild(tag)
}

function useContainerWidth() {
  const ref = React.useRef(null)
  const [width, setWidth] = React.useState(1200)
  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => setWidth(Math.max(0, node.getBoundingClientRect().width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

async function api(path, options) {
  let response
  try {
    response = await fetch(`/api/${PKG}${path}`, {
      headers: { 'content-type': 'application/json' },
      ...options,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(30000),
    })
  } catch {
    throw new Error('工作台数据接口暂时无响应，请稍后点「刷新」重试')
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || `请求失败（HTTP ${response.status}）`)
  return payload
}

const compact = (value) => (value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : String(value))
const languageColor = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584', Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Ruby: '#701516', PHP: '#4F5D95', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', Kotlin: '#A97BFF', Swift: '#F05138', Lua: '#000080' }
const when = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` }

function resolveImage(src, ctx) {
  const value = String(src || '').trim()
  if (!value) return ''
  const rewritten = value.replace(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/i, 'https://raw.githubusercontent.com/$1/$2/$4').replace(/[?#].*$/, '')
  if (rewritten !== value) return rewritten
  if (/^https?:\/\//i.test(value)) return value
  if (/^\/\//.test(value)) return `https:${value}`
  const path = value.replace(/^\.\//, '').replace(/^\.\.\//g, '').replace(/^\//, '')
  return `https://raw.githubusercontent.com/${ctx?.owner || ''}/${ctx?.repo || ''}/HEAD/${path}`
}

const RE_INLINE = /(<img[^>]*>)|(!\[([^\]]*)\]\(([^)\s]+)\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(~~[^~]+~~)|(\[[^\]]+\]\((https?:\/\/[^)\s]+)\))|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g

function renderInline(text, ctx) {
  const nodes = []
  const re = RE_INLINE
  let last = 0; let match; let i = 0
  const pushImage = (src, alt) => {
    const resolved = resolveImage(src, ctx)
    if (resolved) nodes.push(React.createElement('img', { key: i++, src: resolved, alt: alt || '', loading: 'lazy' }))
  }
  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[1]) {
      const src = match[1].match(/src=["']([^"']+)["']/i)
      const alt = match[1].match(/alt=["']([^"']*)["']/i)
      if (src) pushImage(src[1], alt ? alt[1] : '')
    } else if (match[2]) pushImage(match[4], match[3])
    else if (match[5]) nodes.push(React.createElement('code', { key: i++ }, match[5].slice(1, -1)))
    else if (match[6]) nodes.push(React.createElement('strong', { key: i++ }, match[6].slice(2, -2)))
    else if (match[7]) nodes.push(React.createElement('strong', { key: i++ }, match[7].slice(2, -2)))
    else if (match[8]) nodes.push(React.createElement('del', { key: i++ }, match[8].slice(2, -2)))
    else if (match[9]) nodes.push(React.createElement('a', { key: i++, href: match[10], target: '_blank', rel: 'noreferrer' }, match[9]))
    else if (match[11]) nodes.push(React.createElement('em', { key: i++ }, match[11].slice(1, -1)))
    last = re.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function parseListItem(line) {
  const m = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
  if (!m) return null
  const depth = Math.floor(m[1].replace(/\t/g, '  ').length / 2)
  const ordered = /^\d/.test(m[2])
  const task = m[3].match(/^\[( |x|X)\]\s+(.*)$/)
  return { depth, ordered, text: task ? task[2] : m[3], checked: task ? (task[1].toLowerCase() === 'x') : null }
}

function renderList(items, ctx, key) {
  const roots = []
  const stack = [{ depth: -1, children: roots }]
  for (const item of items) {
    const node = { ordered: item.ordered, text: item.text, checked: item.checked, children: [] }
    while (stack.length > 1 && stack[stack.length - 1].depth >= item.depth) stack.pop()
    stack[stack.length - 1].children.push(node)
    stack.push({ depth: item.depth, children: node.children })
  }
  const renderNodes = (nodes) => {
    const ordered = nodes.length > 0 && nodes[0].ordered
    return React.createElement(ordered ? 'ol' : 'ul', null, nodes.map((node, idx) => {
      const content = renderInline(node.text, ctx)
      const kids = node.children.length ? renderNodes(node.children) : null
      if (node.checked !== null) {
        return React.createElement('li', { key: idx },
          React.createElement('label', { className: 'gr-task' },
            React.createElement('input', { type: 'checkbox', checked: node.checked, readOnly: true }),
            React.createElement('span', null, ...content)),
          kids)
      }
      return React.createElement('li', { key: idx }, ...content, kids)
    }))
  }
  return renderNodes(roots)
}

function splitRow(line) {
  return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((cell) => cell.trim())
}

function renderMarkdown(text, ctx) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0
  let key = 0
  const isFence = (line) => /^\s*(```+|~~~+)/.test(line)
  const isHeading = (line) => /^\s{0,3}(#{1,6})\s+/.test(line)
  const isQuote = (line) => /^\s*>\s?/.test(line)
  const isTableRow = (line) => /^\s*\|.*\|/.test(line)
  const isSep = (line) => /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-')
  while (i < lines.length) {
    const line = lines[i]
    const fence = line.match(/^\s*(```+|~~~+)\s*(\S*)/)
    if (fence) {
      const marker = fence[1][0]
      const lang = fence[2] || ''
      const buf = []
      i += 1
      while (i < lines.length && !new RegExp(`^\\s*${marker}{3,}\\s*$`).test(lines[i])) { buf.push(lines[i]); i += 1 }
      i += 1
      out.push(React.createElement('pre', { key: key++ }, React.createElement('code', { className: lang ? `language-${lang}` : '' }, buf.join('\n'))))
      continue
    }
    const head = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
    if (head) {
      out.push(React.createElement(`h${head[1].length}`, { key: key++ }, ...renderInline(head[2], ctx)))
      i += 1
      continue
    }
    if (/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push(React.createElement('hr', { key: key++ })); i += 1; continue }
    if (isQuote(line)) {
      const buf = []
      while (i < lines.length && isQuote(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i += 1 }
      out.push(React.createElement('blockquote', { key: key++ }, ...renderMarkdown(buf.join('\n'), ctx)))
      continue
    }
    if (isTableRow(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const rows = [splitRow(line)]
      i += 2
      while (i < lines.length && isTableRow(lines[i])) { rows.push(splitRow(lines[i])); i += 1 }
      const header = rows[0]
      const body = rows.slice(1)
      out.push(React.createElement('table', { key: key++ },
        React.createElement('thead', null, React.createElement('tr', null, header.map((cell, ci) => React.createElement('th', { key: ci }, ...renderInline(cell, ctx))))),
        body.length ? React.createElement('tbody', null, body.map((row, ri) => React.createElement('tr', { key: ri }, row.map((cell, ci) => React.createElement('td', { key: ci }, ...renderInline(cell, ctx)))))) : null))
      continue
    }
    const item = parseListItem(line)
    if (item) {
      const items = []
      while (i < lines.length) {
        const next = parseListItem(lines[i])
        if (!next) break
        items.push(next)
        i += 1
      }
      out.push(renderList(items, ctx, key++))
      continue
    }
    if (!line.trim()) { i += 1; continue }
    const buf = []
    while (i < lines.length && lines[i].trim() && !isFence(lines[i]) && !isHeading(lines[i]) && !isQuote(lines[i]) && !isTableRow(lines[i]) && !parseListItem(lines[i])) {
      buf.push(lines[i]); i += 1
    }
    out.push(React.createElement('p', { key: key++ }, ...renderInline(buf.join(' '), ctx)))
  }
  return out
}

function isoWeek(dt) {
  const date = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

function starRange(days, range) {
  const limit = range === 'week' ? 7 : range === 'month' ? 30 : 365
  const unit = range === 'year' ? '周' : '天'
  const cutoff = new Date(Date.now() - limit * 86400000).getTime()
  const within = (days || []).filter((day) => {
    const time = new Date(`${day.dateKey}T00:00:00Z`).getTime()
    return Number.isFinite(time) && time >= cutoff
  })
  if (range === 'year') {
    const weeks = []
    let cur = null
    let curKey = ''
    for (const day of within) {
      const dt = new Date(`${day.dateKey}T00:00:00Z`)
      const wk = `${dt.getUTCFullYear()}-${isoWeek(dt)}`
      if (wk !== curKey) { curKey = wk; cur = { dateKey: day.dateKey, stars: day.stars }; weeks.push(cur) } else { cur.dateKey = day.dateKey; cur.stars = day.stars }
    }
    return { points: weeks, limit, unit }
  }
  return { points: within, limit, unit }
}

function StarChart({ snapshots, range }) {
  const { points, limit, unit } = starRange(snapshots, range)
  if (!points.length) return React.createElement('div', { className: 'gr-state' }, '暂无趋势数据，多打开几天榜单会自动积累 star 变化曲线。')
  const max = Math.max(...points.map((d) => d.stars || 0), 1)
  const first = points[0].stars || 0
  const last = points[points.length - 1].stars || 0
  const chartHeight = 70
  return React.createElement('div', null,
    React.createElement('div', { className: 'gr-chart', role: 'img', 'aria-label': `近 ${limit}${unit} star 数变化（已记录 ${points.length} 个${unit}）` },
      points.map((day, index) => React.createElement('div', {
        key: day.dateKey || index,
        className: index === 0 ? 'gr-bar baseline' : 'gr-bar',
        style: { height: `${Math.max(4, Math.round(((day.stars || 0) / max) * chartHeight))}px` },
        title: `${day.dateKey}：${day.stars}★`,
      })),
    ),
    React.createElement('div', { className: 'gr-chart-labels' },
      React.createElement('span', null, first ? `${compact(first)}★` : ''),
      React.createElement('span', null, `基线 ${compact(first)} → 现在 ${compact(last)}`),
      React.createElement('span', null, points.length > 1 ? `净增 ${last - first}★` : '仅 1 个记录')),
    points.length < limit ? React.createElement('div', { className: 'gr-chart-note' }, `数据还在积累：已记录 ${points.length} 个${unit}，每打开一次工作台就多记一天，凑满 ${limit}${unit} 后这里就是完整曲线。`) : null,
  )
}

function Leaderboard({ title, subtitle, items, onOpen, onFollow, followed }) {
  if (!items.length) return React.createElement('div', { className: 'gr-state' }, '正在加载榜单…')
  return React.createElement('div', null,
    subtitle ? React.createElement('p', { className: 'gr-note' }, subtitle) : null,
    React.createElement('div', { className: 'gr-list' },
      items.map((item) => React.createElement('div', {
        key: item.fullName,
        className: 'gr-row',
        onClick: () => onOpen(item),
        role: 'button',
        tabIndex: 0,
        onKeyDown: (event) => { if (event.key === 'Enter') onOpen(item) },
      },
        React.createElement('div', { className: `gr-rank${item.rank <= 3 ? ' top' : ''}` }, item.rank),
        React.createElement('div', { className: 'gr-name' },
          React.createElement('div', { className: 'gr-repo', title: item.fullName }, item.dshWeight === 2 ? React.createElement('span', { className: 'gr-tag', style: { marginRight: 6 } }, '主题') : null, item.fullName),
          item.description ? React.createElement('div', { className: 'gr-desc' }, item.description) : null),
        React.createElement('div', { className: 'gr-meta' },
          React.createElement('div', { className: 'gr-stars' }, `${compact(item.stars)} ★`),
          React.createElement('div', { className: `gr-delta${item.starsDeltaToday ? '' : ' zero'}` }, item.starsDeltaToday ? `今日 +${item.starsDeltaToday}` : '今日 ±0')),
        React.createElement('div', { className: 'gr-lang' },
          React.createElement('span', { className: 'gr-dot', style: { background: languageColor[item.language] || '#6b7280' } }),
          React.createElement('span', null, item.language || '未知')),
        React.createElement('button', {
          className: 'gr-star',
          onClick: (event) => { event.stopPropagation(); onFollow(item) },
          title: '加入追踪',
        }, followed(item) ? '★ 已追踪' : '☆ 追踪'),
      )),
    ),
  )
}

function LeaderboardTab({ variant, onOpen, onFollow, followed, rankings }) {
  const [sub, setSub] = React.useState(variant === 'dsh' ? 'dsh' : 'new')
  const tabs = variant === 'dsh'
    ? [{ id: 'dsh', label: 'DSH 插件榜' }]
    : [{ id: 'new', label: '今日新晋' }, { id: 'hot', label: '本周热榜' }]
  const items = rankings?.[sub] || []
  const subtitle = sub === 'dsh'
    ? '按 GitHub 上与 DSH / DeepSeek Harness 相关的主题与关键词聚合仓库，按 star 数排序。点击仓库看详情，或点「追踪」加入订阅监控。'
    : sub === 'new'
      ? '过去 7 天新创建的仓库中 star 数最高的一批，代表今天最受关注的新项目。'
      : '已有一定规模（500★ 以上）且最近 7 天仍在活跃更新的仓库，看谁在持续升温。'
  return React.createElement('div', null,
    React.createElement('div', { className: 'gr-subtabs' },
      tabs.map((tab) => React.createElement('button', { key: tab.id, className: `gr-sub${sub === tab.id ? ' on' : ''}`, onClick: () => setSub(tab.id) }, tab.label))),
    React.createElement(Leaderboard, { items, subtitle, onOpen, onFollow, followed }),
    (rankings?.errors?.length ? React.createElement('p', { className: 'gr-note' }, `部分数据源暂时不可用：${rankings.errors[0]}`) : null),
  )
}

function DetailView({ item, onBack, onFollow, followed }) {
  const [detail, setDetail] = React.useState(null)
  const [error, setError] = React.useState('')
  const [open, setOpen] = React.useState({ readme: true, releases: true, tags: true, commits: true })
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  const [range, setRange] = React.useState('week')
  const [readmeText, setReadmeText] = React.useState('')
  const [readmePath, setReadmePath] = React.useState('')
  const [readmeLoading, setReadmeLoading] = React.useState(false)
  React.useEffect(() => { setReadmeText(detail?.readme || ''); setReadmePath(detail?.readmeDefault || '') }, [detail?.readme, detail?.readmeDefault])
  const switchReadme = React.useCallback(async (path) => {
    setReadmeLoading(true)
    try {
      const res = await api(`/readme?owner=${encodeURIComponent(item.owner)}&repo=${encodeURIComponent(item.repo)}&path=${encodeURIComponent(path)}`)
      setReadmeText(res.text || '')
      setReadmePath(path)
    } catch (err) { setReadmeText(`读取自述文件失败：${err.message}`) }
    setReadmeLoading(false)
  }, [item.owner, item.repo])
  React.useEffect(() => {
    let alive = true
    setDetail(null)
    setError('')
    api(`/repo?owner=${encodeURIComponent(item.owner)}&repo=${encodeURIComponent(item.repo)}`)
      .then((value) => { if (alive) setDetail(value) })
      .catch((err) => { if (alive) setError(err.message) })
    return () => { alive = false }
  }, [item.owner, item.repo])

  const head = detail?.repo || item
  const isFollowed = followed(head)
  const topics = head.topics || []
  const variants = detail?.readmeVariants || []
  const meta = detail?.repo
  const facts = meta ? [
    ['语言', meta.language || '未标注'],
    ['License', meta.license || '未标注'],
    ['建档时间', when(meta.createdAt)],
    ['最近更新', when(meta.pushedAt)],
    ['Open issues', String(meta.openIssues ?? 0)],
    ['主页', meta.homepage || '—'],
  ] : []

  const section = (key, title, body) => {
    const isOpen = open[key]
    return React.createElement('div', { className: 'gr-section' },
      React.createElement('button', { className: 'gr-sec-head', type: 'button', 'aria-expanded': isOpen, onClick: () => toggle(key) },
        React.createElement('span', { className: 'gr-sec-title' }, title),
        React.createElement('span', { className: `gr-caret ${isOpen ? 'open' : ''}` }, '▾')),
      isOpen ? body : null)
  }

  return React.createElement('div', { className: 'gr-panel' },
    React.createElement('div', { className: 'gr-detail-head' },
      React.createElement('button', { className: 'gr-back', onClick: onBack }, '← 返回榜单'),
      React.createElement('div', { style: { flex: '1 1 320px', minWidth: 0 } },
        React.createElement('div', { className: 'gr-repo' }, head.fullName || `${head.owner}/${head.repo}`)),
      React.createElement('div', { className: 'gr-actions' },
        React.createElement('a', { className: 'gr-btn', href: head.url, target: '_blank', rel: 'noreferrer' }, '在 GitHub 打开'),
        React.createElement('button', { className: `gr-btn ${isFollowed ? 'danger' : 'primary'}`, onClick: () => onFollow(head) }, isFollowed ? '★ 已追踪' : '☆ 追踪这个仓库'))),
    error ? React.createElement('div', { className: 'gr-state' }, error)
      : !detail ? React.createElement('div', { className: 'gr-state' }, '正在加载仓库详情…')
        : React.createElement('div', null,
          React.createElement('div', { className: 'gr-overview' },
            head.description ? React.createElement('p', { className: 'gr-desc' }, head.description) : null,
            topics.length ? React.createElement('div', { className: 'gr-topics' }, topics.map((topic) => React.createElement('span', { key: topic, className: 'gr-topic' }, `#${topic}`))) : null,
            meta ? React.createElement('div', { className: 'gr-facts' },
              facts.map(([k, v]) => React.createElement('div', { key: k, className: 'gr-fact' },
                React.createElement('div', { className: 'k' }, k),
                React.createElement('div', { className: 'v', title: v }, v)))) : null),
          React.createElement('div', { className: 'gr-grid' },
            React.createElement('div', { className: 'gr-stat' }, React.createElement('div', { className: 'k' }, 'Star 数'), React.createElement('div', { className: 'v' }, `${compact(detail.repo.stars)}★`)),
            React.createElement('div', { className: 'gr-stat' }, React.createElement('div', { className: 'k' }, '今日增量'), React.createElement('div', { className: 'v' }, `+${detail.starsDeltaToday || 0}`)),
            React.createElement('div', { className: 'gr-stat' }, React.createElement('div', { className: 'k' }, 'Fork 数'), React.createElement('div', { className: 'v' }, compact(detail.repo.forks))),
            React.createElement('div', { className: 'gr-stat' }, React.createElement('div', { className: 'k' }, 'Open issues'), React.createElement('div', { className: 'v' }, compact(detail.repo.openIssues || 0))),
            React.createElement('div', { className: 'gr-stat' }, React.createElement('div', { className: 'k' }, '语言'), React.createElement('div', { className: 'v', style: { fontSize: '14px' } }, detail.repo.language || '—')),
            React.createElement('div', { className: 'gr-stat' }, React.createElement('div', { className: 'k' }, '最近更新'), React.createElement('div', { className: 'v', style: { fontSize: '14px' } }, when(detail.repo.pushedAt)))),
          React.createElement('div', { className: 'gr-section' },
            React.createElement('div', { className: 'gr-sec-line' },
              React.createElement('h4', null, 'Star 走势'),
              React.createElement('div', { className: 'gr-range' }, [['week', '近一周'], ['month', '近一月'], ['year', '近一年']].map(([key, label]) => React.createElement('button', { key, type: 'button', className: `gr-btn sm${range === key ? ' on' : ''}`, 'aria-pressed': range === key, onClick: () => setRange(key) }, label)))),
            React.createElement(StarChart, { snapshots: detail.snapshots, range })),
          section('readme', '项目自述（README）',
            React.createElement('div', null,
              variants.length > 1 ? React.createElement('div', { className: 'gr-sec-line' },
                React.createElement('span', { className: 'gr-note', style: { margin: 0 } }, '选择语言'),
                React.createElement('div', { className: 'gr-range' }, variants.map((variant) => React.createElement('button', {
                  key: variant.path, type: 'button', className: `gr-btn sm${readmePath === variant.path ? ' on' : ''}`, 'aria-pressed': readmePath === variant.path,
                  onClick: () => switchReadme(variant.path), title: variant.path,
                }, variant.name)))) : null,
              readmeLoading ? React.createElement('div', { className: 'gr-state', style: { padding: '8px' } }, '正在加载自述文件…')
                : readmeText ? React.createElement('div', { className: 'gr-readme' }, ...renderMarkdown(readmeText, { owner: head.owner, repo: head.repo }))
                  : React.createElement('div', { className: 'gr-state', style: { padding: '8px' } }, '这个仓库没有 README'))),
          section('releases', `最近发布（${detail.releases.length}）`, detail.releases.length ? detail.releases.map((release, index) => React.createElement('div', { key: index, className: 'gr-release' },
              React.createElement('div', { className: 'r1' }, release.tag, release.prerelease ? '  (预发布)' : ''),
              release.name ? React.createElement('div', { className: 'r2' }, release.name) : null,
              release.body ? React.createElement('div', { className: 'r3' }, release.body) : null,
              React.createElement('div', { className: 'r2', style: { color: '#6b7280' } }, when(release.publishedAt), ' ',
                release.url ? React.createElement('a', { href: release.url, target: '_blank', rel: 'noreferrer', style: { color: '#8fc1ff' } }, '查看') : null)))
              : React.createElement('div', { className: 'gr-state', style: { padding: '8px' } }, '这个仓库还没有发布记录')),
          detail.tags && detail.tags.length ? section('tags', `版本标签（${detail.tags.length}）`, React.createElement('div', { className: 'gr-versions' }, detail.tags.map((tag) => React.createElement('span', { key: tag.name }, tag.name)))) : null,
          section('commits', `最近提交（${detail.commits?.length || 0}）`, (detail.commits || []).length ? detail.commits.map((commit, index) => React.createElement('div', { key: index, className: 'gr-release' },
              React.createElement('div', { className: 'r1' }, commit.message || commit.shortSha),
              React.createElement('div', { className: 'r2' }, commit.author ? `${commit.author} · ` : '', when(commit.date), ' ',
                commit.url ? React.createElement('a', { href: commit.url, target: '_blank', rel: 'noreferrer', style: { color: '#8fc1ff' } }, commit.shortSha) : null)))
              : React.createElement('div', { className: 'gr-state', style: { padding: '8px' } }, '暂无提交记录'))))
}

function TrackView({ data, onRefresh, onFollowChange, onRead, refreshing, report, onOpen }) {
  const [form, setForm] = React.useState({ type: 'repo', name: '' })
  const [error, setError] = React.useState('')
  const [adding, setAdding] = React.useState(false)
  const { subscriptions = [], events = [] } = data || {}

  const add = async (event) => {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) return
    setAdding(true); setError('')
    try {
      await api('/subscriptions', { method: 'POST', body: { type: form.type, name } })
      setForm({ type: form.type, name: '' })
      await onRefresh()
    } catch (err) { setError(err.message) } finally { setAdding(false) }
  }
  const remove = async (id) => { await api(`/subscriptions/${encodeURIComponent(id)}`, { method: 'DELETE' }); await onRefresh() }

  return React.createElement('div', { className: 'gr-panel' },
    React.createElement('div', { className: 'gr-actions', style: { marginLeft: 0, marginBottom: 12 } },
      React.createElement('button', { className: 'gr-btn primary', onClick: onRefresh, disabled: refreshing }, refreshing ? '正在检查更新…' : '检查更新'),
      events.some((item) => !item.read) ? React.createElement('button', { className: 'gr-btn', onClick: onRead }, '全部标记已读') : null),
    React.createElement('p', { className: 'gr-note' }, '把关心的 GitHub 仓库或作者加入追踪，工作台会在你点「检查更新」时比对发布、提交与作者榜单，把变化记在这里。仓库支持粘贴完整 GitHub 地址，例如 https://github.com/sense-org/sense 或 作者名。'),
    React.createElement('form', { className: 'gr-form', onSubmit: add },
      React.createElement('div', { className: 'gr-subtabs', style: { marginBottom: 0 } },
        ['repo', 'author'].map((type) => React.createElement('button', { key: type, type: 'button', className: `gr-sub${form.type === type ? ' on' : ''}`, onClick: () => setForm({ ...form, type }) }, type === 'repo' ? '追踪仓库' : '追踪作者'))),
      React.createElement('input', { className: 'gr-input', placeholder: form.type === 'repo' ? '例如 owner/repo 或仓库地址' : '输入 GitHub 用户名', value: form.name, onChange: (event) => setForm({ ...form, name: event.target.value }) }),
      React.createElement('button', { className: 'gr-btn primary', type: 'submit', disabled: adding }, adding ? '添加中…' : '添加')),
    error ? React.createElement('p', { className: 'gr-note', style: { color: '#ff8f8f' } }, error) : null,
    React.createElement('h4', { style: { margin: '14px 0 8px', fontSize: '13px', color: '#e6e8eb' } }, `追踪列表（${subscriptions.length}）`),
    subscriptions.length ? React.createElement('div', null,
      subscriptions.map((item) => React.createElement('div', { key: item.id, className: 'gr-seg' },
        React.createElement('div', { className: 'gr-seg-main', role: 'button', tabIndex: 0, title: item.type === 'repo' ? '点击查看仓库详情' : '点击打开该作者的 GitHub 主页', onClick: () => onOpen(item), onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(item) } } },
          React.createElement('div', { style: { minWidth: 0 } },
            React.createElement('div', { className: 's1' }, item.name),
            React.createElement('div', { className: 's2' }, item.type === 'repo' ? '仓库' : '作者'),
            React.createElement('div', { className: 's3' }, item.lastCheckedAt ? `上次检查 ${when(item.lastCheckedAt)}` : '还未检查过')),
          React.createElement('span', { className: 'gr-seg-open' }, '查看详情 ▸')),
        React.createElement('button', { className: 'gr-btn danger', onClick: () => remove(item.id) }, '移除'))))
      : React.createElement('div', { className: 'gr-state' }, '还没有追踪任何对象，从榜单或详情页点「追踪」即可添加。'),
    React.createElement('h4', { style: { margin: '16px 0 8px', fontSize: '13px', color: '#e6e8eb' } }, '变化动态'),
    report ? React.createElement('p', { className: 'gr-note' }, report.errors?.length ? `检查完成：扫描 ${report.checked} 项，发现 ${report.changes} 条变化；${report.errors[0]}` : `检查完成：扫描 ${report.checked} 项，发现 ${report.changes} 条变化。`) : null,
    events.length ? React.createElement('div', null,
      events.map((event) => React.createElement('div', { key: event.id, className: 'gr-event' },
        React.createElement('span', { className: `gr-tag ${event.kind}` }, event.kind === 'release' ? '发布' : event.kind === 'commit' ? '提交' : '作者'),
        React.createElement('div', { className: 'e1' }, event.title),
        event.detail ? React.createElement('div', { className: 'e2' }, event.detail) : null,
        React.createElement('div', { className: 'e3' }, when(event.at), event.url ? ' · ' : '', event.url ? React.createElement('a', { href: event.url, target: '_blank', rel: 'noreferrer', style: { color: '#8fc1ff' } }, '查看') : null))))
      : React.createElement('div', { className: 'gr-state' }, '还没有变化动态。')
  )
}

function Settings({ token, theme, onSave, onClose }) {
  const [value, setValue] = React.useState('')
  return React.createElement('div', { className: 'gr-panel' },
    React.createElement('div', { className: 'gr-detail-head' },
      React.createElement('button', { className: 'gr-back', onClick: onClose }, '← 返回'),
      React.createElement('div', { className: 'gr-repo' }, '设置'),
      React.createElement('button', { className: 'gr-btn primary', onClick: async () => { await onSave({ token: value }); setValue(''); onClose() } }, '保存')),
    React.createElement('div', { className: 'gr-section' },
      React.createElement('h4', null, '界面主题'),
      React.createElement('p', { className: 'gr-note' }, '切换白天或晚上配色，立即生效并记住你的选择。'),
      React.createElement('div', { className: 'gr-range' }, [['light', '白天'], ['dark', '晚上']].map(([key, label]) => React.createElement('button', {
        key, type: 'button', className: `gr-btn${theme === key ? ' sm on' : ''}`, 'aria-pressed': theme === key,
        onClick: async () => { const res = await onSave({ theme: key }); if (res?.theme) onClose() },
      }, label)))),
    React.createElement('p', { className: 'gr-note' }, 'GitHub 匿名请求每小时有次数上限，如果榜单刷新失败或报错，可以填一个个人访问令牌（GitHub → Settings → Developer settings → Personal access tokens，只勾选 public_repo 读取权限）。令牌只保存在本机工作台的数据文件里。'),
    React.createElement('div', { className: 'gr-form' },
      React.createElement('input', { className: 'gr-input', type: 'password', placeholder: token === '已设置' ? '已设置令牌，留空表示不修改' : '粘贴令牌（可留空）', value, onChange: (event) => setValue(event.target.value) })))
}

function App({ service, conversation }) {
  const [rootRef, width] = useContainerWidth()
  const [tab, setTab] = React.useState('rank')
  const [detail, setDetail] = React.useState(null)
  const [rankings, setRankings] = React.useState(null)
  const [rankError, setRankError] = React.useState('')
  const [track, setTrack] = React.useState(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [report, setReport] = React.useState(null)
  const [token, setToken] = React.useState('')
  const [theme, setTheme] = React.useState('dark')
  const [showSettings, setShowSettings] = React.useState(false)

  const loadRankings = React.useCallback(async () => {
    setRankError('')
    try {
      const value = await api('/rankings')
      setRankings(value)
      setTrack((prev) => prev || value)
    } catch (err) { setRankError(err.message) }
  }, [])

  const loadTrack = React.useCallback(async () => {
    const value = await api('/subscriptions')
    setTrack((prev) => ({ ...(prev || {}), subscriptions: value.subscriptions, events: value.events, lastCheckAt: value.lastCheckAt }))
    const config = await api('/config').catch(() => ({}))
    setToken(config.token || '')
    if (config.theme) setTheme(config.theme)
  }, [])

  const saveConfig = React.useCallback(async (body) => {
    const res = await api('/config', { method: 'POST', body })
    if (res.theme) setTheme(res.theme)
    if (res.token) setToken(res.token)
    return res
  }, [])

  const loadAll = React.useCallback(async () => { await Promise.all([loadRankings(), loadTrack()]) }, [loadRankings, loadTrack])

  React.useEffect(() => { loadAll() }, [loadAll])

  const followed = React.useCallback((item) => (track?.subscriptions || []).some((sub) => sub.type === 'repo' && sub.name.toLowerCase() === String(item.fullName || '').toLowerCase()), [track])

  const follow = React.useCallback(async (item) => {
    const name = item.fullName || `${item.owner}/${item.repo}`
    try { await api('/subscriptions', { method: 'POST', body: { type: 'repo', name } }); await loadTrack() } catch { await loadTrack() }
  }, [loadTrack])

  const check = React.useCallback(async () => {
    setRefreshing(true)
    try { const value = await api('/check', { method: 'POST' }); setReport(value) } catch (err) { setReport({ checked: 0, changes: 0, errors: [err.message] }) }
    await loadTrack()
    setRefreshing(false)
  }, [loadTrack])

  const openTracked = React.useCallback((item) => {
    if (item.type === 'author') { window.open(item.url, '_blank', 'noreferrer'); return }
    setDetail({ owner: item.owner, repo: item.repo, fullName: item.name })
  }, [])

  const containerClass = `gr-root${theme === 'light' ? ' gr-theme-light' : ''}${width < 860 ? ' gr-compact' : ''}${width < 640 ? ' gr-narrow' : ''}`

  const body = showSettings ? React.createElement(Settings, { token, theme, onSave: saveConfig, onClose: () => setShowSettings(false) })
    : detail ? React.createElement(DetailView, { item: detail, onBack: () => setDetail(null), onFollow: follow, followed })
      : tab === 'track' ? React.createElement(TrackView, { data: track, onRefresh: loadTrack, onFollowChange: loadTrack, onRead: async () => { await api('/events/read', { method: 'POST' }); await loadTrack() }, refreshing, report, onOpen: openTracked })
        : React.createElement(LeaderboardTab, { variant: tab, onOpen: (item) => setDetail(item), onFollow: follow, followed, rankings })

  return React.createElement('div', { className: containerClass, ref: rootRef },
    React.createElement('header', { 'data-window-drag': 'true', className: 'gr-header' },
      React.createElement('div', { className: 'gr-brand' }, React.createElement('span', { className: 'gr-logo' }, '▲'), React.createElement('span', null, TITLE)),
      React.createElement('div', { className: 'gr-tabs', role: 'tablist' },
        [['rank', '今日榜单'], ['dsh', 'DSH 插件'], ['track', '我的追踪']].map(([id, label]) => React.createElement('button', {
          key: id, role: 'tab', 'aria-selected': tab === id, className: `gr-tab${tab === id ? ' on' : ''}`, onClick: () => { setTab(id); setDetail(null); setShowSettings(false) },
        }, label)),
      ),
      React.createElement('div', { className: 'gr-actions' },
        React.createElement('button', { className: 'gr-btn', onClick: loadAll, title: '刷新' }, '刷新'),
        React.createElement('button', { className: 'gr-btn', onClick: () => setShowSettings((value) => !value), title: '设置' }, '设置'))),
    React.createElement('div', { className: 'gr-main' },
      rankError && tab !== 'track' && !rankings ? React.createElement('div', { className: 'gr-panel' },
        React.createElement('div', { className: 'gr-state' },
          React.createElement('div', { className: 'gr-title' }, '榜单加载失败'),
          React.createElement('div', null, rankError),
          React.createElement('div', { style: { marginTop: 10 } }, React.createElement('button', { className: 'gr-btn primary', onClick: loadAll }, '重试'))))
        : body,
      React.createElement('div', { className: 'gr-panel' },
        React.createElement('p', { className: 'gr-footer' }, '数据来自 GitHub 公开接口。榜单每天刷新，Star 走势按自然日在本机积累；追踪到的变化只保存在这台电脑上。需要更准确的历史数据可以点开仓库详情查看。'))),
  )
}

window.__ModuleLoader__.load({
  id: PKG,
  factory: (require) => {
    React = require('react')
    mountStyle()
    function apply(ctx) {
      ctx.effect(() => {
        const service = ctx.desktopWorkbenches
        const dispose = service.register({
          title: TITLE,
          repository: REPOSITORY,
          description: '每天看 GitHub 仓库排名与 DSH 插件排名，打开仓库看详情、Star 走势与发布记录，并把关心的仓库或作者加入追踪，随时检查它们的变化。',
          panelTitle: TITLE,
          icon: '▲',
          audience: 'developer',
          requirements: ['network'],
          customFrame: true,
          layout: { businessSide: 'left', businessWidth: 0.7 },
        }, App)
        return () => dispose()
      }, `${PKG}: register workbench`)
    }
    return { apply, inject: ['desktopWorkbenches'] }
  },
})