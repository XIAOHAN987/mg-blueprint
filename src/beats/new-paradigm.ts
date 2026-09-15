import type { BeatMap } from "./schema";
import { sec } from "./schema";

const C = { x: 1100, y: 625 };

export const newParadigmBeatMap: BeatMap = {
  fps: 30,
  stage: { width: 2200, height: 1250 },
  beats: [
    {
      id: "b1",
      from: 0,
      to: sec(9.5),
      camera: { ...C, scale: 1.05 },
      note: "开场：小龙虾在专用工具与Bash中选择",
    },
    {
      id: "b2",
      from: sec(9.5),
      to: sec(17.5),
      camera: { ...C, scale: 1.0 },
      note: "旧范式隐喻：多门店小人来回跑",
    },
    {
      id: "b3",
      from: sec(17.5),
      to: sec(23.7),
      camera: { ...C, scale: 0.98 },
      note: "旧范式痛点：延迟与Token消耗巨大",
    },
    {
      id: "b4",
      from: sec(23.7),
      to: sec(31.2),
      camera: { ...C, scale: 1.0 },
      note: "新范式概念：完整公寓与全套工具",
    },
    {
      id: "b5",
      from: sec(31.2),
      to: sec(39.2),
      camera: { ...C, scale: 1.02 },
      note: "Bash全能矩阵：读写跑Git自由组合",
    },
    {
      id: "b6",
      from: sec(39.2),
      to: sec(53.7),
      camera: { ...C, scale: 1.0 },
      note: "案例1：批量重命名变量（分屏对比）",
    },
    {
      id: "b7",
      from: sec(53.7),
      to: sec(68.5),
      camera: { ...C, scale: 1.0 },
      note: "案例2：超大日志处理（爆上下文 vs 外部管道）",
    },
    {
      id: "b8",
      from: sec(68.5),
      to: sec(79.9),
      camera: { ...C, scale: 1.0 },
      note: "安全机制：Harness 保安进程隔离与防护",
    },
    {
      id: "b9",
      from: sec(79.9),
      to: sec(93.8),
      camera: { ...C, scale: 1.03 },
      note: "苦涩教训：通用方法终将战胜手工专用工具",
    },
    {
      id: "b10",
      from: sec(93.8),
      to: sec(104.75),
      camera: { ...C, scale: 1.0 },
      note: "实操建议与收尾：少设约束，搭好护栏",
    },
  ],
};
