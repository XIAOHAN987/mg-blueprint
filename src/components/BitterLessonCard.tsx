import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export const BitterLessonCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 24, stiffness: 90, mass: 1 },
  });

  return (
    <div
      style={{
        opacity: enter,
        transform: `scale(${enter})`,
        width: 1520,
        backgroundColor: "rgba(11, 13, 16, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderRadius: 16,
        padding: "48px 56px",
        boxShadow: "0 32px 80px rgba(0, 0, 0, 0.7)",
        fontFamily: FONT.heading,
        color: COLOR.fg,
        textAlign: "left",
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
        <span style={{ fontFamily: FONT.mono, fontSize: 20, color: COLOR.dim, letterSpacing: "0.25em" }}>
          AI PHILOSOPHY // THE BITTER LESSON (RICH SUTTON, 2019)
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 18,
            color: COLOR.accent,
            padding: "4px 12px",
            borderRadius: 4,
            backgroundColor: "rgba(76, 141, 255, 0.1)",
          }}
        >
          CORE PRINCIPLE
        </span>
      </div>

      <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.3, color: "#FFFFFF", marginBottom: 20 }}>
        长期来看，<span style={{ color: COLOR.accent }}>通用方法</span> 一定会战胜人类手工设计的专用工具。
      </div>

      <div style={{ fontSize: 32, color: COLOR.soft, lineHeight: 1.5, marginBottom: 40 }}>
        模型越聪明，我们越该做的是 <span style={{ color: COLOR.warm, fontWeight: 700 }}>搭好护栏</span>，而不是替它把每一步都封装死。
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Anti-Pattern */}
        <div
          style={{
            backgroundColor: "rgba(226, 75, 74, 0.05)",
            border: "1px solid rgba(226, 75, 74, 0.2)",
            borderRadius: 10,
            padding: "24px 28px",
          }}
        >
          <div style={{ fontSize: 22, color: COLOR.danger, fontWeight: 700, marginBottom: 8 }}>
            传统陷阱：过度封装死每一步
          </div>
          <div style={{ fontSize: 18, color: COLOR.dim, lineHeight: 1.5 }}>
            写死 Prompt、固化数十个死板接口，随模型智力提升迅速成为负资产。
          </div>
        </div>

        {/* Modern Best Practice */}
        <div
          style={{
            backgroundColor: "rgba(76, 141, 255, 0.05)",
            border: "1px solid rgba(76, 141, 255, 0.25)",
            borderRadius: 10,
            padding: "24px 28px",
          }}
        >
          <div style={{ fontSize: 22, color: COLOR.accent, fontWeight: 700, marginBottom: 8 }}>
            现代范式：搭牢外层护栏 Harness
          </div>
          <div style={{ fontSize: 18, color: COLOR.dim, lineHeight: 1.5 }}>
            给予通用环境（Bash/OS），由外层做好权限、拦截与隔离，自主探索最优路径。
          </div>
        </div>
      </div>
    </div>
  );
};
