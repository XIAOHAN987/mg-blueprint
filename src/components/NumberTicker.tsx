import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

/**
 * NumberTicker —— 高能数字极速滚动组件（里程表效果）。
 *
 * 通过 cubic out 减速曲线在指定帧数内将数值从 fromVal 平滑滚至 toVal，
 * 像高速里程表一样"翻滚到位"。支持小数位、前后缀、与任意帧同步。
 *
 * 通用：价格、数量、参数、百分比、跑分——任何"展示一个数字"的场景。
 * 沉淀自 Agent 优化（OxAlphaVideo NumberTicker），实现干净直接沿用。
 */
export const NumberTicker: React.FC<{
  /** 起始值 */
  fromVal: number;
  /** 目标值 */
  toVal: number;
  /** 小数保留位数（如价格保留 1 位或 3 位），默认 0（整数） */
  decimals?: number;
  /** 开始滚动的全局帧 */
  startFrame: number;
  /** 滚动持续帧数（默认 16，约 0.5 秒——够快才有"里程表"感） */
  duration?: number;
  /** 前缀（如 "¥ "） */
  prefix?: string;
  /** 后缀（如 " 万亿"、"B"、"%"） */
  suffix?: string;
}> = ({
  fromVal,
  toVal,
  decimals = 0,
  startFrame,
  duration = 16,
  prefix = "",
  suffix = "",
}) => {
  const frame = useCurrentFrame();

  const val = interpolate(frame, [startFrame, startFrame + duration], [fromVal, toVal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <span style={{ fontVariantNumeric: "tabular-nums", display: "inline-block" }}>
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}
      {suffix}
    </span>
  );
};
