import type { BeatMap } from "./schema";
import { sec } from "./schema";
import type { Cue } from "../components/WordKaraokeCaptions";

/**
 * OX Alpha / GLM-5.3-Flash 口播视频分镜表
 *
 * 口播 54s，30fps，共 1624 帧。
 * beat 边界 = 口播句子边界（SRT cue 归并），相邻 beat 不重叠。
 *
 * 素材分配：
 * - b1：牛来.jpg（Ox Alpha 官方预告图，视觉冲击力最强）
 * - b2：OX调用量超20万亿.png（OpenRouter 排名截图）
 * - b3：模型架构.png + Build Fast with AI demo 视频（多模态能力）
 * - b5：谷歌员工蹭热度.jpg（Google 员工发帖截图）
 * - b9：OX调用量超20万亿.png（调用量）
 * - b10：价格.png（价格对比截图）
 * - b11：网友真实评价.mp4（用户评价视频）
 */

// SRT cues（秒级时间码，来自 口播.srt）
export const oxAlphaCues: Cue[] = [
  { start: 0.2,   end: 0.666,  text: "这两天" },
  { start: 0.666, end: 3.2,    text: "一个代号叫做OX Alpha的神秘大模型" },
  { start: 3.366, end: 4.966,  text: "突然空降open Router" },
  { start: 5.0,   end: 6.466,  text: "多模态能力极强" },
  { start: 6.466, end: 8.6,    text: "能还原极其复杂的前端设计" },
  { start: 8.766, end: 10.766, text: "各大博主都在猜测这款号称" },
  { start: 10.766,end: 12.733, text: "牛来的模型到底是哪家的" },
  { start: 12.733,end: 15.333, text: "甚至Google员工都分别发帖蹭热度" },
  { start: 15.666,end: 17.4,   text: "还有一部分博主通过分词器" },
  { start: 17.4,  end: 19.466, text: "指纹和报错代码交叉比对" },
  { start: 19.6,  end: 21.466, text: "线索迅速锁定国内团队" },
  { start: 21.533,end: 23.7,   text: "直到刚才智谱官方正式认领" },
  { start: 23.8,  end: 28.133, text: "它就是GLM体系的最新迭代底座GLM5.3Flash" },
  { start: 28.3,  end: 29.966, text: "拥有320B总参数" },
  { start: 29.966,end: 31.266, text: "仅激活18B" },
  { start: 31.366,end: 33.4,   text: "性能持平POS4.8" },
  { start: 33.466,end: 35.6,   text: "而且完全基于中国的芯片运行" },
  { start: 35.8,  end: 38.5,   text: "且能满足Openrouter如此夸张的调用量" },
  { start: 38.566,end: 39.5,   text: "价格方面" },
  { start: 39.566,end: 40.866, text: "输入0.4元" },
  { start: 40.9,  end: 42.1,   text: "输出1.4元" },
  { start: 42.166,end: 43.733, text: "缓存0.115元" },
  { start: 43.733,end: 45.6,   text: "在输入和输出的价格上都已经" },
  { start: 45.6,  end: 48.4,   text: "比Deepseek V4 Flash的当前价格要低" },
  { start: 48.6,  end: 51.2,   text: "GLM 5.3 Flash以极具竞争力" },
  { start: 51.2,  end: 52.9,   text: "的价格实现领先性能" },
  { start: 52.9,  end: 54.133, text: "你上手测了吗" },
];

// beat 归并：把连续的短句合并成有意义的视觉段落
// 铁律：beat 边界 = 口播句子边界，相邻 beat 不重叠
// 舞台中心 = BeatWindow 锚点 = 相机注视点，三者必须一致
const C = { x: 1100, y: 625 };

export const oxAlphaBeatMap: BeatMap = {
  fps: 30,
  stage: { width: 2200, height: 1250 },
  beats: [
    // b1 开场钩子（0.2–3.2s）：素材浮现 + 标题
    {
      id: "b1",
      from: sec(0),
      to: sec(3.2),
      camera: { ...C, scale: 1.0 },
      note: "牛来.jpg 素材开场，标题 OX ALPHA 叠加浮现",
    },
    // b2 空降 OpenRouter（3.366–6.466s）
    {
      id: "b2",
      from: sec(3.366),
      to: sec(6.466),
      camera: { ...C, scale: 1.05 },
      note: "OpenRouter 排名截图 SpotlightMedia 放大展示",
    },
    // b3 多模态能力 + 博主猜测（6.466–12.733s）——视频素材延长，文字卡并入
    {
      id: "b3",
      from: sec(6.466),
      to: sec(12.733),
      camera: { ...C, scale: 1.0 },
      note: "Build Fast with AI demo 视频（全屏聚光）+ 博主猜测口播并入",
    },
    // b5 Google 员工蹭热度（12.733–15.333s）
    {
      id: "b5",
      from: sec(12.733),
      to: sec(15.333),
      camera: { ...C, scale: 1.05 },
      note: "谷歌员工蹭热度.jpg SpotlightMedia",
    },
    // b6 分词器指纹锁定（15.666–21.466s）
    {
      id: "b6",
      from: sec(15.666),
      to: sec(21.466),
      camera: { ...C, scale: 1.0 },
      note: "文字卡：分词器指纹交叉比对",
    },
    // b7 智谱官方认领（21.533–28.133s）
    {
      id: "b7",
      from: sec(21.533),
      to: sec(28.133),
      camera: { ...C, scale: 1.08 },
      note: "核心揭示：GLM 5.3 Flash",
    },
    // b8 参数规格（28.3–35.6s）
    {
      id: "b8",
      from: sec(28.3),
      to: sec(35.6),
      camera: { ...C, scale: 1.0 },
      note: "NumberTicker 数字卡片",
    },
    // b9 调用量（35.8–38.5s）
    {
      id: "b9",
      from: sec(35.8),
      to: sec(38.5),
      camera: { ...C, scale: 1.03 },
      note: "OX调用量超20万亿.png SpotlightMedia",
    },
    // b10 价格（38.566–48.4s）
    {
      id: "b10",
      from: sec(38.566),
      to: sec(48.4),
      camera: { ...C, scale: 1.0 },
      note: "价格.png + NumberTicker",
    },
    // b11 总结（48.6–52.9s）
    {
      id: "b11",
      from: sec(48.6),
      to: sec(52.9),
      camera: { ...C, scale: 1.02 },
      note: "网友真实评价视频 + 总结文字",
    },
    // b12 结尾（52.9–54.5s）
    {
      id: "b12",
      from: sec(52.9),
      to: sec(54.5),
      camera: { ...C, scale: 1.0 },
      note: "收尾",
    },
  ],
};
