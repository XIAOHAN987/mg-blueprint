import type { BeatMap } from "./schema";

/**
 * 《DeepSeek Harness 适不适合你》分镜表
 * 由口播 SRT（34 句）归并为 13 个 beat；相机锁定舞台中心，只做 zoom。
 * 素材与文案的对应关系见 Deepseek.tsx。
 *
 * 时间轴（30fps，总长 1800 帧 = 60s，口播 59.47s）：
 *  b1   0-142   钩子：GitHub 高星视频 —— "热度很高"
 *  b2   144-311 问题卡：先别急着部署，先判断适不适合自己
 *  b3   320-495 官方定义：官网截图嵌入 + 「一切皆插件」高亮
 *  b4   496-585 类比：白膜 3D 底盘视频 —— 只有底盘/发动机/接口的车
 *  b5   585-654 流水线视频：自带任务循环与插件调度
 *  b6   654-737 繁琐启动步骤视频：其他都要自己配置
 *  b7   746-851 转折卡：框架本身很优秀
 *  b8   858-993 警告卡：但普通人，不推荐
 *  b9   994-1134 理由卡：目标是产出内容，不是搭底层
 *  b10  1137-1367 对比卡：成熟智能体已内置三能力
 *  b11  1377-1532 人群卡：适合深度自定义/研究架构的人
 *  b12  1536-1647 过渡卡：感兴趣可以浅尝学原理
 *  b13  1647-1800 金句收束：研究工具 还是 生产力工具
 */
const C = { x: 1100, y: 625 };

export const deepseekBeatMap: BeatMap = {
  fps: 30,
  stage: { width: 2200, height: 1250 },
  beats: [
    { id: "b1", from: 0, to: 142, camera: { ...C, scale: 1.0 }, note: "钩子：GitHub 高星" },
    { id: "b2", from: 144, to: 311, camera: { ...C, scale: 1.05 }, note: "问题卡" },
    { id: "b3", from: 320, to: 495, camera: { ...C, scale: 1.06 }, note: "官网截图+高亮" },
    { id: "b4", from: 496, to: 585, camera: { ...C, scale: 1.06 }, note: "3D 底盘类比" },
    { id: "b5", from: 585, to: 654, camera: { ...C, scale: 1.06 }, note: "流水线" },
    { id: "b6", from: 654, to: 737, camera: { ...C, scale: 1.05 }, note: "繁琐配置" },
    { id: "b7", from: 746, to: 851, camera: { ...C, scale: 1.0 }, note: "转折：很优秀" },
    { id: "b8", from: 858, to: 993, camera: { ...C, scale: 1.08 }, note: "警告：不推荐" },
    { id: "b9", from: 994, to: 1134, camera: { ...C, scale: 1.04 }, note: "理由" },
    { id: "b10", from: 1137, to: 1367, camera: { ...C, scale: 1.02 }, note: "三能力卡" },
    { id: "b11", from: 1377, to: 1532, camera: { ...C, scale: 1.0 }, note: "适合人群" },
    { id: "b12", from: 1536, to: 1647, camera: { ...C, scale: 1.0 }, note: "过渡" },
    { id: "b13", from: 1647, to: 1800, camera: { ...C, scale: 1.1 }, note: "金句收束" },
  ],
};
