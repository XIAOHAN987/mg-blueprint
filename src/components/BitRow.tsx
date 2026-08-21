import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * 像素风二进制位行（复刻截图：8 个像素数字 + 红色位号）。
 * 每个数字用 5x7 像素网格绘制，交错入场。
 */

const DIGITS: Record<string, number[][]> = {
  "0": [
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  "1": [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
};

const PixelDigit: React.FC<{ digit: string; cell?: number }> = ({
  digit,
  cell = 13,
}) => {
  const map = DIGITS[digit];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(5, ${cell}px)`,
        gridTemplateRows: `repeat(7, ${cell}px)`,
        gap: 1,
      }}
    >
      {map.flat().map((on, i) => (
        <div
          key={i}
          style={{
            width: cell - 1,
            height: cell - 1,
            background: on ? "#F2F2F2" : "transparent",
            boxShadow: on ? "0 0 10px rgba(255,255,255,0.35)" : "none",
          }}
        />
      ))}
    </div>
  );
};

export const BitRow: React.FC<{
  bits: string[];
  delay?: number;
  /** 当前「讲解到」的位（高亮红色），-1 表示无 */
  activeIndex?: number;
}> = ({ bits, delay = 0, activeIndex = -1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    // 固定总宽 + 居中锚定：数字从中心向两侧铺开入场，不会左偏
    <div style={{ display: "flex", gap: 54, alignItems: "flex-end", justifyContent: "center", width: 900 }}>
      {bits.map((b, i) => {
        const enter = spring({
          frame: frame - delay - i * 5,
          fps,
          config: { damping: 20, stiffness: 120, mass: 0.9 },
        });
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${
                isActive ? 1.12 : 1
              })`,
            }}
          >
            <div
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 22,
                fontWeight: 700,
                color: isActive ? "#FF3B30" : "rgba(255,59,48,0.65)",
              }}
            >
              {i + 1}
            </div>
            <PixelDigit digit={b} />
          </div>
        );
      })}
    </div>
  );
};
