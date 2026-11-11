import { Easing } from "remotion";

/**
 * space.ts —— 连续世界的坐标与相机数学（v2 镜头系统核心）。
 *
 * 思路：所有场景都摆在同一个世界里，各有自己的位置 / 尺度 / 角度，
 * 场景可以嵌套（下一场可以藏在上一场某个元素内部）。
 * 相机不再"锁中心微缩放"，而是在场景之间真实地推、拉、摇。
 */

/** 局部坐标 → 父坐标：p' = [x,y] + R(r)·s·p（r 为角度） */
export type T = { x: number; y: number; s: number; r: number };

export const ID: T = { x: 0, y: 0, s: 1, r: 0 };

const rot = (deg: number, x: number, y: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c * x - s * y, s * x + c * y];
};

/** 把子坐标系 b（定义在 a 内部）换算成世界坐标系 */
export const compose = (a: T, b: T): T => {
  const [dx, dy] = rot(a.r, b.x * a.s, b.y * a.s);
  return { x: a.x + dx, y: a.y + dy, s: a.s * b.s, r: a.r + b.r };
};

export const apply = (t: T, x: number, y: number): [number, number] => {
  const [dx, dy] = rot(t.r, x * t.s, y * t.s);
  return [t.x + dx, t.y + dy];
};

/** 相机姿态：屏幕中心对准的世界点、放大倍率、世界旋转角 */
export type Pose = { cx: number; cy: number; z: number; r: number };

export const VIEW_W = 1920;
export const VIEW_H = 1080;

/** 让相机正好取景到某个坐标系里的一块矩形（默认整个 1920×1080 画幅） */
export const frameOn = (
  t: T,
  rect: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: VIEW_W, h: VIEW_H },
): Pose => {
  const [cx, cy] = apply(t, rect.x + rect.w / 2, rect.y + rect.h / 2);
  return { cx, cy, z: VIEW_W / (rect.w * t.s), r: -t.r };
};

export const EASE = {
  /** 甩镜：猛起猛停 */
  whip: Easing.bezier(0.7, 0, 0.2, 1),
  /** 推入 / 拉出：起步稍缓，末段稳稳落定 */
  push: Easing.bezier(0.62, 0, 0.16, 1),
  /** 元素入场：快出慢停 */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** 被打断的元素退场：越走越快 */
  in: Easing.bezier(0.6, 0, 0.9, 0.3),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

export type Move = {
  /** 起始帧 */
  at: number;
  /** 持续帧数 */
  dur: number;
  to: Pose;
  ease?: (t: number) => number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * 相机采样：到位即静止，只在 Move 区间内运动。
 * 缩放按对数插值（否则大倍率推拉会"先慢后炸"），
 * 平移围绕高倍率一端的落点展开，保证推入时目标稳稳走向画面中心。
 */
export const sampleCamera = (start: Pose, moves: Move[], frame: number): Pose => {
  let cur = start;
  for (const m of moves) {
    if (frame <= m.at) return cur;
    if (frame >= m.at + m.dur) {
      cur = m.to;
      continue;
    }
    const e = (m.ease ?? EASE.whip)((frame - m.at) / m.dur);
    const a = cur;
    const b = m.to;
    const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), e));
    const f = b.z >= a.z ? b : a;
    const s0x = (f.cx - a.cx) * a.z;
    const s0y = (f.cy - a.cy) * a.z;
    const s1x = (f.cx - b.cx) * b.z;
    const s1y = (f.cy - b.cy) * b.z;
    return {
      cx: f.cx - lerp(s0x, s1x, e) / z,
      cy: f.cy - lerp(s0y, s1y, e) / z,
      z,
      r: lerp(a.r, b.r, e),
    };
  }
  return cur;
};

/** 相机在屏幕空间的逐帧速度，用来驱动方向性运动模糊 */
export const cameraBlur = (start: Pose, moves: Move[], frame: number) => {
  const a = sampleCamera(start, moves, frame - 1);
  const b = sampleCamera(start, moves, frame);
  const [dx, dy] = rot(b.r, (b.cx - a.cx) * b.z, (b.cy - a.cy) * b.z);
  const zoomRate = Math.abs(Math.log(b.z) - Math.log(a.z));
  const zoomBlur = Math.min(7, zoomRate * 34);
  return {
    x: Math.min(54, Math.abs(dx) * 0.3) + zoomBlur,
    y: Math.min(54, Math.abs(dy) * 0.3) + zoomBlur,
  };
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 0→1 进度：从 at 帧起，历时 dur 帧 */
export const prog = (frame: number, at: number, dur: number, ease: (t: number) => number = EASE.out) =>
  ease(clamp01((frame - at) / dur));
