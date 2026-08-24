import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
// WorkBuddy 沙箱会拦截 headless shell 下载锁删除，直接用系统 Chrome 渲染
Config.setBrowserExecutable("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");

// snapcn 组件用 @/ 别名导入；Remotion bundler 不读 tsconfig paths，必须在这里配
Config.overrideBundlerConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...config.resolve?.alias, "@": path.join(process.cwd(), "src") },
  },
}));
