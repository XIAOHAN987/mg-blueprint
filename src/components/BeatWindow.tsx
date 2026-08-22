import React from "react";
import { useCurrentFrame } from "remotion";
import { StaggerItem, SlideInItem, PunchThroughItem } from "../motion/primitives";
import { defaultPhase, Direction } from "../motion/motion";

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
 */

const EXIT_FRAMES = 16; // smooth-motion 出场帧数（14-16f）

export const BeatWindow: React.FC<{
  from: number;
  to: number;
  offsetY?: number;
  fullBleed?: boolean;
  mode?: "stagger" | "slide" | "punch";
  enterFrom?: Direction;
  exitTo?: Direction;
  children: React.ReactNode;
}> = ({
  from,
  to,
  offsetY = 0,
  fullBleed = false,
  mode = "stagger",
  enterFrom = "bottom",
  exitTo = "right",
  children,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;

  const beatDur = to - from;
  const holdDur = beatDur - EXIT_FRAMES - 22; // 进场 22f + 出场 16f，其余 hold

  const phase = defaultPhase(holdDur);

  const content = (
    <div
      style={{
        position: "absolute",
        left: fullBleed ? 140 : 1100,
        top: fullBleed ? 85 : 625 + offsetY,
        transform: fullBleed ? "none" : "translate(-50%, -50%)",
      }}
    >
      {children}
    </div>
  );

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
      <SlideInItem startFrame={from} phase={phase} from={enterFrom} exitTo={exitTo}>
        {content}
      </SlideInItem>
    );
  }

  // 默认 stagger
  return (
    <StaggerItem startFrame={from} phase={phase} from={enterFrom} exitTo={exitTo}>
      {content}
    </StaggerItem>
  );
};
