import React from "react";
import {
  useCurrentFrame,
  staticFile,
  Video,
  Img,
  Sequence,
  interpolate,
} from "remotion";
import { BeatWindow } from "./BeatWindow";
import { Direction } from "../motion/motion";

export interface ShowcaseItem {
  id: string;
  src: string;
  kind?: "video" | "image";
  label: string;
  from: number; // 全局绝对起始帧
  to: number;   // 全局绝对结束帧
}

/**
 * ShowcaseStage —— 连续实测素材常驻大展台
 * 
 * 设计哲学（反高频打断 / 极简科技发布会流）：
 * 1. 外层 1600x900（16:9）大展台只进场一次，全程静止锚定在画面中央；
 * 2. 内部多段视频/切片在同一容器内做精准硬切（Cut），避免多次飞入飞出打断观感；
 * 3. 左上角标签随活跃切片平滑过渡更新；
 * 4. 彻底消除多段短视频（3-6秒）频繁破坏画面的顿挫感。
 */
export const ShowcaseStage: React.FC<{
  from: number;
  to: number;
  items: ShowcaseItem[];
  offsetY?: number;
  enterFrom?: Direction;
  exitTo?: Direction;
  linkOut?: boolean;
}> = ({
  from,
  to,
  items,
  offsetY = -25,
  enterFrom = "right",
  exitTo = "left",
  linkOut = true,
}) => {
  const frame = useCurrentFrame();

  // 当前活跃素材
  const activeItem =
    items.find((it) => frame >= it.from && frame < it.to) ||
    (frame < items[0]?.from ? items[0] : items[items.length - 1]);

  // 标签随切片切换的微动效（6 帧微淡入与轻微位移）
  const itemElapsed = activeItem ? Math.max(0, frame - activeItem.from) : 0;
  const labelOpacity = interpolate(itemElapsed, [0, 6], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelTranslateY = interpolate(itemElapsed, [0, 6], [4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <BeatWindow
      from={from}
      to={to}
      offsetY={offsetY}
      mode="slide"
      enterFrom={enterFrom}
      exitTo={exitTo}
      linkOut={linkOut}
    >
      <div
        style={{
          position: "relative",
          width: 1530,
          height: 860,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          background: "#0B0D10",
          lineHeight: 0,
        }}
      >
        {/* 各切片在同一容器内原位流转 */}
        {items.map((it) => (
          <Sequence
            key={it.id}
            from={it.from}
            durationInFrames={it.to - it.from}
            layout="none"
          >
            {it.kind === "image" ? (
              <Img
                src={staticFile(it.src)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Video
                src={staticFile(it.src)}
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </Sequence>
        ))}

        {/* 常驻展台标签 */}
        {activeItem?.label && (
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              background: "rgba(16, 20, 26, 0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: 8,
              padding: "8px 18px",
              color: "rgba(255, 255, 255, 0.95)",
              fontSize: 20,
              fontWeight: 600,
              fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.5)",
              zIndex: 20,
              opacity: labelOpacity,
              transform: `translateY(${labelTranslateY}px)`,
              pointerEvents: "none",
            }}
          >
            {activeItem.label}
          </div>
        )}
      </div>
    </BeatWindow>
  );
};
