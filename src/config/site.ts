/**
 * 站点内容配置（构建时打包，非环境变量）。
 * 修改活动名称、欢迎语、时间地点、社团卡片、流程说明等文案后，
 * 重新构建部署即可生效，无需改动任何组件代码。
 */

export type ClubCard = {
  /** 展示名 */
  name: string;
  /** 卡片配色主题（对应 index.astro 里的 .ClubCard.<color> 样式） */
  color: "ctech" | "coal";
  /** 图标路径（public 下） */
  icon: string;
  /** 入群二维码路径（public 下） */
  qr: string;
  /** 一句话介绍 */
  desc: string;
  /** 二维码角标说明 */
  tag: string;
};

export type StepCard = {
  icon: string;
  title: string;
  desc: string;
};

export type FooterClub = {
  name: string;
  /** 页脚社团名配色（对应 Footer.astro 里的 .club.<color> 样式） */
  color: "cyan" | "coal";
};

export const SITE_CONFIG = {
  /** 站点名称：导航栏、页面标题后缀、页脚 */
  name: "方块嘉年华",

  /** 联合主办 / 品牌副标：导航栏小字、默认标题 */
  coHost: "MyGO!!!!! × Yuzusoft",

  /** SEO 描述（Layout meta description） */
  description:
    "MyGO!!!!! × Yuzusoft 方块嘉年华第一期：报名、随机组队、晒图提交",

  /** 主页 Hero 区 */
  hero: {
    /** 大标题上方的小字 */
    kicker: "CTA x SDTBUcraft",
    /** 大标题 */
    title: "方块嘉年华",
    /** 欢迎语 / 标语 */
    tagline:
      "每一次的联机，都是心的连通。每一次的方块落下，都是连接世界的精彩。",
    /** 时间 / 地点等信息标签（每条一个 TagBox） */
    tags: ["时间：本周六 19:00 - 23:00", "地点：方块嘉年华服务器（进群获取 IP）"],
  },

  /** 主页跑马灯滚动文案 */
  marquee: "MyGO!!!!! × Yuzusoft · 方块嘉年华第一期 ·  ",

  /** 扫码进群社团卡片 */
  clubs: [
    {
      name: "MyGO!!!!!",
      color: "ctech",
      icon: "/img/bdstar.svg",
      qr: "/qr/ctech-club.svg",
      desc: "写代码、玩硬件、整活 AI。这次我们负责服务器与红石全自动化！",
      tag: "扫码进①群",
    },
    {
      name: "Yuzusoft",
      color: "coal",
      icon: "/img/items/coal_block.png",
      qr: "/qr/coal-club.svg",
      desc: "专业挖矿三十年，从煤炭到下界合金。这次我们负责把矿道挖到你家！",
      tag: "扫码进②群",
    },
  ] as ClubCard[],

  /** 活动流程卡片 */
  steps: [
    { icon: "/img/items/diamond.png", title: "① 登记报名", desc: "登录后填写信息，账号自动绑定" },
    { icon: "/img/items/tnt.png", title: "② 随机组队", desc: "TNT 点燃，命运分组" },
    { icon: "/img/items/crafting_table.png", title: "③ 联谊开黑", desc: "共建、竞速、团战" },
    { icon: "/img/items/ender_pearl.png", title: "④ 晒图提交", desc: "高光时刻进摄影展" },
  ] as StepCard[],

  /** 主页行动按钮文案 */
  cta: {
    /** 主按钮：未登录时的文案（登录后显示「欢迎您，昵称 / MC ID」） */
    primary: "登录并报名",
    /** 主按钮跳转 */
    primaryHref: "/me",
    /** 副按钮 */
    secondary: "查看随机组队",
    secondaryHref: "/lottery",
  },

  /** 页脚（站点名 + 年份一行由 name 自动组合） */
  footer: {
    /** 顶部双社团展示行，社团名之间以金苹果图标分隔 */
    clubs: [
      { name: "MyGO!!!!!", color: "cyan" },
      { name: "Yuzusoft", color: "coal" },
    ] as FooterClub[],
    /** 底部团队署名行 */
    credit: "开发团队：MyGO!!!!!",
  },
} as const;
