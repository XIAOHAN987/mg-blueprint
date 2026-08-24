import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

/**
 * FlickerText —— Remotion 适配版闪烁文字（Originkit Flicker Text 改造）。
 *
 * 核心机制：文字在「描边 → 填充」之间按帧序列切换，配合逐字随机闪烁，
 * 做出专业科普"数据/关键词跳动强调"的效果。
 *
 * 与原版差异：
 * - 去 setTimeout/IntersectionObserver，全部由 useCurrentFrame() 驱动（确定性渲染）
 * - 只保留 word 级闪烁（整词在描边/填充间切换）+ letter 级闪烁（逐字随机描边）
 * - 默认参数调成专业科普调：慢速、低透明度闪烁、描边用主题蓝
 */

type Phase = "filled" | "outline" | "invisible";

export const FlickerText: React.FC<{
  text: string;
  fontSize?: number;
  delay?: number;
  /** 闪烁持续帧数（默认 60 帧 = 2s） */
  duration?: number;
  /** 整词闪烁次数（描边/填充切换） */
  flickerCount?: number;
  /** 逐字闪烁强度 1-20（越高越频繁），0 关闭 */
  letterFlickerIntensity?: number;
  /** 逐字闪烁时的透明度（0-100） */
  letterFlickerOpacity?: number;
  /** 描边颜色（默认主题蓝） */
  strokeColor?: string;
  /** 填充颜色 */
  fillColor?: string;
  /** 闪烁结束后的静止状态 */
  restState?: "filled" | "outline";
  fontWeight?: number;
}> = ({
  text,
  fontSize = 120,
  delay = 0,
  duration = 15,
  flickerCount = 4,
  letterFlickerIntensity = 10,
  letterFlickerOpacity = 30,
  strokeColor = "#4C8DFF",
  fillColor = "#EDEDED",
  restState = "filled",
  fontWeight = 700,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - delay;

  // 入场 spring（上浮 + 淡入，克制）
  const enter = spring({
    frame: t,
    fps,
    config: { damping: 24, stiffness: 110, mass: 1 },
  });

  // 整词闪烁：在 duration 内按 flickerCount 次在 outline/filled 间切换
  const flickerProgress = Math.min(1, Math.max(0, t / duration));
  const flickerPhase: Phase =
    flickerProgress >= 1
      ? restState
      : Math.floor(flickerProgress * flickerCount * 2) % 2 === 0
        ? "outline"
        : "filled";

  // 逐字闪烁：在 filled/outline 阶段，随机选几个字短暂变透明
  const getLetterFlicker = (charIndex: number): number => {
    if (letterFlickerIntensity === 0 || flickerProgress >= 1) return 1;
    // 用帧号 + 字符索引做伪随机，保证同一帧内结果确定
    const seed = Math.sin(t * 0.7 + charIndex * 3.7) * 10000;
    const rand = seed - Math.floor(seed);
    // intensity 控制闪烁频率：1-20 映射到 0.05-0.4 的闪烁概率
    const flickerProb = 0.05 + (letterFlickerIntensity / 20) * 0.35;
    return rand < flickerProb ? letterFlickerOpacity / 100 : 1;
  };

  const baseStyle: React.CSSProperties = {
    fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
    fontSize,
    fontWeight,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    opacity: enter,
    transform: `translateY(${Math.round(interpolate(enter, [0, 1], [24, 0]))}px)`,
    textRendering: "geometricPrecision",
  };

  const phaseStyle: React.CSSProperties =
    flickerPhase === "filled"
      ? { color: fillColor, WebkitTextStroke: "0px transparent" }
      : flickerPhase === "outline"
        ? {
            color: "transparent",
            WebkitTextFillColor: "transparent",
            WebkitTextStroke: `2px ${strokeColor}`,
          }
        : { color: "transparent", WebkitTextFillColor: "transparent", WebkitTextStroke: "0px transparent" };

  return (
    <div style={{ ...baseStyle, ...phaseStyle }}>
      {text.split("").map((char, i) => {
        const letterOpacity = getLetterFlicker(i);
        return (
          <span key={i} style={{ opacity: letterOpacity }}>
            {char}
          </span>
        );
      })}
    </div>
  );
};
