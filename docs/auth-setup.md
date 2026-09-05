# 登录认证（Melody Auth）接入与部署指南

本站已接入自建的 [Melody Auth](https://github.com/ValueMelody/melody-auth)（部署在 Cloudflare Workers），
认证类型为 **SPA（OAuth 2.0 + PKCE）**，登录时携带组织 `mc-party`。

设计细节见 `docs/superpowers/specs/2026-09-05-mc-event-auth-design.md`。

## 一、Melody Auth Admin Panel 配置（一次性）

1. **Apps → Create App**
   - Name：`MC 联谊`（随意）
   - Type：**SPA**
   - Redirect URIs（两条都要加）：
     - `https://<你的生产域名>/auth/callback`
     - `http://localhost:4321/auth/callback`（本地调试用）
   - 保存后复制该应用的 **Client ID**
2. **Orgs → mc-party**
   - `Allow Public Registration` = **true**（学生可自助注册）
   - `Only Use for Branding Override` = **false**（注册用户自动加入组织，方便管理）
   - 可选：配置组织 Logo / 配色，登录页会展示 mc-party 品牌
3. 确认邮件服务（Email Provider）已配置，注册 / 找回密码邮件可正常发送

## 二、环境变量

### 本地开发

复制 `.env.example` 为 `.env` 并填写：

```bash
PUBLIC_MCAUTH_SERVER_URI=https://<你的melody-auth域名>
PUBLIC_MCAUTH_CLIENT_ID=<SPA应用的clientId>
PUBLIC_SITE_URI=http://localhost:4321
```

### Cloudflare Pages（生产）

仪表盘 → Pages 项目 → Settings → Environment variables，
**Production 和 Preview 都要配置**：

| 变量 | 层 | 说明 |
|---|---|---|
| `PUBLIC_MCAUTH_SERVER_URI` | 构建时（前端 SDK 用） | melody auth 服务地址，结尾不带斜杠 |
| `PUBLIC_MCAUTH_CLIENT_ID` | 构建时（前端 SDK 用） | SPA 应用 Client ID |
| `PUBLIC_SITE_URI` | 构建时（redirect/postLogout 基址） | 生产为 `https://<你的域名>`，结尾不带斜杠 |
| `MCAUTH_SERVER_URI` | 运行时（Functions 验签用） | 与 `PUBLIC_MCAUTH_SERVER_URI` 相同 |
| `MCAUTH_CLIENT_ID` | 运行时（Functions 验签用） | 与 `PUBLIC_MCAUTH_CLIENT_ID` 相同 |

> `PUBLIC_*` 在构建时打进前端 bundle，属于公开信息（SPA 的标准形态）；
> 配置后需要**重新触发一次部署**才会生效。

### 已移除的变量

Turnstile 相关变量（`TURNSTILE_SECRET`、`TURNSTILE_HOSTNAMES`）已不再使用，
可从 Pages 环境变量中删除。`IMG_UPLOAD_URL` 晒图图床变量**继续保留**。

## 三、数据库迁移（自动，无需手工操作）

`registrations` 表新增 `auth_id` 列（melody auth 用户 ID，UNIQUE）。
Functions 在首次写入时会自动：

1. `CREATE TABLE IF NOT EXISTS`（新库直接建全量表）
2. `ALTER TABLE ... ADD COLUMN auth_id TEXT`（存量库补列，列已存在时自动忽略）
3. `CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_auth_id`

老用户下次提交报名时，若学号已存在且从未绑定账号，会**自动认领绑定**，
无需任何数据迁移脚本。`d1/schema.sql` 已同步更新，可用于全新环境初始化。

## 四、部署

```bash
npm run build          # 本地确认构建通过
npm run pagesdeploy    # 部署 dist + functions/ 到 Cloudflare Pages
```

Git 集成模式下推送 `feat.auth` 分支合并到 `main` 即自动部署。

## 五、部署后验证

1. 打开 `https://<你的域名>/me`（个人主页），应自动跳转到 melody auth 登录页（mc-party 品牌）
2. 注册新账号（邮箱验证码）→ 登录成功回跳个人主页 → 填写表单提交 → 显示「报名成功」
3. 退出登录 → 重新登录（右上角用户信息可进入个人主页）→ 个人主页应直接显示刚才的报名信息（无需任何凭证）
4. 旧链接 `/register` 会自动重定向到 `/me`
4. `/gallery`：登录后应显示「晒图署名（来自你的报名信息）」，直接选图提交
5. `/lottery`：未登录可玩；登录后显示「检测到你的报名记录：<MC ID>」
6. curl 验证后端验签已生效：
   ```bash
   curl https://<你的域名>/api/me
   # 预期 401 {"ok":false,"code":"unauthorized",...}
   ```

## 六、工作原理速查

```
登录：任意页「登录 / 注册」→ triggerLogin(org=mc-party)
  → melody auth 托管页（登录/注册/邮箱验证）
  → 302 回 /auth/callback?code&state → PKCE 换 token（S256）
  → refresh/id token 存 localStorage → 跳回来源页
会话：access token 过期后 SDK 自动用 refresh token 续期（refresh token 不轮换）
鉴权：/api/* 用 Authorization: Bearer <accessToken>；
  Functions 以 melody auth JWKS 本地验签（RS256 + iss + azp），提取 sub 作为 auth_id
绑定：一人一账号一条报名（auth_id 唯一）；学号唯一；学号被其他账号绑定返回 409
```

## 七、常见问题

- **登录后页面一直「正在前往登录页」**：检查 Pages 构建变量
  `PUBLIC_MCAUTH_*` 是否已配置并重新部署；本地检查 `.env`。
- **报名提交 401**：Functions 运行时变量 `MCAUTH_SERVER_URI` / `MCAUTH_CLIENT_ID`
  未配置或与前端不一致（`iss`/`azp` 校验失败）。
- **「该学号已绑定另一个账号」**：该学号的报名已被其他 melody auth 账号认领；
  确认无误后可在 Admin Panel 调整。
- **换设备登录**：直接登录即可，报名记录随账号走，不再依赖 UUID 或登录链接。
