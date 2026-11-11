import fs from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");

// 浏览器：优先用环境变量 REMOTION_CHROME，其次用本机已装的 Chrome / Edge；
// 都没有时不指定，Remotion 会自动下载一个专用浏览器。
const chromeCandidates = [
  process.env.REMOTION_CHROME,
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter((p): p is string => Boolean(p));
const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (chrome) {
  Config.setBrowserExecutable(chrome);
}

Config.overrideBundlerConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...config.resolve?.alias, "@": path.join(process.cwd(), "src") },
  },
}));
