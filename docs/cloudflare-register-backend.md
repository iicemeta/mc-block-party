# 报名后端：Cloudflare Pages Functions + D1

## 架构

```
浏览器 (RegisterForm.tsx)
  │  POST /api/register  { name, studentId, college, qq, mcId, skills, turnstileToken }
  ▼
functions/api/register.ts (Pages Function)
  │  1. 字段校验（长度/格式/白名单）
  │  2. Turnstile siteverify（校验 success + action=register）
  │  3. D1 upsert（按学号唯一，重复报名=更新资料）
  ▼
D1 数据库 registrations 表
```

## 你已在仪表盘完成的配置

- D1 数据库绑定（变量名任意，代码运行时自动探测 D1 实例，推荐叫 `DB`）
- 环境变量 `TURNSTILE_SECRET`（Production 与 Preview 都要配）

## 可选环境变量

| 变量 | 说明 |
|---|---|
| `TURNSTILE_HOSTNAMES` | 逗号分隔的来源域名白名单（如 `mc-block-party.pages.dev`）。**生产环境建议设置且不要包含 localhost**；不设置则跳过域名校验（token 本身已由 widget 注册域名约束） |

## 数据表

函数在首次写入时会自动 `CREATE TABLE IF NOT EXISTS`，无需手动初始化。
如需手动管理，在仪表盘 D1 控制台执行 `d1/schema.sql` 即可，两者等价。

- `student_id` 唯一：同一学号重复报名视为**更新资料**（upsert），不会产生重复记录
- `skills` 以 JSON 数组字符串存储：`["build","redstone","survival","pvp"]`

## 部署

Git 集成模式下推送即部署：

- 构建命令：`npm run build`
- 输出目录：`dist`
- `functions/` 目录由 Cloudflare Pages 自动识别并部署为 API 路由

推送后验证：`curl -X POST https://<你的域名>/api/register -H "content-type: application/json" -d '{}'`
预期返回 400（字段校验），说明函数已上线。

## 查询报名名单

仪表盘 → Storage & Databases → D1 → 你的数据库 → Console：

```sql
SELECT id, name, student_id, college, qq, mc_id, skills, created_at, updated_at
FROM registrations ORDER BY updated_at DESC;
```

导出 CSV 可直接在 Console 中执行后下载。

## 本地调试（可选）

不装 wrangler 时无法本地跑 Functions，可直接推送到 Pages 的 preview 环境验证。
若后续安装 wrangler，可：

1. 项目根目录建 `.dev.vars`：`TURNSTILE_SECRET=<你的密钥>`、`TURNSTILE_HOSTNAMES=localhost,127.0.0.1`
2. `npm run build && npx wrangler pages dev`（本地 D1 自动创建，互不影响远端）
