import React from "react";
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from "remotion";

/**
 * PrimitiveCards —— 「动效组件库」组件卡片展开/合拢动画（v2 现代简约）。
 *
 * 配色：深墨面 + 单色高光描边（不用多色），全片统一 #4C8DFF 冷蓝 +
 * 极细白描边，靠留白和字阶拉出大气感，不靠色块。
 * 展开：一叠 → 横排四张，上方主标题同步缩小上移让位；
 * 合拢：横排 → 一叠，整体向右滑出。
 */

const PRIMITIVES = [
  { name: "StaggerItem", desc: "错峰进 · 统一出" },
  { name: "SlideInItem", desc: "侧滑入 · 停中心" },
  { name: "PunchThrough", desc: "中心放大穿透" },
  { name: "CameraBreath", desc: "镜头呼吸" },
];

const ACCENT = "#4C8DFF";

const Card: React.FC<{
  name: string;
  desc: string;
  index: number;
  expand: number;
  count: number;
  demoFrame: number;
}> = ({ name, desc, index, expand, count, demoFrame }) => {
  const spread = 330;
  const targetX = (index - (count - 1) / 2) * spread;
  const x = interpolate(expand, [0, 1], [index * 10, targetX]);
  const rot = interpolate(expand, [0, 1], [(index - 1.5) * 5, 0]);
  const y = interpolate(expand, [0, 1], [index * -6, 0]);

  const t = demoFrame % 64;
  let demoEl: React.ReactNode = null;
  const dim = "rgba(237,237,237,0.9)";
  if (index === 0) {
    demoEl = (
      <div style={{ display: "flex", gap: 9, justifyContent: "center" }}>
        {[0, 1, 2].map((k) => {
          const p = interpolate(t, [k * 8, k * 8 + 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.exp),
          });
          return (
            <div
              key={k}
              style={{
                width: 16,
                height: 46,
                borderRadius: 4,
                background: dim,
                transform: `translateY(${(1 - p) * -42}px)`,
                opacity: p,
              }}
            />
          );
        })}
      </div>
    );
  } else if (index === 1) {
    const ease = Easing.inOut(Easing.cubic)(interpolate(t, [0, 32, 64], [0, 1, 0]));
    demoEl = (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: dim,
          margin: "0 auto",
          transform: `translateX(${(ease * 2 - 1) * 56}px)`,
        }}
      />
    );
  } else if (index === 2) {
    const p = interpolate(t, [0, 32, 64], [0.5, 1.5, 0.5]);
    demoEl = (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: ACCENT,
          margin: "0 auto",
          transform: `scale(${p})`,
        }}
      />
    );
  } else {
    const p = interpolate(t, [0, 32, 64], [1, 1.2, 1]);
    demoEl = (
      <div
        style={{
          width: 58,
          height: 38,
          borderRadius: 6,
          border: `2.5px solid ${dim}`,
          margin: "0 auto",
          transform: `scale(${p})`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 300,
        height: 330,
        marginLeft: -150,
        marginTop: -165,
        background: "#0C0F14",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${interpolate(expand, [0, 1], [0.82, 1])})`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 28,
        fontFamily: "Inter, 'Noto Sans SC', sans-serif",
      }}
    >
      {/* 顶部细高光线 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "18%",
          right: "18%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
          borderRadius: 2,
        }}
      />
      <div style={{ height: 78, display: "flex", alignItems: "center", transform: "scale(1.25)" }}>{demoEl}</div>
      <div style={{ color: "#EDEDED", fontSize: 31, fontWeight: 700, letterSpacing: "0.01em" }}>
        {name}
      </div>
      <div style={{ color: "rgba(237,237,237,0.5)", fontSize: 20, letterSpacing: "0.04em" }}>
        {desc}
      </div>
    </div>
  );
};

export const PrimitiveCards: React.FC<{
  /** 展开开始帧 */
  expandAt: number;
  /** 合拢+滑出开始帧（不传则一直展开） */
  collapseAt?: number;
  /** 让位回调：展开进度（0-1）——父级用它把上方标题缩小/挪开 */
  onExpandProgress?: (p: number) => void;
  delay?: number;
}> = ({ expandAt, collapseAt, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const expand = spring({
    frame: frame - expandAt,
    fps,
    config: { damping: 24, stiffness: 90, mass: 1 },
  });

  const collapse = collapseAt !== undefined
    ? interpolate(frame, [collapseAt, collapseAt + 22], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.poly(3)),
      })
    : 0;

  const effExpand = expand * (1 - collapse);
  const slideX = collapse * 1700;

  return (
    <div
      style={{
        position: "relative",
        width: 1500,
        height: 340,
        transform: `translateX(${slideX}px)`,
      }}
    >
      {PRIMITIVES.map((p, i) => (
        <Card
          key={p.name}
          name={p.name}
          desc={p.desc}
          index={i}
          count={PRIMITIVES.length}
          expand={effExpand}
          demoFrame={Math.max(0, frame - expandAt - 24)}
        />
      ))}
    </div>
  );
};
