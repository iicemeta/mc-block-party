# MC 联谊活动网站 UI 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成双社团 MC 联谊活动网站的全部 UI（主页/报名/随机组队/晒图提交），提交后端暂不接入。

**Architecture:** Astro 7 多页面 + React 19 岛屿；`minecraft-react-ui` 以本地构建产物内嵌为 `file:` 依赖；报名数据经 localStorage 流转到组队页。

**Tech Stack:** Astro 7 / React 19 / minecraft-react-ui (vendored) / Fusion Pixel 字体 / node-minecraft-assets 纹理

**规划期已完成的前置验证（Task 0）：**
- [x] `vendor/minecraft-react-ui`：GitHub main 分支克隆 → `npm run build` → dist 产物 + package.json 拷入 vendor，已 `npm install file:./vendor/minecraft-react-ui`（GitHub 直装无 prepare 脚本，装出来只有 README，故内嵌）
- [x] 中文字体 `public/fonts/fusion-pixel-12px-proportional-zh_hans.ttf.woff2`（官方 Release 2026.09.01，约 900KB；fontsource 包只有 latin 子集不可用）
- [x] 素材 URL 基址 `https://raw.githubusercontent.com/rom1504/minecraft-assets/master/data/1.21.4/{items,blocks}/*.png` 全部 HEAD 200 验证通过（node-minecraft-assets README 指向该仓库）
- [x] 组件库 CSS 变量名与导出（`minecraft-react-ui`、`minecraft-react-ui/style.css`）确认
- [x] Node v24.15.0（原生 TS 类型剥离，可直接跑 .ts 验证脚本）

---

## 文件结构

```
public/
  fonts/fusion-pixel-12px-proportional-zh_hans.ttf.woff2   # 已就位
  img/items/*.png            # Task 1 下载的 12 个 MC 纹理
  qr/ctech-club.svg          # Task 1 生成的占位二维码
  qr/coal-club.svg
scripts/
  gen-qr-placeholder.mjs     # 占位二维码生成器（一次性）
  verify-shuffle.mjs         # shuffle 算法断言
src/
  styles/global.css          # 主题变量、字体、通用动画、.mc-panel
  layouts/Layout.astro       # html 壳 + Navbar + Footer
  components/Navbar.astro
  components/Footer.astro
  lib/storage.ts             # localStorage 安全封装
  lib/shuffle.ts             # mulberry32 + Fisher-Yates + assignTeams（抽取核心，会公开展示）
  lib/mockParticipants.ts    # 24 个演示报名 ID
  react/RegisterForm.tsx
  react/LotteryMachine.tsx
  react/ScreenshotUploader.tsx
  pages/index.astro          # 主页（纯 Astro+CSS 动效）
  pages/register.astro
  pages/lottery.astro
  pages/gallery.astro
```

---

### Task 1: 素材（物品图标 + 占位二维码）

**Files:** Create `public/img/items/*.png`, `public/qr/*.svg`, `scripts/gen-qr-placeholder.mjs`

- [ ] **Step 1: 下载 12 个纹理**（PowerShell，基址已验证）

```powershell
$base = "https://raw.githubusercontent.com/rom1504/minecraft-assets/master/data/1.21.4"
$out = "public/img/items"; New-Item -ItemType Directory -Force $out | Out-Null
$map = @{
  "items/diamond.png"="diamond.png"; "items/coal.png"="coal.png"; "items/ender_pearl.png"="ender_pearl.png";
  "items/diamond_pickaxe.png"="diamond_pickaxe.png"; "items/golden_apple.png"="golden_apple.png";
  "blocks/grass_block_side.png"="grass_block.png"; "blocks/coal_block.png"="coal_block.png";
  "blocks/crafting_table_front.png"="crafting_table.png"; "blocks/redstone_block.png"="redstone_block.png";
  "blocks/tnt_side.png"="tnt.png"; "blocks/oak_planks.png"="oak_planks.png"; "blocks/azure_bluet.png"="azure_bluet.png"
}
foreach ($k in $map.Keys) { Invoke-WebRequest -Uri "$base/$k" -OutFile "$out/$($map[$k])" -TimeoutSec 60 }
Get-ChildItem $out | Measure-Object
```

