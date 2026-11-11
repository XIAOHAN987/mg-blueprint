// 抽帧自检：node scripts/stills.mjs <合成ID> <帧号,帧号,...> [输出目录]
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";

const [id, list, outDir = "out/stills"] = process.argv.slice(2);
const frames = list.split(",").map(Number);
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
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
for (const frame of frames) {
  await renderStill({
    composition, serveUrl, frame, puppeteerInstance: browser,
    output: path.resolve(outDir, `${id}-${String(frame).padStart(4, "0")}.jpg`),
    imageFormat: "jpeg", jpegQuality: 80,
  });
  console.log("frame", frame);
}
await browser.close({ silent: true });
// 打包目录每次约 150MB，用完即删，否则会把系统盘的临时目录占满
fs.rmSync(serveUrl, { recursive: true, force: true });
process.exit(0);
