import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

/**
 * CrossStage —— 分镜内两段内容的交叉位移过渡容器（消灭硬切）。
 *
 * 解决"分镜内两段式展示用 frame < t ? <A/> : <B/> 瞬间硬切"的掉帧感：
 * A 在结束前 fadeDur 帧平滑隐退（上移+淡出），B 在起始 fadeDur 帧渐入咬合（下移归位+淡入），
 * 两段在交界处重叠，彻底无缝。
 *
 * 与 BeatWindow 的区别：BeatWindow 管 beat（口播段）之间的转场；
 * CrossStage 管**同一个 beat 内部**两段内容的先后切换（如"先放图A再换成图B"）。
 *
 * 用法：每个内容段包一个 CrossStage，设定它出现的帧区间 [showFrom, showTo]。
 */

export const CrossStage: React.FC<{
  /** 该内容段开始显示的全局帧 */
  showFrom: number;
  /** 该内容段结束显示的全局帧 */
  showTo: number;
  /** 进/出场过渡时长（帧，默认 14） */
  fadeDur?: number;
  /** 位移幅度（px，默认 26——上移归隐/下移归位） */
  shift?: number;
  children: React.ReactNode;
}> = ({ showFrom, showTo, fadeDur = 14, shift = 26, children }) => {
  const frame = useCurrentFrame();
  if (frame < showFrom - 2 || frame > showTo + 2) return null;

  // 进场：指数衰减平滑推入
  const inP = interpolate(frame, [showFrom, showFrom + fadeDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  // 出场：立方加速平滑浮出
  const outP = interpolate(frame, [showTo - fadeDur, showTo], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.poly(3)),
  });

  const opacity = Math.min(inP, outP);
  const translateY = (1 - inP) * shift + (1 - outP) * -shift;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translate3d(0, ${translateY}px, 0)`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};
