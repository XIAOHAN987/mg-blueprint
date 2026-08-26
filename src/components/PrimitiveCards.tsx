import React from "react";
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from "remotion";

/**
 * PrimitiveCards —— 「动效组件库」组件卡片（v3 代码组件卡风格）。
 *
 * 不再是大黑块+简陋几何体。改为「代码组件卡」设计语言：
 * 等宽字体序号 + kicker 标签 + 会动的迷你动效示意图 + 细线分区 + 名称 + 描述。
 * 冷静克制、高信息密度，对齐组件库整体调性。
 */

const ACCENT = "#4C8DFF";
const MONO = "'Consolas','SF Mono','Courier New',monospace";

const PRIMITIVES = [
  { name: "StaggerItem", desc: "错峰进 · 统一出", en: "STAGGER" },
  { name: "SlideInItem", desc: "侧滑入 · 停中心", en: "SLIDE" },
  { name: "PunchThrough", desc: "中心放大穿透", en: "PUNCH" },
  { name: "CameraBreath", desc: "镜头呼吸", en: "BREATH" },
];

/** 会动的迷你动效示意图（每张卡一个，直观演示这个原语干嘛的） */
const DemoIcon: React.FC<{ index: number; demoFrame: number }> = ({ index, demoFrame }) => {
  const t = demoFrame % 72;
  const dim = "rgba(237,237,237,0.92)";

  if (index === 0) {
    // Stagger：三条错峰落下
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 56 }}>
        {[0, 1, 2, 3].map((k) => {
          const p = interpolate(t, [k * 6, k * 6 + 26], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.exp),
          });
          return (
            <div key={k} style={{
              width: 12, height: 44, borderRadius: 3,
              background: k === 1 ? ACCENT : dim,
              transform: `translate3d(0, ${(1 - p) * -36}px, 0)`, opacity: p,
              willChange: "transform",
            }} />
          );
        })}
      </div>
    );
  }
  if (index === 1) {
    // Slide：一个块从左滑入停住
    const p = Easing.out(Easing.cubic)(interpolate(t, [0, 36, 72], [0, 1, 1]));
    return (
      <div style={{ width: 96, height: 56, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 8, width: 40, height: 40, borderRadius: 9,
          background: dim,
          transform: `translate3d(${(p * 52)}px, 0, 0)`, willChange: "transform",
        }} />
        <div style={{ position: "absolute", right: 6, top: 24, width: 2, height: 8, background: ACCENT }} />
      </div>
    );
  }
  if (index === 2) {
    // Punch：中心块穿透放大
    const p = interpolate(t, [0, 30, 50, 72], [0.4, 1.1, 2.2, 0.4], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
    });
    const op = interpolate(t, [40, 60, 72], [1, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ width: 96, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: ACCENT,
          transform: `scale(${p})`, opacity: op, willChange: "transform, opacity",
        }} />
      </div>
    );
  }
  // Breath：描边框呼吸缩放
  const p = interpolate(t, [0, 36, 72], [1, 1.16, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: 96, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 52, height: 34, borderRadius: 7, border: `2px solid ${dim}`,
        transform: `scale(${p})`, willChange: "transform",
      }} />
    </div>
  );
};

const Card: React.FC<{
  name: string; desc: string; en: string;
  index: number; count: number; expand: number; demoFrame: number;
  /** 弹射入场进度（0-1，spring 过冲） */
  enterP: number;
}> = ({ name, desc, en, index, count, expand, enterP, demoFrame }) => {
  const spread = 348;
  const targetX = (index - (count - 1) / 2) * spread;

  // 弹射入场：从屏幕外（下方偏右）快速甩入 + 过冲回弹稳停
  // enterP 是 spring 值（会 >1 产生过冲）
  const enterX = (1 - enterP) * 1600;           // 从右侧屏外甩入
  const enterY = (1 - enterP) * 500;             // 同时从下方来，斜向弹入
  const enterRot = (1 - enterP) * 14;            // 带倾斜，到位回正
  const enterScale = interpolate(Math.max(0, Math.min(1.2, enterP)), [0, 1], [0.7, 1]);

  // 展开阶段的位移（沿用原 expand 逻辑，但现在主要做"到位后保持"）
  const x = interpolate(expand, [0, 1], [0, 0]) + enterX;
  const rot = enterRot;
  const y = enterY;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 320,
        height: 340,
        marginLeft: -160,
        marginTop: -170,
        background: "#0C0F14",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        transform: `translate3d(${targetX + x}px, ${y}px, 0) rotate(${rot}deg) scale(${enterScale})`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
        display: "flex",
        flexDirection: "column",
        padding: "26px 26px 24px",
        fontFamily: "Inter, 'Noto Sans SC', sans-serif",
        willChange: "transform",
      }}
    >
      {/* 顶行：序号 + kicker 英文标签 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: ACCENT, fontWeight: 700, letterSpacing: 1 }}>
          0{index + 1}
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 14, color: "rgba(237,237,237,0.4)",
          letterSpacing: 2, border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 6, padding: "3px 10px",
        }}>
          {en}
        </div>
      </div>

      {/* 迷你动效示意图 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DemoIcon index={index} demoFrame={demoFrame} />
      </div>

      {/* 分区细线 */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 0 18px" }} />

      {/* 名称 + 描述 */}
      <div style={{ color: "#EDEDED", fontSize: 26, fontWeight: 700, letterSpacing: "0.01em", textRendering: "geometricPrecision" }}>
        {name}
      </div>
      <div style={{ color: "rgba(237,237,237,0.5)", fontSize: 18, letterSpacing: "0.03em", marginTop: 8, textRendering: "geometricPrecision" }}>
        {desc}
      </div>
    </div>
  );
};

export const PrimitiveCards: React.FC<{
  expandAt: number;
  collapseAt?: number;
  delay?: number;
}> = ({ expandAt, collapseAt, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const collapse = collapseAt !== undefined
    ? interpolate(frame, [collapseAt, collapseAt + 22], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.poly(3)),
      })
    : 0;

  const slideX = collapse * 1700;

  return (
    <div style={{ position: "relative", width: 1560, height: 350, transform: `translate3d(${slideX}px, 0, 0)`, willChange: "transform" }}>
      {PRIMITIVES.map((p, i) => {
        // 每张卡独立 spring 弹射入场（错峰 5 帧，过冲回弹）
        const enterP = spring({
          frame: frame - expandAt - i * 5,
          fps,
          config: { damping: 16, stiffness: 200, mass: 0.5 },
        });
        return (
          <Card
            key={p.name}
            name={p.name} desc={p.desc} en={p.en}
            index={i} count={PRIMITIVES.length}
            expand={1}
            enterP={enterP}
            demoFrame={Math.max(0, frame - expandAt - 20)}
          />
        );
      })}
    </div>
  );
};
