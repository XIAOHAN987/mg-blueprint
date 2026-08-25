import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraRig } from "../components/CameraRig";
import { GridBackground } from "../components/GridBackground";
import { DotMatrixBackground } from "../components/DotMatrixBackground";
import { BeatWindow } from "../components/BeatWindow";
import { EmbeddedMedia } from "../components/EmbeddedMedia";
import { HighlightCallout } from "../components/HighlightCallout";
import { TextCard } from "../components/TextCard";
import { FeatureCards } from "../components/FeatureCards";
import { SrtCaptions } from "../components/SrtCaptions";
import { FlickerText } from "../components/FlickerText";
import { TextReveal } from "../components/TextReveal";
import { FrameChrome } from "../components/FrameChrome";
import { SpotlightMedia } from "../components/SpotlightMedia";
import { deepseekBeatMap } from "../beats/deepseek";
import { deepseekCues } from "../beats/deepseek-cues";

/**
 * 《DeepSeek Harness 适不适合你》正片（v3 回退版）
 * 语法：锁定居中相机（zoom-only）+ BeatWindow 交接 + 光盘 demo 验证过的组件。
 * 全片无全屏视频、无流程图，所有素材以嵌入卡片呈现，文字用 TextCard/FeatureCards。
 */
export const DeepseekVideo: React.FC = () => {
  const { beats, stage } = deepseekBeatMap;
  const b = (id: string) => beats.find((x) => x.id === id)!;

  return (
    <AbsoluteFill style={{ background: "#050607" }}>
      <Audio src={staticFile("deepseek/voiceover.mp3")} />

      <CameraRig beatMap={deepseekBeatMap} viewWidth={1920} viewHeight={1080}>
        <GridBackground width={stage.width} height={stage.height} />
        {/* 点阵动态氛围层：叠在网格之上，Perlin 噪点缓慢流动 */}
        <DotMatrixBackground opacity={0.4} />

        {/* b1 钩子：GitHub 录屏嵌入卡片（从下进，从右出） */}
        <BeatWindow from={b("b1").from} to={b("b1").to} offsetY={-40} mode="stagger" enterFrom="bottom" exitTo="right">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
            <TextCard
              kicker="GitHub"
              delay={b("b1").from + 4}
              lines={[{ text: "DeepSeek Harness，正在爆火" }]}
            />
            <EmbeddedMedia
              src="deepseek/github-stars.mp4"
              kind="video"
              width={1120}
              delay={b("b1").from + 10}
              label="github.com/deepseek-ai/deepseek-harness"
            />
          </div>
        </BeatWindow>

        {/* b2 问题卡：关键词闪烁强调（从左进，从上出） */}
        <BeatWindow from={b("b2").from} to={b("b2").to} mode="slide" enterFrom="left" exitTo="top">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <TextCard
              kicker="部署之前"
              delay={b("b2").from + 4}
              lines={[{ text: "先别急着部署" }]}
            />
            <FlickerText
              text="先判断适不适合自己"
              fontSize={64}
              delay={b("b2").from + 20}
              duration={15}
              flickerCount={3}
              letterFlickerIntensity={12}
              strokeColor="#4C8DFF"
              fillColor="#4C8DFF"
            />
          </div>
        </BeatWindow>

        {/* b3 官方定义：官网截图 + 高亮（从右进，穿透出） */}
        <BeatWindow from={b("b3").from} to={b("b3").to} offsetY={-40} mode="punch" enterFrom="right">
          <EmbeddedMedia
            src="deepseek/harness-home.png"
            kind="image"
            width={1220}
            delay={b("b3").from + 4}
            label="DeepSeek Harness 官网"
          >
            <HighlightCallout
              x={6}
              y={41}
              w={27}
              h={24}
              label="官方定义：一切皆插件"
              delay={b("b3").from + 26}
            />
          </EmbeddedMedia>
        </BeatWindow>

        {/* b4 类比：3D 底盘（全屏聚光，从下进，从下出） */}
        <BeatWindow from={b("b4").from} to={b("b4").to} offsetY={-40} mode="slide" enterFrom="bottom" exitTo="bottom">
          <SpotlightMedia
            src="deepseek/chassis-3d.mp4"
            kind="video"
            delay={b("b4").from + 4}
            startFromSec={2}
            zoomAt={18}
            caption="一辆只有底盘、发动机和接口的车"
          />
        </BeatWindow>

        {/* b5 流水线嵌入（从上进，从右出） */}
        <BeatWindow from={b("b5").from} to={b("b5").to} offsetY={-40} mode="stagger" enterFrom="top" exitTo="right">
          <EmbeddedMedia
            src="deepseek/pipeline.mp4"
            kind="video"
            width={1120}
            delay={b("b5").from + 4}
            label="自带任务循环 · 插件调度"
          />
        </BeatWindow>

        {/* b6 繁琐配置嵌入（从左进，穿透出） */}
        <BeatWindow from={b("b6").from} to={b("b6").to} offsetY={-40} mode="punch" enterFrom="left">
          <EmbeddedMedia
            src="deepseek/setup-steps.mp4"
            kind="video"
            width={1120}
            delay={b("b6").from + 4}
            startFromSec={3}
            label="但其他一切，都要自己研究配置"
          />
        </BeatWindow>

        {/* b7 转折：优秀（逐字升起，从下进，从上出） */}
        <BeatWindow from={b("b7").from} to={b("b7").to} mode="stagger" enterFrom="bottom" exitTo="top">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <TextReveal
              text="框架本身"
              fontSize={64}
              delay={b("b7").from + 4}
              preset="per-character-rise"
              color="#EDEDED"
            />
            <FlickerText
              text="是优秀的技术创新"
              fontSize={64}
              delay={b("b7").from + 18}
              duration={15}
              flickerCount={3}
              letterFlickerIntensity={12}
              strokeColor="#4C8DFF"
              fillColor="#4C8DFF"
            />
          </div>
        </BeatWindow>

        {/* b8 警告：不推荐（关键词闪烁，从右进，从下出） */}
        <BeatWindow from={b("b8").from} to={b("b8").to} mode="slide" enterFrom="right" exitTo="bottom">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <TextCard
              variant="warning"
              kicker="但是"
              delay={b("b8").from + 4}
              lines={[{ text: "自媒体 / 上班族 / 只想快速跑通工作流" }]}
            />
            <FlickerText
              text="普通人，不推荐"
              fontSize={76}
              delay={b("b8").from + 18}
              duration={15}
              flickerCount={4}
              letterFlickerIntensity={14}
              strokeColor="#E24B4A"
              fillColor="#E24B4A"
            />
          </div>
        </BeatWindow>

        {/* b9 理由（逐词推进，从上进，从右出） */}
        <BeatWindow from={b("b9").from} to={b("b9").to} mode="stagger" enterFrom="top" exitTo="right">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <TextReveal
              text="目标是产出内容、拿到结果"
              fontSize={64}
              delay={b("b9").from + 4}
              preset="staggered-fade-up"
              color="#EDEDED"
            />
            <FlickerText
              text="而不是耗费时间搭建底层"
              fontSize={64}
              delay={b("b9").from + 20}
              duration={15}
              flickerCount={3}
              letterFlickerIntensity={12}
              strokeColor="#4C8DFF"
              fillColor="#4C8DFF"
            />
          </div>
        </BeatWindow>

        {/* b10 对比：成熟智能体三能力（从左进，穿透出） */}
        <BeatWindow from={b("b10").from} to={b("b10").to} mode="punch" enterFrom="left">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
            <TextCard
              delay={b("b10").from + 4}
              lines={[{ text: "豆包 · Codex · WorkBuddy 已经内置" }]}
            />
            <FeatureCards
              delay={b("b10").from + 18}
              items={[
                { title: "Harness 执行逻辑", desc: "任务循环与插件调度开箱即用" },
                { title: "插件商店", desc: "能力即装即用，无需手写配置" },
                { title: "记忆系统", desc: "上下文与偏好长期沉淀" },
              ]}
            />
          </div>
        </BeatWindow>

        {/* b11 适合人群（逐字升起 + 关键词闪烁，从下进，从上出） */}
        <BeatWindow from={b("b11").from} to={b("b11").to} mode="stagger" enterFrom="bottom" exitTo="top">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <TextCard
              kicker="Harness 更适合"
              delay={b("b11").from + 4}
              lines={[{ text: "想深度自定义 Agent 规则" }]}
            />
            <FlickerText
              text="研究智能体架构的人"
              fontSize={64}
              delay={b("b11").from + 18}
              duration={15}
              flickerCount={3}
              letterFlickerIntensity={12}
              strokeColor="#4C8DFF"
              fillColor="#4C8DFF"
            />
          </div>
        </BeatWindow>

        {/* b12 过渡（从右进，从下出） */}
        <BeatWindow from={b("b12").from} to={b("b12").to} mode="slide" enterFrom="right" exitTo="bottom">
          <TextCard
            delay={b("b12").from + 4}
            lines={[{ text: "单纯感兴趣？可以浅尝" }]}
            sub="体验一下，学学原理"
          />
        </BeatWindow>

        {/* b13 金句收束：关键词闪烁（从上进，穿透出） */}
        <BeatWindow from={b("b13").from} to={b("b13").to} mode="punch" enterFrom="top">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <TextCard
              variant="quote"
              kicker="新技术热潮来袭"
              delay={b("b13").from + 4}
              lines={[{ text: "先分清你要的是" }]}
            />
            <FlickerText
              text="研究工具，还是生产力工具"
              fontSize={76}
              delay={b("b13").from + 22}
              duration={15}
              flickerCount={5}
              letterFlickerIntensity={10}
              strokeColor="#4C8DFF"
              fillColor="#EDEDED"
              restState="outline"
            />
          </div>
        </BeatWindow>
      </CameraRig>

      {/* 页眉页脚装饰层 */}
      <FrameChrome beatId={b("b1").id} />

      {/* 屏幕空间暗角 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 75% 70% at 50% 46%, transparent 62%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      <SrtCaptions cues={deepseekCues} />
    </AbsoluteFill>
  );
};
