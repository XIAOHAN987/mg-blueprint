import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLOR, FONT, LAYOUT, TYPE } from "./theme";
import { image25BeatMap } from "./beats/image2-5";

const HEADER_LEFT = "OPENAI // GPT-IMAGE-2.5 LAUNCH";
const HEADER_RIGHT = "SUNBURST & FLARE — MULTI-TURN SYNTHESIS";
const FOOTER_RIGHT = "SYS.MODE // MG-BLUEPRINT • REMOTION 4.0";

const BEAT_LABELS: Record<string, string> = {
  b1: "01. REVEAL",
  b2: "02. FLARE_SPEED",
  b3: "03. SUNBURST_SPEC",
  b4: "04. PERFORMANCE",
  b5: "05. CONSISTENCY",
  b6: "06. SKETCH_TO_IMAGE",
  b7: "07. ARTIFACT_SCAN",
  b8: "08. MARKET_COMPARISON",
  b9: "09. SUMMARY",
};

export const Image25FrameChrome: React.FC = () => {
  const frame = useCurrentFrame();

  const currentBeat = image25BeatMap.beats.find(
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
