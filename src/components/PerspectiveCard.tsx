import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

/**
 * PerspectiveCard —— 2.5D 空间微透视翻板入场（幅度焊死，防过头）。
 *
 * 用克制的 perspective + rotate 做"微透视"入场（≤16deg），给卡片/面板实体感，
 * 不做 90deg 大翻转（那会廉价）。沉淀自 Agent 优化（OxAlphaVideo 3D Perspective Swing）。
 *
 * 三种预设（preset），AI 只能选，不能自由调角度：
 * - "press"：单面板从斜上方下压翻平（rotateX 14deg→0）
 * - "fan"：多卡扇形展开（rotateX 16deg→0 + 按 index 的 rotateY ∓8deg 扇形）
 * - "bifold"：左右对开门合拢（rotateY ±8deg→0）
 *
 * 幅度锁死 ≤16deg，配合 spring 微过冲（scale 0.85→1.025→1.0），沉稳不飘。
 */

type Preset = "press" | "fan" | "bifold";

export const PerspectiveCard: React.FC<{
  /** 入场开始的全局帧 */
  enterFrame: number;
  /** 入场预设：press 单面板下压 / fan 扇形展开 / bifold 对开门 */
  preset?: Preset;
  /** fan/bifold 预设下，该卡是第几张（0 起） */
  index?: number;
  /** fan/bifold 预设下，总卡数（算扇形角度用） */
  count?: number;
  /** bifold 专用：该卡是左栏还是右栏 */
  side?: "left" | "right";
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ enterFrame, preset = "press", index = 0, count = 3, side, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 15, stiffness: 180, mass: 0.6 },
  });

  // 位移（统一微上浮归位）+ 微过冲缩放
  const translateY = interpolate(enter, [0, 1], [40, 0]);
  const scale = interpolate(enter, [0, 0.75, 1], [0.85, 1.025, 1]);

  // 按预设算 3D 旋转角（全部焊死 ≤16deg）
  let rotX = 0;
  let rotY = 0;
  if (preset === "press") {
    // 单面板：rotateX 14deg → 0（从斜上方下压翻平）
    rotX = (1 - enter) * 14;
  } else if (preset === "fan") {
    // 扇形：统一 rotateX 16deg 前倾 + 按 index 的 rotateY 扇形（左负右正）
    rotX = (1 - enter) * 16;
    const mid = (count - 1) / 2;
    rotY = (index - mid) * (1 - enter) * -8;
  } else if (preset === "bifold") {
    // 对开门：左栏 +8deg、右栏 -8deg 向内合拢归零
    const sign = side === "right" ? -1 : 1;
    rotY = (1 - enter) * 8 * sign;
  }

  return (
    <div
      style={{
        transform: `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(0, ${translateY}px, 0) scale(${scale})`,
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
