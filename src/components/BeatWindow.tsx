import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { StaggerItem, SlideInItem, PunchThroughItem } from "../motion/primitives";
import { defaultPhase, Direction } from "../motion/motion";
import { EASE } from "../theme";

/**
 * BeatWindow —— beat 级显隐窗口（锁定相机构图下的元素交接协议，v2 丝滑转场版）。
 *
 * 每个 beat 的内容包一层 BeatWindow：
 * - from 前：不可见
 * - [from, to-EXIT]：完全可见（入场动画由内部组件自己的 delay 负责）
 * - 末尾 EXIT 帧：用 smooth-motion 原语丝滑出场（不再淡出上浮）
 *
 * 转场接力（smooth-motion 铁律）：
 * - 新场景必须在旧场景出场走完 40% 时进场（OVERLAP = exitDur × 0.4 ≈ 6f @ exitDur=16）
 * - 场景背景必须全部透明，底色统一铺在根容器
 * - 出场方向一个场景内必须统一，场景之间可交替（右 → 上 → 穿透 → 下）
 *
 * 居中约定：内容默认锚定舞台中心（1100, 625），可用 offsetY 微调垂直构图。
 * fullBleed=true 时锚定取景框左上（用于 FullBleedMedia 等自带全幅定位的内容）。
 *
 * 动效原语：
 * - mode="stagger"（默认）：多元素错峰进场，统一方向出场
 * - mode="slide"：单元素从任意侧滑入，停在中心
 * - mode="punch"：单主角中心停稳后原地急剧放大穿透视野消失
 * - mode="hold"：只进不出——内容进场后停留在画面上（用于渐进揭示的旧内容靠边让位）
 */

const EXIT_FRAMES = 16; // smooth-motion 出场帧数（14-16f）
/** 转场接力重叠帧：旧 beat 出场拖尾延伸到下一个 beat 开头，新 beat 同时滑入 */
export const LINK_OVERLAP = 16;

export const BeatWindow: React.FC<{
  from: number;
  to: number;
  offsetY?: number;
  fullBleed?: boolean;
  mode?: "stagger" | "slide" | "punch" | "hold";
  enterFrom?: Direction;
  exitTo?: Direction;
  /** 进场速度倍率：<1 更快提前，>1 更慢拖后 */
  enterRate?: number;
  /** 出场速度倍率：<1 更快先走，>1 更慢后走 */
  exitRate?: number;
  /** 转场接力：true 时 beat 在 to 之后多存活 LINK_OVERLAP 帧做滑出（与下一个 beat 进场重叠，动势连续） */
  linkOut?: boolean;
  /** 舞台安全区防撞顶：内容锚点距顶部的最小值（px）。内容过高顶到 FrameChrome 页眉时开启（如 safeTop=130），默认 undefined 不启用 */
  safeTop?: number;
  children: React.ReactNode;
}> = ({
  from,
  to,
  offsetY = 0,
  fullBleed = false,
  mode = "stagger",
  enterFrom = "bottom",
  exitTo = "right",
  enterRate = 1,
  exitRate = 1,
  linkOut = false,
  safeTop,
  children,
}) => {
  const frame = useCurrentFrame();
  // linkOut：beat 内容存活到 to + 10 帧，把出场滑走放进转场重叠区
  const endFrame = linkOut ? to + 10 : to;
  if (frame < from || frame >= endFrame) return null;

  // 当 linkOut 为 true 时，出场提前 8 帧启动，确保新场景进入时旧场景已完成 ~40% 位移，绝不在屏幕中央重叠重影
  const exitAdvance = linkOut ? 8 : 0;
  const holdDur = Math.max(1, (to - from) - EXIT_FRAMES - 22 + (EXIT_FRAMES - exitAdvance));

  const phase = defaultPhase(holdDur);

  // 防撞顶：safeTop 启用时，锚点 top 不小于 safeTop（内容是 translate(-50%,-50%) 居中，
  // 锚点 top 即内容垂直中心；内容越高，其顶边 = top - contentH/2，越高越往上顶。
  // safeTop 直接约束锚点 top 的下限，内容顶边 = safeTop 时刚好不撞页眉——
  // 由于无法预知内容高度，这里用"锚点 top 不低于 safeTop"作为保守约束）
  const rawTop = fullBleed ? 85 : 625 + offsetY;
  const top = safeTop !== undefined && !fullBleed ? Math.max(rawTop, safeTop) : rawTop;

  const content = (
    <div
      style={{
        position: "absolute",
        left: fullBleed ? 140 : 1100,
        top,
        transform: fullBleed ? "none" : "translate(-50%, -50%)",
      }}
    >
      {children}
    </div>
  );

  // hold 模式：只进不出，内容停留到 beat 结束
  if (mode === "hold") {
    const enterT = interpolate(frame, [from, from + 22], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.smooth,
    });
    const y = Math.round((1 - enterT) * 40);
    const opacity = interpolate(enterT, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

    return (
      <div
        style={{
          transform: `translateY(${y}px)`,
          opacity,
          backgroundColor: "transparent",
        }}
      >
        {content}
      </div>
    );
  }

  // 用 smooth-motion 原语做丝滑出入场
  if (mode === "punch") {
    return (
      <PunchThroughItem startFrame={from} holdFrames={holdDur}>
        {content}
      </PunchThroughItem>
    );
  }

  if (mode === "slide") {
    return (
      <SlideInItem startFrame={from} phase={phase} from={enterFrom} exitTo={exitTo} enterRate={enterRate} exitRate={exitRate}>
        {content}
      </SlideInItem>
    );
  }

  // 默认 stagger
  return (
    <StaggerItem startFrame={from} phase={phase} from={enterFrom} exitTo={exitTo} enterRate={enterRate} exitRate={exitRate}>
      {content}
    </StaggerItem>
  );
};
