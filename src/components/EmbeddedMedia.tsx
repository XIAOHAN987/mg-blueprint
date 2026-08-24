import React from "react";
import {
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
  staticFile,
  Video,
  Img,
  Sequence,
} from "remotion";

/**
 * EmbeddedMedia —— AI 视频素材 / 截图的标准嵌入容器（专业科普「素材上桌」）。
 *
 * - 从右侧带轻微 rotateY 伪3D 飞入，落地时阴影收敛
 * - 带 1px 描边 + 圆角 + 左上角小标签（可选）
 * - 内部视频静音播放（口播音频在 Composition 层统一给）
 * - 子元素（如 HighlightCallout）通过 children 叠在素材上
 */
export const EmbeddedMedia: React.FC<{
  src: string;
  kind: "video" | "image";
  width?: number;
  delay?: number;
  /** 视频裁剪起点（秒） */
  startFromSec?: number;
  label?: string;
  /** 视频从这个全局帧开始播放（局部时间从 0 起算，解决跟随全局时间轴导致超出素材长度定格的问题） */
  startAtFrame?: number;
  children?: React.ReactNode;
}> = ({ src, kind, width = 1100, delay = 0, startFromSec = 0, label, startAtFrame, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 110, mass: 1 },
  });

  const x = interpolate(enter, [0, 1], [160, 0]);
  const rotateY = interpolate(enter, [0, 1], [-16, 0]);
  const shadowBlur = interpolate(enter, [0, 1], [80, 26]);
  const shadowAlpha = interpolate(enter, [0, 1], [0.05, 0.45]);

  return (
    <div style={{ perspective: 1400 }}>
      <div
        style={{
          position: "relative",
          width,
          opacity: enter,
          transform: `translateX(${x}px) rotateY(${rotateY}deg)`,
          transformOrigin: "center center",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: `0 18px ${shadowBlur}px rgba(0,0,0,${shadowAlpha})`,
          background: "#0B0D10",
          lineHeight: 0,
        }}
      >
        {kind === "video" ? (
          // 用 Sequence 把视频的局部时间轴归零：全局 startAtFrame 帧时，视频从第 0 帧开始播。
          // 否则 <Video> 跟随全局时间（如第 50 秒），素材只有 8 秒就定格在末尾静态图。
          <Sequence from={startAtFrame ?? 0} layout="none">
            <Video
              src={staticFile(src)}
              muted
              startFrom={Math.round(startFromSec * fps)}
              style={{ width: "100%" }}
            />
          </Sequence>
        ) : (
          <Img src={staticFile(src)} style={{ width: "100%" }} />
        )}
        {children}
      </div>
      {label ? (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: 18,
            opacity: enter,
            background: "#10141A",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 8,
            padding: "8px 16px",
            color: "rgba(255,255,255,0.9)",
            fontSize: 22,
            fontWeight: 600,
            fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
            letterSpacing: "0.04em",
            lineHeight: 1.2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
