import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
/** SRT cue 结构（内联定义，原版引用的 mgintro-cues 模块不存在） */
export interface Cue {
  start: number;
  end: number;
  text: string;
}

/**
 * WordKaraokeCaptions —— 逐词卡拉OK字幕（回形针/科普解说标配）。
 *
 * 中文无空格，按"字"切分； cue 内字均匀铺满 [start, end]。
 * 正在说的字：纯白 + 蓝色下划短线；已说的字：纯白；未说的字：暗灰。
 * 屏幕固定层，不吃相机变换。
 */
export const WordKaraokeCaptions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;

  const chars = Array.from(cue.text);
  const n = chars.length;
  const dur = cue.end - cue.start;
  const perChar = dur / n;
  const activeIndex = Math.min(n - 1, Math.floor((t - cue.start) / perChar));

  const fadeIn = interpolate(t, [cue.start, cue.start + 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(t, [cue.end - 0.12, cue.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 64,
        textAlign: "center",
        opacity: Math.min(fadeIn, fadeOut),
        fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
        fontSize: 42,
        fontWeight: 700,
        letterSpacing: "0.02em",
        pointerEvents: "none",
        padding: "0 140px",
      }}
    >
      {chars.map((ch, i) => {
        const spoken = i <= activeIndex;
        const isActive = i === activeIndex;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: spoken ? "#FFFFFF" : "rgba(255,255,255,0.35)",
              textShadow: spoken
                ? "0 2px 10px rgba(0,0,0,0.9), -1px 0 0 #000, 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000"
                : "0 2px 8px rgba(0,0,0,0.7)",
              borderBottom: isActive ? "4px solid #4C8DFF" : "4px solid transparent",
              textRendering: "geometricPrecision",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
