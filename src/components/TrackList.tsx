import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * 文件清单列表（复刻截图：歌曲名 …… Track01.cda）。
 * 逐行 stagger 从左侧进入，行间虚线连接。
 */
export const TrackList: React.FC<{
  items: { name: string; file: string }[];
  delay?: number;
  accent?: string;
}> = ({ items, delay = 0, accent = "#C86A5A" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item, i) => {
        const enter = spring({
          frame: frame - delay - i * 6,
          fps,
          config: { damping: 22, stiffness: 110, mass: 0.9 },
        });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: enter,
              transform: `translateX(${interpolate(enter, [0, 1], [-40, 0])}px)`,
              fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                background: `linear-gradient(135deg, ${accent}, #8A3B30)`,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ♪
            </div>
            <span style={{ color: "#E8E8E8", fontSize: 24, width: 200 }}>
              {item.name}
            </span>
            <span
              style={{
                flex: 1,
                borderBottom: "2px dotted rgba(255,255,255,0.28)",
                marginBottom: 6,
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 24,
                fontFamily: '"Consolas", "Courier New", monospace',
                fontStyle: "italic",
              }}
            >
              {item.file}
            </span>
          </div>
        );
      })}
    </div>
  );
};
