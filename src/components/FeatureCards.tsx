import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * FeatureCards —— 能力/要点卡片组，逐张 stagger 上浮入场。
 * 适合「列举 2-4 个并列要点」的 beat。
 */
export const FeatureCards: React.FC<{
  items: { title: string; desc: string }[];
  delay?: number;
  cardWidth?: number;
}> = ({ items, delay = 0, cardWidth = 380 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", gap: 36 }}>
      {items.map((item, i) => {
        const enter = spring({
          frame: frame - delay - i * 9,
          fps,
          config: { damping: 22, stiffness: 110, mass: 1 },
        });
        return (
          <div
            key={i}
            style={{
              width: cardWidth,
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [44, 0])}px)`,
              background: "#10141A",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "30px 28px",
              boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
              fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
            }}
          >
            <div
              style={{
                width: 34,
                height: 4,
                borderRadius: 2,
                background: "#4C8DFF",
                marginBottom: 20,
              }}
            />
            <div
              style={{
                color: "#EDEDED",
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 14,
                lineHeight: 1.3,
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 22,
                lineHeight: 1.6,
              }}
            >
              {item.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
};
