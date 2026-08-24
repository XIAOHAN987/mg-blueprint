import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Video, staticFile } from "remotion";

/**
 * FilmReel —— 「我之前迭代过好几套」的历史视频胶片滚动。
 *
 * 多条历史视频排成横向胶片条，带胶片齿孔边框，
 * 整条缓慢匀速滚动（从右往左），营造"翻旧作品"的回顾感。
 */
export const FilmReel: React.FC<{
  sources: string[];
  delay?: number;
  /** 滚动速度 px/帧 */
  speed?: number;
}> = ({ sources, delay = 0, speed = 2.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - delay);

  const clipW = 380;
  const gap = 26;
  const reelH = 250;

  const enter = interpolate(t, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 整条缓慢左移，到尾部循环
  const stripW = sources.length * (clipW + gap);
  const scroll = (t * speed) % stripW;

  // 齿孔
  const holes = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${(1 - enter) * 40}px)`,
        width: 1500,
        overflow: "hidden",
        borderRadius: 12,
        background: "#000",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        padding: "26px 0",
        position: "relative",
      }}
    >
      {/* 上排齿孔 */}
      <div style={{ position: "absolute", top: 7, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
        {holes.map((i) => (
          <div key={i} style={{ width: 16, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
        ))}
      </div>
      {/* 下排齿孔 */}
      <div style={{ position: "absolute", bottom: 7, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
        {holes.map((i) => (
          <div key={i} style={{ width: 16, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
        ))}
      </div>

      {/* 胶片条：复制两份实现无缝循环 */}
      <div style={{ display: "flex", transform: `translateX(${-scroll}px)`, width: stripW * 2 }}>
        {[...sources, ...sources].map((src, i) => (
          <div
            key={i}
            style={{
              width: clipW,
              height: reelH,
              marginRight: gap,
              flexShrink: 0,
              overflow: "hidden",
              borderRadius: 4,
              background: "#0B0D10",
              lineHeight: 0,
            }}
          >
            <Video
              src={staticFile(src)}
              muted
              acceptableTimeShiftInSeconds={0.6}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
