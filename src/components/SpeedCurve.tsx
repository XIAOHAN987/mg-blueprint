import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

/**
 * SpeedCurve —— 原理一「运动不对称」的速度-时间曲线可视化。
 *
 * 左：easeOutExpo 进场曲线（先快后慢，尾速趋零）
 * 右：easeInQuint 出场曲线（先慢后快，离屏时速度最大）
 * 曲线逐步绘制（strokeDashoffset），绘制完成后小球沿曲线跑一遍。
 */

const easeOutExpo = (t: number) => 1 - Math.pow(2, -10 * t);
const easeInQuint = (t: number) => Math.pow(t, 5);

const buildPath = (
  fn: (t: number) => number,
  x0: number,
  y0: number,
  w: number,
  h: number,
  samples = 60,
): string => {
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = x0 + t * w;
    const y = y0 - fn(t) * h;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
};

const SingleCurve: React.FC<{
  label: string;
  sub: string;
  fn: (t: number) => number;
  color: string;
  delay: number;
  x0: number;
}> = ({ label, sub, fn, color, delay, x0 }) => {
  const frame = useCurrentFrame();

  const W = 460;
  const H = 320;
  const Y0 = 400;

  const draw = interpolate(frame, [delay, delay + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const path = buildPath(fn, x0, Y0, W, H);
  const pathLen = 700;

  // 小球：绘制完成后沿曲线跑
  const ballT = interpolate(frame, [delay + 45, delay + 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ballX = x0 + ballT * W;
  const ballY = Y0 - fn(ballT) * H;

  return (
    <g>
      {/* 坐标轴 */}
      <line x1={x0} y1={Y0} x2={x0 + W} y2={Y0} stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
      <line x1={x0} y1={Y0} x2={x0} y2={Y0 - H} stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
      <text x={x0 + W - 8} y={Y0 + 34} fill="rgba(255,255,255,0.45)" fontSize={22} textAnchor="end" fontFamily="Inter, 'Noto Sans SC', sans-serif">
        时间 →
      </text>
      <text x={x0 + 10} y={Y0 - H - 14} fill="rgba(255,255,255,0.45)" fontSize={22} fontFamily="Inter, 'Noto Sans SC', sans-serif">
        位移
      </text>
      {/* 曲线 */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={pathLen}
        strokeDashoffset={pathLen * (1 - draw)}
      />
      {/* 小球 */}
      {ballT > 0 && ballT < 1 && <circle cx={ballX} cy={ballY} r={12} fill={color} />}
      {/* 标注 */}
      <text x={x0 + W / 2} y={Y0 + 78} fill="#EDEDED" fontSize={34} fontWeight={700} textAnchor="middle" fontFamily="Inter, 'Noto Sans SC', sans-serif">
        {label}
      </text>
      <text x={x0 + W / 2} y={Y0 + 122} fill="rgba(255,255,255,0.55)" fontSize={26} textAnchor="middle" fontFamily="Inter, 'Noto Sans SC', sans-serif">
        {sub}
      </text>
    </g>
  );
};

export const SpeedCurve: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  return (
    <svg width={1100} height={520} viewBox="0 0 1100 520">
      <SingleCurve
        label="进场 easeOutExpo"
        sub="先快后慢 · 稳稳停住"
        fn={easeOutExpo}
        color="#4C8DFF"
        delay={delay}
        x0={40}
      />
      <SingleCurve
        label="出场 easeInQuint"
        sub="先慢后快 · 加速甩走"
        fn={easeInQuint}
        color="#E24B4A"
        delay={delay + 20}
        x0={600}
      />
    </svg>
  );
};
