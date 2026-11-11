import React from "react";
import { useCurrentFrame } from "remotion";
import "../fonts";
import { EASE, prog } from "./space";

export const F = {
  cn: "'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  num: "'Inter', 'Segoe UI', 'Helvetica Neue', 'Noto Sans SC', sans-serif",
  mono: "'JetBrains Mono', Consolas, monospace",
};

export const C = {
  ink: "#0C0D10",
  paper: "#F4F3EF",
  red: "#FF4A2B",
  green: "#3DDC84",
  termGreen: "#6CFFA6",
  land: "#B4B6B5",
};

/** 全片最小字号。任何文字不得低于它 */
export const MIN_FONT = 48;

/** 逐字从遮罩下方升起 */
export const Rise: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  charColor?: (i: number, ch: string) => string | undefined;
}> = ({ text, at, stagger = 2, dur = 16, style, charColor }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ whiteSpace: "nowrap", lineHeight: 1.18, ...style }}>
      {Array.from(text).map((ch, i) => {
        const p = prog(frame, at + i * stagger, dur);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - p) * 108}%)`,
                color: charColor?.(i, ch),
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** 色块文字牌：压在视频上也清晰。入场方式可选，避免全片一个样 */
export const Plate: React.FC<{
  at: number;
  out?: number;
  enter?: "wipe" | "flip" | "drop";
  bg?: string;
  color?: string;
  size?: number;
  font?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, out, enter = "wipe", bg = C.ink, color = C.paper, size = 110, font = F.cn, style, children }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = prog(frame, at, 12);
  const q = out === undefined ? 0 : prog(frame, out, 9, EASE.inOut);
  if (q >= 1) return null;

  let transform = "none";
  let clip = `inset(0 0 0 ${q * 100}%)`;
  if (enter === "wipe") {
    clip = q > 0 ? clip : `inset(0 ${(1 - p) * 100}% 0 0)`;
  } else if (enter === "flip") {
    transform = `perspective(900px) rotateX(${(1 - p) * -92}deg)`;
  } else {
    transform = `translateY(${(1 - p) * -140}px) rotate(${(1 - p) * -5}deg)`;
  }

  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontFamily: font,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.18,
        padding: `${size * 0.1}px ${size * 0.3}px ${size * 0.14}px`,
        whiteSpace: "nowrap",
        clipPath: clip,
        transform,
        transformOrigin: "50% 0",
        opacity: enter === "drop" ? Math.min(1, p * 3) : 1,
        ...style,
      }}
    >
      <div style={{ transform: enter === "wipe" ? `translateX(${(1 - p) * -36}px)` : undefined }}>{children}</div>
    </div>
  );
};

/**
 * RollSwap —— 同一个槽位里的文字接力：新内容从下方顶进来的同时把旧内容顶出去。
 * 旧内容不等自己"演完"就被打断，节奏跟着口播走。
 */
export const RollSwap: React.FC<{
  height: number;
  items: { at: number; node: React.ReactNode }[];
  out?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ height, items, out, dur = 11, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", height, overflow: "hidden", ...style }}>
      {items.map((it, i) => {
        const nextAt = items[i + 1]?.at ?? out;
        const p = prog(frame, it.at, dur);
        const q = nextAt === undefined ? 0 : prog(frame, nextAt, dur);
        if (p <= 0 || q >= 1) return null;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${(1 - p - q) * height}px)` }}
          >
            {it.node}
          </div>
        );
      })}
    </div>
  );
};

/** 滚动数字 */
export const Counter: React.FC<{
  from?: number;
  to: number;
  at: number;
  dur: number;
  decimals?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ from = 0, to, at, dur, decimals = 0, suffix = "", style }) => {
  const frame = useCurrentFrame();
  const v = from + (to - from) * prog(frame, at, dur, EASE.out);
  const txt =
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");
  return (
    <div style={{ fontFamily: F.num, fontWeight: 900, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...style }}>
      {txt}
      {suffix}
    </div>
  );
};
