import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLOR, FONT, LAYOUT, TYPE } from "./theme";
import { newParadigmBeatMap } from "./beats/new-paradigm";

const HEADER_LEFT = "AI AGENT PARADIGM SHIFT // BASH VS SPECIALIZED TOOLS";
const HEADER_RIGHT = "GENERAL COMPUTATION > HAND-CRAFTED TOOLS";
const FOOTER_RIGHT = "SYS.MODE // MG-BLUEPRINT • REMOTION 4.0";

const BEAT_LABELS: Record<string, string> = {
  b1: "01. PARADIGM_DILEMMA",
  b2: "02. SPECIALIZED_TOOLS",
  b3: "03. BOTTLENECK_ANALYSIS",
  b4: "04. BASH_SUITE",
  b5: "05. UNIFIED_MATRIX",
  b6: "06. CASE_CODE_RENAME",
  b7: "07. CASE_LOG_STREAM",
  b8: "08. HARNESS_SECURITY",
  b9: "09. THE_BITTER_LESSON",
  b10: "10. GUARDRAILS_PRAXIS",
};

export const NewParadigmFrameChrome: React.FC = () => {
  const frame = useCurrentFrame();

  const currentBeat = newParadigmBeatMap.beats.find(
    (beat) => frame >= beat.from && frame < beat.to
  );
  const beatLabel = currentBeat ? (BEAT_LABELS[currentBeat.id] ?? "") : "";

  const enter = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chromeStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily: FONT.mono,
    fontSize: TYPE.caption.size,
    color: COLOR.dim,
    letterSpacing: TYPE.caption.letterSpacing,
    opacity: enter,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 100,
  };

  return (
    <>
      <div style={{ ...chromeStyle, left: LAYOUT.marginX, top: LAYOUT.marginY }}>
        {HEADER_LEFT}
      </div>
      <div
        style={{
          ...chromeStyle,
          right: LAYOUT.marginX,
          top: LAYOUT.marginY,
          textAlign: "right",
        }}
      >
        {HEADER_RIGHT}
      </div>
      <div style={{ ...chromeStyle, left: LAYOUT.marginX, bottom: LAYOUT.marginY }}>
        METHODOLOGY // {beatLabel}
      </div>
      <div
        style={{
          ...chromeStyle,
          right: LAYOUT.marginX,
          bottom: LAYOUT.marginY,
          textAlign: "right",
        }}
      >
        {FOOTER_RIGHT}
      </div>
    </>
  );
};
