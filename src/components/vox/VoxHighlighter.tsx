import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { VoxHighlighterProps } from "./types";
import { useVoxBoiled } from "./VoxFilterProvider";

/**
 * 荧光笔涂抹高亮:
 *  - 粗笔触横向扫过 (clipPath 生长)
 *  - 半透明荧光黄 multiply, 底层文字清晰透出
 *  - 两端不规则(多边形), 配合 heavy 湍流滤镜模拟马克笔纤维边缘
 */
export const VoxHighlighter: React.FC<VoxHighlighterProps> = ({
  rect,
  color = "#fde047",
  delayInFrames = 0,
  durationInFrames = 14,
  rotation = -1,
  boiled = true,
  blendMode = "multiply",
}) => {
  const frame = useCurrentFrame();
  const { enabled: boilEnabled } = useVoxBoiled();

  const localFrame = frame - delayInFrames;

  // 线性偏缓的涂抹: 起笔稍慢, 中段快, 收笔略拖
  const progress = interpolate(localFrame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 2.2),
  });

  // 不规则涂抹多边形: 上下边缘各 8 个点带抖动, 两端斜切
  const polygon = useMemo(() => {
    const { x, y, width, height } = rect;
    const pseudo = (i: number) => {
      const s = Math.sin(i * 91.7 + 47.3) * 12543.876;
      return (s - Math.floor(s)) * 2 - 1;
    };
    const pts: string[] = [];
    const N = 8;
    // 上边缘(左→右), 左端收窄
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const px = x + width * t;
      const taperL = Math.min(1, t * 4) * 0.35;
      const py = y + height * (0.1 + pseudo(i) * 0.16 + (1 - taperL) * 0.3);
      pts.push(`${px},${py}`);
    }
    // 下边缘(右→左), 右端收窄
    for (let i = N; i >= 0; i--) {
      const t = i / N;
      const px = x + width * t;
      const taperR = Math.min(1, (1 - t) * 4) * 0.35;
      const py = y + height * (0.9 + pseudo(i + 40) * 0.16 - (1 - taperR) * 0.3);
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, [rect]);

  if (localFrame < 0) return null;

  return (
    <svg
      style={{
        position: "absolute",
        left: rect.x - 10,
        top: rect.y - 10,
        overflow: "visible",
        mixBlendMode: blendMode,
        pointerEvents: "none",
      }}
      width={rect.width + 20}
      height={rect.height + 20}
    >
      <defs>
        <clipPath id={`hl-clip-${rect.x}-${rect.y}`}>
          <rect
            x={rect.x}
            y={rect.y - rect.height * 0.2}
            width={rect.width * progress}
            height={rect.height * 1.4}
          />
        </clipPath>
      </defs>
      <g
        transform={`translate(10 10) rotate(${rotation} ${rect.width / 2} ${rect.height / 2})`}
      >
        <polygon
          points={polygon}
          fill={color}
          opacity={0.82}
          clipPath={`url(#hl-clip-${rect.x}-${rect.y})`}
          filter={boiled && boilEnabled ? "url(#vox-roughen-heavy)" : undefined}
        />
      </g>
    </svg>
  );
};
