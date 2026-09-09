import { interpolate, Easing } from "remotion";

/**
 * 丝滑动效核心缓动预设
 *
 * 进场：先快后慢，稳稳停住（decay 型，尾速趋近 0，无回弹）
 * 出场：先慢后快，加速离屏（accelerate 型，离屏时速度最大）
 *
 * 两条曲线拼起来，接力时新内容进场的初速 ≈ 旧内容出场的末速，
 * 视觉上形成"惯性接力"而不是硬切。
 */

/** 进场：Expo 衰减——起步极快，末端指数级减速，稳稳停住 */
export const easeOutExpo = Easing.out(Easing.exp);

/** 出场：自然加速甩出视野（poly 3.5 兼具起步响应与末端甩速） */
export const easeInQuint = Easing.in(Easing.poly(3.5));

/** 穿透缩放：接近立方加速，穿透瞬间足够"剧" */
export const easeInCubic = Easing.in(Easing.poly(3));

/** 标准帧率 */
export const FPS = 30;

/** 四方向（进出场都用） */
export type Direction = "top" | "bottom" | "left" | "right";

/** 方向 → 单位向量 [x, y] */
export const dirVec = (d: Direction): [number, number] => {
  switch (d) {
    case "top":
      return [0, -1];
    case "bottom":
      return [0, 1];
    case "left":
      return [-1, 0];
    case "right":
      return [1, 0];
  }
};

/** 反方向（用于"从哪来，回哪去"或对称编排） */
export const oppositeDir = (d: Direction): Direction => {
  switch (d) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
      return "right";
    case "right":
      return "left";
  }
};

export interface MotionPhase {
  /** 进场持续帧数 */
  enterDur: number;
  /** 停留帧数 */
  holdDur: number;
  /** 出场持续帧数 */
  exitDur: number;
}

/** 默认节拍：进 22f（0.73s）— 停留 — 出 16f（0.53s） */
export const defaultPhase = (holdDur: number): MotionPhase => ({
  enterDur: 22,
  holdDur,
  exitDur: 16,
});

/**
 * 计算一个元素在其生命周期内的运动进度
 * 返回 [0..1 进场进度, 0..1 出场进度]，均已施加缓动
 */
export const usePhaseProgress = (
  frame: number,
  startFrame: number,
  phase: MotionPhase,
): { enter: number; exit: number } => {
  const enter = interpolate(
    frame,
    [startFrame, startFrame + phase.enterDur],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutExpo,
    },
  );
  const exitStart = startFrame + phase.enterDur + phase.holdDur;
  const exit = interpolate(frame, [exitStart, exitStart + phase.exitDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInQuint,
  });
  return { enter, exit };
};

/** 由进/出进度合成最终位移（从 fromOffset 进场到 0，再向 exitOffset 出场） */
export const composeOffset = (
  enter: number,
  exit: number,
  fromOffset: number,
  exitOffset: number,
): number => {
  const inPos = (1 - enter) * fromOffset;
  const outPos = exit * exitOffset;
  return inPos + outPos;
};
