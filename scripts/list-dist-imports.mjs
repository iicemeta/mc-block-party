import fs from "node:fs";

const re = /from\s*['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g;
const files = [
  "vendor/minecraft-react-ui/dist/index.js",
  "vendor/minecraft-react-ui/dist/index.cjs",
];
const out = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1] || m[2];
    if (spec && !spec.startsWith(".") && !spec.startsWith("/")) out.add(spec);
  }
}
console.log([...out].sort().join("\n"));
