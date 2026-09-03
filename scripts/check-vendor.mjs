import { existsSync } from "node:fs";

const required = [
  "index.js",
  "index.cjs",
  "index.d.ts",
  "minecraft-react-ui.css",
].map((f) => `vendor/minecraft-react-ui/dist/${f}`);

const missing = required.filter((p) => !existsSync(p));
if (missing.length > 0) {
  console.error(`[prepare] vendor 构建产物缺失: ${missing.join(", ")}`);
  console.error("[prepare] 请确认 git 检出完整（vendor dist 已随仓库提交），或重新克隆");
  process.exit(1);
}
console.log("[prepare] minecraft-react-ui vendor 产物完整");
