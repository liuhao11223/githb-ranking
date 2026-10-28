# GitHub 排名（githb-ranking）

DSH Desktop 工作台。每天看 GitHub 仓库排名与 DSH 插件排名，点开单个仓库看详情、Star 走势与发布记录，并把关心的仓库或作者加入追踪，随时检查它们的变化。

## 能做什么

- **今日榜单**：过去 7 天新建仓库的 star 榜，以及「本周热榜」（500★ 以上且最近仍在活跃更新的仓库）。
- **DSH 插件**：按 GitHub 上与 DSH / DeepSeek Harness 相关的主题与关键词聚合仓库排名。
- **仓库详情**：打开某个仓库看 star/fork 数、今日增量、最近更新，以及 Star 走势、最近发布与最近提交。
- **我的追踪**：把仓库（支持 `owner/repo` 或完整 GitHub 地址）或作者加入追踪，点「检查更新」时工作台比对发布、提交与作者榜单变化，把动态记在工作台里。

## 布局

业务整页展示（`customFrame`），打开即显示榜单；没有会话时直接使用业务，不自动创建会话。按业务容器宽度自动重排：较窄时列表收成两列、隐藏语言列，窄窗时标签栏换行。

## 数据与隐私

- 榜单与仓库详情来自 GitHub 公开接口；匿名请求有次数上限，限流时可在「设置」里填个人访问令牌（只需 `public_repo` 读取权限）。
- 追踪列表、变化动态、Star 快照只保存在本机工作台数据目录，不对外上传或投稿。

## 本地开发与校验

```bash
pnpm install        # 安装 peerDependencies
node scripts/check-workbench-package.mjs   # 校验工作台包格式与代码
node --test tests/*.test.mjs               # 运行单元测试
pnpm pack           # 生成可安装的 .tgz
```

## 安装

在 DSH Desktop 的「工作台市场」中搜索「GitHub 排名」安装（分类：开发），或从 [Releases](https://github.com/liuhao11223/githb-ranking/releases/latest/download/githb-ranking.tgz) 下载 `githb-ranking.tgz`，在「工作台管理」中从本地文件安装。

## 说明

本工作台由 [liuhao11223](https://github.com/liuhao11223) 开发，代码以 MIT 许可在 [githb-ranking](https://github.com/liuhao11223/githb-ranking) 开源。`package.json` 与客户端 `register()` 中的 `repository` 均指向该仓库。