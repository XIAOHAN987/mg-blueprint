// 抽帧自检（一条命令，不需要 Python）：
//   node scripts/stills.mjs <合成ID>                 自动选帧（推荐）：按相机轨迹抽每次转场的前、中、到位、停稳，以及长停留
//   node scripts/stills.mjs <合成ID> 帧号,帧号,...     手动指定帧（改完某处后复查用）
// 做三件事：渲染这些帧 → 拼成总览图 out/check-*.png → 检测空画面。
// 拼图用的是渲染用的同一个浏览器，所以只要能渲染就一定能拼图。
// 拼图失败、或场景停稳后仍是空画面，都会以非零状态退出，不会悄悄跳过。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const [id, list, outDir = "out/stills"] = process.argv.slice(2);
if (!id) {
  console.error("用法：node scripts/stills.mjs <合成ID> [帧号,帧号,...] [输出目录]");
  process.exit(2);
}
const COLS = 4;
const PER_PAGE = 16;
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

let plan;
if (list && list !== "auto") {
  plan = list
    .split(",")
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .map((f) => ({ f, kind: "" }));
} else {
  plan = composition.props?.checkFrames;
  if (!Array.isArray(plan) || !plan.length) {
    await browser.close({ silent: true });
    fs.rmSync(serveUrl, { recursive: true, force: true });
    console.error(
      `\n[自检] 合成 ${id} 没有登记自动选帧。请在 Root.tsx 里给它加上：\n` +
        `       defaultProps={{ checkFrames: checkFrames(<这个合成的 MOVES>, <总帧数>) }}\n` +
        `       （写法见 Root.tsx 里的 ParadigmV2），或者在命令后面手动给出帧号。`,
    );
    process.exit(2);
  }
}

fs.rmSync(path.resolve(outDir), { recursive: true, force: true });
const shots = [];
for (const { f, kind } of plan) {
  const output = path.resolve(outDir, `${id}-${String(f).padStart(4, "0")}.jpg`);
  await renderStill({ composition, serveUrl, frame: f, puppeteerInstance: browser, output, imageFormat: "jpeg", jpegQuality: 80 });
  shots.push({ frame: f, kind, output });
}
await browser.close({ silent: true });
// 打包目录每次约 150MB，用完即删，否则会把系统盘的临时目录占满
fs.rmSync(serveUrl, { recursive: true, force: true });

// ───────── 2. 拼图（每 16 帧一张） ─────────
const cellH = Math.round((CELL_W * composition.height) / composition.width);
const chrome = (await ensureBrowser({ browserExecutable })).path ?? browserExecutable;
for (const old of fs.readdirSync(path.resolve("out")).filter((n) => /^check(-\d+)?\.png$/.test(n))) {
  fs.rmSync(path.resolve("out", old), { force: true });
}

const pages = [];
const sparse = [];
let detectOk = true;
for (let p = 0; p * PER_PAGE < shots.length; p++) {
  const part = shots.slice(p * PER_PAGE, (p + 1) * PER_PAGE);
  const rows = Math.ceil(part.length / COLS);
  const sheetW = COLS * CELL_W;
  const sheetH = rows * (cellH + LABEL_H);
  const cells = part
    .map(
      (s) => `<div class="cell" data-frame="${s.frame}">
  <div class="label">帧 ${s.frame} · ${(s.frame / composition.fps).toFixed(2)}s${s.kind ? " · " + s.kind : ""}<span class="warn"></span></div>
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
    const rowsN = Math.round(H * 0.84);
    const d = g.getImageData(0, 0, W, rowsN).data;
    let edges = 0, sum = 0, sum2 = 0;
    for (let y = 0; y < rowsN; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
      sum += l; sum2 += l * l;
      if (x === 0) continue;
      const diff = Math.abs(d[i] - d[i - 4]) + Math.abs(d[i + 1] - d[i - 3]) + Math.abs(d[i + 2] - d[i - 2]);
      if (diff > 60) edges++;
    }
    const n = rowsN * W;
    const spread = Math.sqrt(Math.max(0, sum2 / n - (sum / n) ** 2));
    // 既没有清晰边缘、整体明暗又几乎没有起伏，才算空画面（运动模糊的画面边缘少但明暗起伏大）
    if (edges / n < 0.004 && spread < 12) {
      cell.classList.add("sparse");
      cell.querySelector(".warn").textContent = "空画面?";
      sparse.push(Number(cell.dataset.frame));
    }
  }
  document.getElementById("result").textContent = "SPARSE=" + JSON.stringify(sparse);
});
</script>`;
  const htmlPath = path.resolve(outDir, `_sheet-${p + 1}.html`);
  fs.writeFileSync(htmlPath, html);
  const sheetPath = path.resolve("out", `check-${p + 1}.png`);
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
    console.error(`\n[自检] 拼图失败：没有生成 out/check-${p + 1}.png。请先解决这个问题，不要改成逐张看单帧。`);
    console.error("       浏览器：" + chrome);
    process.exit(1);
  }
  pages.push(`out/check-${p + 1}.png`);
  const m = /SPARSE=(\[[^\]]*\])/.exec(dom.stdout ?? "");
  if (m) sparse.push(...JSON.parse(m[1]));
  else detectOk = false;
}

// ───────── 3. 报告 ─────────
const kindOf = new Map(shots.map((s) => [s.frame, s.kind]));
const inTransit = sparse.filter((f) => kindOf.get(f) === "转场中");
const inScene = sparse.filter((f) => kindOf.get(f) && kindOf.get(f) !== "转场中");
const unknown = sparse.filter((f) => !kindOf.get(f));

console.log(`\n[自检] ${shots.length} 帧已拼成 ${pages.length} 张总览图：${pages.join("、")}`);
if (!detectOk) console.log("[自检] 空画面检测没有完成，请在总览图里自己留意。");
if (inTransit.length) console.log(`[自检] 提示：转场中点画面是空的 → 帧 ${inTransit.join(", ")}。相机扫过了空白区，考虑让路径经过有内容的地方或缩短距离。`);
if (unknown.length) console.log(`[自检] 警告：这些帧内容很少，可能是空画面 → 帧 ${unknown.join(", ")}`);
if (inScene.length) {
  console.log(`[自检] 错误：相机已经停在场景上，画面却是空的 → ${inScene.map((f) => `帧 ${f}（${kindOf.get(f)}）`).join("、")}`);
  console.log("       多半是元素的入场时间晚于相机到位时间。把这些元素的入场帧提前到相机到位之前或同时。");
}
if (!sparse.length && detectOk) console.log("[自检] 没有发现空画面。");
console.log(`[自检] 下一步：打开${pages.length > 1 ? "这 " + pages.length + " 张" : ""}总览图，逐条核对 WORKFLOW-V2.md 第 5 步的清单。只看总览图，不要逐张打开单帧。`);
process.exit(inScene.length ? 1 : 0);
