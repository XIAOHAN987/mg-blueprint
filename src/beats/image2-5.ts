import type { BeatMap } from "./schema";
import { sec } from "./schema";

const C = { x: 1100, y: 625 };

export const image25BeatMap: BeatMap = {
  fps: 30,
  stage: { width: 2200, height: 1250 },
  beats: [
    {
      id: "b1",
      from: 0,
      to: sec(5.3),
      camera: { ...C, scale: 1.05 },
      note: "开场钩子：Image 2.5 震撼发布",
    },
    {
      id: "b2",
      from: sec(5.3),
      to: sec(12.2),
      camera: { ...C, scale: 1.0 },
      note: "速度先锋：Flare 小型模型",
    },
    {
      id: "b3",
      from: sec(12.2),
      to: sec(17.5),
      camera: { ...C, scale: 1.0 },
      note: "高精细节：Sunburst 蜻蜓翅膀透明度（large 90% 屏占比）",
    },
    {
      id: "b4",
      from: sec(17.5),
      to: sec(22.0),
      camera: { ...C, scale: 1.0 },
      note: "速度对比：全面超越 2.0",
    },
    {
      id: "b5",
      from: sec(22.0),
      to: sec(28.3),
      camera: { ...C, scale: 1.0 },
      note: "一致性强化：人像多轮迭代无抖动（large 90% 屏占比）",
    },
    {
      id: "b6",
      from: sec(28.3),
      to: sec(31.9),
      camera: { ...C, scale: 1.0 },
      note: "交互突破：Sketch 草图定向生图（large 90% 屏占比）",
    },
    {
      id: "b7",
      from: sec(31.9),
      to: sec(40.0),
      camera: { ...C, scale: 1.0 },
      note: "细节审视：人物背景暗部噪点与多轮伪影（large 90% 屏占比）",
    },
    {
      id: "b8",
      from: sec(40.0),
      to: sec(45.2),
      camera: { ...C, scale: 0.98 },
      note: "竞品对比：Banana2 与 Google 迟滞",
    },
    {
      id: "b9",
      from: sec(45.2),
      to: sec(51.12),
      camera: { ...C, scale: 1.0 },
      note: "结尾收束：等待正式开放实测",
    },
  ],
};