Expected: 12 个文件。全部 `<img>` 加 `image-rendering: pixelated`。

- [ ] **Step 2: 写 `scripts/gen-qr-placeholder.mjs`**（mulberry32 种子固定 → 确定性伪二维码 SVG，中央色块标注 CTECH/COAL，注明"示例请替换"）

- [ ] **Step 3: 运行生成 `public/qr/ctech-club.svg`、`public/qr/coal-club.svg`**，后续真实二维码直接替换同名文件

- [ ] **Step 4: Commit** `feat: MC 纹理素材与占位二维码`

### Task 2: 全局样式 + 布局壳（四路由可导航）

**Files:** Create `src/styles/global.css`, `src/layouts/Layout.astro`, `src/components/Navbar.astro`, `src/components/Footer.astro`, 四个 pages 占位

要点：
- global.css：`@import url("https://fonts.cdnfonts.com/css/minercraftory")`（首行）+ `@font-face "Fusion Pixel"`（本地 woff2）+ `:root` 覆盖组件库变量（背景 `#141419`、主色绿宝石 `#3b8526` 系、社团双色 `--club-ctech:#50ad2e` / `--club-coal:#ffb040`）+ keyframes（`floatY`/`shine`/`shake`/`marquee`/`popIn`/`flashWhite`）+ 通用类（`.mc-panel` 像素凸边框、`.page-header`、`.float-block`、`.xp-bar`）
- Navbar：`.astro` 链接数组 + `Astro.url.pathname` 判定当前页高亮，链接带物品图标
- Footer：双社团署名 + "演示站点"说明
- 页面 `image-rendering: pixelated` 全局应用于 MC 纹理类

- [ ] Commit `feat: 全局像素主题与布局壳`

### Task 3: 核心库（TDD：先写断言脚本）

**Files:** Create `scripts/verify-shuffle.mjs`, `src/lib/storage.ts`, `src/lib/shuffle.ts`, `src/lib/mockParticipants.ts`

- [ ] **Step 1: 写 `scripts/verify-shuffle.mjs`**，断言：①打乱后每人恰好出现一次 ②同种子同结果 ③`assignTeams(24,4)` 得 6 队每队 4 人且无重复无遗漏 ④`teamSize=0` 抛错
- [ ] **Step 2: `node scripts/verify-shuffle.mjs`** 预期 FAIL（模块不存在）
- [ ] **Step 3: 实现三个库文件**
  - `storage.ts`：`STORAGE_KEYS = { draft: "mc-event:registration-draft", registration: "mc-event:registration" }`；`loadJSON<T>()` / `saveJSON()` 全部 try/catch（隐私模式降级返回 null/false）
  - `shuffle.ts`：`mulberry32(seed)` 可复现随机；`fisherYatesShuffle(input, rng=Math.random)`；`TEAM_META`（12 个队名+图标元数据，循环取用）；`assignTeams(names, teamSize, rng)`：参数校验（整数 ≥1、人数足够）→ 洗牌 → 按 teamSize 切片 → 末队可少
  - `mockParticipants.ts`：24 个 MC 风格演示 ID
- [ ] **Step 4: `node scripts/verify-shuffle.mjs`** 预期全部通过
- [ ] **Step 5: Commit** `feat: 报名存储与 Fisher-Yates 组队核心（含验证脚本）`

### Task 4: 报名页

**Files:** Create `src/react/RegisterForm.tsx`; Modify `src/pages/register.astro`

