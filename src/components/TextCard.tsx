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

  const accentColor = variant === "warning" ? "#FF5533" : "#4C8DFF";
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
        backgroundColor: variant === "warning" ? "rgba(11, 13, 16, 0.75)" : "transparent",
        padding: variant === "warning" ? "20px 36px" : "0",
        borderRadius: 16,
        border: variant === "warning" ? "1px solid rgba(255, 85, 51, 0.25)" : "none",
        backdropFilter: variant === "warning" ? "blur(8px)" : "none",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        transform: "translateZ(0)",
        willChange: "transform",
        isolation: "isolate",
      }}
    >
      {kicker ? (
        <div
          style={{
            opacity: kickerEnter,
            color: variant === "warning" ? "#FF5533" : "rgba(255,255,255,0.6)",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.9)",
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
              transform: `translateY(${Math.round(interpolate(enter, [0, 1], [26, 0]))}px)`,
              textRendering: "geometricPrecision",
              fontSize,
              fontWeight: 800,
              lineHeight: 1.25,
              color: line.accent ? accentColor : "#FFFFFF",
              textShadow:
                line.accent && variant === "warning"
                  ? "0 2px 16px rgba(0, 0, 0, 0.95), 0 0 32px rgba(255, 85, 51, 0.5)"
                  : "0 2px 16px rgba(0, 0, 0, 0.95), 0 0 24px rgba(0, 0, 0, 0.8)",
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
