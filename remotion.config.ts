import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setBrowserExecutable("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");

Config.overrideBundlerConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...config.resolve?.alias, "@": path.join(process.cwd(), "src") },
  },
}));
