import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Video,
  Img,
} from "remotion";

/**
 * FullBleedMedia —— 全屏素材段（视频/图片铺满取景框）。
 *
 * 与 EmbeddedMedia（小窗嵌入）互补：全屏素材本身就是画面主体。
 * - cover 铺满 1920x1080，BeatWindow 以 (0,0) 锚点摆放
 * - 入场：1.09 → 1.0 缓慢 Ken Burns 推近 + 淡入（素材内部运动，相机保持锁定）
 * - 底部 45% 黑色渐变 scrim，保证叠加文字与字幕可读
 * - caption：左下大文字（spring 上浮入场），配蓝色小标
 */
export const FullBleedMedia: React.FC<{
  src: string;
  kind: "video" | "image";
  delay?: number;
  /** 视频裁剪起点（秒） */
  startFromSec?: number;
  kicker?: string;
  caption?: string;
  /** scrim 高度比例，默认 0.45 */
  scrim?: number;
}> = ({ src, kind, delay = 0, startFromSec = 0, kicker, caption, scrim = 0.45 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Ken Burns：素材内部缓慢推近（30s 内 1.09→1.0，全程有效）
  const kb = interpolate(frame, [delay, delay + 300], [1.09, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const captionEnter = spring({
    frame: frame - delay - 12,
    fps,
    config: { damping: 24, stiffness: 110, mass: 1 },
  });

  return (
    <div style={{ position: "relative", width: 1920, height: 1080, opacity: fadeIn }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          transform: `scale(${kb})`,
        }}
      >
        {kind === "video" ? (
          <Video
            src={staticFile(src)}
            muted
            startFrom={Math.round(startFromSec * fps)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Img
            src={staticFile(src)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      {/* 底部 scrim：文字与字幕的可读区 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${scrim * 100}%`,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
        }}
      />

      {/* 左下叠加文字 */}
      {caption ? (
        <div
          style={{
            position: "absolute",
            left: 90,
            bottom: 150,
            opacity: captionEnter,
            transform: `translateY(${interpolate(captionEnter, [0, 1], [30, 0])}px)`,
            filter: `blur(${interpolate(captionEnter, [0, 1], [8, 0])}px)`,
            fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
          }}
        >
          {kicker ? (
            <div
              style={{
                display: "inline-block",
                background: "#2563EB",
                color: "#fff",
                fontSize: 21,
                fontWeight: 600,
                letterSpacing: "0.12em",
                padding: "5px 14px",
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.3,
              textShadow: "0 3px 16px rgba(0,0,0,0.8)",
              maxWidth: 1300,
            }}
          >
            {caption}
          </div>
        </div>
      ) : null}
    </div>
  );
};
