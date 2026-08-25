import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { easeOutExpo, easeInQuint } from "../../motion/motion";

/**
 * StaggerGroup —— 焊死的错峰进场合（Agent 只能塞内容，不能改结构）。
 *
 * 防的就是 Agent 随手把列表写成同步静态堆叠。子元素以极短 4 帧交错咬合进场，
 * 进场强制复合（位移 + 缩放 0.93→1 + 透明度前 25% 拉满），出场统一方向加速甩走。
 *
 * 物理参数全部内嵌焊死，不暴露给 Agent：
 * - interval = 4 帧（>8 帧大脑会识别为串行而非并行波浪，锁死）
 * - 进场 22f easeOutExpo（先快后慢稳停）、出场 16f easeInQuint（先慢后快甩走）
 * - 复合：translate + scale + opacity 同时非线性爆发
 */

const ENTER_DUR = 22;
const EXIT_DUR = 16;
const INTERVAL = 4; // 焊死，禁止 Agent 拉大

export const StaggerGroup: React.FC<{
  /** 整组进场的起始帧 */
  startFrame: number;
  /** 整组出场的起始帧（不传则不出场，停留到结束） */
  exitStartFrame?: number;
  /** 进场方向（统一） */
  from?: "top" | "bottom" | "left" | "right";
  /** 出场方向（统一） */
  exitTo?: "top" | "bottom" | "left" | "right";
  /** 子元素 */
  children: React.ReactNode;
  /** 子元素间距 */
  gap?: number;
}> = ({ startFrame, exitStartFrame, from = "bottom", exitTo = "right", children, gap = 20 }) => {
  const frame = useCurrentFrame();
  const items = React.Children.toArray(children);

  const dirVecMap: Record<string, [number, number]> = {
    top: [0, -1],
    bottom: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };
  const [fx, fy] = dirVecMap[from];
  const [ex, ey] = dirVecMap[exitTo];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap, alignItems: "center" }}>
      {items.map((child, i) => {
        const itemStart = startFrame + i * INTERVAL;
        const enter = interpolate(frame, [itemStart, itemStart + ENTER_DUR], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeOutExpo,
        });

        // 出场：所有子元素同一时刻统一方向甩走（不错峰，形成整体感）
        // 不传 exitStartFrame 时用极大有限值（Infinity 会触发 interpolate 校验报错）
        const exitStart = exitStartFrame ?? Number.MAX_SAFE_INTEGER / 2;
        const exit = interpolate(frame, [exitStart, exitStart + EXIT_DUR], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeInQuint,
        });

        // 复合爆发：位移 + 缩放 + 透明度（前 25% 拉满）
        const travel = 40;
        const x = (1 - enter) * fx * travel + exit * ex * 1600;
        const y = (1 - enter) * fy * travel + exit * ey * 1100;
        const scale = interpolate(enter, [0, 1], [0.93, 1]);
        const opacity = interpolate(enter, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }) * (1 - exit);

        return (
          <div
            key={i}
            style={{
              transform: `translate(${Math.round(x)}px, ${Math.round(y)}px) scale(${scale})`,
              opacity,
              willChange: "transform, opacity",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
