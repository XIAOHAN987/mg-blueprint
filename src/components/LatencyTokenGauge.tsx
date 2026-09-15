import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export const LatencyTokenGauge: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 100, mass: 1 },
  });

  const progress = interpolate(frame - delay - 6, [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rttCount = Math.round(interpolate(progress, [0, 1], [1, 14]));
  const latencySec = interpolate(progress, [0, 1], [1.2, 18.6]).toFixed(1);
  const tokenBloat = Math.round(interpolate(progress, [0, 1], [100, 520]));

  return (
    <div
      style={{
        opacity: enter,
        transform: `scale(${enter})`,
        width: 1400,
        backgroundColor: "rgba(11, 13, 16, 0.85)",
        border: "1px solid rgba(226, 75, 74, 0.35)",
        borderRadius: 14,
        padding: "36px 48px",
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
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLOR.danger}
            strokeWidth="2"
          >
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span
            style={{
              fontSize: 24,
              letterSpacing: "0.15em",
              color: COLOR.danger,
              fontWeight: 700,
            }}
          >
            BOTTLENECK // SPECIALIZED TOOLS OVERHEAD
          </span>
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize: 18, color: COLOR.dim }}>
          OLD PARADIGM BENCHMARK
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
        {/* Metric 1: API RTT & Latency */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            padding: "24px 28px",
            borderRadius: 10,
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              color: COLOR.soft,
              marginBottom: 12,
            }}
          >
            <span>多工具轮换往返 (RTT / 延迟)</span>
            <span style={{ fontFamily: FONT.mono, color: COLOR.danger, fontWeight: 700 }}>
              {latencySec}s
            </span>
          </div>
          <div
            style={{
              height: 10,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 5,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                backgroundColor: COLOR.danger,
                borderRadius: 5,
                transition: "width 0.1s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontFamily: FONT.mono,
              fontSize: 16,
              color: COLOR.dim,
            }}
          >
            <span>BASELINE: 1.0s</span>
            <span>{rttCount} CALLS / MULTI-AGENT HANDOFF</span>
          </div>
        </div>

        {/* Metric 2: Context Token Bloat */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            padding: "24px 28px",
            borderRadius: 10,
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              color: COLOR.soft,
              marginBottom: 12,
            }}
          >
            <span>上下文 TOKEN 消耗膨胀</span>
            <span style={{ fontFamily: FONT.mono, color: COLOR.warm, fontWeight: 700 }}>
              +{tokenBloat}%
            </span>
          </div>
          <div
            style={{
              height: 10,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 5,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, (tokenBloat / 520) * 100)}%`,
                backgroundColor: COLOR.warm,
                borderRadius: 5,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontFamily: FONT.mono,
              fontSize: 16,
              color: COLOR.dim,
            }}
          >
            <span>SCHEMA OVERHEAD: 4.8KB</span>
            <span>CONTEXT DEPLETION CRITICAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
