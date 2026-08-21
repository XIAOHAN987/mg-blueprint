import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { Beat } from "../beats/schema";

/**
 * 底部口播字幕 —— 直接吃分镜表 beats（其时间码来自 SRT），
 * 与口播音频、相机天然同源对齐。
 * 真实项目中换成 @remotion/captions 可实现逐词高亮。
 */
export const Captions: React.FC<{ beats: Beat[] }> = ({ beats }) => {
  const frame = useCurrentFrame();
  const beat = beats.find((b) => frame >= b.from && frame < b.to);
  if (!beat || !beat.caption) return null;

  const fadeIn = interpolate(frame, [beat.from, beat.from + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [beat.to - 5, beat.to], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 54,
        textAlign: "center",
        opacity: Math.min(fadeIn, fadeOut),
        fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
        fontSize: 34,
        fontWeight: 700,
        color: "#FFFFFF",
        textShadow:
          "0 2px 8px rgba(0,0,0,0.9), -1px 0 0 #000, 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000",
        letterSpacing: "0.02em",
        pointerEvents: "none",
      }}
    >
      {beat.caption}
    </div>
  );
};
