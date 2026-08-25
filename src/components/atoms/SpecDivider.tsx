import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { easeOutExpo } from "../../motion/motion";

/**
 * SpecDivider —— 焊死的信息分区细线（替代所有卡片背景框）。
 *
 * 纯靠 0.5px 极细线 + 等宽编码文字划分信息区，不用卡片背景/阴影/大圆角。
 * 划线时线条从左到右逐步展开（TrimPaths 手感），标签文字随后浮现。
 */

export const SpecDivider: React.FC<{
  /** 分区标签（可选，等宽小字） */
  label?: string;
  /** 展开起始帧 */
  startFrame: number;
  /** 线宽（px） */
  width?: number;
  /** 方向 */
  direction?: "horizontal" | "vertical";
}> = ({ label, startFrame, width = 400, direction = "horizontal" }) => {
  const frame = useCurrentFrame();

  // 线条展开：0→100%，8 帧完成（抢跑感）
  const lineProgress = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  // 标签随后浮现
  const labelEnter = interpolate(frame, [startFrame + 4, startFrame + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  const isH = direction === "horizontal";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isH ? "column" : "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* 极细分区线 */}
      <div
        style={{
          width: isH ? width * lineProgress : 0.5,
          height: isH ? 0.5 : width * lineProgress,
          background: "rgba(255,255,255,0.28)",
          flexShrink: 0,
        }}
      />
      {label ? (
        <div
          style={{
            fontFamily: '"JetBrains Mono", "Segoe UI", monospace',
            fontSize: 16,
            color: "rgba(237,237,237,0.45)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: labelEnter,
            transform: `translateY(${Math.round((1 - labelEnter) * 8)}px)`,
            marginTop: isH ? 0 : 0,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
