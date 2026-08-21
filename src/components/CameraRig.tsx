import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { BeatMap, CameraPose } from "../beats/schema";

/**
 * CameraRig —— 整套系统的灵魂（v2：运镜升级）。
 *
 * 专业科普相机语法：只在转场/段落切换时移动 ——
 * whip 急推到落点（先爆发后稳）→ 完全停住讲解 → 下一段再走。
 * 无呼吸、无持续漂移、无匀速爬行：落点即静止。
 *
 * 运镜缓动（从 TerminalSimulator 提炼）：
 * - whip：突然加速到位（Easing.bezier(0.7, 0, 0.25, 1)），用于转场的"爆发感"
 * - punch：突然 punch-in（Easing.bezier(0.75, 0, 0.3, 1)），用于强调落点
 * - glide：平滑滑入（Easing.bezier(0.35, 0, 0.55, 1)），用于段落收尾
 *
 * ghost trail：转场瞬间绘制最近 3 帧的残影（透明度/模糊递减），
 * 模拟运动模糊，让 whip/punch 的爆发感更真实。
 */

// 三种运镜缓动
const EASE_WHIP = Easing.bezier(0.7, 0, 0.25, 1);
const EASE_PUNCH = Easing.bezier(0.75, 0, 0.3, 1);
const EASE_GLIDE = Easing.bezier(0.35, 0, 0.55, 1);

// 转场窗口：切 beat 前 5 帧启动，切后 18 帧内到位，之后静止
const MOVE_LEAD = 5;
const MOVE_TAIL = 18;

// Ghost trail 配置：帧回溯、透明度、模糊
const GHOSTS = [
  { back: 2, alpha: 0.25, blur: 2 },
  { back: 4, alpha: 0.15, blur: 5 },
  { back: 6, alpha: 0.08, blur: 9 },
];

export const CameraRig: React.FC<{
  beatMap: BeatMap;
  viewWidth: number;
  viewHeight: number;
  children: React.ReactNode;
}> = ({ beatMap, viewWidth, viewHeight, children }) => {
  const frame = useCurrentFrame();
  const { beats, stage } = beatMap;

  // keyframe 结构：hold → [from-5, from+18] whip/punch/glide → hold → …
  // 段落内部没有任何插值区间，相机完全静止
  const keyFrames: number[] = [0];
  const poses: CameraPose[] = [beats[0].camera];
  const easings: ((t: number) => number)[] = [];

  for (let i = 1; i < beats.length; i++) {
    keyFrames.push(beats[i].from - MOVE_LEAD, beats[i].from + MOVE_TAIL);
    poses.push(beats[i - 1].camera, beats[i].camera);

    // 根据 zoom 变化选择缓动：
    // - zoom in（scale 变大）→ punch（爆发式推近）
    // - zoom out（scale 变小）→ glide（平滑拉远）
    // - 纯平移 → whip（突然加速）
    const prevScale = beats[i - 1].camera.scale;
    const nextScale = beats[i].camera.scale;
    if (nextScale > prevScale) {
      easings.push(EASE_PUNCH);
    } else if (nextScale < prevScale) {
      easings.push(EASE_GLIDE);
    } else {
      easings.push(EASE_WHIP);
    }
  }

  // 分段插值：每段用自己的缓动
  const camX = interpolate(frame, keyFrames, poses.map((p) => p.x), {
    easing: (t) => {
      // 找到当前段的缓动
      for (let i = 0; i < keyFrames.length - 1; i += 2) {
        if (t >= keyFrames[i] && t <= keyFrames[i + 1]) {
          const segIndex = Math.floor(i / 2);
          return easings[segIndex] ? easings[segIndex](t) : t;
        }
      }
      return t;
    },
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camY = interpolate(frame, keyFrames, poses.map((p) => p.y), {
    easing: (t) => {
      for (let i = 0; i < keyFrames.length - 1; i += 2) {
        if (t >= keyFrames[i] && t <= keyFrames[i + 1]) {
          const segIndex = Math.floor(i / 2);
          return easings[segIndex] ? easings[segIndex](t) : t;
        }
      }
      return t;
    },
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camScale = interpolate(frame, keyFrames, poses.map((p) => p.scale), {
    easing: (t) => {
      for (let i = 0; i < keyFrames.length - 1; i += 2) {
        if (t >= keyFrames[i] && t <= keyFrames[i + 1]) {
          const segIndex = Math.floor(i / 2);
          return easings[segIndex] ? easings[segIndex](t) : t;
        }
      }
      return t;
    },
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 相机速度（用于 ghost trail 强度）
  const getCamAt = (f: number) => {
    const x = interpolate(f, keyFrames, poses.map((p) => p.x), {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const y = interpolate(f, keyFrames, poses.map((p) => p.y), {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const s = interpolate(f, keyFrames, poses.map((p) => p.scale), {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { x, y, s };
  };

  const prevCam = getCamAt(frame - 1);
  const camSpeed = Math.hypot(camX - prevCam.x, camY - prevCam.y) * camScale + Math.abs(camScale - prevCam.s) * 360;
  const trailStrength = Math.min(1, Math.max(0, (camSpeed - 2) / 30));

  const worldTransform = (c: { x: number; y: number; s: number }) =>
    `translate(${viewWidth / 2}px, ${viewHeight / 2}px) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`;

  const world = (
    <div
      style={{
        position: "absolute",
        width: stage.width,
        height: stage.height,
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#050607",
      }}
    >
      {/* Ghost trail：转场瞬间绘制最近 3 帧的残影 */}
      {trailStrength > 0.01 &&
        GHOSTS.map((g) => {
          const ghostCam = getCamAt(frame - g.back);
          return (
            <div
              key={g.back}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transformOrigin: "0 0",
                transform: worldTransform(ghostCam),
                opacity: g.alpha * trailStrength,
                filter: `blur(${g.blur * trailStrength}px)`,
                pointerEvents: "none",
              }}
            >
              {world}
            </div>
          );
        })}

      {/* 主画面 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: worldTransform({ x: camX, y: camY, s: camScale }),
        }}
      >
        {world}
      </div>
    </div>
  );
};
