import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { easeOutExpo } from "../../motion/motion";

/**
 * SnapText —— 焊死的超大字阶弹射文字（Agent 只能填文字，不能改结构）。
 *
 * 内建 overflow:hidden 遮罩裁切，强制执行单行超大字阶 +
 * translateY(40→0) 瞬间弹射 + 复合微缩放。字阶焊死极端对比：
 * - hero ≥ 88px（主标）
 * - sub ≤ 24px（次级/元数据）
 * 不给 Agent 写 24-44px 中间字号的机会（那是平庸网页字号）。
 */

const ENTER_DUR = 16;

export const SnapText: React.FC<{
  /** 主标文字 */
  text: string;
  /** 次级文字（可选） */
  sub?: string;
  /** 字阶：hero=超大主标 / sub=次级 */
  size?: "hero" | "sub";
  /** 进场起始帧 */
  startFrame: number;
  /** 强调色（默认主题蓝） */
  accent?: string;
  align?: "left" | "center";
}> = ({ text, sub, size = "hero", startFrame, accent = "#4C8DFF", align = "center" }) => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [startFrame, startFrame + ENTER_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  const y = Math.round((1 - enter) * 40);
  const scale = interpolate(enter, [0, 1], [0.94, 1]);
  const opacity = interpolate(enter, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  const fontSize = size === "hero" ? 88 : 22;
  const subEnter = interpolate(frame, [startFrame + 8, startFrame + 8 + ENTER_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: 14,
        fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
        textAlign: align,
      }}
    >
      {/* 遮罩裁切容器 */}
      <div style={{ overflow: "hidden", lineHeight: 1.1 }}>
        <div
          style={{
            fontSize,
            fontWeight: 800,
            color: "#EDEDED",
            letterSpacing: "-0.02em",
            transform: `translateY(${y}px) scale(${scale})`,
            opacity,
            textRendering: "geometricPrecision",
          }}
        >
          {text}
        </div>
      </div>
      {sub ? (
        <div
          style={{
            fontSize: 20,
            color: accent,
            letterSpacing: "0.06em",
            transform: `translateY(${Math.round((1 - subEnter) * 15)}px)`,
            opacity: subEnter,
            textRendering: "geometricPrecision",
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
