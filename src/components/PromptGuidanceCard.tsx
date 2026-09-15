import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export const PromptGuidanceCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 90, mass: 1 },
  });

  return (
    <div
      style={{
        opacity: enter,
        transform: `scale(${enter})`,
        width: 1460,
        backgroundColor: "rgba(11, 13, 16, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderRadius: 16,
        padding: "40px 52px",
        boxShadow: "0 32px 80px rgba(0, 0, 0, 0.7)",
        fontFamily: FONT.heading,
        color: COLOR.fg,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 18,
          color: COLOR.dim,
          letterSpacing: "0.2em",
          marginBottom: 20,
        }}
      >
        ENGINEERING PRAXIS // REDUCE KEYWORD OVERKILL
      </div>

      <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.3, color: "#FFFFFF", marginBottom: 16 }}>
        指挥大模型干活：<span style={{ color: COLOR.warm }}>少设琐碎枷锁</span>，给思维留出空间
      </div>

      <div style={{ fontSize: 24, color: COLOR.soft, marginBottom: 32 }}>
        清晰的意图定义 + 健壮的测试验证护栏，胜过写几十条死板的格式硬约束。
      </div>

      {/* CTA Box */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 28,
          padding: "20px 48px",
          backgroundColor: "rgba(76, 141, 255, 0.08)",
          border: "1px solid rgba(76, 141, 255, 0.3)",
          borderRadius: 40,
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, color: COLOR.accent }}>
          关注 & 转发
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 20, color: COLOR.soft }}>
          探索更前沿的智能体底层架构
        </span>
      </div>
    </div>
  );
};
