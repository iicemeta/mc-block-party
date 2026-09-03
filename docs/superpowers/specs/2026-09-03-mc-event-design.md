# MC 联谊活动网站设计文档

- 日期：2026-09-03
- 状态：已确认
- 参与方：电脑技术协会、山商煤炭社

## 背景与目标

两个社团联合举办 Minecraft 联谊活动，需要一个活动网站：

1. 炫酷主页，展示双方社团入群二维码
2. 便捷的报名系统（点击即填）
3. 报名后随机组队抽取，带 MC 动画，并公开展示抽取核心源码以示公正
4. 联谊过程截图提交系统

**本期范围：仅 UI。** 报名提交与截图上传的真实后端提交暂不实现（前端模拟成功反馈）。

## 架构

- **Astro 7 多页面 + React 19 岛屿**（已确认方案 A）
- 每个页面一个 `.astro` 路由，页面主体挂载一个 React 岛屿组件
- UI 组件库：`minecraft-react-ui`（GitHub 安装：`npm install github:iicemeta/minecraft-react-ui`，非 npm 发布版）
- 报名数据经 `localStorage` 流转到组队页（模拟真实报名 → 抽取流程）
- 纯静态构建，无服务端代码；后续接后端只需在岛屿组件内补 fetch

### 路由

| 路由 | 页面 | 岛屿组件 |
|---|---|---|
| `/` | 主页 | `HomeHero.astro`（Astro 为主，动效纯 CSS） |
| `/register` | 报名 | `RegisterForm.tsx` |
| `/lottery` | 组队抽取 | `LotteryMachine.tsx` |
| `/gallery` | 截图提交 | `ScreenshotUploader.tsx` |

共享 `Layout.astro`：MC 风格导航栏（当前页高亮）+ 页脚（双社团署名 + 免责/说明）。

## 视觉主题

- 全局引入 `minecraft-react-ui/style.css`，通过 CSS 变量定制主题色：
  - 电脑技术协会：绿宝石色系（`--primary-color: #3b8526` 一类）
  - 山商煤炭社：煤炭深灰/岩黑色系
- 字体：
  - 英文/数字标题：Minercraftory（USAGE.md 的 `fonts.cdnfonts.com` CDN 方案，加载失败优雅降级）
  - 中文像素字体：npm 包 `fusion-pixel-12px-proportional-zh_hans`（本地打包，不依赖 CDN）
- 主页动效（纯 CSS/少量 JS）：
  - 漂浮像素方块背景（草方块、煤炭、钻石、TNT 等图标，多层级视差漂浮）
  - 大标题像素描边 + 金光扫过动画
  - 导航按钮、CTA 的 MC 按压式交互
- 物品图标：从 `PrismarineJS/node-minecraft-assets` raw 链接按需下载约 10 个 PNG 到 `public/img/items/`（草方块、煤炭、钻石、红石、TNT、箱子、工作台、末影珍珠等）。**不整包安装**（仓库体积过大）。

## 页面设计

### 1. 主页 `/`

- Hero 区：活动标题「电脑技术协会 × 山商煤炭社 MC 联谊」、时间/地点 Tag、CTA 按钮（立即报名 → `/register`）
- 双社团二维码卡片：并排两张 MC 物品栏风格卡片（名称、简介、二维码图、入群提示）
- 活动流程/亮点区：报名 → 组队 → 联谊 → 晒图，四个步骤配 MC 物品图标
- 二维码占位：自绘像素风 QR 样式 SVG，放 `public/qr/ctech-club.svg`、`public/qr/coal-club.svg`，之后直接替换同名文件即可

### 2. 报名 `/register`

- 字段（基础集）：
  - 姓名（Input，必填）
  - 学号（Input，必填）
  - 学院/班级（Input，必填）
  - QQ 号（Input，必填）
  - MC 游戏 ID（Input，必填）
  - 擅长方向（CheckboxGroup：建筑 / 红石 / 生存 / PVP）
- 便捷性设计：
  - 表单草稿自动存 `localStorage`（key：`mc-event:registration-draft`），刷新/关页不丢
  - 再次进入自动回填草稿
  - 提交成功后写入 `mc-event:registration`（正式记录），并显示 MC 风格成功弹层（UI only，不发网络请求）
- 校验：必填项为空时按钮禁用 + 行内提示

### 3. 组队抽取 `/lottery`

- 输入区：报名总人数、每组人数（演示默认值填充；若本地有报名记录则提示"检测到你的报名"）
- 抽取动画：
  - 点击「开始抽取」→ MC slot-machine 风格名字滚动（物品格内快速轮换名字，伴随 XP 条式进度）
  - 结束时 TNT 引爆式转场（粒子/震屏），随后逐队揭示
- 结果展示：队伍卡片（队号 + 成员 + 随机队伍名/图标）
- 源码公示：页面底部折叠面板展示 Fisher-Yates 洗牌核心源码（MC 风格代码面板），附「源码可审查，结果可复现」说明文字
- 算法：`fisherYatesShuffle`（种子可选，默认 `Math.random`）；演示名单为内置 mock

### 4. 截图提交 `/gallery`

- 箱子风格虚线拖拽区（拖入 / 点击选择，`<input type="file" multiple accept="image/*">`）
- 已选图片缩略图网格，每张可填说明文字、可删除
- 提交按钮（UI only：点击后模拟成功提示并清空）
- 页面下方「往期/示例」静态占位网格（MC 截图风格色块）

## 数据流

- `mc-event:registration-draft`：报名草稿（自动保存）
- `mc-event:registration`：报名提交记录（组队页读取，提示已报名）
- 抽取结果仅在当前会话内存中，不持久化
- 无任何网络请求

## 错误处理

- 字体/图标资源缺失：布局不塌陷，有回退字体与色块图标
- `localStorage` 不可用（隐私模式）：try/catch 包裹，降级为纯内存表单
- 抽取参数非法（人数不能整除/为 0）：行内 MC 风格错误提示，禁止开始
- 图片类型/大小不符：缩略图列表行内提示并忽略该文件

## 测试与验证

- `astro build` 静态构建通过
- `astro dev --background` 启动后逐页手测四条路由
- 抽取算法断言（独立脚本或 vitest 风格小脚本）：每人恰好出现一次、无遗漏无重复、组数正确

## 依赖清单

| 包 | 用途 |
|---|---|
| `github:iicemeta/minecraft-react-ui` | MC 风格 UI 组件库 |
| `fusion-pixel-12px-proportional-zh_hans` | 中文像素字体 |

素材：`public/img/items/*.png`（node-minecraft-assets 按需下载）、`public/qr/*.svg`（占位二维码）。
