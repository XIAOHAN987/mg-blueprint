import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { Video, Img, staticFile } from "remotion";

/**
 * CameraDrift —— 焊死的素材镜头漂移容器（彻底抹杀静态死图）。
 *
 * 任何素材（视频/图片）只要包进来，就强制获得：
 * - 非线性推焦（缓慢 zoom in，easeInOut）
 * - 微呼吸（极轻微 scale 脉动）
 * - 微暗角加深（聚焦感）
 * Agent 不能用裸 <Img>/<Video>，必须过这层。
 *
 * 视差：素材内层（contentScale 基准）与外层容器（driftScale）分开，
 * 前景内容可选 focal=true 获得更快的推近速率（视差层次感）。
 */

export const CameraDrift: React.FC<{
  src: string;
  kind: "video" | "image";
  /** 视频从这个全局帧起播（局部时间归零，防定格） */
  startAtFrame?: number;
  /** 推焦目标缩放（默认 1.08，克制） */
  zoom?: number;
  /** 视频裁剪起点（秒） */
  startFromSec?: number;
  /** 是否为前景层（true=推近速率更快，产生视差） */
  focal?: boolean;
  width?: number;
}> = ({ src, kind, startAtFrame = 0, zoom = 1.08, startFromSec = 0, focal = false, width = 1080 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startAtFrame);

  // 非线性推焦：0→zoom 缓慢推近（前景 focal 推得更快，视差）
  const driftDur = 240; // 8 秒推满
  const driftProgress = interpolate(localFrame, [0, driftDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const zoomRate = focal ? 1.4 : 1;
  const targetZoom = 1 + (zoom - 1) * zoomRate;
  const driftScale = interpolate(driftProgress, [0, 1], [1, targetZoom]);

  // 微呼吸：极轻微脉动（幅度随推焦略增）
  const breath = 1 + Math.sin(localFrame / 28) * 0.004 * (1 + driftProgress * 0.5);

  const scale = driftScale * breath;

  const mediaEl =
    kind === "video" ? (
      <Video
        src={staticFile(src)}
        muted
        startFrom={Math.round(startFromSec * fps)}
        acceptableTimeShiftInSeconds={0.6}
        style={{ width: "100%" }}
      />
    ) : (
      <Img src={staticFile(src)} style={{ width: "100%" }} />
    );

  return (
    <div
      style={{
        width,
        overflow: "hidden",
        borderRadius: 12,
        position: "relative",
        lineHeight: 0,
      }}
    >
      {/* 素材层：推焦+呼吸 */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {mediaEl}
      </div>
      {/* 微暗角：随推焦加深 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 65% at 50% 50%, transparent ${60 - driftProgress * 12}%, rgba(0,0,0,${0.18 + driftProgress * 0.14}) 100%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
