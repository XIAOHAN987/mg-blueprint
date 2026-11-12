import React from "react";
import { Freeze, OffthreadVideo, Sequence, getInputProps, staticFile, useCurrentFrame } from "remotion";
import type { Move, Pose, T } from "./space";
import { VIEW_H, VIEW_W, cameraBlur, sampleCamera } from "./space";

const BLEED = 180;

/** 自检阈值：最大的那块素材至少占画面的比例；画面文字的最小显示字号（留 2px 取整余量） */
const MIN_ASSET_SHARE = 0.3;
const MIN_FONT_PX = 46;

const InWorld = React.createContext(false);

type Box = { l: number; t: number; r: number; b: number };
const cut = (a: Box, b: Box): Box => ({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) });
const area = (a: Box) => Math.max(0, a.r - a.l) * Math.max(0, a.b - a.t);
const box = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { l: r.left, t: r.top, r: r.right, b: r.bottom };
};

/**
 * 自检探针 —— 只在 `node scripts/stills.mjs` 抽帧时启用（inputProps.__check）。
 * 直接量页面上的真实尺寸：最大素材占画面多少、最小的字显示出来多大，
 * 不达标就在画面左上角画色块，由自检脚本读取。正常预览和渲染完全不受影响。
 */
const measure = (root: HTMLElement, view: HTMLElement) => {
  const screen = box(view);
  const unit = (screen.r - screen.l) / VIEW_W;
  const total = area(screen);

  // 可见性与缩放：沿祖先累乘 opacity 和 transform 的缩放，并按 overflow:hidden 的祖先裁剪
  const walk = (el: Element, rect: Box | null) => {
    let opacity = 1;
    let det = 1;
    let clip = rect ? cut(rect, screen) : null;
    for (let p: Element | null = el; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      opacity *= Number(cs.opacity);
      if (cs.visibility === "hidden" || cs.display === "none") opacity = 0;
      if (cs.transform && cs.transform !== "none") {
        const m = new DOMMatrixReadOnly(cs.transform);
        det *= Math.abs(m.a * m.d - m.b * m.c);
      }
      if (clip && p !== el && cs.overflow !== "visible") clip = cut(clip, box(p));
    }
    return { opacity, scale: Math.sqrt(det), clip };
  };

  let maxAsset = -1;
  for (const el of Array.from(root.querySelectorAll("img,video,canvas,[data-asset]"))) {
    if (el.parentElement?.closest("[data-asset]")) continue;
    const w = walk(el, box(el));
    if (w.opacity < 0.5 || !w.clip) continue;
    const share = area(w.clip) / total;
    if (share > 0.01) maxAsset = Math.max(maxAsset, share);
  }

  let minFont = Infinity;
  const texts = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = texts.nextNode(); n; n = texts.nextNode()) {
    const el = n.parentElement;
    if (!el || !n.textContent?.trim() || el.closest("[data-asset],[data-captions],svg")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    const w = walk(el, { l: r.left, t: r.top, r: r.right, b: r.bottom });
    if (w.opacity < 0.5 || !w.clip || area(w.clip) < 4) continue;
    minFont = Math.min(minFont, (parseFloat(getComputedStyle(el).fontSize) * w.scale) / unit);
  }
  return (maxAsset >= 0 && maxAsset < MIN_ASSET_SHARE ? 1 : 0) + (minFont < MIN_FONT_PX ? 2 : 0);
};

/**
 * World —— 相机容器。children 全部处在世界坐标里，
 * 相机按 moves 推拉摇移；运动时按屏幕速度加方向性模糊。
 */
export const World: React.FC<{ start: Pose; moves: Move[]; children: React.ReactNode }> = ({
  start,
  moves,
  children,
}) => {
  const frame = useCurrentFrame();
  const filterId = "v2-motion-blur-" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const cam = sampleCamera(start, moves, frame);
  const blur = cameraBlur(start, moves, frame);
  const blurOn = blur.x > 0.4 || blur.y > 0.4;

  // 自检探针：只有最外层的 World、且由自检脚本渲染时才启用
  const nested = React.useContext(InWorld);
  const probing = !nested && Boolean((getInputProps() as { __check?: boolean }).__check);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<HTMLDivElement>(null);
  const [flags, setFlags] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!probing || !rootRef.current || !viewRef.current) return;
    const root = rootRef.current;
    const view = viewRef.current;
    const run = () => setFlags(measure(root, view));
    run();
    root.addEventListener("load", run, true);
    return () => root.removeEventListener("load", run, true);
  });

  return (
    <InWorld.Provider value>
      {probing ? (
        <>
          <div ref={viewRef} style={{ position: "absolute", left: 0, top: 0, width: VIEW_W, height: VIEW_H, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 24, height: 24, zIndex: 9999, background: flags & 1 ? "#FF00FF" : "#000000" }} />
          <div style={{ position: "absolute", left: 24, top: 0, width: 24, height: 24, zIndex: 9999, background: flags & 2 ? "#00FFFF" : "#000000" }} />
        </>
      ) : null}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${blur.x.toFixed(2)} ${blur.y.toFixed(2)}`} />
          </filter>
        </defs>
      </svg>
      {/* 外扩一圈再模糊，避免屏幕边缘被模糊吃出暗边 */}
      <div
        ref={rootRef}
        style={{
          position: "absolute",
          left: -BLEED,
          top: -BLEED,
          width: VIEW_W + BLEED * 2,
          height: VIEW_H + BLEED * 2,
          overflow: "hidden",
          filter: blurOn ? `url(#${filterId})` : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${VIEW_W / 2 + BLEED}px, ${VIEW_H / 2 + BLEED}px) rotate(${cam.r}deg) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </InWorld.Provider>
  );
};

/** 把一块内容按坐标系 t 摆进父坐标系 */
export const Place: React.FC<{
  t: T;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ t, w = VIEW_W, h = VIEW_H, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: w,
      height: h,
      transformOrigin: "0 0",
      transform: `translate(${t.x}px, ${t.y}px) rotate(${t.r}deg) scale(${t.s})`,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Clip —— 满幅视频。起播前停在首帧、播完停在末帧，
 * 所以相机可以提前看见它、也可以在它播完后再离开。
 */
export const Clip: React.FC<{
  src: string;
  /** 全局起播帧 */
  start: number;
  /** 素材时长（秒） */
  seconds: number;
  rate?: number;
  /** 显示尺寸，默认满幅 1920×1080；录屏等可按素材原始像素摆放 */
  w?: number;
  h?: number;
  style?: React.CSSProperties;
}> = ({ src, start, seconds, rate = 1, w = VIEW_W, h = VIEW_H, style }) => {
  const frame = useCurrentFrame();
  const maxLocal = Math.floor((seconds * 30) / rate) - 3;
  const local = Math.min(maxLocal, Math.max(0, frame - start));
  return (
    <Freeze frame={start + local}>
      <Sequence from={start} layout="none">
        <OffthreadVideo
          src={staticFile(src)}
          muted
          playbackRate={rate}
          style={{ position: "absolute", left: 0, top: 0, width: w, height: h, objectFit: "cover", ...style }}
        />
      </Sequence>
    </Freeze>
  );
};
