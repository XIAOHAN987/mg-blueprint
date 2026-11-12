// 抽帧自检（一条命令，不需要 Python）：
//   node scripts/stills.mjs <合成ID> <帧号,帧号,...> [输出目录=out/stills]
// 做三件事：渲染这些帧 → 拼成一张总览图 out/check.png → 标出"内容很少"的帧。
// 拼图用的是渲染用的同一个浏览器，所以只要能渲染就一定能拼图。
// 任何一步失败都会以非零状态退出，不会悄悄跳过。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const [id, list, outDir = "out/stills"] = process.argv.slice(2);
if (!id || !list) {
  console.error("用法：node scripts/stills.mjs <合成ID> <帧号,帧号,...> [输出目录]");
  process.exit(2);
}
const frames = list.split(",").map(Number).filter((n) => Number.isFinite(n));
const COLS = 4;
const CELL_W = 470;
const LABEL_H = 30;

const browserExecutable =
  [
    process.env.REMOTION_CHROME,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find((p) => p && fs.existsSync(p)) ?? null; // 都没有时交给 Remotion 自动下载

// ───────── 1. 渲染 ─────────
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
const shots = [];
for (const frame of frames) {
  const output = path.resolve(outDir, `${id}-${String(frame).padStart(4, "0")}.jpg`);
  await renderStill({ composition, serveUrl, frame, puppeteerInstance: browser, output, imageFormat: "jpeg", jpegQuality: 80 });
  shots.push({ frame, output });
}
await browser.close({ silent: true });
// 打包目录每次约 150MB，用完即删，否则会把系统盘的临时目录占满
fs.rmSync(serveUrl, { recursive: true, force: true });

// ───────── 2. 拼图 ─────────
const cellH = Math.round((CELL_W * composition.height) / composition.width);
const rows = Math.ceil(shots.length / COLS);
const sheetW = COLS * CELL_W;
const sheetH = rows * (cellH + LABEL_H);
const cells = shots
  .map(
    (s) => `<div class="cell" data-frame="${s.frame}">
  <div class="label">帧 ${s.frame} · ${(s.frame / composition.fps).toFixed(2)}s<span class="warn"></span></div>
  <img src="${pathToFileURL(s.output).href}" width="${CELL_W}" height="${cellH}">
</div>`,
  )
  .join("\n");
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:#101012;width:${sheetW}px;height:${sheetH}px;overflow:hidden}
body{display:grid;grid-template-columns:repeat(${COLS},${CELL_W}px);font:600 17px/30px "Microsoft YaHei","PingFang SC",sans-serif;color:#c8c8ce}
.cell{position:relative;height:${cellH + LABEL_H}px}.label{height:${LABEL_H}px;padding-left:8px;white-space:nowrap}
img{display:block}.warn{color:#ff4a2b;margin-left:10px}
.sparse img{outline:4px solid #ff4a2b;outline-offset:-4px}
</style>${cells}<pre id="result" hidden></pre><script>
// 判断"这一帧有没有内容"：看画面里明暗变化的多少，而不是看平均亮度
// （深色背景的正常画面平均亮度也很低）。底部字幕带不计入。
window.addEventListener("load", () => {
  const sparse = [];
  for (const cell of document.querySelectorAll(".cell")) {
    const img = cell.querySelector("img");
    const W = 160, H = 90, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, Math.round(H * 0.84)).data;
    const rowsN = Math.round(H * 0.84);
    let edges = 0;
    for (let y = 0; y < rowsN; y++) for (let x = 1; x < W; x++) {
      const i = (y * W + x) * 4;
      const diff = Math.abs(d[i] - d[i - 4]) + Math.abs(d[i + 1] - d[i - 3]) + Math.abs(d[i + 2] - d[i - 2]);
      if (diff > 60) edges++;
    }
    const ratio = edges / (rowsN * W);
    if (ratio < 0.004) {
      cell.classList.add("sparse");
      cell.querySelector(".warn").textContent = "内容很少?";
      sparse.push(Number(cell.dataset.frame));
    }
  }
  document.getElementById("result").textContent = "SPARSE=" + JSON.stringify(sparse);
});
</script>`;
const htmlPath = path.resolve(outDir, "_sheet.html");
fs.writeFileSync(htmlPath, html);

const sheetPath = path.resolve("out/check.png");
fs.rmSync(sheetPath, { force: true });
const chrome = (await ensureBrowser({ browserExecutable })).path ?? browserExecutable;
const common = [
  "--headless",
  "--disable-gpu",
  "--hide-scrollbars",
  "--allow-file-access-from-files",
  "--virtual-time-budget=6000",
  `--window-size=${sheetW},${sheetH}`,
];
const url = pathToFileURL(htmlPath).href;
spawnSync(chrome, [...common, `--screenshot=${sheetPath}`, url], { stdio: "ignore" });
const dom = spawnSync(chrome, [...common, "--dump-dom", url], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
fs.rmSync(htmlPath, { force: true });

if (!fs.existsSync(sheetPath)) {
  console.error("\n[自检] 拼图失败：没有生成 out/check.png。请先解决这个问题，不要改成逐张看单帧。");
  console.error("       浏览器：" + chrome);
  process.exit(1);
}

// ───────── 3. 报告 ─────────
const m = /SPARSE=(\[[^\]]*\])/.exec(dom.stdout ?? "");
const sparse = m ? JSON.parse(m[1]) : null;
console.log(`\n[自检] ${shots.length} 帧已拼成一张总览图：out/check.png`);
if (sparse === null) console.log("[自检] 没能完成空画面检测，请在总览图里自己留意。");
else if (sparse.length) console.log(`[自检] 警告：这些帧内容很少，可能是空画面 → ${sparse.join(", ")}（转场中间帧出现 1–2 帧属正常，连续出现或落在场景内就是问题）`);
else console.log("[自检] 没有发现空画面。");
console.log("[自检] 下一步：打开 out/check.png 逐条核对清单（只需要看这一张，不要逐张打开单帧）。");
process.exit(0);
