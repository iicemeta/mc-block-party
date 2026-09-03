import { writeFileSync, mkdirSync } from "node:fs";

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeQR({ file, accent, label }) {
  const N = 25;
  const px = 8;
  const quiet = 2;
  const size = (N + quiet * 2) * px;
  const rng = mulberry32(20260903);
  const inFinder = (x, y) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  const inBadge = (x, y) =>
    x >= 8 && x <= 16 && y >= 8 && y <= 16;
  let rects = "";
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y) || inBadge(x, y)) continue;
      if (rng() < 0.45) {
        rects += `<rect x="${(x + quiet) * px}" y="${(y + quiet) * px}" width="${px}" height="${px}"/>`;
      }
    }
  }
  const finder = (fx, fy) =>
    `<rect x="${(fx + quiet) * px}" y="${(fy + quiet) * px}" width="${7 * px}" height="${7 * px}"/>` +
    `<rect x="${(fx + quiet + 1) * px}" y="${(fy + quiet + 1) * px}" width="${5 * px}" height="${5 * px}" fill="#ffffff"/>` +
    `<rect x="${(fx + quiet + 2) * px}" y="${(fy + quiet + 2) * px}" width="${3 * px}" height="${3 * px}"/>`;
  const badgeX = (quiet + 8) * px;
  const badgeY = (quiet + 8) * px;
  const badgeW = 9 * px;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <g fill="#1a1a21">${rects}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</g>
  <g>
    <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeW}" fill="#ffffff"/>
    <rect x="${badgeX + 6}" y="${badgeY + 6}" width="${badgeW - 12}" height="${badgeW - 12}" fill="${accent}"/>
    <text x="${badgeX + badgeW / 2}" y="${badgeY + badgeW / 2}" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="19" font-weight="bold" fill="#ffffff">${label}</text>
  </g>
</svg>
`;
  writeFileSync(file, svg);
}

mkdirSync("public/qr", { recursive: true });
makeQR({ file: "public/qr/ctech-club.svg", accent: "#3b8526", label: "CTECH" });
makeQR({ file: "public/qr/coal-club.svg", accent: "#5a5a66", label: "COAL" });
console.log("done");
