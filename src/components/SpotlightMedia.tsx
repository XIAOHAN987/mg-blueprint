import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  OffthreadVideo,
  Img,
} from "remotion";

/**
 * SpotlightMedia —— 全屏聚光素材段（小框 → 放大下移 → 缩回）。
 *
 * 三段动画：
 * 1. 小框入场（spring 上浮 + 淡入）
 * 2. 放大下移（scale 1.0 → 1.4，y 下移，素材成为画面主体）
 * 3. 缩回（scale 1.4 → 1.0，y 回位，让位给下一个 beat）
 *
 * 底部带 scrim 渐变，保证字幕可读。
 */
export const SpotlightMedia: React.FC<{
  src: string;
  kind: "video" | "image";
  delay?: number;
  startFromSec?: number;
  /** 放大开始帧（相对 delay） */
  zoomAt?: number;
  caption?: string;
}> = ({ src, kind, delay = 0, startFromSec = 0, zoomAt = 30, caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - delay;

  // 入场
  const enter = spring({
    frame: t,
    fps,
    config: { damping: 22, stiffness: 110, mass: 1 },
  });

  // 放大下移（zoomAt 到 zoomAt+20，干脆利落）
  const zoomIn = interpolate(t, [zoomAt, zoomAt + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 合成：scale 1.0 → 1.15（放大到字幕上方停住，不缩回）
  const scale = interpolate(zoomIn, [0, 1], [1.0, 1.15]);
  const y = interpolate(zoomIn, [0, 1], [0, 30]);
  const width = interpolate(zoomIn, [0, 1], [900, 1200]);

  // 字幕淡入（放大后）
  const captionEnter = interpolate(t, [zoomAt + 15, zoomAt + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width,
        opacity: enter,
        transform: `translateY(${y}px) scale(${scale})`,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: `0 ${18 + zoomIn * 12}px ${40 + zoomIn * 20}px rgba(0,0,0,${0.5 + zoomIn * 0.15})`,
        background: "#0B0D10",
        lineHeight: 0,
      }}
    >
      {kind === "video" ? (
        <OffthreadVideo
          src={staticFile(src)}
          muted
          startFrom={Math.round(startFromSec * fps)}
          style={{ width: "100%" }}
        />
      ) : (
        <Img src={staticFile(src)} style={{ width: "100%" }} />
      )}

      {/* 底部 scrim */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "40%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          opacity: zoomIn,
        }}
      />

      {/* 叠加文字 */}
      {caption ? (
        <div
          style={{
            position: "absolute",
            left: 40,
            bottom: 40,
            opacity: captionEnter,
            transform: `translateY(${interpolate(captionEnter, [0, 1], [20, 0])}px)`,
            fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 42,
              fontWeight: 700,
              lineHeight: 1.3,
              textShadow: "0 3px 16px rgba(0,0,0,0.8)",
            }}
          >
            {caption}
          </div>
        </div>
      ) : null}
    </div>
  );
};
