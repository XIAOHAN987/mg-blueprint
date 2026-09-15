import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraRig } from "./components/CameraRig";
import { GridBackground } from "./components/GridBackground";
import { DotMatrixBackground } from "./components/DotMatrixBackground";
import { BeatWindow } from "./components/BeatWindow";
import { EmbeddedMedia } from "./components/EmbeddedMedia";
import { TextCard } from "./components/TextCard";
import { WordKaraokeCaptions } from "./components/WordKaraokeCaptions";
import { NewParadigmFrameChrome } from "./NewParadigmFrameChrome";
import { LatencyTokenGauge } from "./components/LatencyTokenGauge";
import { TerminalMatrix } from "./components/TerminalMatrix";
import { ContextFlowDiagram } from "./components/ContextFlowDiagram";
import { BitterLessonCard } from "./components/BitterLessonCard";
import { PromptGuidanceCard } from "./components/PromptGuidanceCard";
import { newParadigmBeatMap } from "./beats/new-paradigm";
import { newParadigmCues } from "./beats/new-paradigm-cues";
import { COLOR } from "./theme";

export const NewParadigmVideo: React.FC = () => {
  const { beats, stage } = newParadigmBeatMap;
  const b = (id: string) => beats.find((x) => x.id === id)!;

  return (
    <AbsoluteFill style={{ background: COLOR.bg }}>
      <Audio src={staticFile("new-paradigm/voiceover.wav")} />

      <CameraRig beatMap={newParadigmBeatMap} viewWidth={1920} viewHeight={1080}>
        <GridBackground width={stage.width} height={stage.height} />
        <DotMatrixBackground opacity={0.4} />

        {/* Act 1: 开场钩子 —— 专用工具还是 Bash（00:00 - 00:09.5） */}
        <BeatWindow
          from={b("b1").from}
          to={b("b1").to}
          offsetY={-340}
          mode="slide"
          enterFrom="bottom"
          exitTo="left"
          linkOut={true}
        >
          <TextCard
            kicker="PARADIGM DILEMMA"
            delay={b("b1").from + 2}
            lines={[{ text: "Agent 执行任务还需要专用工具吗？", accent: true }]}
            sub="从小龙虾到 Codex：底层范式正在经历根本变革"
          />
        </BeatWindow>

        <BeatWindow
          from={b("b1").from}
          to={b("b1").to}
          offsetY={70}
          mode="slide"
          enterFrom="bottom"
          exitTo="left"
          linkOut={true}
        >
          <EmbeddedMedia
            src="new-paradigm/shot_1_choice.mp4"
            kind="video"
            width={1080}
            delay={b("b1").from + 4}
            startAtFrame={b("b1").from}
            label="CASE 01 // TOOL CLUSTER VS BASH TERMINAL"
          />
        </BeatWindow>

        {/* Act 2: 旧范式隐喻 —— 多门店小人来回跑（00:09.5 - 00:17.5） */}
        <BeatWindow
          from={b("b2").from}
          to={b("b2").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <EmbeddedMedia
            src="new-paradigm/shot_2_stores.mp4"
            kind="video"
            large
            delay={b("b2").from + 2}
            startAtFrame={b("b2").from}
            label="OLD PARADIGM // FRAGMENTED SPECIALIZED STORES"
          />
        </BeatWindow>

        {/* Act 3: 旧范式痛点 —— 延迟极慢与 Token 爆表（00:17.5 - 00:23.7） */}
        <BeatWindow
          from={b("b3").from}
          to={b("b3").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <TextCard
              kicker="PERFORMANCE CRITICAL"
              delay={b("b3").from + 2}
              variant="warning"
              lines={[{ text: "速度极慢，且 TOKEN 消耗巨大", accent: true }]}
              sub="频繁的模式校验与跨进程上下文损耗"
            />
            <LatencyTokenGauge delay={b("b3").from + 6} />
          </div>
        </BeatWindow>

        {/* Act 4: 新范式概念 —— 完整公寓与全套工具（00:23.7 - 00:31.2） */}
        <BeatWindow
          from={b("b4").from}
          to={b("b4").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <EmbeddedMedia
            src="new-paradigm/shot_3_apartment.mp4"
            kind="video"
            large
            delay={b("b4").from + 2}
            startAtFrame={b("b4").from}
            label="NEW PARADIGM // COMPLETE APARTMENT SUITE"
          />
        </BeatWindow>

        {/* Act 5: Bash 全能矩阵 —— 读写跑Git自由组合（00:31.2 - 00:39.2） */}
        <BeatWindow
          from={b("b5").from}
          to={b("b5").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <TextCard
              kicker="COMPUTE RUNTIME"
              delay={b("b5").from + 2}
              lines={[{ text: "自由组合：读文件、改代码、跑 Git、处理日志", accent: true }]}
              sub="操作系统原生标准输入输出（I/O）管道生态"
            />
            <TerminalMatrix delay={b("b5").from + 6} />
          </div>
        </BeatWindow>

        {/* Act 6: 案例 1 —— 批量重命名变量分屏对比（00:39.2 - 00:53.7） */}
        <BeatWindow
          from={b("b6").from}
          to={b("b6").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <EmbeddedMedia
            src="new-paradigm/shot_4_rename.mp4"
            kind="video"
            large
            delay={b("b6").from + 2}
            startAtFrame={b("b6").from}
            label="CASE 01 // 5-6 TOOL ROUNDTRIPS VS 1 BASH SCRIPT"
          />
        </BeatWindow>

        {/* Act 7A: 案例 2 —— 超大日志处理 视频演示（00:53.7 - 01:01.7） */}
        <BeatWindow
          from={b("b7").from}
          to={b("b7").from + 240}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <EmbeddedMedia
            src="new-paradigm/shot_5_logs.mp4"
            kind="video"
            large
            delay={b("b7").from + 2}
            startAtFrame={b("b7").from}
            label="CASE 02 // 50GB LOGS FLOODING VS EXTERNAL PIPELINE"
          />
        </BeatWindow>

        {/* Act 7B: 案例 2 —— 数据流向架构穿透图（01:01.7 - 01:08.5） */}
        <BeatWindow
          from={b("b7").from + 240}
          to={b("b7").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <TextCard
              kicker="ARCHITECTURE MECHANISM"
              delay={b("b7").from + 242}
              lines={[{ text: "原始数据根本不进上下文", accent: true }]}
              sub="外部脚本本地预统计，只将精简结论交付模型"
            />
            <ContextFlowDiagram delay={b("b7").from + 246} />
          </div>
        </BeatWindow>

        {/* Act 8: 安全防护 —— Harness 保安进程隔离（01:08.5 - 01:19.9） */}
        <BeatWindow
          from={b("b8").from}
          to={b("b8").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <EmbeddedMedia
            src="new-paradigm/shot_6_guard.mp4"
            kind="video"
            large
            delay={b("b8").from + 2}
            startAtFrame={b("b8").from}
            label="SECURITY LAYER // HARNESS PROCESS ISOLATION"
          />
        </BeatWindow>

        {/* Act 9: 哲学高潮 —— The Bitter Lesson 苦涩教训（01:19.9 - 01:33.8） */}
        <BeatWindow
          from={b("b9").from}
          to={b("b9").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <BitterLessonCard delay={b("b9").from + 2} />
        </BeatWindow>

        {/* Act 10: 实操建议与收尾 CTA（01:33.8 - 01:44.75） */}
        <BeatWindow
          from={b("b10").from}
          to={b("b10").to}
          offsetY={-25}
          mode="hold"
          enterFrom="right"
        >
          <PromptGuidanceCard delay={b("b10").from + 2} />
        </BeatWindow>
      </CameraRig>

      {/* 页眉页脚 Blueprint 装饰 */}
      <NewParadigmFrameChrome />

      {/* 底部逐字卡拉OK字幕 */}
      <WordKaraokeCaptions cues={newParadigmCues} />
    </AbsoluteFill>
  );
};
