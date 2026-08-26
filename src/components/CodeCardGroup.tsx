import React from "react";
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from "remotion";

/**
 * CodeCardGroup —— 通用「代码组件卡」组（v4 通用版，原 PrimitiveCards）。
 *
 * 样式焊死：序号 + 英文标签徽章 + 迷你示意图 + 细线分区 + 名称 + 描述。
 * 入场焊死：每张卡独立 spring 弹射入场（过冲回弹），错峰依次进场。
 *
 * 内容由调用方（AI）通过 items 传入，组件不关心是什么主题——
 * 动效原语、产品功能、特性对比、技术栈，任何"一组卡片"都能用。
 */

const ACCENT = "#4C8DFF";
const MONO = "'Consolas','SF Mono','Courier New',monospace";

export interface CodeCardItem {
  /** 卡片名称（主标题） */
  name: string;
  /** 描述（一行） */
  desc: string;
  /** 英文标签徽章（右上角小字，如 "STAGGER"/"API"/"CORE"） */
  en: string;
  /** 迷你示意图：内置预设 或 自定义 React 节点 */
  icon?: "stagger" | "slide" | "punch" | "breath" | "pulse" | "grid" | React.ReactNode;
}

/** 内置迷你示意图预设（会动的小图标，直观示意） */
type IconPreset = "stagger" | "slide" | "punch" | "breath" | "pulse" | "grid";

const DemoIcon: React.FC<{ preset: IconPreset; demoFrame: number }> = ({ preset, demoFrame }) => {
  const t = demoFrame % 72;
  const dim = "rgba(237,237,237,0.92)";

  if (preset === "stagger") {
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
  if (preset === "slide") {
    const p = Easing.out(Easing.cubic)(interpolate(t, [0, 36, 72], [0, 1, 1]));
    return (
      <div style={{ width: 96, height: 56, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 8, width: 40, height: 40, borderRadius: 9,
          background: dim, transform: `translate3d(${p * 52}px, 0, 0)`, willChange: "transform",
        }} />
        <div style={{ position: "absolute", right: 6, top: 24, width: 2, height: 8, background: ACCENT }} />
      </div>
    );
  }
  if (preset === "punch") {
    const p = interpolate(t, [0, 30, 50, 72], [0.4, 1.1, 2.2, 0.4], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
    });
    const op = interpolate(t, [40, 60, 72], [1, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ width: 96, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: ACCENT, transform: `scale(${p})`, opacity: op, willChange: "transform, opacity" }} />
      </div>
    );
  }
  if (preset === "breath") {
    const p = interpolate(t, [0, 36, 72], [1, 1.16, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ width: 96, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 52, height: 34, borderRadius: 7, border: `2px solid ${dim}`, transform: `scale(${p})`, willChange: "transform" }} />
      </div>
    );
  }
  if (preset === "pulse") {
    const p = interpolate(t, [0, 36, 72], [0.7, 1, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center", height: 56 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{
            width: 10, height: 10, borderRadius: "50%", background: k === 1 ? ACCENT : dim,
            transform: `scale(${p})`, opacity: 0.5 + p * 0.5, willChange: "transform, opacity",
          }} />
        ))}
      </div>
    );
  }
  // grid：四宫格呼吸
  const gp = interpolate(t, [0, 36, 72], [1, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{
          width: 20, height: 20, borderRadius: 5,
          background: k === 0 ? ACCENT : "rgba(237,237,237,0.25)",
          transform: `scale(${gp})`, willChange: "transform",
        }} />
      ))}
    </div>
  );
};

const Card: React.FC<{
  item: CodeCardItem;
  index: number; count: number; enterP: number; demoFrame: number;
}> = ({ item, index, count, enterP, demoFrame }) => {
  const spread = 348;
  const targetX = (index - (count - 1) / 2) * spread;

  // 弹射入场：从屏幕外（下方偏右）快速甩入 + 过冲回弹稳停
  const enterX = (1 - enterP) * 1600;
  const enterY = (1 - enterP) * 500;
  const enterRot = (1 - enterP) * 14;
  const enterScale = interpolate(Math.max(0, Math.min(1.2, enterP)), [0, 1], [0.7, 1]);

  // 示意图：内置预设 or 自定义节点 or 默认脉冲
  let iconEl: React.ReactNode;
  if (item.icon && typeof item.icon !== "string") {
    iconEl = item.icon; // 自定义 React 节点
  } else {
    const preset = (item.icon as IconPreset | undefined) || "pulse";
    iconEl = <DemoIcon preset={preset} demoFrame={demoFrame} />;
  }

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
        transform: `translate3d(${targetX + enterX}px, ${enterY}px, 0) rotate(${enterRot}deg) scale(${enterScale})`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
        display: "flex",
        flexDirection: "column",
        padding: "26px 26px 24px",
        fontFamily: "Inter, 'Noto Sans SC', sans-serif",
        willChange: "transform",
      }}
    >
      {/* 顶行：序号 + 英文标签徽章 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: ACCENT, fontWeight: 700, letterSpacing: 1 }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 14, color: "rgba(237,237,237,0.4)",
          letterSpacing: 2, border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 6, padding: "3px 10px",
        }}>
          {item.en}
        </div>
      </div>

      {/* 迷你示意图 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {iconEl}
      </div>

      {/* 分区细线 */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 0 18px" }} />

      {/* 名称 + 描述 */}
      <div style={{ color: "#EDEDED", fontSize: 26, fontWeight: 700, letterSpacing: "0.01em", textRendering: "geometricPrecision" }}>
        {item.name}
      </div>
      <div style={{ color: "rgba(237,237,237,0.5)", fontSize: 18, letterSpacing: "0.03em", marginTop: 8, textRendering: "geometricPrecision" }}>
        {item.desc}
      </div>
    </div>
  );
};

export const CodeCardGroup: React.FC<{
  /** 卡片内容（AI 传入，2-6 张最佳） */
  items: CodeCardItem[];
  /** 弹射入场开始帧 */
  expandAt: number;
  /** 合拢+滑出开始帧（不传则一直停留） */
  collapseAt?: number;
  /** 卡片错峰间隔（帧，默认 5） */
  staggerGap?: number;
}> = ({ items, expandAt, collapseAt, staggerGap = 5 }) => {
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
      {items.map((item, i) => {
        const enterP = spring({
          frame: frame - expandAt - i * staggerGap,
          fps,
          config: { damping: 16, stiffness: 200, mass: 0.5 },
        });
        return (
          <Card
            key={item.name}
            item={item}
            index={i} count={items.length}
            enterP={enterP}
            demoFrame={Math.max(0, frame - expandAt - 20)}
          />
        );
      })}
    </div>
  );
};
