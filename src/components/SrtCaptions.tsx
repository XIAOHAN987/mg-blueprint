import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { Cue } from "../beats/deepseek-cues";

/**
 * SrtCaptions —— 口播字幕（SRT cue 驱动，与音频逐句对齐）。
 * 屏幕固定层，不吃相机变换；换句时 6 帧淡入淡出。
 */
export const SrtCaptions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;

  const fadeIn = interpolate(t, [cue.start, cue.start + 0.18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(t, [cue.end - 0.15, cue.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 56,
        textAlign: "center",
        opacity: Math.min(fadeIn, fadeOut),
        fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
        fontSize: 36,
        fontWeight: 700,
        color: "#FFFFFF",
        textShadow:
          "0 2px 10px rgba(0,0,0,0.95), -1px 0 0 #000, 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000",
        letterSpacing: "0.02em",
        pointerEvents: "none",
        padding: "0 120px",
      }}
    >
      {cue.text}
    </div>
  );
};
