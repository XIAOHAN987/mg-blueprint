import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

/**
 * TokenCounter —— 「巨费TOKEN」的记忆点：token 计数器爆炸式上涨。
 * 数字指数级滚动（对应费 token 的失控感），配红色警示色。
 */
export const TokenCounter: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();

  const p = interpolate(frame, [delay, delay + 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.poly(3)), // 加速失控
  });

  const tokens = Math.round(p * 487000);
  const cost = (p * 146.5).toFixed(2);

  const shake = p > 0.7 ? Math.sin(frame * 1.7) * (p - 0.7) * 14 : 0;

  // 未起爆前不占布局（否则透明块会和标题重叠）
  if (frame < delay - 2) return null;

  const enter = interpolate(frame, [delay - 2, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        fontFamily: '"JetBrains Mono", "Segoe UI", monospace',
        transform: `translateX(${shake}px) translateY(${(1 - enter) * 40}px)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          color: "#E24B4A",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textShadow: "0 0 60px rgba(226,75,74,0.4)",
        }}
      >
        {tokens.toLocaleString()}
        <span style={{ fontSize: 44, color: "rgba(237,237,237,0.6)", marginLeft: 16 }}>tokens</span>
      </div>
      <div style={{ fontSize: 38, color: "rgba(237,237,237,0.55)" }}>
        ≈ ¥{cost} / 一个镜头的微调
      </div>
    </div>
  );
};
