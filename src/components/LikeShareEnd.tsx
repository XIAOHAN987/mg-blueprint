import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

/**
 * LikeShareEnd —— 结尾点赞 + 转发 SVG 动画（不放 GitHub 链接）。
 * 拇指和分享箭头依次弹入，带一点点回弹，下方配"记得点赞转发"。
 */
export const LikeShareEnd: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const likeIn = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });
  const shareIn = spring({ frame: frame - delay - 14, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });

  // 拇指持续轻微脉冲（"点一下"的感觉）
  const pulse = 1 + Math.sin((frame - delay) / 9) * 0.05;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
      <div style={{ display: "flex", gap: 90, alignItems: "center" }}>
        {/* 点赞拇指 */}
        <div style={{ transform: `scale(${likeIn * pulse})`, opacity: likeIn }}>
          <svg width={130} height={130} viewBox="0 0 24 24" fill="none" stroke="#4C8DFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" fill="#4C8DFF22" />
          </svg>
        </div>
        {/* 转发箭头 */}
        <div style={{ transform: `scale(${shareIn}) rotate(${(1 - shareIn) * -40}deg)`, opacity: shareIn }}>
          <svg width={130} height={130} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4 20-7z" fill="#10B98122" />
            <path d="M22 2 11 13" />
          </svg>
        </div>
      </div>
      <div
        style={{
          fontFamily: "Inter, 'Noto Sans SC', sans-serif",
          fontSize: 54,
          fontWeight: 700,
          color: "#EDEDED",
          letterSpacing: "0.02em",
          opacity: spring({ frame: frame - delay - 26, fps, config: { damping: 22, stiffness: 110 } }),
        }}
      >
        记得<span style={{ color: "#4C8DFF" }}>点赞</span> · <span style={{ color: "#10B981" }}>转发</span>给做 AI 视频的朋友
      </div>
    </div>
  );
};
