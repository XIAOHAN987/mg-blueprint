import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { COLOR, EASE, FONT, SPRING, TYPE } from "../theme";
import { GridBackground } from "./GridBackground";

/**
 * CinematicIntro —— 电影级开场（冷静克制调性）。
 *
 * 节拍（默认 120f / 4s）：
 * 1. 0–20f   极细横线从中心向两端扫开（mask 扫描感）
 * 2. 12–50f  主标题逐字升起（mask reveal + blur resolve，错峰 3f）
 * 3. 40–70f  副标题 + kicker 淡入
 * 4. 60–90f  相机 punch 微推进（scale 1.0 → 1.04，沉稳落定）
 * 5. 90–120f 静止呼吸，收尾
 *
 * 无弹跳、无旋转、无夸张位移——力量全部来自字级对比和速度曲线。
 */

export const CinematicIntro: React.FC<{
  /** 主标题（逐字升起） */
  title: string;
  /** 副标题（可选，较小字号） */
  sub?: string;
  /** 顶部 kicker 小字（可选） */
  kicker?: string;
  /** 总帧数（默认 120 = 4s） */
  durationInFrames?: number;
  /** 强调色（用于细线 + kicker） */
  accent?: string;
}> = ({
  title,
  sub,
  kicker,
  durationInFrames = 120,
  accent = COLOR.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 1. 细线扫描（0–20f）─────────────────────────────
  const lineProgress = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.snappy,
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 320]);
  const lineOpacity = interpolate(frame, [0, 4, 20, 40], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── 2. 主标题逐字升起（12f 起，错峰 3f）──────────────
  const chars = Array.from(title);
  const CHAR_STAGGER = 3;
  const CHAR_ENTER = 22;
  const titleStart = 12;

  // ── 3. 副标题 + kicker（40f 起）──────────────────────
  const subEnter = interpolate(frame, [40, 40 + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });

  // ── 4. 相机 punch 微推进（60–90f）────────────────────
  const camScale = interpolate(frame, [60, 90], [1, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.punch,
  });

  // ── 5. 整体呼吸（90f 后极微漂移，防死屏）─────────────
  const breathe =
    frame > 90 ? Math.sin((frame - 90) / 40) * 1.5 : 0;

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
        transform: `scale(${camScale}) translateY(${breathe}px)`,
      }}
    >
      <GridBackground width={1920} height={1080} />

      {/* kicker */}
      {kicker ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: TYPE.caption.size,
            color: accent,
            letterSpacing: "0.3em",
            opacity: subEnter,
            transform: `translateY(${(1 - subEnter) * 10}px)`,
            marginBottom: 28,
          }}
        >
          {kicker}
        </div>
      ) : null}

      {/* 细线扫描 */}
      <div
        style={{
          width: lineWidth,
          height: 1,
          background: accent,
          opacity: lineOpacity,
          marginBottom: 36,
        }}
      />

      {/* 主标题逐字升起 */}
      <div
        style={{
          display: "flex",
          overflow: "hidden",
          lineHeight: 1.05,
        }}
      >
        {chars.map((ch, i) => {
          const start = titleStart + i * CHAR_STAGGER;
          const enter = interpolate(
            frame,
            [start, start + CHAR_ENTER],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE.outExpo,
            }
          );
          const y = Math.round((1 - enter) * 60);
          const blur = interpolate(enter, [0, 1], [10, 0]);
          const opacity = interpolate(enter, [0, 0.25], [0, 1], {
            extrapolateRight: "clamp",
          });
          const settled = enter >= 1;

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: FONT.heading,
                fontSize: TYPE.hero.size,
                fontWeight: 700,
                color: COLOR.fg,
                letterSpacing: TYPE.hero.letterSpacing,
                transform: `translateY(${settled ? 0 : y}px)`,
                filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
                opacity,
                textRendering: "geometricPrecision",
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          );
        })}
      </div>

      {/* 副标题 */}
      {sub ? (
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: TYPE.body.size,
            color: COLOR.soft,
            letterSpacing: "0.02em",
            opacity: subEnter,
            transform: `translateY(${Math.round((1 - subEnter) * 16)}px)`,
            marginTop: 40,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
