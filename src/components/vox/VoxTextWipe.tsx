import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { VoxTextWipeProps } from "./types";

/**
 * 文字羽化线性擦除:
 * 底层内容 opacity 降到 0.25, 高亮层用线性渐变 mask 从左到右"擦亮"。
 * 把要聚焦的内容(文字/图片)作为 children 传入。
 */
export const VoxTextWipe: React.FC<
  VoxTextWipeProps & { children: React.ReactNode }
> = ({
  children,
  delayInFrames = 0,
  durationInFrames = 20,
  direction = "ltr",
  feather = 15,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delayInFrames;

  const progress = interpolate(localFrame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 2),
  });

  const dir = direction === "ltr" ? "to right" : "to left";
  const mask = `linear-gradient(${dir}, black ${progress}%, transparent ${
    progress + feather
  }%)`;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* 底层: 压淡 */}
      <div style={{ opacity: 0.25 }}>{children}</div>
      {/* 高亮层: mask 擦除 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {children}
      </div>
    </div>
  );
};
