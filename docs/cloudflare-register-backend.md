# 报名后端：Cloudflare Pages Functions + D1

> 登录认证（Melody Auth）的环境变量、Admin Panel 配置与部署验证见
> [`docs/auth-setup.md`](./auth-setup.md)。本文只描述 API 与数据库本身。

## 架构

```
浏览器 (RegisterForm.tsx / ScreenshotUploader.tsx)
  │  GET  /api/me                    Bearer <accessToken>
  │  POST /api/register              Bearer <accessToken> + JSON 字段
  │  POST /api/upload                Bearer <accessToken> + FormData(files/captions)
  ▼
functions/_auth.ts（JWKS 本地验签：RS256 + iss + azp → authId）
  ▼
D1 数据库 registrations / showcase 表
```

- 身份来源：Melody Auth 签发的 RS256 JWT access token（SPA + PKCE 获得），
  `sub` 即 `auth_id`。无 token / 签名无效 / 过期 → 401。
- 人机验证：登录环节由 Melody Auth 承担，API 不再做 Turnstile 校验。

## API

| 接口 | 说明 |
|---|---|
| `GET /api/me` | 当前登录用户的报名记录；未报名返回 `{ ok, registration: null }` |
| `POST /api/register` | 报名 / 修改。见下方绑定规则 |
| `POST /api/upload` | 晒图上传：按 `auth_id` 查本人报名取 `uuid`/`mc_id` 入库（防冒用）；图片转发 `IMG_UPLOAD_URL` 图床 |
| `GET /api/showcase` | 最新 60 条风采展示（公开） |

### 报名绑定规则（POST /api/register）

| 场景 | 行为 |
|---|---|
| 账号已有报名 | 更新姓名/学院/QQ/MC ID/擅长方向（学号锁定） |
| 新学号 | 插入记录（`auth_id` + 内部 `uuid`） |
| 学号已存在且从未绑定账号（存量数据） | 自动认领：绑定当前账号并更新信息 |
| 学号已绑定其他账号 | 409 `already_bound`，提示联系负责人 |

## 数据表（`d1/schema.sql`）

- `registrations.auth_id`：Melody Auth 用户 ID（`sub`），UNIQUE，一人一条
- `registrations.uuid`：内部关联字段（showcase 外键），**不再作为用户凭证展示**
- `student_id` UNIQUE：同学号仅一条记录
- 存量库由 Functions 自动 `ALTER TABLE` 补 `auth_id` 列并建索引，无需手工迁移

## 环境变量

| 变量 | 说明 |
|---|---|
| `MCAUTH_SERVER_URI` / `MCAUTH_CLIENT_ID` | 验签用（必配，见 auth-setup.md） |
| `IMG_UPLOAD_URL` | 晒图图床接口完整地址（必配，不在仓库出现） |
| ~~`TURNSTILE_SECRET` / `TURNSTILE_HOSTNAMES`~~ | 已移除，可删除 |

## 本地调试

1. 项目根目录建 `.dev.vars`：`MCAUTH_SERVER_URI=...`、`MCAUTH_CLIENT_ID=...`、`IMG_UPLOAD_URL=...`
2. `npm run build && npx wrangler pages dev`（本地 D1 自动创建，与远端互不影响）

## 查询报名名单

仪表盘 → Storage & Databases → D1 → 数据库 → Console：

```sql
SELECT id, auth_id, name, student_id, college, qq, mc_id, skills, created_at, updated_at
FROM registrations ORDER BY updated_at DESC;
```
