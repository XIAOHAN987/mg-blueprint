import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

/**
 * DrawPathFlow —— 流程图线条逐步绘制（专业科普机制拆解）。
 *
 * 核心机制：
 * - 节点 spring 缩放入场
 * - 连线用 SVG path + strokeDashoffset 从全长到 0 逐步绘制（像电路连通）
 * - 当前讲解节点高亮，其余降透明度
 * - 箭头用流动小圆点表示"执行流"
 */

export type FlowNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  desc?: string;
  accent?: string;
  dashed?: boolean;
  dim?: boolean;
};

export type FlowEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  accent?: string;
  dim?: boolean;
  /** 流动圆点（表示执行流方向） */
  flow?: boolean;
};

const nodeCenter = (n: FlowNode, side: "right" | "left" | "bottom" | "top") => {
  if (side === "right") return { x: n.x + n.w, y: n.y + n.h / 2 };
  if (side === "left") return { x: n.x, y: n.y + n.h / 2 };
  if (side === "bottom") return { x: n.x + n.w / 2, y: n.y + n.h };
  return { x: n.x + n.w / 2, y: n.y };
};

const edgeEndpoints = (a: FlowNode, b: FlowNode) => {
  const acx = a.x + a.w / 2;
  const bcx = b.x + b.w / 2;
  const acy = a.y + a.h / 2;
  const bcy = b.y + b.h / 2;
  const dx = bcx - acx;
  const dy = bcy - acy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return {
      p1: nodeCenter(a, dx > 0 ? "right" : "left"),
      p2: nodeCenter(b, dx > 0 ? "left" : "right"),
    };
  }
  return {
    p1: nodeCenter(a, dy > 0 ? "bottom" : "top"),
    p2: nodeCenter(b, dy > 0 ? "top" : "bottom"),
  };
};

export const DrawPathFlow: React.FC<{
  nodes: FlowNode[];
  edges: FlowEdge[];
  delay?: number;
  width?: number;
  height?: number;
  /** 当前讲解节点 id（高亮，其余 dim） */
  activeNodeId?: string;
}> = ({ nodes, edges, delay = 0, width = 1400, height = 700, activeNodeId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodeDelay = (i: number) => delay + i * 8;
  const edgeDelay = (i: number) => delay + nodes.length * 8 + i * 10;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <marker
            id="flow-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="context-stroke"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = nodes.find((n) => n.id === e.from)!;
          const b = nodes.find((n) => n.id === e.to)!;
          const { p1, p2 } = edgeEndpoints(a, b);
          const pathLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          // 线条逐步绘制：strokeDashoffset 从全长到 0
          const drawProgress = spring({
            frame: frame - edgeDelay(i),
            fps,
            config: { damping: 26, stiffness: 80, mass: 1 },
          });
          const dashOffset = pathLength * (1 - drawProgress);

          const stroke = e.accent ?? "rgba(255,255,255,0.5)";
          const isDim = e.dim || (activeNodeId && e.from !== activeNodeId && e.to !== activeNodeId);

          // 流动圆点（表示执行流）
          const flowDotProgress = e.flow
            ? interpolate(
                frame % 60,
                [0, 60],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            : 0;
          const flowX = e.flow ? p1.x + (p2.x - p1.x) * flowDotProgress : 0;
          const flowY = e.flow ? p1.y + (p2.y - p1.y) * flowDotProgress : 0;

          return (
            <g key={i} opacity={isDim ? 0.2 : 1}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={stroke}
                strokeWidth={2.5}
                strokeDasharray={e.dashed ? "8 7" : pathLength}
                strokeDashoffset={e.dashed ? 0 : dashOffset}
                markerEnd={e.dashed ? undefined : "url(#flow-arrow)"}
                opacity={drawProgress}
              />
              {/* 流动圆点 */}
              {e.flow && drawProgress > 0.5 && (
                <circle
                  cx={flowX}
                  cy={flowY}
                  r={5}
                  fill={stroke}
                  opacity={0.9}
                />
              )}
              {e.label && (
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2 - 12}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.65)"
                  fontSize={20}
                  opacity={drawProgress}
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {nodes.map((n, i) => {
        const enter = spring({
          frame: frame - nodeDelay(i),
          fps,
          config: { damping: 22, stiffness: 110, mass: 0.95 },
        });
        const accent = n.accent ?? "#4C8DFF";
        const isActive = activeNodeId === n.id;
        const isDim = n.dim || (activeNodeId && !isActive);

        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: n.w,
              height: n.h,
              opacity: enter * (isDim ? 0.25 : 1),
              transform: `scale(${interpolate(enter, [0, 1], [0.6, 1])})`,
              transformOrigin: "center center",
              background: isActive ? "#1A2332" : "#10141A",
              border: n.dashed
                ? `2px dashed rgba(255,255,255,0.35)`
                : `2px solid ${isActive ? accent : "rgba(255,255,255,0.2)"}`,
              borderRadius: 14,
              boxShadow: isActive
                ? `0 10px 34px rgba(0,0,0,0.45), 0 0 24px ${accent}44`
                : "0 10px 34px rgba(0,0,0,0.45)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "0 16px",
              textAlign: "center",
              transition: "border 0.3s, box-shadow 0.3s",
            }}
          >
            <div
              style={{
                color: n.dashed ? "rgba(255,255,255,0.75)" : isActive ? accent : "#EDEDED",
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.25,
              }}
            >
              {n.title}
            </div>
            {n.desc && (
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 20,
                  lineHeight: 1.4,
                }}
              >
                {n.desc}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
