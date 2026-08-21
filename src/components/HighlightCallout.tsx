import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * HighlightCallout —— 截图关键区域高亮框 + 标注文字。
 * 位置用相对素材容器的百分比给出。边框用 spring「收拢」出现，
 * 标注牌从框边长出，克制不弹跳。
 */
export const HighlightCallout: React.FC<{
  /** 相对容器百分比 */
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  delay?: number;
  accent?: string;
}> = ({ x, y, w, h, label, delay = 0, accent = "#2563EB" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 24, stiffness: 120, mass: 0.9 },
  });

  const scale = interpolate(enter, [0, 1], [1.25, 1]);
  const labelEnter = spring({
    frame: frame - delay - 8,
    fps,
    config: { damping: 22, stiffness: 120, mass: 0.9 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        opacity: enter,
        transform: `scale(${scale})`,
        border: `3px solid ${accent}`,
        borderRadius: 10,
        boxShadow: `0 0 24px ${accent}55, inset 0 0 24px ${accent}22`,
        lineHeight: 1.2,
      }}
    >
      {label ? (
        <div
          style={{
            position: "absolute",
            top: -16,
            left: -3,
            transform: `translateY(${interpolate(labelEnter, [0, 1], [10, 0])}px)`,
            opacity: labelEnter,
            background: accent,
            color: "#fff",
            fontSize: 20,
            fontWeight: 600,
            padding: "5px 14px",
            borderRadius: 7,
            fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
