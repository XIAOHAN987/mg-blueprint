import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import {
  MotionPhase,
  usePhaseProgress,
  composeOffset,
  easeInCubic,
  Direction,
  dirVec,
} from "./motion";

/**
 * 丝滑动效原语（smooth-motion 移植版）
 *
 * 四个原语：
 * - StaggerItem：多元素错峰进场，统一方向出场
 * - SlideInItem：单元素从任意侧滑入，停在中心
 * - PunchThroughItem：单主角中心停稳后原地急剧放大穿透视野消失
 * - CameraBreath：场景级极缓慢推近，消除死画面
 *
 * 铁律：
 * - 新场景必须在旧场景出场走完 40% 时进场（OVERLAP = exitDur × 0.4 ≈ 6f @ exitDur=16）
 * - 场景背景必须全部透明，底色统一铺在根容器
 * - 帧数区间：进场 22-26f、出场 14-16f、stagger 相邻 4-8f、穿透 14-15f
 * - 出场方向一个场景内必须统一，场景之间可交替（右 → 上 → 穿透 → 下）
 */

/** 极简色块卡片 */
export const ColorCard: React.FC<{
  width: number;
  height: number;
  color: string;
  label?: string;
  labelColor?: string;
  fontSize?: number;
  radius?: number;
}> = ({
  width,
  height,
  color,
  label,
  labelColor = "#FFFFFF",
  fontSize = 42,
  radius = 18,
}) => (
  <div
    style={{
      width,
      height,
      backgroundColor: color,
      borderRadius: radius,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: labelColor,
      fontSize,
      fontWeight: 600,
      fontFamily: "Inter, 'Noto Sans SC', sans-serif",
      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
      letterSpacing: 2,
    }}
  >
    {label}
  </div>
);

/**
 * 错峰进 + 统一方向出 的元素
 * from: 进场方向（四方向均可）
 * exitTo: 出场方向（默认 "right"，可改 "top"/"bottom"/"left" 交替使用）
 * 元素共享同一个出场起点（由场景统一传入 phase.holdDur 对齐），
 * 即使各自进场时间不同，也会在同一时刻一起向 exitTo 甩出。
 */
export const StaggerItem: React.FC<{
  startFrame: number;
  phase: MotionPhase;
  from: Direction;
  exitTo?: Direction;
  travel?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ startFrame, phase, from, exitTo = "right", travel = 140, children, style }) => {
  const frame = useCurrentFrame();
  const { enter, exit } = usePhaseProgress(frame, startFrame, phase);

  const [fx, fy] = dirVec(from);
  const [ex, ey] = dirVec(exitTo);
  const inX = composeOffset(enter, exit, fx * travel, 0);
  const inY = composeOffset(enter, exit, fy * travel, 0);
  // 出场走大行程，确保飞出画面（先慢后快）
  const x = inX + exit * ex * 1600;
  const y = inY + exit * ey * 1100;
  const opacity = interpolate(enter, [0, 0.35], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        opacity,
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 从任意侧滑入，停在中心；之后随统一出场离开
 * from: 进场方向（四方向均可）
 * exitTo: 出场方向（默认 "right"，可交替）
 */
export const SlideInItem: React.FC<{
  startFrame: number;
  phase: MotionPhase;
  from: Direction;
  exitTo?: Direction;
  children: React.ReactNode;
}> = ({ startFrame, phase, from, exitTo = "right", children }) => {
  const frame = useCurrentFrame();
  const { enter, exit } = usePhaseProgress(frame, startFrame, phase);

  const [fx, fy] = dirVec(from);
  const [ex, ey] = dirVec(exitTo);
  const isHorizontal = fx !== 0;
  const fromDist = isHorizontal ? 1200 : 700;

  const x = composeOffset(enter, exit, fx * fromDist, ex * 1700);
  const y = composeOffset(enter, exit, fy * fromDist, ey * 1200);
  // 垂直方向进场时加一点横向漂移，水平进场时加一点纵向沉浮——抛物线惯性
  const cross = isHorizontal ? (from === "left" ? 60 : -60) : (from === "top" ? -60 : 60);
  const crossOffset = interpolate(enter, [0, 1], [isHorizontal ? cross : 0, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crossOffsetY = interpolate(enter, [0, 1], [isHorizontal ? 0 : cross, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 滑入时带一点点倾斜，停稳后回正——惯性体感的关键
  const tilt = fx !== 0 ? fx * -6 : fy * 6;
  const rotate = interpolate(enter, [0, 1], [tilt, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(enter, [0, 0.25], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translate(${x + (isHorizontal ? 0 : crossOffset)}px, ${y + (isHorizontal ? crossOffset : crossOffsetY)}px) rotate(${rotate}deg)`,
        opacity,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

/**
 * 中心原地急剧放大、穿透视野消失
 * 前半段几乎不动（悬念），后半段指数放大直到吞掉镜头
 */
export const PunchThroughItem: React.FC<{
  startFrame: number;
  holdFrames: number;
  punchFrames?: number;
  children: React.ReactNode;
}> = ({ startFrame, holdFrames, punchFrames = 14, children }) => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  const punchStart = startFrame + 20 + holdFrames;
  const punch = interpolate(frame, [punchStart, punchStart + punchFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInCubic,
  });

  // 进场：从 0.85 缩到 1；穿透：1 → 14 倍吞掉画面
  const scale = 0.85 + enter * 0.15 + punch * 13;
  // 穿透末段快速淡出（放大到遮住全屏后消失，露出下一场景）
  const opacity =
    interpolate(enter, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(punch, [0.85, 1], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  // 穿透瞬间轻微过曝提亮，模拟"镜头被吞"的闪光
  const brightness = 1 + punch * punch * 0.6;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: `brightness(${brightness})`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};

/**
 * 镜头呼吸：场景级极缓慢推近，消除死画面
 */
export const CameraBreath: React.FC<{
  from?: number;
  to?: number;
  driftX?: number;
  children: React.ReactNode;
}> = ({ from = 1, to = 1.05, driftX = -18, children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 150], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [0, 150], [0, driftX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${scale}) translateX(${x}px)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};
