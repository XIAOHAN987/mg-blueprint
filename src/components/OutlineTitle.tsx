import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * 标志性巨型描边空心字。
 * solid = 实心部分（如截图里的 "8"），outline = 空心描边部分（如斜体 "bit"）。
 * 入场：模糊 → 清晰 + 轻微上浮，克制不弹跳。
 */
export const OutlineTitle: React.FC<{
  solid: string;
  outline: string;
  fontSize?: number;
  delay?: number;
}> = ({ solid, outline, fontSize = 220, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 24, stiffness: 100, mass: 1 },
  });

  const blur = interpolate(enter, [0, 1], [14, 0]);
  const y = interpolate(enter, [0, 1], [30, 0]);

  return (
    <div
      style={{
        opacity: enter,
        filter: `blur(${blur}px)`,
        transform: `translateY(${y}px)`,
        fontFamily: '"Arial Black", "Segoe UI", "Microsoft YaHei", sans-serif',
        fontSize,
        fontWeight: 900,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          color: "#EDEDED",
          textShadow: "0 0 60px rgba(255,255,255,0.25)",
        }}
      >
        {solid}
      </span>
      <span
        style={{
          fontStyle: "italic",
          color: "transparent",
          WebkitTextStroke: "3px rgba(255,255,255,0.8)",
          marginLeft: fontSize * 0.12,
        }}
      >
        {outline}
      </span>
    </div>
  );
};
