import fs from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");

// 浏览器：环境变量 REMOTION_CHROME 优先，其次按 scripts/browsers.json 的顺序找本机已装的
// Chrome / Edge / Chromium / Brave；都没有时不指定，Remotion 会自动下载一个专用浏览器。
const findBrowser = (): string | null => {
  const expand = (p: string) => p.replace(/%([A-Z_]+)%/g, (_, k: string) => process.env[k] ?? "");
  let listed: string[] = [];
  try {
    listed = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "browsers.json"), "utf8")).paths;
  } catch {
    // 清单读不到就只看环境变量
  }
  const candidates = [process.env.REMOTION_CHROME, ...listed].filter((p): p is string => Boolean(p)).map(expand);
  return candidates.find((p) => fs.existsSync(p)) ?? null;
};
const browser = findBrowser();
if (browser) {
  Config.setBrowserExecutable(browser);
}

Config.overrideBundlerConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...config.resolve?.alias, "@": path.join(process.cwd(), "src") },
  },
}));
