import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLOR, FONT, LAYOUT, TYPE } from "./theme";
import { oxAlphaBeatMap } from "./beats/ox-alpha";

/**
 * OxFrameChrome —— OX Alpha 视频专用页眉页脚装饰层。
 * 从 b2 开始显示（开场 b1 不需要），跟随 beat 切换方法论编号。
 */

const HEADER_LEFT = "OX ALPHA // GLM-5.3-FLASH REVEAL";
const HEADER_RIGHT = "ZHIPU AI — PRODUCTION REPORT";
const FOOTER_RIGHT = "SYS.MODE // DARK CONTAINER • REMOTION 4.0";

const BEAT_LABELS: Record<string, string> = {
  b2: "02. LAUNCH",
  b3: "03. CAPABILITY",
  b4: "04. SPECULATION",
  b5: "05. GOOGLE_REACT",
  b6: "06. INVESTIGATION",
  b7: "07. REVEAL",
  b8: "08. SPECS",
  b9: "09. TRAFFIC",
  b10: "10. PRICING",
  b11: "11. VERDICT",
  b12: "12. OUTRO",
};

export const OxFrameChrome: React.FC = () => {
  const frame = useCurrentFrame();

  // 从 b2 开始才显示
  const b2From = oxAlphaBeatMap.beats.find((x) => x.id === "b2")!.from;
  if (frame < b2From) return null;

  // 找到当前 beat
  const currentBeat = oxAlphaBeatMap.beats.find(
    (beat) => frame >= beat.from && frame < beat.to
  );
  const beatLabel = currentBeat ? (BEAT_LABELS[currentBeat.id] ?? "") : "";

  // 页眉页脚入场：极慢淡入
  const enter = interpolate(frame, [b2From, b2From + 20], [0, 1], {
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
      <div style={{ ...chromeStyle, left: LAYOUT.marginX, top: LAYOUT.marginY }}>{HEADER_LEFT}</div>
      <div style={{ ...chromeStyle, right: LAYOUT.marginX, top: LAYOUT.marginY, textAlign: "right" }}>
        {HEADER_RIGHT}
      </div>
      <div style={{ ...chromeStyle, left: LAYOUT.marginX, bottom: LAYOUT.marginY }}>
        METHODOLOGY // {beatLabel}
      </div>
      <div style={{ ...chromeStyle, right: LAYOUT.marginX, bottom: LAYOUT.marginY, textAlign: "right" }}>
        {FOOTER_RIGHT}
      </div>
    </>
  );
};
