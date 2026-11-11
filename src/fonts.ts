import { continueRender, delayRender, staticFile } from "remotion";
import { getInfo as interInfo } from "@remotion/google-fonts/Inter";
import { getInfo as monoInfo } from "@remotion/google-fonts/JetBrainsMono";

/**
 * fonts.ts —— 全工程唯一的字体加载入口。
 *
 * - 中文（Noto Sans SC）：用随项目分发的本地可变字体 public/fonts/NotoSansSC-VF.ttf，不联网。
 * - 西文与等宽（Inter / JetBrains Mono）：从 Google Fonts 取，只有几个小文件；
 *   限时 8 秒，要么全部加载成功，要么一个都不用（回退系统字体），避免帧与帧之间字形跳变。
 * 字体族名固定，组件里的 font-family 写法不受加载结果影响。
 */

const REMOTE_CAP_MS = 8000;

type Face = { family: string; url: string; weight: string };

const remoteFaces = (): Face[] => {
  const inter = interInfo();
  const mono = monoInfo();
  const pick = (info: typeof inter, family: string, weights: string[]): Face[] =>
    weights.flatMap((w) => {
      const url = (info.fonts.normal as Record<string, Record<string, string>>)[w]?.latin;
      return url ? [{ family, url, weight: w }] : [];
    });
  return [...pick(inter, "Inter", ["400", "700", "900"]), ...pick(mono as typeof inter, "JetBrains Mono", ["400", "700"])];
};

let started = false;

export const ensureFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;

  // 本地中文字体：必须加载成功
  const localHandle = delayRender("加载本地字体 Noto Sans SC", { timeoutInMilliseconds: 60000 });
  const noto = new FontFace("Noto Sans SC", `url(${staticFile("fonts/NotoSansSC-VF.ttf")}) format("truetype")`, {
    weight: "100 900",
    style: "normal",
  });
  noto
    .load()
    .then((f) => document.fonts.add(f))
    .catch(() => {
      // eslint-disable-next-line no-console
      console.warn("[fonts] 找不到 public/fonts/NotoSansSC-VF.ttf，中文回退到系统字体。");
    })
    .finally(() => continueRender(localHandle));

  // 远程西文字体：限时，全有或全无
  const remoteHandle = delayRender("加载 Inter / JetBrains Mono", { timeoutInMilliseconds: 60000 });
  const faces = remoteFaces().map(
    (f) => new FontFace(f.family, `url(${f.url}) format("woff2")`, { weight: f.weight, style: "normal" }),
  );
  const cap = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), REMOTE_CAP_MS));
  Promise.race([Promise.all(faces.map((f) => f.load())), cap])
    .then((loaded) => loaded.forEach((f) => document.fonts.add(f)))
    .catch(() => {
      // eslint-disable-next-line no-console
      console.warn("[fonts] 8 秒内没能从 Google Fonts 取到 Inter / JetBrains Mono，西文回退到系统字体。");
    })
    .finally(() => continueRender(remoteHandle));
};

ensureFonts();
