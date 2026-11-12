import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Pose, T } from "./space";
import { EASE, VIEW_H, VIEW_W, apply, compose, prog } from "./space";
import { C, F } from "./type";

/**
 * kit.tsx —— 与具体素材无关的通用件：
 *   lookAt        相机取景到任意坐标系里的任意矩形（自动按宽或高适配）
 *   portalChild   "推进某个小形状，里面是下一场" 的坐标换算
 *   tileParent    "满幅画面拉出，缩成下一场里的一块屏" 的坐标换算
 *   anchorParent  "素材里的某块区域原位变成独立资料" 的坐标换算
 *   Doc           资料页（截图 / 论文 / 图表图片），带逐个出现的标记框
 *   Captions      屏幕固定字幕
 */

export type Rect = { x: number; y: number; w: number; h: number };

/** 取景到矩形；pad 为四周留白比例 */
export const lookAt = (t: T, rect: Rect, pad = 0): Pose => {
  const [cx, cy] = apply(t, rect.x + rect.w / 2, rect.y + rect.h / 2);
  const z = Math.min(VIEW_W / (rect.w * t.s), VIEW_H / (rect.h * t.s)) * (1 - pad);
  return { cx, cy, z, r: -t.r };
};

/**
 * 下一场藏在 parent 坐标系的一个圆（或方）里。
 * 返回下一场（1920×1080）的坐标系；coverRadius 是圆要盖住整个画幅所需的半径。
 */
export const PORTAL_COVER_R = Math.ceil(Math.hypot(VIEW_W, VIEW_H) / 2);
export const portalChild = (parent: T, dot: { x: number; y: number; r: number }): T => {
  const s = dot.r / PORTAL_COVER_R;
  return compose(parent, { x: dot.x - (VIEW_W / 2) * s, y: dot.y - (VIEW_H / 2) * s, s, r: 0 });
};

/** child 满幅画面拉出后，落在新场景的 tile 矩形里。返回新场景的坐标系 */
export const tileParent = (child: T, tile: Rect): T => {
  const k = VIEW_W / tile.w;
  return compose(child, { x: -tile.x * k, y: -tile.y * k, s: k, r: 0 });
};

/**
 * 素材（坐标系 src）里的 srcRect 这一块，要在新场景里出现在 dstRect。
 * 返回新场景的坐标系：相机从旧取景移到新场景时，这一块内容原位不跳。
 */
export const anchorParent = (src: T, srcRect: Rect, dstRect: Rect): T => {
  const k = srcRect.w / dstRect.w;
  return compose(src, { x: srcRect.x - dstRect.x * k, y: srcRect.y - dstRect.y * k, s: k, r: 0 });
};

export type Mark = Rect & { at: number; color?: string };

/** 资料页：按图片原始像素定坐标，marks 也用图片像素 */
export const Doc: React.FC<{
  src: string;
  w: number;
  h: number;
  radius?: number;
  opacity?: number;
  marks?: Mark[];
}> = ({ src, w, h, radius = 0, opacity = 1, marks = [] }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, opacity }}>
      <Img src={staticFile(src)} style={{ width: w, height: h, borderRadius: radius, display: "block" }} />
      {marks.map((m, i) => {
        const p = prog(frame, m.at, 12, EASE.out);
        if (p <= 0) return null;
        const pulse = 1 + 0.5 * (1 - prog(frame, m.at, 18, EASE.out));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: m.x,
              top: m.y,
              width: m.w,
              height: m.h,
              boxSizing: "border-box",
              border: `${Math.max(3, Math.min(m.w, m.h) * 0.08)}px solid ${m.color ?? C.red}`,
              borderRadius: 6,
              clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
              transform: `scale(${pulse})`,
            }}
          />
        );
      })}
    </div>
  );
};

export type Cue = { start: number; end: number; text: string };

export const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const chars = Array.from(cue.text);
  const active = Math.min(chars.length - 1, Math.floor(((t - cue.start) / (cue.end - cue.start)) * chars.length));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center" }}>
      <span
        style={{
          display: "inline-block",
          background: "rgba(12,13,16,0.82)",
          padding: "8px 30px 12px",
          fontFamily: F.cn,
          fontWeight: 700,
          fontSize: 50,
          letterSpacing: "0.03em",
        }}
      >
        {chars.map((ch, i) => (
          <span key={i} style={{ color: i <= active ? C.paper : "rgba(244,243,239,0.4)" }}>
            {ch}
          </span>
        ))}
      </span>
    </div>
  );
};

/**
 * Ground —— 铺在世界画布上的背景网格。它是世界的一部分，会跟着镜头平移、缩放、旋转，
 * 所以纯文字场景不再是一片纯色，甩镜时也有参照物。不要把背景贴在屏幕上（镜头一动就穿帮）。
 * 用法：放进 <World> 里、所有场景之前；rect 要盖住相机会经过的全部范围。
 */
export const Ground: React.FC<{
  rect: Rect;
  /** 细线间距（所在坐标系的像素）；每 major 格一条粗线 */
  step?: number;
  major?: number;
  line?: string;
  majorLine?: string;
  weight?: number;
}> = ({ rect, step = 240, major = 4, line = "rgba(244,243,239,0.06)", majorLine = "rgba(244,243,239,0.13)", weight = 3 }) => {
  const big = step * major;
  const layer = (dir: string, color: string, w: number) => `linear-gradient(${dir}, ${color} ${w}px, transparent ${w}px)`;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        backgroundImage: [
          layer("to right", majorLine, weight * 2),
          layer("to bottom", majorLine, weight * 2),
          layer("to right", line, weight),
          layer("to bottom", line, weight),
        ].join(","),
        backgroundSize: `${big}px ${big}px, ${big}px ${big}px, ${step}px ${step}px, ${step}px ${step}px`,
      }}
    />
  );
};
