import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export const TerminalMatrix: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 100, mass: 1 },
  });

  const chars = Math.floor(
    interpolate(frame - delay - 8, [0, 40], [0, 84], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const fullCmd = "grep -rn 'processLegacy' src/ | awk -F: '{print $1}' | xargs sed -i '' && git diff";
  const displayedCmd = fullCmd.slice(0, chars);

  const capabilities = [
    { title: "读文件", tech: "cat / ripgrep / find", active: frame - delay > 12 },
    { title: "改代码", tech: "sed / AST / python", active: frame - delay > 20 },
    { title: "跑Git", tech: "checkout / diff / commit", active: frame - delay > 28 },
    { title: "处理日志", tech: "awk / grep / stream", active: frame - delay > 36 },
  ];

  return (
    <div
      style={{
        opacity: enter,
        transform: `scale(${enter})`,
        width: 1460,
        backgroundColor: "rgba(11, 13, 16, 0.9)",
        border: "1px solid rgba(76, 141, 255, 0.35)",
        borderRadius: 14,
        padding: "36px 44px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
        fontFamily: FONT.heading,
        color: COLOR.fg,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#FF5F56" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFBD2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#27C93F" }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 18, color: COLOR.soft, marginLeft: 16 }}>
            BASH RUNTIME // UNIFIED TOOLCHAIN ENVIRONMENT
          </span>
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize: 16, color: COLOR.accent }}>
          FULL LOCAL PERMISSION
        </span>
      </div>

      {/* Terminal typing area */}
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 22,
          backgroundColor: "#050607",
          padding: "20px 24px",
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: 32,
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: COLOR.accent }}>agent@host:~/project$ </span>
        <span style={{ color: "#FFF" }}>{displayedCmd}</span>
        <span
          style={{
            opacity: Math.sin((frame - delay) * 0.3) > 0 ? 1 : 0,
            color: COLOR.accent,
          }}
        >
          _
        </span>
      </div>

      {/* 4 Connected capability cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {capabilities.map((c, i) => (
          <div
            key={i}
            style={{
              backgroundColor: c.active ? "rgba(76, 141, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
              border: c.active ? "1px solid rgba(76, 141, 255, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
              padding: "20px 18px",
              borderRadius: 10,
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: c.active ? COLOR.accent : COLOR.dim,
                marginBottom: 8,
              }}
            >
              {c.title}
            </div>
            <div style={{ fontFamily: FONT.mono, fontSize: 16, color: COLOR.dim }}>
              {c.tech}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
