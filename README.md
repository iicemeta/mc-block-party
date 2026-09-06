# 方块嘉年华（mc-block-party）

「MyGO!!!!! × Yuzusoft」方块联谊活动的站点：报名登记、随机组队抽奖、风采晒图墙与管理后台。

## 一键部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/iicemeta/mc-block-party)

点击按钮按向导授权 GitHub 仓库并创建 Worker 即可；前端构建变量已随仓库的 `.env.production` 提供，运行时变量由仓库内 `wrangler.jsonc` 定义（敏感变量部署后在仪表盘 Settings → Variables 中补充）。

基于 **Astro + React** 构建，部署在 **Cloudflare Workers**（`@astrojs/cloudflare` 适配器）：

- 页面全部预渲染为静态资源（免费、不计 Workers 请求）
- 后端接口位于 `src/pages/api/**`（`export const prerender = false`，按需渲染走 Worker）
- 数据存 **Cloudflare D1**（绑定名 `DB`），图片存外部图床（由 `IMG_UPLOAD_URL` 指定上游接口）
- 鉴权使用 melody auth 的 JWT（无状态），UI 组件库为仓库内 vendor 的 `minecraft-react-ui`

## 页面一览

| 路由 | 说明 |
| --- | --- |
| `/` | 活动主页（报名入口、扫码进群、流程介绍） |
| `/register` | 报名登记 |
| `/me` | 个人中心（登录后可见报名信息与晒图管理） |
| `/lottery` | 随机组队抽奖 |
| `/gallery` | 风采墙（晒图提交与展示） |
| `/admin` | 管理后台（报名/晒图管理、数据导出） |
| `/auth/callback` | 登录回跳（瞬态页） |
| `/404` `/500` | Minecraft 风格错误页 |

## 环境变量详解

变量按生效时机分为**构建时**与**运行时**两类，配置位置完全不同，不要混淆。

### 1. 构建时变量（`PUBLIC_*`，Astro 构建时内联进页面代码）

只在 `npm run build` 执行的那一刻生效，构建产物中是字面量；**改了必须重新构建部署才会生效**。

| 变量 | 说明 |
| --- | --- |
| `PUBLIC_SITE_URI` | 本站对外访问基址（结尾不带斜杠），用于拼接登录回跳 `/auth/callback` 与登出跳转。生产为 `https://blockparty.iicemeta.com`，本地开发为 `http://localhost:4321` |
| `PUBLIC_MCAUTH_SERVER_URI` | melody auth 服务地址（结尾不带斜杠），前端登录跳转用 |
| `PUBLIC_MCAUTH_CLIENT_ID` | melody auth Admin Panel 中为本站创建的 SPA 应用 clientId（公开值，会出现在页面代码中） |

这三个值都是**公开值**（会内联进任何访客可见的 JS 中，不存在泄密问题），因此生产值直接提交在 **`.env.production`**（`astro build` 默认 production 模式自动加载），GitHub 连接部署无需任何额外配置。本地开发时复制 `.env.example` 为 `.env`（已被 gitignore，勿提交）填入值即可，`.env` 优先级高于 `.env.production`。

### 2. 运行时变量（Worker 运行时读取，与 `.env` 无关）

代码中通过 `cloudflare:workers` 的 `env` 读取（见 `src/server/_auth.ts`、`_admin.ts`、`src/pages/api/upload.ts`）。

**非敏感变量** —— 直接写在 `wrangler.jsonc` 的 `vars` 中，随 `wrangler deploy` 生效：

| 变量 | 说明 |
| --- | --- |
| `MCAUTH_SERVER_URI` | melody auth 服务地址，服务端 JWT 验签与 userinfo 拉取用（通常与 `PUBLIC_MCAUTH_SERVER_URI` 相同） |
| `MCAUTH_CLIENT_ID` | melody auth SPA clientId，服务端校验 JWT 的 `azp` 用 |
| `SUPER_ADMIN_EMAIL` | 超级管理员引导邮箱：该邮箱首次登录并同步后自动晋升为超级管理员；留空则角色完全由数据库管理 |
| `IMG_UPLOAD_URL` | 图床上游接口完整地址。后端以 POST multipart 提交 `file` 字段，期望响应 `{ code: 200, url: "..." }`。图片 URL 本就公开展示在风采墙，无需保密，用普通变量即可 |

**敏感变量（密钥类）** —— 不放配置文件，用命令设置：`npx wrangler secret put <名称>`（本地开发写入 `.dev.vars`，已被 gitignore）：

| 变量 | 说明 |
| --- | --- |
| `TURNSTILE_SECRET` | Cloudflare Turnstile 服务端密钥（预留，代码已支持、暂未接线；启用报名/晒图防刷时设置） |
| `TURNSTILE_HOSTNAMES` | Turnstile 允许的域名列表，逗号分隔（同上，配套前端组件见 `src/react/Turnstile.tsx`） |

