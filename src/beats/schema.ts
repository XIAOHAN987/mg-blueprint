/**
 * 分镜表 schema —— 每期视频的中枢契约。
 * Agent 拿到脚本 + SRT + 素材清单后，第一步先产出这份 JSON，确认后再写代码。
 *
 * 每个 beat 对应一句（或一小段）口播：
 * - 时间区间来自 SRT（秒 → 帧）
 * - camera：这个 beat 结束时相机应在的位置（beat 间自动平滑插值）
 * - caption：底部字幕文本
 * - note：视觉意图备注（给 Agent 看的，不参与渲染）
 */

export type CameraPose = {
  /** 相机注视的舞台坐标 */
  x: number;
  y: number;
  /** 缩放，>1 推近，<1 拉远 */
  scale: number;
};

export type Beat = {
  id: string;
  /** 起始帧（含） */
  from: number;
  /** 结束帧（不含） */
  to: number;
  /** 底部字幕文本；有 SRT 时可省略（字幕由 SrtCaptions 直接驱动） */
  caption?: string;
  camera: CameraPose;
  note?: string;
};

export type BeatMap = {
  fps: number;
  /** 舞台尺寸（可以比取景框大很多） */
  stage: { width: number; height: number };
  beats: Beat[];
};

/** 秒转帧 */
export const sec = (s: number, fps = 30) => Math.round(s * fps);
