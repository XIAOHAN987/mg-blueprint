import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export const ContextFlowDiagram: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 100, mass: 1 },
  });

  return (
    <div
      style={{
        opacity: enter,
        transform: `scale(${enter})`,
        width: 1460,
        backgroundColor: "rgba(11, 13, 16, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 14,
        padding: "32px 48px",
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
          marginBottom: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 18, color: COLOR.soft, letterSpacing: "0.15em" }}>
            DATA PIPELINE ARCHITECTURE // CONTEXT ISOLATION
          </span>
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize: 16, color: COLOR.dim }}>
          LOG PROCESSING EFFICIENCY
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Track 1: Specialized Tool Context Bloat */}
        <div
          style={{
            backgroundColor: "rgba(226, 75, 74, 0.05)",
            border: "1px solid rgba(226, 75, 74, 0.25)",
            borderRadius: 10,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              color: COLOR.danger,
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            <span>旧范式：整段日志全量塞入模型</span>
            <span>TOKEN 撑爆 / 上下文溢出 (CRASH)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FONT.mono, fontSize: 18 }}>
            <div style={{ padding: "10px 18px", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: 6 }}>
              50GB 生产日志
            </div>
            <div style={{ flex: 1, height: 2, backgroundColor: COLOR.danger, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: `8px solid ${COLOR.danger}`,
                }}
              />
            </div>
            <div
              style={{
                padding: "10px 18px",
                backgroundColor: "rgba(226, 75, 74, 0.2)",
                color: COLOR.danger,
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              256K Context Window (OVERFLOW)
            </div>
          </div>
        </div>

        {/* Track 2: Modern Bash Subprocess Filter */}
        <div
          style={{
            backgroundColor: "rgba(76, 141, 255, 0.05)",
            border: "1px solid rgba(76, 141, 255, 0.3)",
            borderRadius: 10,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              color: COLOR.accent,
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            <span>新范式：OS 操作系统外置子进程统计</span>
            <span>原始数据不进上下文 / 消耗 42 Tokens</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FONT.mono, fontSize: 18 }}>
            <div style={{ padding: "10px 18px", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: 6 }}>
              50GB 生产日志
            </div>
            <div style={{ flex: 0.8, height: 2, backgroundColor: COLOR.accent, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: `8px solid ${COLOR.accent}`,
                }}
              />
            </div>
            <div
              style={{
                padding: "10px 18px",
                backgroundColor: "rgba(76, 141, 255, 0.15)",
                color: COLOR.accent,
                borderRadius: 6,
                border: "1px dashed rgba(76, 141, 255, 0.5)",
              }}
            >
              awk / ripgrep (本地运算)
            </div>
            <div style={{ flex: 0.8, height: 2, backgroundColor: COLOR.accent, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: `8px solid ${COLOR.accent}`,
                }}
              />
            </div>
            <div
              style={{
                padding: "10px 18px",
                backgroundColor: "rgba(76, 141, 255, 0.25)",
                color: "#FFF",
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              3行汇总结果 (Context)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