### 3. 平台绑定（非环境变量）

| 绑定 | 配置位置 | 说明 |
| --- | --- | --- |
| `DB` | `wrangler.jsonc` → `d1_databases` | Cloudflare D1 数据库。代码由 `src/server/_lib.ts` 的 `resolveD1` 自动识别绑定；应用运行时 `ensure*Schema` 会在首次请求时自动建表/迁移，权威模式见 `d1/schema.sql`，存量库迁移见 `d1/migrations/` |
| `ASSETS` | `wrangler.jsonc` → `assets` | 静态资源目录（`dist/`），由适配器自动配置 |

## 本地开发

要求 Node.js ≥ 22.12（见 `.nvmrc`）。

```sh
npm install
npm run dev        # http://localhost:4321，经 workerd 运行时，API 接口可用
```

- 本地 D1：`astro dev` 使用 wrangler 的本地 D1（`.wrangler/state`），可执行
  `npx wrangler d1 execute mc-block-party-db --local --file=d1/schema.sql` 初始化
- 本地运行时变量：在项目根目录建 `.dev.vars`（勿提交），格式 `KEY=value`；
  未配置的键会回退到 `wrangler.jsonc` 的 `vars`
- 前端构建变量：复制 `.env.example` 为 `.env` 填入本地值（本地 `PUBLIC_SITE_URI` 用 `http://localhost:4321`）
- 类型生成：修改 `wrangler.jsonc` 的绑定/vars 后执行 `npm run cf-typegen` 重新生成 `worker-configuration.d.ts`

其他常用命令：

```sh
npm run build      # 生产构建到 dist/
npm run preview    # 构建并本地预览生产产物
npx wrangler deploy --dry-run   # 校验配置与产物（不实际上传）
```

## 部署

### 方式一：仪表盘连接 GitHub（当前使用）

1. Cloudflare 仪表盘 → Workers & Pages → 创建 Worker → 连接 GitHub 仓库 `feat.workers` 分支
2. 构建命令 `npm run build`，部署由 Workers Builds 自动完成
3. 前端构建变量无需在仪表盘配置（已提交 `.env.production`）；运行时变量以本地 `wrangler.jsonc` 为准，推送即生效
4. 敏感变量（当前仅预留的 `TURNSTILE_*`）需在仪表盘 Settings → Variables 中配置，或本地执行 `npx wrangler secret put <名称>`

每次 `git push` 后自动构建部署；确保 `wrangler.jsonc` 与仓库同步即可。

### 方式二：本地 CLI 部署

```sh
npm run deploy     # 等价于 astro build && wrangler deploy
```

首次部署前确认：

1. `wrangler login` 已登录
2. D1 数据库已创建且 `wrangler.jsonc` 中 `database_id` 正确：
   `npx wrangler d1 create mc-block-party-db`
3. 敏感变量已用 `wrangler secret put` 设置

### D1 迁移（存量库）

应用运行时会自动完成等价迁移（`ensure*Schema`），一般无需手动操作。如需手动执行：

```sh
# 远程库
npx wrangler d1 migrations apply mc-block-party-db --remote
# 本地库
npx wrangler d1 migrations apply mc-block-party-db --local
```

迁移脚本见 `d1/migrations/`，权威模式见 `d1/schema.sql`。

## 项目结构

```text
/
├── d1/                        # D1 模式与迁移脚本
├── docs/                      # 鉴权/后端设计与部署文档
├── public/                    # 静态资源（图标、字体、二维码）
├── src/
│   ├── components/            # Astro 组件（导航、页脚）
│   ├── config/site.ts         # 站点文案配置（改文案只动这里）
│   ├── layouts/               # 页面布局
│   ├── lib/                   # 前端工具（shuffle、mock 数据）
│   ├── pages/                 # 页面（预渲染）+ api/（Worker 接口，按需渲染）
│   ├── react/                 # React 交互组件（登录、报名表、抽奖机、上传等）
│   ├── scripts/               # 全局脚本（点击音效）
│   ├── server/                # 接口共用服务端逻辑（鉴权、D1、管理员）
│   └── styles/                # 全局样式
├── vendor/minecraft-react-ui  # 内置 UI 组件库（见 minecraft-react-ui-USAGE.md）
├── wrangler.jsonc             # Workers 配置（绑定、vars、可观测性）
└── .env.production            # 公开的前端构建变量（astro build 自动加载）
```

## 相关文档

- [`docs/auth-setup.md`](docs/auth-setup.md) —— melody auth 接入配置
- [`docs/cloudflare-register-backend.md`](docs/cloudflare-register-backend.md) —— 后端与数据库说明
- [`docs/superpowers/specs/`](docs/superpowers/specs/) —— UI / 鉴权设计文档
- [`minecraft-react-ui-USAGE.md`](minecraft-react-ui-USAGE.md) —— UI 组件库用法
