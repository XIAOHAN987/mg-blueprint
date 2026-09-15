import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export const RenameScriptCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 100, mass: 1 },
  });

  const progress = interpolate(frame - delay - 6, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: enter,
        transform: `scale(${enter})`,
        width: 1440,
        backgroundColor: "rgba(11, 13, 16, 0.92)",
        border: "1px solid rgba(76, 141, 255, 0.35)",
        borderRadius: 14,
        padding: "36px 44px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
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
        <span style={{ fontFamily: FONT.mono, fontSize: 18, color: COLOR.soft, letterSpacing: "0.15em" }}>
          CASE COMPARISON // VARIABLE REFACTORING EFFICIENCY
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 16,
            color: COLOR.accent,
            backgroundColor: "rgba(76, 141, 255, 0.12)",
            padding: "4px 12px",
            borderRadius: 4,
          }}
        >
          1 BASH LINE VS 5 ROUNDTRIPS
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Left: Old Paradigm Multi-Tool Fragmented Loop */}
        <div
          style={{
            backgroundColor: "rgba(226, 75, 74, 0.05)",
            border: "1px solid rgba(226, 75, 74, 0.25)",
            borderRadius: 10,
            padding: "24px 26px",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: COLOR.danger, marginBottom: 14 }}>
            旧范式：多专用工具来回 5-6 轮调用
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: FONT.mono, fontSize: 15, color: COLOR.dim }}>
            <div style={{ padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
              1. find_definitions() // 查找定义 (4.2s)
            </div>
            <div style={{ padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
              2. find_references() // 逐一找引用 (5.1s)
            </div>
            <div style={{ padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
              3. batch_replace() // 逐文件重命名 (4.8s)
            </div>
            <div style={{ padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
              4. git_diff() // 检查校验 (3.2s)
            </div>
          </div>
          <div style={{ marginTop: 16, borderTop: "1px dashed rgba(226, 75, 74, 0.3)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontSize: 16 }}>
            <span style={{ color: COLOR.danger }}>总耗时: 17.3s</span>
            <span style={{ color: COLOR.dim }}>消耗: 3,450 Tokens</span>
          </div>
        </div>

        {/* Right: New Paradigm Single Bash Script */}
        <div
          style={{
            backgroundColor: "rgba(76, 141, 255, 0.05)",
            border: "1px solid rgba(76, 141, 255, 0.35)",
            borderRadius: 10,
            padding: "24px 26px",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: COLOR.accent, marginBottom: 14 }}>
            新范式：完整 Bash 原生脚本一步搞定
          </div>
          <div
            style={{
              backgroundColor: "#050607",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "16px 18px",
              fontFamily: FONT.mono,
              fontSize: 16,
              lineHeight: 1.6,
              color: "#FFF",
              marginBottom: 16,
            }}
          >
            <div style={{ color: COLOR.accent }}># 一行脚本精准替换并跑测试</div>
            <div>sed -i 's/oldName/newName/g' $(git ls-files)</div>
            <div>npm test --silent && git diff --stat</div>
          </div>
          <div style={{ borderTop: "1px dashed rgba(76, 141, 255, 0.3)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontSize: 16 }}>
            <span style={{ color: COLOR.accent, fontWeight: 700 }}>总耗时: 0.18s (瞬时完成)</span>
            <span style={{ color: "#FFF" }}>消耗: 仅 62 Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
};
