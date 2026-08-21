import React from "react";

/**
 * 标志性细网格蓝图背景。
 * 以舞台中心为原点、3 倍于舞台的超大平面：
 * 相机无论怎么平移 / 拉远，取景范围内永远有网格，不会露出「画布外」。
 * 网格铺在舞台坐标系里，相机移动时自然产生位移与视差 —— 最便宜的空间感来源。
 */
export const GridBackground: React.FC<{
  width: number;
  height: number;
  cell?: number;
}> = ({ width, height, cell = 56 }) => {
  // 3 倍超大平面，中心对齐舞台中心：相机怎么拉都不会露出「画布外」
  // 网格本身完全静止（专业科普的画面稳定感来自「背景不动，只有元素动」）
  const planeW = width * 3;
  const planeH = height * 3;
  const offsetX = -(planeW - width) / 2;
  const offsetY = -(planeH - height) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: offsetX,
        top: offsetY,
        width: planeW,
        height: planeH,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)
        `,
        backgroundSize: `
          ${cell}px ${cell}px,
          ${cell}px ${cell}px,
          ${cell * 5}px ${cell * 5}px,
          ${cell * 5}px ${cell * 5}px
        `,
      }}
    />
  );
};
