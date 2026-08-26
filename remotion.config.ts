import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// vulkan：走真 GPU（RTX 4070）硬件光栅化，修复 angle 默认 SwiftShader CPU 软渲染
// 导致的文字 transform 动画逐帧重光栅化抖动（预览流畅渲染抖的根源）
Config.setChromiumOpenGlRenderer("vulkan");
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
