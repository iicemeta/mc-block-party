# 报名后端：Cloudflare Pages Functions + D1

## 架构

```
浏览器 (RegisterForm.tsx)
  │  POST /api/register  { name, studentId, college, qq, mcId, skills, turnstileToken, uuid? }
  │  GET  /api/register?uuid=...  （查询报名用于回填）
  ▼
functions/api/register.ts (Pages Function)
  │  1. 字段校验（长度/格式/白名单）
  │  2. Turnstile siteverify（校验 success + action=register）
  │  3. D1 写入/更新（新报名发 UUID，修改需验 UUID，学号占用返 409）
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
| `IMG_UPLOAD_URL` | 晒图上传的图床接口完整地址（`functions/api/upload.ts` 依赖，**必配**；写在仪表盘环境变量里，不在仓库出现，避免暴露图床域名） |

## 晒图上传后端（/api/upload）

- 前端一次请求批量提交所有图片（`files` 多值字段 + `captions` 每张一句 + `turnstileToken` + `uuid`）
- 服务端：**UUID 验证**（必须为已报名凭证，MC 游戏 ID 以报名记录为准，防止冒用）→ Turnstile 校验（action=gallery）→ 单张 ≤5MB、单次 ≤20 张、仅图片类型 → 逐张转发图床 → 写入 `showcase` 表 → 返回 `{ ok, mcId, results: [{ name, url }] }`
- 图床域名不出现在前端与仓库；图片 URL 由上传结果返回给提交者（图片可访问必然包含域名，属预期）

## 风采展示接口（/api/showcase）

- `GET /api/showcase`：返回最新 60 条展示记录 `{ mcId, imageUrl, caption, createdAt }`，gallery 页「风采展示区」消费

## 数据表

函数在首次写入时会自动 `CREATE TABLE IF NOT EXISTS`，无需手动初始化。
如需手动管理，在仪表盘 D1 控制台执行 `d1/schema.sql` 即可，两者等价。

- `uuid`：报名唯一凭证（UUID v4，服务端 `crypto.randomUUID()` 生成），用于查询/修改，UNIQUE
- `student_id` 唯一：同一学号只允许一条记录
- `skills` 以 JSON 数组字符串存储：`["build","redstone","survival","pvp"]`

### UUID 防冒用流程

| 场景 | 行为 |
|---|---|
| 新学号报名 | 写入记录，返回 UUID（仅此一次展示） |
| 相同学号 + 未提供 UUID | 409：`该学号的同学已经报名…请联系活动负责人处理` |
| 相同学号 + UUID 匹配 | 更新原记录（UUID 不变） |
| 相同学号 + UUID 不匹配 | 403：`UUID 与该学号的报名记录不匹配…请联系活动负责人处理` |

### 存量表迁移（已建表时添加 uuid 列）

仪表盘 D1 Console 执行：

```sql
ALTER TABLE registrations ADD COLUMN uuid TEXT UNIQUE;
UPDATE registrations SET uuid =
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
  substr(lower(hex(randomblob(2))), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
  lower(hex(randomblob(6)))
WHERE uuid IS NULL;
```

（测试数据也可直接 `DROP TABLE registrations;` 让函数按新结构重建。）

## 查询接口

`GET /api/register?uuid=<uuid>` 返回该 UUID 对应的报名信息（用于表单回填）；404 表示无记录。

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
SELECT id, uuid, name, student_id, college, qq, mc_id, skills, created_at, updated_at
FROM registrations ORDER BY updated_at DESC;
```

导出 CSV 可直接在 Console 中执行后下载。

## 本地调试（可选）

不装 wrangler 时无法本地跑 Functions，可直接推送到 Pages 的 preview 环境验证。
若后续安装 wrangler，可：

1. 项目根目录建 `.dev.vars`：`TURNSTILE_SECRET=<你的密钥>`、`TURNSTILE_HOSTNAMES=localhost,127.0.0.1`
2. `npm run build && npx wrangler pages dev`（本地 D1 自动创建，互不影响远端）
