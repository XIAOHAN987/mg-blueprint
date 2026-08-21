import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

/**
 * FrameChrome —— 页眉页脚装饰层（专业科普精致感）。
 *
 * - 页眉：左上角章节小字（跟随 beat 变化），右上角系统标识
 * - 页脚：左下角方法论编号（跟随 beat 变化），右下角系统模式
 * - 全部小字（18-20px）、低透明度、等宽字体，不抢主体
 */

const HEADER_LEFT = "DEEPSEEK HARNESS // SYSTEM DECONSTRUCTION";
const HEADER_RIGHT = "GITHUB / DEEPSEEK-AI — PRODUCTION_FIT_REPORT";
const FOOTER_RIGHT = "SYS.MODE // DARK CONTAINER • REMOTION 4.0";

// 每个 beat 对应的方法论编号（页脚左下）
const BEAT_LABELS: Record<string, string> = {
  b1: "01. HOOK",
  b2: "02. QUESTION",
  b3: "03. DEFINITION",
  b4: "04. ANALOGY",
  b5: "05. MECHANISM",
  b6: "06. REALITY",
  b7: "07. TWIST",
  b8: "08. VERDICT",
  b9: "09. REASON",
  b10: "10. COMPARISON",
  b11: "11. AUDIENCE",
  b12: "12. TRANSITION",
  b13: "13. CONCLUSION",
};

export const FrameChrome: React.FC<{ beatId?: string }> = ({ beatId = "b1" }) => {
  const frame = useCurrentFrame();
  const beatLabel = BEAT_LABELS[beatId] ?? "01. HOOK";

  // 页眉页脚入场：极慢淡入（前 20 帧）
  const enter = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chromeStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily: '"Consolas", "Courier New", monospace',
    fontSize: 18,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.08em",
    opacity: enter,
    pointerEvents: "none",
    whiteSpace: "nowrap",
  };

  return (
    <>
      {/* 页眉左 */}
      <div style={{ ...chromeStyle, left: 60, top: 28 }}>{HEADER_LEFT}</div>
      {/* 页眉右 */}
      <div style={{ ...chromeStyle, right: 60, top: 28, textAlign: "right" }}>
        {HEADER_RIGHT}
      </div>
      {/* 页脚左（跟随 beat 变化） */}
      <div style={{ ...chromeStyle, left: 60, bottom: 28 }}>
        CORE METHODOLOGY // {beatLabel}
      </div>
      {/* 页脚右 */}
      <div style={{ ...chromeStyle, right: 60, bottom: 28, textAlign: "right" }}>
        {FOOTER_RIGHT}
      </div>
    </>
  );
};
