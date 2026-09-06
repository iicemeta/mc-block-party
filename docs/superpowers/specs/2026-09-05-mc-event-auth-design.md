# MC 联谊站接入 Melody Auth（SPA / OAuth2 PKCE）设计

日期：2026-09-05　分支：`feat.auth`

## 背景与目标

参与者经常忘记保存报名 UUID，导致无法找回报名记录。引入 melody auth
（已部署于 Cloudflare，组织 slug `mc-party`）作为登录注册系统：

- 报名、晒图强制登录；账号与报名记录一对一绑定，登录即找回
- UUID 凭证机制废除；`uuid` 列降级为内部关联字段（showcase 外键）
- 随机组队保持开放，登录后自动带入 MC ID
- 导航栏显示登录状态

## 架构（方案 A：静态多页 + React 岛屿）

- SDK：`@melody-auth/react`（Provider + useAuth），`@melody-auth/web`（导航栏轻量触发），后端验签用 `jose`
- 认证类型：SPA，PKCE（S256）授权码流程，无 client secret
- `redirectUri` 固定为 `<站点>/auth/callback`：code 换 token 只发生在该页，
  避免多岛屿争抢一次性 code；兑换后跳回 `sessionStorage.auth:returnTo`（仅允许站内路径）
- 每页最多一个 `AuthProvider` 实例；melody auth refresh token 不轮换，
  多实例并发静默刷新安全

| 页面 | 岛屿 | 行为 |
|---|---|---|
| `/auth/callback` | `AuthCallback`（唯一 Provider） | Setup 自动兑换 → 跳回 returnTo；本页不挂 AuthStatus |
| `/register` | `AuthGate(enforce)` + `RegisterForm` | 强制登录；`/api/me` 有记录→查看/编辑，无→新报名 |
| `/gallery` | `AuthGate(enforce)` + `ScreenshotUploader` | 强制登录；未报名提示先报名；已报名自动带出 MC ID |
| `/lottery` | `AuthGate(可选)` + `LotteryMachine` | 不强制登录；登录后带入 MC ID |
| 全站 Navbar | `AuthStatus`（无 Provider） | 读 shared storage 展示账号；`triggerLogin({ org: 'mc-party' })`；callback 页不挂载 |

登录流：`triggerLogin(org=mc-party, locale=zh)` → melody auth 托管页 →
302 回 `/auth/callback?code` → Setup 兑换 → refresh/id token 入 localStorage →
跳回 returnTo → 页面 Provider 恢复会话（access token 过期自动续期）→
API 带 `Authorization: Bearer`。

## 数据模型

```sql
ALTER TABLE registrations ADD COLUMN auth_id TEXT;  -- melody auth user sub
CREATE UNIQUE INDEX idx_registrations_auth_id ON registrations (auth_id);
```

- SQLite 唯一索引允许多个 NULL，老数据不冲突
- 函数首次写入时自动执行 `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN`
  （捕获 duplicate column 异常）+ `CREATE INDEX IF NOT EXISTS`，线上零手工迁移
- `uuid` 保留：新建报名仍由服务端 `crypto.randomUUID()` 生成，供 showcase 关联；
  不再返回给前端

## API（Pages Functions）

- 新增 `functions/_auth.ts`：`createRemoteJWKSet([MCAUTH_SERVER_URI]/.well-known/jwks.json)`
  + `jwtVerify`，校验 RS256、`iss`、`azp`（= MCAUTH_CLIENT_ID）、`exp`，返回 `authId`；
  无效/缺失 Bearer → 401
- 新增 `GET /api/me`：验签 → 按 `auth_id` 查报名 → `{ registration } | { registration: null }`
- `POST /api/register`：必须 Bearer；移除 `uuid`/`turnstileToken` 入参：
  1. 本人已有记录 → 更新（学号锁定）
  2. 新学号 → 插入（含 `auth_id`、内部 uuid）
  3. 学号已存在且 `auth_id` 为空 → 自动认领绑定（老用户平滑迁移）
  4. 学号已绑定其他账号 → 409 提示联系负责人
- `POST /api/upload`：必须 Bearer；不再收 `uuid`，服务端按 `auth_id` 查本人记录取
  `uuid`/`mc_id` 入库（防冒用）
- Turnstile 全部移除：`siteverify`、`TURNSTILE_*` 环境变量、`Turnstile.tsx`、
  三个组件中的人机验证 UI 与校验

## 前端要点

- `src/lib/auth.ts`：集中读取 `import.meta.env.PUBLIC_MCAUTH_SERVER_URI / CLIENT_ID / SITE_URI`，
  提供 `authConfig`、`returnTo` 写读（站内路径校验，防 open redirect）、`orgSlug = 'mc-party'`
- `AuthGate.tsx`：`<AuthProvider><GateInner>{children}</GateInner></AuthProvider>`；
  `isAuthenticating` → 加载态；未登录且 enforce → 自动 `loginRedirect`
  （sessionStorage 时间戳防 5 秒内循环）；未登录且非 enforce → 直接渲染
- 提交前 `useAuth().acquireToken()` 获取 Bearer
- 成功面板不再展示 UUID/登录链接，改为「账号已绑定，随时登录查看」
- 删除 `session.ts` 的 UUID 会话逻辑与 `STORAGE_KEYS.session/registration`；
  `STORAGE_KEYS.draft` 草稿保留
- 401 → 提示登录态过期请重新登录

## melody auth 控制台配置（用户一次性操作）

1. Apps → 创建 SPA 应用：Redirect URIs =
   `https://<生产域名>/auth/callback`、`http://localhost:4321/auth/callback`；记录 clientId
2. Org `mc-party`：Allow Public Registration = true；
   Only Use for Branding Override = false；可选配置组织品牌

## 环境变量

| 变量 | 层 | 用途 |
|---|---|---|
| `PUBLIC_MCAUTH_SERVER_URI` | 构建时（前端） | SDK serverUri |
| `PUBLIC_MCAUTH_CLIENT_ID` | 构建时（前端） | SDK clientId |
| `PUBLIC_SITE_URI` | 构建时（前端） | redirectUri / postLogoutRedirectUri 基址 |
| `MCAUTH_SERVER_URI` | 运行时（Functions） | iss 校验 |
| `MCAUTH_CLIENT_ID` | 运行时（Functions） | azp 校验 |

新增 `.env.example`；`.env` 已在 gitignore。

## 错误处理

- 刷新失败/refresh token 失效 → 视为未登录 → enforce 页自动重登（防循环）
- auth server 不可达 → 登录跳转报错提示；后端 JWKS 拉取失败 → 401/提示稍后重试
- 409 学号绑定冲突、403/404 → 明确中文文案

## 测试与验证

- `npm run build` + `tsc --noEmit`（functions 与 src）通过
- 端到端：配置 `.env` 后 `astro dev`（前端）+ `wrangler pages dev`（函数），
  用线上 melody auth 注册→报名→退出→重新登录找回→晒图上传
- 交付 `docs/auth-setup.md`：控制台配置、环境变量、部署与验证步骤
