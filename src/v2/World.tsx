import React from "react";
import { Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Move, Pose, T } from "./space";
import { VIEW_H, VIEW_W, cameraBlur, sampleCamera } from "./space";

const BLEED = 180;

/**
 * World —— 相机容器。children 全部处在世界坐标里，
 * 相机按 moves 推拉摇移；运动时按屏幕速度加方向性模糊。
 */
export const World: React.FC<{ start: Pose; moves: Move[]; children: React.ReactNode }> = ({
  start,
  moves,
  children,
}) => {
  const frame = useCurrentFrame();
  const cam = sampleCamera(start, moves, frame);
  const blur = cameraBlur(start, moves, frame);
  const blurOn = blur.x > 0.4 || blur.y > 0.4;

  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="v2-motion-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${blur.x.toFixed(2)} ${blur.y.toFixed(2)}`} />
          </filter>
        </defs>
      </svg>
      {/* 外扩一圈再模糊，避免屏幕边缘被模糊吃出暗边 */}
      <div
        style={{
          position: "absolute",
          left: -BLEED,
          top: -BLEED,
          width: VIEW_W + BLEED * 2,
          height: VIEW_H + BLEED * 2,
          overflow: "hidden",
          filter: blurOn ? "url(#v2-motion-blur)" : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${VIEW_W / 2 + BLEED}px, ${VIEW_H / 2 + BLEED}px) rotate(${cam.r}deg) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

/** 把一块内容按坐标系 t 摆进父坐标系 */
export const Place: React.FC<{
  t: T;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ t, w = VIEW_W, h = VIEW_H, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: w,
      height: h,
      transformOrigin: "0 0",
      transform: `translate(${t.x}px, ${t.y}px) rotate(${t.r}deg) scale(${t.s})`,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Clip —— 满幅视频。起播前停在首帧、播完停在末帧，
 * 所以相机可以提前看见它、也可以在它播完后再离开。
 */
export const Clip: React.FC<{
  src: string;
  /** 全局起播帧 */
  start: number;
  /** 素材时长（秒） */
  seconds: number;
  rate?: number;
  /** 显示尺寸，默认满幅 1920×1080；录屏等可按素材原始像素摆放 */
  w?: number;
  h?: number;
  style?: React.CSSProperties;
}> = ({ src, start, seconds, rate = 1, w = VIEW_W, h = VIEW_H, style }) => {
  const frame = useCurrentFrame();
  const maxLocal = Math.floor((seconds * 30) / rate) - 3;
  const local = Math.min(maxLocal, Math.max(0, frame - start));
  return (
    <Freeze frame={start + local}>
      <Sequence from={start} layout="none">
        <OffthreadVideo
          src={staticFile(src)}
          muted
          playbackRate={rate}
          style={{ position: "absolute", left: 0, top: 0, width: w, height: h, objectFit: "cover", ...style }}
        />
      </Sequence>
    </Freeze>
  );
};
