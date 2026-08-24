import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

/**
 * WebpageThinking —— 「用写网页的思维做视频」的对照演示。
 *
 * 左侧：代码块逐行敲出（div/flex/position absolute…网页布局代码）
 * 右侧：一个方框"元素"僵硬地淡入淡出、线性平移（网页式运动）
 * 直观呈现：AI 把视频当成了"排网页"，元素只会静态摆放 + 生硬切换。
 */

const CODE_LINES = [
  "<div className='container'>",
  "  <div style={{display:'flex'}}>",
  "    <Card position='absolute' />",
  "    <Card opacity={fadeIn} />",
  "    <Card left={x} transition='linear' />",
  "  </div>",
  "</div>",
];

export const WebpageThinking: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);

  // 代码逐行敲出
  const lineInterval = 16;

  // 右侧方框：僵硬淡入淡出 + 线性来回（网页式）
  const cycle = (t % 90) / 90; // 3 秒一个循环
  const fade = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2; // 线性淡入淡出
  const slide = interpolate(cycle, [0, 1], [0, 1]); // 匀速线性
  const boxX = slide * 120;

  return (
    <div
      style={{
        display: "flex",
        gap: 70,
        alignItems: "center",
        fontFamily: '"JetBrains Mono", "Segoe UI", monospace',
      }}
    >
      {/* 左：代码块 */}
      <div
        style={{
          background: "#0B0D10",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 14,
          padding: "28px 34px",
          minWidth: 560,
          boxShadow: "0 16px 44px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["#E24B4A", "#F59E0B", "#10B981"].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
          ))}
        </div>
        {CODE_LINES.map((line, i) => {
          const appear = interpolate(t, [i * lineInterval, i * lineInterval + 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isComment = line.includes("flex") || line.includes("linear");
          return (
            <div
              key={i}
              style={{
                opacity: appear,
                fontSize: 22,
                lineHeight: 1.7,
                color: isComment ? "#E24B4A" : "#7EB6FF",
                whiteSpace: "pre",
              }}
            >
              {line}
              {i === Math.min(CODE_LINES.length - 1, Math.floor(t / lineInterval)) && (
                <span style={{ color: "#EDEDED", opacity: (t % 30) < 15 ? 1 : 0 }}>▌</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 右：网页式僵硬运动 */}
      <div
        style={{
          position: "relative",
          width: 320,
          height: 280,
          border: "1px dashed rgba(255,255,255,0.2)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            fontSize: 18,
            color: "rgba(237,237,237,0.4)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          渲染结果
        </div>
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 12,
            background: "#EDEDED",
            opacity: fade,
            transform: `translateX(${boxX - 60}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 18,
            fontSize: 17,
            color: "rgba(237,237,237,0.5)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          淡入淡出 · 线性
        </div>
      </div>
    </div>
  );
};
