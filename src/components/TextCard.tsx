import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * TextCard —— 纯文字观点卡（问题抛出 / 结论 / 金句）。
 * lines 支持逐行 stagger，accent 关键词上色。
 * variant: normal（蓝强调）| warning（红强调）| quote（金句，更大字号）
 */
export type TextLine = { text: string; accent?: boolean };

export const TextCard: React.FC<{
  kicker?: string;
  lines: TextLine[];
  sub?: string;
  delay?: number;
  variant?: "normal" | "warning" | "quote";
  align?: "center" | "left";
}> = ({ kicker, lines, sub, delay = 0, variant = "normal", align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentColor = variant === "warning" ? "#E24B4A" : "#4C8DFF";
  const fontSize = variant === "quote" ? 76 : 64;

  const kickerEnter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 24, stiffness: 110, mass: 1 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: 22,
        fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
        textAlign: align,
        maxWidth: 1500,
      }}
    >
      {kicker ? (
        <div
          style={{
            opacity: kickerEnter,
            color: "rgba(255,255,255,0.45)",
            fontSize: 24,
            letterSpacing: "0.25em",
          }}
        >
          {kicker}
        </div>
      ) : null}
      {lines.map((line, i) => {
        const enter = spring({
          frame: frame - delay - 6 - i * 8,
          fps,
          config: { damping: 22, stiffness: 110, mass: 1 },
        });
        return (
          <div
            key={i}
            style={{
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px)`,
              filter: `blur(${interpolate(enter, [0, 1], [8, 0])}px)`,
              fontSize,
              fontWeight: 700,
              lineHeight: 1.25,
              color: line.accent ? accentColor : "#EDEDED",
              textShadow: line.accent ? `0 0 40px ${accentColor}44` : "none",
            }}
          >
            {line.text}
          </div>
        );
      })}
      {sub ? (
        <div
          style={{
            opacity: spring({
              frame: frame - delay - 10 - lines.length * 8,
              fps,
              config: { damping: 24, stiffness: 110, mass: 1 },
            }),
            color: "rgba(255,255,255,0.55)",
            fontSize: 30,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
