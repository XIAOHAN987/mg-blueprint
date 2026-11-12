import { continueRender, delayRender, staticFile } from "remotion";

/**
 * fonts.ts —— 全工程唯一的字体加载入口。
 *
 * 三套字体都随项目放在 public/fonts/，渲染全程不联网：
 *   Noto Sans SC      中文，可变字重 100–900
 *   Inter             西文与数字，拉丁子集，登记 400 / 700 / 900 三档
 *   JetBrains Mono    等宽，拉丁子集，登记 400 / 700 两档
 * 字体族名固定，组件里的 font-family 写法不用改。
 * 某个文件缺失时只打一条警告并回退到系统字体，不会让渲染失败。
 */

// Inter 和 JetBrains Mono 只登记这几档固定字重（同一个可变字体文件），
// 与此前在线加载时的行为保持一致：组件里写更粗的字重时，取最接近的一档。
const FACES = [
  { family: "Noto Sans SC", file: "fonts/NotoSansSC-VF.ttf", format: "truetype", weight: "100 900" },
  { family: "Inter", file: "fonts/Inter-latin-VF.woff2", format: "woff2", weight: "400" },
  { family: "Inter", file: "fonts/Inter-latin-VF.woff2", format: "woff2", weight: "700" },
  { family: "Inter", file: "fonts/Inter-latin-VF.woff2", format: "woff2", weight: "900" },
  { family: "JetBrains Mono", file: "fonts/JetBrainsMono-latin-VF.woff2", format: "woff2", weight: "400" },
  { family: "JetBrains Mono", file: "fonts/JetBrainsMono-latin-VF.woff2", format: "woff2", weight: "700" },
] as const;

let started = false;

export const ensureFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;

  for (const face of FACES) {
    const handle = delayRender(`加载本地字体 ${face.family}`, { timeoutInMilliseconds: 60000 });
    new FontFace(face.family, `url(${staticFile(face.file)}) format("${face.format}")`, {
      weight: face.weight,
      style: "normal",
    })
      .load()
      .then((f) => document.fonts.add(f))
      .catch(() => {
        // eslint-disable-next-line no-console
        console.warn(`[fonts] 找不到 public/${face.file}，${face.family} 回退到系统字体。`);
      })
      .finally(() => continueRender(handle));
  }
};

ensureFonts();
