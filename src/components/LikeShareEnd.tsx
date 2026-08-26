import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

/**
 * LikeShareEnd —— 结尾点赞 + 转发 SVG 动画。
 * 拇指和分享箭头依次弹入带回弹，下方可配文案。
 *
 * v2 通用化：
 * - 文案参数化 text?: React.ReactNode（传 null 只保留图标，不带强制文字）
 * - 色板统一：#10B981（翠绿）→ #3DBA7E（组件库规范成功绿）
 * - 尺寸档位 size="compact"|"normal"，防止大图标在信息密集尾页挤占空间
 */

const BLUE = "#4C8DFF";
const GREEN = "#3DBA7E"; // 组件库规范成功绿（不用 #10B981）

export const LikeShareEnd: React.FC<{
  delay?: number;
  /** 底部文案（可传自定义 JSX 或 null 只留图标）。默认"记得点赞·转发" */
  text?: React.ReactNode;
  /** 尺寸档位：normal=130px 图标 / compact=88px 图标（信息密集尾页用） */
  size?: "normal" | "compact";
}> = ({ delay = 0, text, size = "normal" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconSize = size === "compact" ? 88 : 130;
  const gap = size === "compact" ? 60 : 90;
  const groupGap = size === "compact" ? 34 : 48;
  const fontSize = size === "compact" ? 40 : 54;

  const likeIn = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });
  const shareIn = spring({ frame: frame - delay - 14, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });

  // 拇指持续轻微脉冲（"点一下"的感觉）
  const pulse = 1 + Math.sin((frame - delay) / 9) * 0.05;

  const textOpacity = spring({ frame: frame - delay - 26, fps, config: { damping: 22, stiffness: 110 } });

  // 默认文案（不传 text 时）
  const defaultText = (
    <>
      记得<span style={{ color: BLUE }}>点赞</span> · <span style={{ color: GREEN }}>转发</span>给做 AI 视频的朋友
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: groupGap }}>
      <div style={{ display: "flex", gap, alignItems: "center" }}>
        {/* 点赞拇指 */}
        <div style={{ transform: `translate3d(0,0,0) scale(${likeIn * pulse})`, opacity: likeIn, willChange: "transform" }}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" fill={`${BLUE}22`} />
          </svg>
        </div>
        {/* 转发箭头 */}
        <div style={{ transform: `translate3d(0,0,0) scale(${shareIn}) rotate(${(1 - shareIn) * -40}deg)`, opacity: shareIn, willChange: "transform" }}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4 20-7z" fill={`${GREEN}22`} />
            <path d="M22 2 11 13" />
          </svg>
        </div>
      </div>
      {text !== null ? (
        <div
          style={{
            fontFamily: "Inter, 'Noto Sans SC', sans-serif",
            fontSize,
            fontWeight: 700,
            color: "#EDEDED",
            letterSpacing: "0.02em",
            opacity: textOpacity,
            textRendering: "geometricPrecision",
          }}
        >
          {text ?? defaultText}
        </div>
      ) : null}
    </div>
  );
};
