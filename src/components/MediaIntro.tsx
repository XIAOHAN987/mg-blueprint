import React from "react";
import { useCurrentFrame, interpolate, staticFile, Img, Video, Audio } from "remotion";
import { COLOR, EASE, FONT, TYPE } from "../theme";
import { GridBackground } from "./GridBackground";

/**
 * MediaIntro —— 素材开场（口播视频专用）。
 *
 * 与 CinematicIntro 的区别：素材先行，不做纯文字开场。
 * 口播第一句直接在素材上开始，标题文字叠加在素材上浮现。
 *
 * 节拍（默认 90f / 3s）：
 * 1. 0–16f   素材从 blur(20px) + brightness(0.3) 浮现，相机 scale 1.06→1.0 微推
 * 2. 8–30f   标题文字从底部升起（mask + blur resolve）
 * 3. 20–40f  副标题/元数据淡入
 * 4. 40f+    素材稳定，口播继续，场景交给后续 beat
 *
 * 素材占画幅 ~78%（宽 1500px），手机上可读。
 */

export const MediaIntro: React.FC<{
  /** 素材路径（public/ 下相对路径） */
  src: string;
  /** 素材类型 */
  kind?: "image" | "video";
  /** 主标题（叠加在素材上） */
  title?: string;
  /** 副标题 */
  sub?: string;
  /** 总帧数（默认 90 = 3s） */
  durationInFrames?: number;
  /** 口播音频路径（可选，从此组件开始播放） */
  audioSrc?: string;
  /** 强调色 */
  accent?: string;
}> = ({
  src,
  kind = "image",
  title,
  sub,
  durationInFrames = 90,
  audioSrc,
  accent = COLOR.accent,
}) => {
  const frame = useCurrentFrame();

  // ── 1. 素材浮现（0–16f）──────────────────────────────
  const mediaEnter = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const mediaBlur = interpolate(mediaEnter, [0, 1], [20, 0]);
  const mediaBrightness = interpolate(mediaEnter, [0, 1], [0.3, 1]);
  const mediaScale = interpolate(mediaEnter, [0, 1], [1.06, 1.0]);

  // ── 2. 标题文字（8–30f，mask 升起）───────────────────
  const TITLE_START = 8;
  const titleEnter = interpolate(frame, [TITLE_START, TITLE_START + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });
  const titleY = Math.round((1 - titleEnter) * 50);
  const titleBlur = interpolate(titleEnter, [0, 1], [8, 0]);
  const titleOpacity = interpolate(titleEnter, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── 3. 副标题（20–40f）───────────────────────────────
  const SUB_START = 20;
  const subEnter = interpolate(frame, [SUB_START, SUB_START + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });

  // ── 4. 底部 scrim（保护文字可读）─────────────────────
  const scrimOpacity = interpolate(mediaEnter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLOR.bg,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GridBackground width={1920} height={1080} />

      {/* 口播音频 */}
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}

      {/* 素材主体 */}
      <div
        style={{
          position: "relative",
          width: 1500,
          borderRadius: 16,
          overflow: "hidden",
          transform: `scale(${mediaScale})`,
          filter: `blur(${mediaBlur}px) brightness(${mediaBrightness})`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          lineHeight: 0,
        }}
      >
        {kind === "video" ? (
          <Video
            src={staticFile(src)}
            muted
            style={{ width: "100%", display: "block" }}
          />
        ) : (
          <Img
            src={staticFile(src)}
            style={{ width: "100%", display: "block" }}
          />
        )}

        {/* 底部 scrim */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "45%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
            opacity: scrimOpacity,
          }}
        />

        {/* 标题叠加在素材上 */}
        {title ? (
          <div
            style={{
              position: "absolute",
              left: 48,
              bottom: sub ? 72 : 48,
              lineHeight: 1.1,
            }}
          >
            <div
              style={{
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: FONT.heading,
                  fontSize: TYPE.display.size,
                  fontWeight: 700,
                  color: COLOR.fg,
                  letterSpacing: TYPE.display.letterSpacing,
                  transform: `translateY(${titleY}px)`,
                  filter: titleBlur > 0.5 ? `blur(${titleBlur}px)` : undefined,
                  opacity: titleOpacity,
                  textRendering: "geometricPrecision",
                  textShadow: "0 4px 24px rgba(0,0,0,0.9)",
                }}
              >
                {title}
              </div>
            </div>
          </div>
        ) : null}

        {/* 副标题 */}
        {sub ? (
          <div
            style={{
              position: "absolute",
              left: 48,
              bottom: 36,
              fontFamily: FONT.mono,
              fontSize: TYPE.caption.size,
              color: accent,
              letterSpacing: "0.12em",
              opacity: subEnter,
              transform: `translateY(${Math.round((1 - subEnter) * 12)}px)`,
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};
