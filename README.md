# dsh-usage-stats

[![GitHub Release](https://img.shields.io/github/v/release/menghun3-cn/dsh-usage-stats?display_name=tag&sort=semver&color=1f6feb)](https://github.com/menghun3-cn/dsh-usage-stats/releases/latest)
[![CI](https://github.com/menghun3-cn/dsh-usage-stats/actions/workflows/ci.yml/badge.svg)](https://github.com/menghun3-cn/dsh-usage-stats/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-2da44e)](LICENSE)

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 网页端提供 **Token 用量统计面板**。

Token usage analytics for the DeepSeek Harness Web GUI (`dsh web`).

![dsh-usage-stats v0.2.17 interface preview](docs/images/usage-panel-v2.svg)

> 展示图使用脱敏演示数据（`docs/images/usage-panel.svg` 为 0.2.0 旧界面存档，仅作历史对照）。

## 一眼看懂 / At a glance

| | 能力 | 说明 |
| --- | --- | --- |
| 🏷️ | 左下角悬浮徽标 | 显示「用量 · 今日」tokens（两位小数），可切换为 今日 / 本月 / 累计，选择会持久化 |
| 📊 | 三个汇总卡 | 今日、本月、累计 tokens（舍入到两位小数，万/亿自动换算） |
| 📈 | 最近 7 天柱状图 | 每根柱子顶部直接标注数值；点击柱子下钻当天 明细（输入/输出/缓存命中/缓存读写/模型拆分） |
| 📉 | 最近 12 个月折线图 | 每个线点上方标注数值、下方标注月份；点击线点下钻该月 每日用量 |
| 🔄 | 自动刷新 | 插件挂载后每 60 秒刷新一次，面板开合都一样；跨天数字自动翻新为今日 |
| 🗄️ | 有界历史 | 服务端只保留最近 400 天（12 个月 + 余量），缓存文件不会无限膨胀 |

- 数据来自 `assistant/chunk` / `assistant/message` 中 provider 上报的 `usage`，不是本地估算。
- 统计完全在本机进行，凭据、提示词、回复与文件路径从不进入面板或缓存。
- 面板支持中文和英文，跟随 Harness 界面语言。

## 界面结构 / Panel

点击屏幕左下角的「用量」悬浮按钮展开面板（再次点击空白处或按 `Esc` 收起）：

1. **标题栏**：左侧「Token 用量」；右侧 今日/本月/累计 切换器（决定徽标显示哪个数字）、生成分享图片、刷新、关闭。
2. **汇总卡**：「今日」「本月」「累计」三个汇总，格式始终为两位小数（`9999.00` / `1.23万` / `1.23亿`）。
3. **最近 7 天柱状图**：按本地日历取最近 7 天（含今天，零用量天保留占位），柱顶直接标注数值；点击任一柱子查看当天详情。
4. **最近 12 个月折线图**：按本地日历聚合最近 12 个月（含当前月），线点上方标注数值、下方标注 MM 月份；当前月带高亮圆环；点击任一线点下钻该月每日用量。
5. 详情视图均可返回主面板；标题栏「更新于 HH:MM」显示最近一次成功刷新的时刻。

## 快速安装 / Quick start

### 桌面版 GUI（desktop profile，DSH 0.2.0-rc.2）

桌面版（Electron 应用）实际加载 `~/.dsh/profiles/desktop`，**不是** `web` profile——安装到 `web` 不会出现在桌面 GUI 里。使用桌面版自带的 `dsh plugin` 通道从 GitHub 仓库安装：

```powershell
# 1) 先完全退出 DeepSeek Harness 桌面应用（GUI 运行时会锁住 profile 的
#    package.json，导致 pnpm 写清单失败，报 EPERM）。
# 2) 把下面的 <dsh> 替换为安装目录，例如
#    D:\Program Files\DeepSeek Harness\resources\app.asar\dsh
$env:ELECTRON_RUN_AS_NODE = '1'
# pnpm 会把 github: 短协议规范化为 ssh（没有 SSH key 时被 GitHub 拒绝），
# 注入 insteadOf 环境配置强制走 https（仅本次进程生效，不改全局 gitconfig）：
$env:GIT_CONFIG_COUNT = '2'
$env:GIT_CONFIG_KEY_0 = 'url.https://github.com/.insteadOf'
$env:GIT_CONFIG_VALUE_0 = 'ssh://git@github.com/'
$env:GIT_CONFIG_KEY_1 = 'url.https://github.com/.insteadOf'
$env:GIT_CONFIG_VALUE_1 = 'git@github.com:'
& "C:\Program Files\DeepSeek Harness\DeepSeek Harness.exe" --expose-internals `
  "<dsh>\node_modules\@deepseek-ai\dsh-desktop-host\lib\cli.js" `
  plugin --profile desktop add "git+https://github.com/menghun3-cn/dsh-usage-stats.git"
```

`dsh plugin add` 只安装仓库依赖，不会自动写补丁。手动在 `~/.dsh/profiles/desktop/cordis.patch.yml` **末尾**追加挂载行：

```yaml
# dsh-usage-stats（GitHub 仓库安装）
- insert:
    - id: usage-stats
      name: dsh-usage-stats
```

重新打开桌面应用，屏幕左下角会出现浮动的「用量」悬浮按钮，点击展开面板。

升级（同样先退出桌面应用再执行）：

```powershell
& "C:\Program Files\DeepSeek Harness\DeepSeek Harness.exe" --expose-internals `
  "<dsh>\node_modules\@deepseek-ai\dsh-desktop-host\lib\cli.js" `
  plugin --profile desktop update dsh-usage-stats
```

> `github:` 短协议与 `git+https:` 指向同一仓库：短协议会被 pnpm 规范化为 SSH（无 SSH key 时报 `Permission denied (publickey)`），推荐显式 `git+https://github.com/menghun3-cn/dsh-usage-stats.git`。GitHub 安装没有 npm 版本语义，跟随仓库 HEAD；要固定版本可给仓库打 tag（如 `v0.2.16`）后使用 `...git#v0.2.16` 形式的 spec。与 `npx` 兼容安装器二选一，不要同时启用两种安装路径。

### Web profile（浏览器版，0.1.x CLI 或 `dsh web`）

需要 DeepSeek Harness `web` profile（`@deepseek-ai/dsh >= 0.1.0-rc.6`）。

```bash
dsh plugin --profile web add "github:menghun3-cn/dsh-usage-stats"
```

然后重启已经运行的 `dsh web`，并在浏览器中硬刷新。

> 0.2.9 起客户端挂载到 0.2.0 的 `shell.overlay` 布局槽位；0.1.x 的 `web` profile 缺少该槽位，只会提供数据端点、不再渲染 UI。桌面版（0.2.0-rc.2+）不受影响。

### 插件市场 GUI 安装（DSH Community Market，Path A 标准来源）

本仓库按 [DSH Community Market 目录 adapter 指南](https://github.com/anywhere-labs/deepseek-harness-desktop/blob/master/dsh-community-market/docs/catalog-adapter-guide.zh.md) 的**标准来源（Path A）** 接入，无需修改 Market 代码。内置两份目录数据：

- `catalog/catalog-source.json` — 来源 manifest（`catalog-source.schema.json` v1.0.0）
- `catalog/v1/plugins.json` — 标准 provider page（`catalog-provider-page.schema.json` v1.0.0）

**使用前提（重要）**：市场托管安装只接受 npm registry 的精确稳定版本，git 条目仅可浏览。目录条目身份与仓库包名 `dsh-usage-stats` 对齐。要启用 GUI「安装」按钮，需先发布：

1. 仓库包身份已统一为 `dsh-usage-stats`；每次发版需同步 `package.json` / `package-lock.json` / `catalog/v1/plugins.json` 的版本。
2. 发布公共包：`npm publish`。
3. 把 `catalog/v1/plugins.json` 内容发布到 `https://menghun3-cn.github.io/dsh-usage-stats/v1/plugins`（GitHub Pages，manifest 与 endpoint 必须同源、HTTPS 443、无凭据）。
4. 在 DSH 插件市场 → 来源管理 → 添加来源，粘贴 manifest URL：`https://menghun3-cn.github.io/dsh-usage-stats/catalog-source.json`，选择后即可走「可恢复安装边界」GUI 安装。

> 若最终包名不同，请同步修改 `catalog-source.json` 的 `providerId`/`transport.endpoint` 与 `catalog/v1/plugins.json` 的身份字段。发布前目录条目可浏览但安装保持禁用（fail-closed，属预期）。

升级或卸载：

```bash
dsh plugin --profile web update dsh-usage-stats
dsh plugin --profile web remove dsh-usage-stats
```

<details>
<summary><strong>兼容安装器：无法使用 dsh plugin 时展开</strong></summary>

PowerShell、命令提示符和 macOS/Linux 终端使用同一条命令：

```bash
npx --yes github:menghun3-cn/dsh-usage-stats
```

安装器会把运行文件复制到 `~/.dsh/profiles/node_modules/dsh-usage-stats`，并在 `profiles/web/cordis.patch.yml` 中幂等启用插件。重复运行即可更新，不会重复追加配置。设置了 `DSH_HOME` 时使用该目录。

`dsh plugin` 与 `npx` 是两条独立安装路径，请选择其中一种；不要同时保留手工 Cordis entry 和 bundle 注册，否则会重复挂载。

```bash
# 预览，不修改文件
npx --yes github:menghun3-cn/dsh-usage-stats --dry-run

# 检查现有安装
npx --yes github:menghun3-cn/dsh-usage-stats --check

# 安装但不修改 Cordis patch
npx --yes github:menghun3-cn/dsh-usage-stats --no-enable
```

无法使用 `npx` 时可从源码运行 `node scripts/install.mjs`。

</details>

## 使用 / Usage

1. 点击屏幕左下角的「用量」悬浮按钮展开面板；再点空白处或按 `Esc` 收起。
2. 标题栏的 今日/本月/累计 切换器决定悬浮徽标显示哪个数字（持久化，重启不丢）。
3. 点击「最近 7 天」柱状图上的任意柱子，查看当天的输入/输出/缓存读写与缓存命中率、模型拆分。
4. 点击「最近 12 个月」折线图上的任意线点，查看该月每日用量；返回可逐日下钻。
5. 「更新于 HH:MM」表示最近一次成功刷新；面板开着的时候每 60 秒自动更新，关着的时候静默更新徽标数字。
6. **生成分享图片**：标题栏分享按钮把当前统计绘成一张浅色 PNG（三汇总卡 + 7 天柱状图 + 12 个月折线图，全部带数值），弹窗预览后可 **下载 PNG**、**分享到微信**（复制到系统剪贴板，微信里直接粘贴）或关闭。

## 数据保留 / Retention

- 服务端按「日」聚合持久化到 `~/.dsh/storages/usage-stats-cache.json`，只保留**最近 400 天**（12 个月 + 余量），每次聚合时自动裁剪最旧的天，缓存文件大小有界。
- 统计从会话事件进行**增量折叠**，不逐条重放历史；`0.1.x` 的旧缓存在不兼容时会被识别并重建。
- 顺带说明：`0.2.5` 之前版本的 providers / balance / token-plan 账户卡片功能已移除，插件现在是纯 token 面板；对应的 `/api/usage-stats/providers|account|balance|subscriptions` 路由保留为兼容空壳（`not-configured`）。

## Agent 友好安装 / Agent-friendly installation

<details>
<summary><strong>复制给 Codex、Claude Code 或其他本地编码 Agent</strong></summary>

```text
Install or update dsh-usage-stats from:
https://github.com/menghun3-cn/dsh-usage-stats

Constraints:
- Resolve DSH_HOME from the environment; otherwise use ~/.dsh.
- Do not read, print, edit, or request .credentials.yaml, auth.json, cookies, or any API key.
- Do not expose the plugin through a reverse proxy.
- Do not restart or terminate an existing dsh process without asking me.

Procedure:
1. Confirm node, npx, and dsh are available.
2. Prefer `dsh plugin --profile web update dsh-usage-stats` when already installed; otherwise use `dsh plugin --profile web add "github:menghun3-cn/dsh-usage-stats"`.
3. If unavailable, use: npx --yes github:menghun3-cn/dsh-usage-stats
4. Do not combine bundle installation with an existing manual dsh-usage-stats Cordis entry.
5. For npx, require a verified package and exactly one Cordis entry, then run again with --check.
6. Report the installation path and resolved profile paths.
7. If dsh web is running, report that a restart is needed and stop.
```

只获准检查而不能修改时运行：

```bash
npx --yes github:menghun3-cn/dsh-usage-stats --check
```

安装器退出码：未知参数返回 `2`；文件、版本或配置验证失败返回非零；成功时输出已验证版本、安装目录和 patch 路径。Agent 无需自行解析或重写 YAML。

</details>

## 隐私与安全 / Privacy & security

- 面板与徽标只显示聚合后的 Token 数字；凭据、提示词、回复、文件路径都不进入浏览器响应、缓存或日志。
- 插件端点仅接受 GET，并同时校验 peer socket 与 Host；非回环请求返回 `403`，其他方法返回 `405`；所有响应均为 JSON 并带 `Cache-Control: no-cache`。
- 用量缓存 `~/.dsh/storages/usage-stats-cache.json` 只保存聚合 Token、会话 id、不透明 revision 与折叠游标。

本机反向代理会让插件看到代理自身的回环地址。请勿把端点经反向代理暴露到局域网或公网；确需代理时必须在代理层增加可靠认证与访问控制。安全问题请按 [SECURITY.md](SECURITY.md) 私下报告。

## 正确性与数据口径 / Correctness

统计值来自 `assistant/chunk` 或 `assistant/message` 中 provider-reported `usage`，不是本地估算。相同 turn/step 的后续样本会替换旧样本，并按 `provider/model` 归集。

- 活跃会话只处理新追加事件。
- 持久化会话使用不透明 revision；未变化时不重复读取日志。
- seq 缺口、日志重写或 live/persisted 切换时完整重折叠该会话。
- 聚合采用 single-flight，并在同一临界区原子保存缓存。
- `validate:live` 会逐会话比较 raw artifact、`session.history`、插件端点与官方 token projection；缺文件或不一致会返回非零。

## API

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/api/usage-stats/usage` | 按日期/provider/model 聚合的 Token 与缓存命中率（最近 400 天） |
| `GET` | `/api/usage-stats/providers` | 兼容空壳：provider 列表（空） |
| `GET` | `/api/usage-stats/account?provider=<id>` | 兼容空壳：`not-configured` |
| `GET` | `/api/usage-stats/balance?provider=<id>` | 兼容空壳：`not-configured` |
| `GET` | `/api/usage-stats/subscriptions` | 兼容空壳：`not-configured` |

非 GET 返回 `405`，非回环请求返回 `403`。

## 开发与验证 / Development

```bash
npm install
npm run check
npm test
npm pack --dry-run
```

`npm test` 完全离线，覆盖 bundle、客户端渲染与请求竞态、服务端安全边界、400 天保留裁剪、缓存和安装器幂等性。真实数据验证需先运行 `dsh web`：

```bash
npm run validate:live
node scripts/check-balance.mjs
```

所有服务端脚本均遵循 `DSH_HOME`。

## 兼容性 / Compatibility

当前版本 `0.2.17`（适配 Harness 0.2.0-rc.2 插件规范）：服务端以 Cordis 对象插件面挂载（`module.default = { name, inject, apply }`，不引入第二份 cordis 副本），路由经 `webServer.register` 注册；客户端以 `__ModuleLoader__` factory 格式发布 `exports["./client"]` 包，注册到 0.2.0 的 `shell.overlay` 布局槽位（直接消费平台 `react` 种子与 `react/jsx-runtime`，0.2.10+ 不再引入 `dsh-client-ui-primitives`），数据走 `sessions.snapshotEvents` / `sessionPersistence` 句柄读取。Harness 预发布接口变化时可能需要同步适配。

## License

[MIT](LICENSE)
