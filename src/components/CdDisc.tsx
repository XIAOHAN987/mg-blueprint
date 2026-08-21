import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * 伪 3D 光盘 —— 纯 CSS 复刻 CD 镜头。
 *
 * 结构：perspective 容器 → rotateX 压扁的圆盘。
 * 盘体 = 径向渐变金属底 + repeating-radial-gradient 刻槽纹 + 黄色数据轨。
 * 激光 = 一道橙色竖线，带轻微扫描移动。
 * 入场：从右侧带旋转飞入，阴影随之收敛。
 */
export const CdDisc: React.FC<{
  delay?: number;
  size?: number;
  /** 0-1，数据轨写入进度（黄色轨道逐圈点亮） */
  writeProgress?: number;
}> = ({ delay = 0, size = 720, writeProgress = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 90, mass: 1.1 },
  });

  const flyX = interpolate(enter, [0, 1], [700, 0]);
  const rotY = interpolate(enter, [0, 1], [-35, 0]);
  const shadow = interpolate(enter, [0, 1], [80, 30]);

  // 激光缓慢上下扫描
  const t = Math.max(0, frame - delay) / 30;
  const laserY = Math.sin(t * 1.2) * size * 0.18;

  const hole = size * 0.13;
  const labelR = size * 0.36;

  return (
    <div style={{ perspective: 1400 }}>
      <div
        style={{
          width: size,
          height: size,
          opacity: enter,
          transform: `translateX(${flyX}px) rotateY(${rotY}deg) rotateX(55deg)`,
          transformStyle: "preserve-3d",
          position: "relative",
          filter: `drop-shadow(0 ${shadow}px ${shadow * 1.6}px rgba(0,0,0,0.55))`,
        }}
      >
        {/* 盘体 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `
              repeating-radial-gradient(circle, rgba(0,0,0,0.10) 0 1px, transparent 1px 6px),
              conic-gradient(from 210deg, rgba(255,255,255,0.35), transparent 25%, rgba(255,255,255,0.18) 45%, transparent 60%, rgba(255,255,255,0.3) 80%, transparent),
              radial-gradient(circle at 38% 32%, #F4F4F4, #CFCFCF 42%, #A8A8A8 68%, #DADADA 88%, #BEBEBE)
            `,
            border: "2px solid rgba(255,255,255,0.5)",
          }}
        />
        {/* 数据轨（黄色刻录轨道，随 writeProgress 增加圈数） */}
        <svg
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0 }}
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const r = labelR + 24 + i * ((size / 2 - labelR - 40) / 7);
            const on = i / 7 < writeProgress;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={on ? "#F5C400" : "rgba(0,0,0,0.12)"}
                strokeWidth={on ? 3 : 1.5}
                strokeDasharray="10 6"
                opacity={on ? 0.95 : 0.5}
              />
            );
          })}
        </svg>
        {/* 中心标签圈 + 孔 */}
        <div
          style={{
            position: "absolute",
            left: size / 2 - labelR,
            top: size / 2 - labelR,
            width: labelR * 2,
            height: labelR * 2,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 35%, #FAFAFA, #D5D5D5 60%, #B0B0B0)",
            border: "2px solid rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: hole * 2,
              height: hole * 2,
              borderRadius: "50%",
              background: "#0A0A0A",
              border: `${size * 0.012}px solid rgba(255,255,255,0.75)`,
            }}
          />
        </div>
        {/* 激光 */}
        <div
          style={{
            position: "absolute",
            left: size / 2 - 2,
            top: size / 2 - size * 0.32 + laserY,
            width: 4,
            height: size * 0.3,
            background: "#FF8C1A",
            boxShadow:
              "0 0 18px 4px rgba(255,140,26,0.8), 0 0 40px 10px rgba(255,140,26,0.35)",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};
