import React, { useState } from "react";
import {
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
  staticFile,
  Video,
  Img,
  Sequence,
  Easing,
} from "remotion";

/** 画面安全区：素材容器不许超出这个范围（1920x1080 画面，留出标题/字幕/边距） */
const SAFE_MAX_W = 1400;
const SAFE_MAX_H = 760;
const DEFAULT_W = 1100;

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
  /** 固定宽度（可选）。不传则按素材宽高比+画面安全区自动算，避免忽大忽小 */
  width?: number;
  delay?: number;
  /** 视频裁剪起点（秒） */
  startFromSec?: number;
  label?: string;
  /** 视频从这个全局帧开始播放（局部时间从 0 起算，解决跟随全局时间轴导致超出素材长度定格的问题） */
  startAtFrame?: number;
  /** 长内容滚动：true 时容器固定大小，素材在容器内纵向缓慢漫游（适合长截图/长网页/长表格） */
  scroll?: boolean;
  /** scroll 模式容器高度（默认 620，太长会顶到字幕区） */
  scrollHeight?: number;
  /** scroll 漫游位移量（px，默认 150——克制的小位移，不追求滚完整张图，均匀铺满分镜时长，约 15-20px/秒电影运镜感） */
  scrollAmount?: number;
  /** scroll 滚动结束帧（传 beat.to，让漫游均匀铺满整个分镜口播时长；不传则默认滚 240 帧） */
  scrollEndFrame?: number;
  children?: React.ReactNode;
}> = ({ src, kind, width, delay = 0, startFromSec = 0, label, startAtFrame, scroll = false, scrollHeight = 620, scrollAmount = 150, scrollEndFrame, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 素材实际宽高比（图片 onLoad / 视频 loadedmetadata 读取）
  const [ratio, setRatio] = useState<number | null>(null);

  // 自动尺寸：按宽高比放进安全区，既不超出也不憋屈
  // width 显式传入时优先（兼容旧调用）；否则按素材比例自适应
  let autoW = width ?? DEFAULT_W;
  if (width === undefined && ratio) {
    // 先按最大宽试，若高度超出安全区则改为按最大高反推宽
    autoW = SAFE_MAX_W;
    if (autoW / ratio > SAFE_MAX_H) {
      autoW = Math.round(SAFE_MAX_H * ratio);
    }
    // 竖图/方图别太窄，给个下限
    autoW = Math.max(autoW, 640);
  }
  // scroll 模式：容器宽度固定（不被长图带歪），高度固定 scrollHeight
  if (scroll) {
    autoW = width ?? 1000;
  }

  // scroll 模式：慢速微漫游（不是快速扫过长图）。
  // 只挪一小段（scrollAmount，默认 150px 的克制位移），匀速铺满整个分镜口播时长，
  // 约 15-20px/秒，像电影运镜缓缓平移，眼睛能看清图上每一行字，没有眩晕感。
  // 不再"把整图滚到底"（那会导致 300-400px/秒飞速滑过、字迹模糊）。
  const scrollStart = delay + 26;
  // 滚动持续到分镜结束（scrollEndFrame 由调用方传 beat.to，不传则滚 240 帧≈8秒）
  const scrollEnd = scrollEndFrame ?? scrollStart + 240;
  const scrollP = scroll
    ? interpolate(frame, [scrollStart, scrollEnd], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.linear, // 匀速，不要缓入缓出（漫游要的是恒定慢速）
      })
    : 0;
  const scrollY = -scrollP * scrollAmount;

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
          width: autoW,
          // scroll 模式：容器高度固定，内容超出部分被裁切（由内部 translateY 滚动）
          height: scroll ? scrollHeight : undefined,
          opacity: enter,
          transform: `translate3d(${x}px, 0, 0) rotateY(${rotateY}deg)`,
          transformOrigin: "center center",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: `0 18px ${shadowBlur}px rgba(0,0,0,${shadowAlpha})`,
          background: "#0B0D10",
          lineHeight: 0,
          willChange: "transform",
        }}
      >
        {/* scroll 模式：内容包一层做纵向滚动 */}
        <div
          style={
            scroll
              ? { transform: `translate3d(0, ${scrollY}px, 0)`, willChange: "transform", lineHeight: 0 }
              : { lineHeight: 0 }
          }
        >
        {kind === "video" ? (
          // 用 Sequence 把视频的局部时间轴归零：全局 startAtFrame 帧时，视频从第 0 帧开始播。
          // 否则 <Video> 跟随全局时间（如第 50 秒），素材只有 8 秒就定格在末尾静态图。
          <Sequence from={startAtFrame ?? 0} layout="none">
            <Video
              src={staticFile(src)}
              muted
              startFrom={Math.round(startFromSec * fps)}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
              }}
              style={{ width: "100%" }}
            />
          </Sequence>
        ) : (
          <Img
            src={staticFile(src)}
            onLoad={(e) => {
              const im = e.currentTarget;
              if (im.naturalWidth && im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight);
            }}
            style={{ width: "100%" }}
          />
        )}
        {children}
        </div>
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
