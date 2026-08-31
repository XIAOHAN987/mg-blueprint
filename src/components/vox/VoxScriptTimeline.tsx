import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import type { VoxRect } from "./types";
import { VoxUnderline } from "./VoxUnderline";
import { VoxCircle } from "./VoxCircle";
import { VoxHighlighter } from "./VoxHighlighter";
import { VoxFocusCallout } from "./VoxFocusCallout";

/**
 * 口播脚本驱动的批注时间线:
 * 传入 cue sheet(口播逐句时间 + 动作 + 目标区域), 自动:
 *  1. 在每句口播开始时触发动画(画线/圈/高亮/聚焦)
 *  2. 相机跟随当前 cue 的 focusRect 推拉摇移
 *
 * cue 时间单位: 帧(30fps 下 30 = 1秒)。从 TTS 对齐或人工标注拿到。
 */

export interface VoxCue {
  /** 口播开始帧 */
  start: number;
  /** 口播结束帧(可选, 默认 start + 45) */
  end?: number;
  /** 口播文本(用于调试/字幕, 不渲染) */
  text?: string;
  /** 批注动作 */
  action: "underline" | "circle" | "highlight" | "focus" | "none";
  /** 动作目标区域(文档坐标) */
  target?: VoxRect;
  /** 相机聚焦点(文档坐标) + 缩放; 缺省用 target 中心 */
  camera?: { x: number; y: number; zoom?: number };
  /** 批注颜色 */
  color?: string;
}

interface VoxScriptTimelineProps {
  cues: VoxCue[];
  /** 画布尺寸, 默认 1920x1080 */
  width?: number;
  height?: number;
  /** 相机默认 zoom */
  baseZoom?: number;
  /** 相机缓动 */
  cameraEasing?: (t: number) => number;
  /** 批注层之下/之上的自定义内容插槽 */
  children?: React.ReactNode;
}

const ACTION_DEFAULT_COLOR: Record<string, string> = {
  underline: "#dc2626",
  circle: "#1d4ed8",
  highlight: "#fde047",
};

/** 当前帧活跃的 cue 索引(最后一个 start <= frame 的) */
const activeCueIndex = (cues: VoxCue[], frame: number) => {
  let idx = -1;
  for (let i = 0; i < cues.length; i++) {
    if (cues[i].start <= frame) idx = i;
    else break;
  }
  return idx;
};

export const VoxScriptTimeline: React.FC<VoxScriptTimelineProps> = ({
  cues,
  width = 1920,
  height = 1080,
  baseZoom = 1.15,
  cameraEasing = Easing.inOut(Easing.cubic),
  children,
}) => {
  const frame = useCurrentFrame();

  // 按 start 排序的 cue
  const sorted = useMemo(
    () => [...cues].sort((a, b) => a.start - b.start),
    [cues]
  );

  const activeIdx = activeCueIndex(sorted, frame);

  // 相机: 在当前 cue 开始前 12 帧就开始向目标移动(镜头先行原则)
  const camState = useMemo(() => {
    if (activeIdx < 0) {
      // 还没开始: 用第一个 cue 的相机或默认
      const first = sorted[0];
      const fx = first?.camera?.x ?? first?.target?.x ?? width / 2;
      const fy = first?.camera?.y ?? first?.target?.y ?? height / 2;
      const zoom = first?.camera?.zoom ?? baseZoom;
      return { fx, fy, zoom };
    }
    const cur = sorted[activeIdx];
    const target = cur.camera ?? {
      x: (cur.target?.x ?? width / 2) + (cur.target?.width ?? 0) / 2,
      y: (cur.target?.y ?? height / 2) + (cur.target?.height ?? 0) / 2,
      zoom: baseZoom,
    };
    return {
      fx: target.x,
      fy: target.y,
      zoom: target.zoom ?? baseZoom,
    };
  }, [activeIdx, sorted, width, height, baseZoom]);

  // 相机过渡: 取上一个 cue 的相机与当前做插值
  const prevCam = useMemo(() => {
    if (activeIdx <= 0) return camState;
    const prev = sorted[activeIdx - 1];
    return {
      fx: prev.camera?.x ?? prev.target?.x ?? width / 2,
      fy: prev.camera?.y ?? prev.target?.y ?? height / 2,
      zoom: prev.camera?.zoom ?? baseZoom,
    };
  }, [activeIdx, sorted, camState, width, height, baseZoom]);

  const LEAD = 12; // 镜头提前量(帧)
  const camStart =
    activeIdx >= 0 ? Math.max(0, sorted[activeIdx].start - LEAD) : 0;
  const camT = interpolate(
    frame,
    [camStart, camStart + LEAD + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: cameraEasing }
  );

  const fx = prevCam.fx + (camState.fx - prevCam.fx) * camT;
  const fy = prevCam.fy + (camState.fy - prevCam.fy) * camT;
  const zoom = prevCam.zoom + (camState.zoom - prevCam.zoom) * camT;
  const tx = width / 2 - fx * zoom;
  const ty = height / 2 - fy * zoom;

  return (
    <>
      {/* 相机层 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {children}

        {/* 已触发的批注按顺序叠加渲染 */}
        {sorted.map((cue, i) => {
          if (i > activeIdx || !cue.target || cue.action === "none")
            return null;
          const color = cue.color ?? ACTION_DEFAULT_COLOR[cue.action];
          const rel = cue.start; // 动画在本组件帧 = cue.start 触发
          const t = cue.target;
          if (cue.action === "underline") {
            return (
              <VoxUnderline
                key={i}
                from={[t.x, t.y + t.height]}
                to={[t.x + t.width, t.y + t.height]}
                color={color}
                strokeWidth={7}
                delayInFrames={rel}
                durationInFrames={16}
              />
            );
          }
          if (cue.action === "circle") {
            return (
              <VoxCircle
                key={i}
                rect={t}
                color={color}
                strokeWidth={8}
                delayInFrames={rel}
                durationInFrames={28}
              />
            );
          }
          if (cue.action === "highlight") {
            return (
              <VoxHighlighter
                key={i}
                rect={t}
                color={color}
                delayInFrames={rel}
                durationInFrames={14}
              />
            );
          }
          return null;
        })}
      </div>

      {/* 聚焦遮罩(屏幕空间): 当前 cue 是 focus 时激活 */}
      {sorted.map((cue, i) => {
        if (i !== activeIdx || cue.action !== "focus" || !cue.target)
          return null;
        const t = cue.target;
        return (
          <VoxFocusCallout
            key={`focus-${i}`}
            focusRect={{
              x: t.x * zoom + tx,
              y: t.y * zoom + ty,
              width: t.width * zoom,
              height: t.height * zoom,
            }}
            startFrame={cue.start + 6}
            durationInFrames={18}
            dimOpacity={0.68}
            feather={50}
          />
        );
      })}
    </>
  );
};