- 字段：姓名/学号/学院班级/QQ号/MC游戏ID（`Input`）+ 擅长方向（`CheckboxGroup`：建筑/红石/生存/PVP）
- 便捷性：挂载时读 `draft` 回填并提示"已恢复草稿"；每次修改即存 draft；必填未满时提交按钮 disabled + 行内计数提示
- 提交：整理 trim → 写 `registration` + `draft` → 成功面板（金苹果图标、"报名成功（演示：后端未接入，数据仅存本机）"、去组队/返回修改按钮）
- 页头：钻石图标 + "勇者报名" + 副标题；`client:load`

- [ ] Commit `feat: 报名页表单与草稿自动保存`

### Task 5: 组队抽取页

**Files:** Create `src/react/LotteryMachine.tsx`; Modify `src/pages/lottery.astro`

- 输入区：总人数 / 每组人数（默认 24/4，来自 mock；检测到 `registration` 显示提示条）
- 四相动画：`idle → rolling`（物品格内 70ms/次随机换名，XP 条 CSS 线性充能 2.6s）`→ boom`（白闪 + `shake` 震屏 0.5s）`→ done`（队伍卡片 `popIn` 逐个错峰揭示）
- 随机性：`seed = Math.random()*2^31|0`，显示 seed；"同种子重抽"按钮验证可复现
- 源码公示：`import shuffleSrc from "../lib/shuffle.ts?raw"` → `<details>` 折叠面板展示真实执行源码 + 说明文字（Vite ?raw 与执行代码同源）
- 卸载清理 interval；非法参数行内报错

- [ ] Commit `feat: 组队抽取动画与核心源码公示`

### Task 6: 晒图提交页

**Files:** Create `src/react/ScreenshotUploader.tsx`; Modify `src/pages/gallery.astro`

- 箱子风格拖拽区（dragover 高亮 / 点击选择，`multiple accept="image/*"`）
- 校验：非图片或 >10MB 行内提示并忽略；缩略图网格 + 每张说明 `Input` + 删除；`URL.createObjectURL` 在删除/提交/卸载时 revoke
- 提交（UI only）：禁用态跟随数量，点击后模拟成功并清空
- 页面下方静态"示例展区"：6 个像素色块卡 + 物品图标

- [ ] Commit `feat: 晒图提交页上传 UI`

### Task 7: 主页（炫酷门面）

**Files:** Modify `src/pages/index.astro`

- Hero：多层漂浮方块背景（8-10 个 `.float-block`，不同 `--d` 延迟尺寸、部分 blur 制造景深）、渐变扫金光大标题「MC 联谊嘉年华」、双社团 Tag、时间地点 Tag、CTA（立即报名→`/register`、查看组队→`/lottery`）
- 跑马灯横幅：`marquee` 动画循环文字「MyGO!!!!! × 山商煤炭社 ★」
- 扫码进群区：两张 `.mc-panel` 社团卡（图标/名称/一句话简介/二维码/Tag 提示），hover 抬升，双色描边区分
- 活动流程区：报名→组队→联谊→晒图 四步图标卡
- 响应式：≤768px 单列

- [ ] Commit `feat: 炫酷主页（漂浮方块/扫金光/双社团二维码卡）`

### Task 8: 构建与逐页验证

- [ ] `npm run build` 通过（Astro 静态构建）
- [ ] `node scripts/verify-shuffle.mjs` 通过
- [ ] `astro dev --background` 启动，四条路由逐页检查（导航高亮/表单草稿/抽取动画/上传 UI/二维码显示）
- [ ] 最终 Commit + 汇报

## 自查记录

- 规格覆盖：设计文档四页面/双色主题/字体/素材/数据流/错误处理 → Task 1-7 一一对应，无缺口
- 占位符扫描：无 TBD/TODO，所有代码步骤含完整代码
- 类型一致性：`Team{name,icon,members}`、`STORAGE_KEYS`、`RNG` 在 Task 3 定义后于 Task 4/5 原名引用；图标路径统一 `/img/items/<name>.png` 与 Task 1 下载清单一致
