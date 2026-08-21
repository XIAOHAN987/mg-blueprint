import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/**
 * FlowDiagram —— 节点-连线机制图（专业科普流程/架构可视化）。
 *
 * 节点 spring 缩放入场，连线用 strokeDashoffset 逐步绘制。
 * 节点/连线可标 dim（透明度 0.3，用于"当前讲解点高亮，其余退后"）。
 */

export type FlowNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  desc?: string;
  /** 节点强调色，默认冷静蓝 */
  accent?: string;
  /** 描边虚线（表示"需自建/缺失"） */
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
    return { p1: nodeCenter(a, dx > 0 ? "right" : "left"), p2: nodeCenter(b, dx > 0 ? "left" : "right") };
  }
  return { p1: nodeCenter(a, dy > 0 ? "bottom" : "top"), p2: nodeCenter(b, dy > 0 ? "top" : "bottom") };
};

export const FlowDiagram: React.FC<{
  nodes: FlowNode[];
  edges: FlowEdge[];
  delay?: number;
  /** 画布尺寸（内容坐标系） */
  width?: number;
  height?: number;
}> = ({ nodes, edges, delay = 0, width = 1400, height = 700 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodeDelay = (i: number) => delay + i * 8;
  const edgeDelay = (i: number) => delay + nodes.length * 8 + i * 7;

  return (
    <div style={{ position: "relative", width, height, fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif' }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = nodes.find((n) => n.id === e.from)!;
          const b = nodes.find((n) => n.id === e.to)!;
          const { p1, p2 } = edgeEndpoints(a, b);
          const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const enter = spring({
            frame: frame - edgeDelay(i),
            fps,
            config: { damping: 26, stiffness: 90, mass: 1 },
          });
          const stroke = e.accent ?? "rgba(255,255,255,0.5)";
          return (
            <g key={i} opacity={e.dim ? 0.25 : 1}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={stroke}
                strokeWidth={2.5}
                strokeDasharray={e.dashed ? "8 7" : `${len}`}
                strokeDashoffset={e.dashed ? 0 : len * (1 - enter)}
                markerEnd={e.dashed ? undefined : "url(#flow-arrow)"}
                opacity={enter}
              />
              {e.label ? (
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2 - 12}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.65)"
                  fontSize={20}
                  opacity={enter}
                >
                  {e.label}
                </text>
              ) : null}
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
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: n.w,
              height: n.h,
              opacity: enter * (n.dim ? 0.3 : 1),
              transform: `scale(${interpolate(enter, [0, 1], [0.6, 1])})`,
              transformOrigin: "center center",
              background: "#10141A",
              border: n.dashed ? `2px dashed rgba(255,255,255,0.35)` : `2px solid ${accent}`,
              borderRadius: 14,
              boxShadow: n.dim ? "none" : `0 10px 34px rgba(0,0,0,0.45), 0 0 20px ${accent}22`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "0 16px",
              textAlign: "center",
            }}
          >
            <div style={{ color: n.dashed ? "rgba(255,255,255,0.75)" : "#EDEDED", fontSize: 30, fontWeight: 700, lineHeight: 1.25 }}>
              {n.title}
            </div>
            {n.desc ? (
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 20, lineHeight: 1.4 }}>{n.desc}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
