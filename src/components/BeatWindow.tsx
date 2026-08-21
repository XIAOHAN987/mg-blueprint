import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

/**
 * BeatWindow —— beat 级显隐窗口（锁定相机构图下的元素交接协议）。
 *
 * 每个 beat 的内容包一层 BeatWindow：
 * - from 前：不可见
 * - [from, to-EXIT]：完全可见（入场动画由内部组件自己的 delay 负责）
 * - 末尾 12 帧：淡出 + 轻微上浮让位给下一个 beat
 *
 * 居中约定：内容默认锚定舞台中心（1100, 625），可用 offsetY 微调垂直构图。
 * fullBleed=true 时锚定取景框左上（用于 FullBleedMedia 等自带全幅定位的内容）。
 */
const EXIT_FRAMES = 12;

export const BeatWindow: React.FC<{
  from: number;
  to: number;
  offsetY?: number;
  fullBleed?: boolean;
  children: React.ReactNode;
}> = ({ from, to, offsetY = 0, fullBleed = false, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;

  const exit = interpolate(frame, [to - EXIT_FRAMES, to], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(frame, [to - EXIT_FRAMES, to], [0, -22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: fullBleed ? 140 : 1100,
        top: fullBleed ? 85 : 625 + offsetY,
        transform: fullBleed
          ? `translateY(${exitY}px)`
          : `translate(-50%, -50%) translateY(${exitY}px)`,
        opacity: exit,
      }}
    >
      {children}
    </div>
  );
};
