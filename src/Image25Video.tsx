import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraRig } from "./components/CameraRig";
import { GridBackground } from "./components/GridBackground";
import { DotMatrixBackground } from "./components/DotMatrixBackground";
import { BeatWindow } from "./components/BeatWindow";
import { EmbeddedMedia } from "./components/EmbeddedMedia";
import { TextCard } from "./components/TextCard";
import { FlickerText } from "./components/FlickerText";
import { WordKaraokeCaptions } from "./components/WordKaraokeCaptions";
import { ShowcaseStage, ShowcaseItem } from "./components/ShowcaseStage";
import { Image25FrameChrome } from "./Image25FrameChrome";
import { image25BeatMap } from "./beats/image2-5";
import { image25Cues } from "./beats/image2-5-cues";
import { COLOR } from "./theme";

export const Image25Video: React.FC = () => {
  const { beats, stage } = image25BeatMap;
  const b = (id: string) => beats.find((x) => x.id === id)!;

  // 核心实测流（b2 ~ b6，整整 26.6 秒，大展台常驻静止，视频原位流转）
  const showcaseDemos: ShowcaseItem[] = [
    {
      id: "flare-speed",
      src: "image2-5/clip_flare_speed.mp4",
      kind: "video",
      label: "FLARE BENCHMARK // 50% LATENCY REDUCTION",
      from: b("b2").from,
      to: b("b2").to,
    },
    {
      id: "sunburst-dragonfly",
      src: "image2-5/clip_sunburst_dragonfly.mp4",
      kind: "video",
      label: "SUNBURST // NATIVE TRANSPARENCY (MICRO DETAIL)",
      from: b("b3").from,
      to: b("b3").to,
    },
    {
      id: "speed-eval",
      src: "image2-5/clip_speed_compare.mp4",
      kind: "video",
      label: "SPEED EVALUATION // 4X PLAYBACK TIMERS",
      from: b("b4").from,
      to: b("b4").to,
    },
    {
      id: "person-consistency",
      src: "image2-5/clip_person_consistency.mp4",
      kind: "video",
      label: "MULTI-TURN STABILITY // ZERO DRIFT",
      from: b("b5").from,
      to: b("b5").to,
    },
    {
      id: "sketch-gen",
      src: "image2-5/clip_sketch.mp4",
      kind: "video",
      label: "CHATGPT SKETCH // DIRECT GEOMETRIC GUIDANCE",
      from: b("b6").from,
      to: b("b6").to,
    },
  ];

  return (
    <AbsoluteFill style={{ background: COLOR.bg }}>
      <Audio src={staticFile("image2-5/voiceover.mp3")} />

      <CameraRig beatMap={image25BeatMap} viewWidth={1920} viewHeight={1080}>
        <DotMatrixBackground opacity={0.35} />
        <GridBackground width={stage.width} height={stage.height} />

        {/* Act 1: 开场钩子 —— Image 2.5 震撼发布（观点标题层，独立图层无硬件视频遮挡） */}
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
            kicker="OPENAI ANNOUNCEMENT"
            delay={b("b1").from + 2}
            lines={[{ text: "全新生图模型 Image 2.5", accent: true }]}
            sub="双模型架构：Flare & Sunburst"
          />
        </BeatWindow>

        {/* Act 1: 开场钩子 —— 官方视频层（独立图层） */}
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
            src="image2-5/clip_official_intro.mp4"
            kind="video"
            width={1080}
            delay={b("b1").from + 6}
            startAtFrame={b("b1").from + 6}
            label="OFFICIAL REVEAL // SUNBURST & FLARE"
          />
        </BeatWindow>

        {/* Act 2: 核心实测流（b2 ~ b6，26.6s 常驻大展台，内部无缝切片） */}
        <ShowcaseStage
          from={b("b2").from}
          to={b("b6").to}
          items={showcaseDemos}
          offsetY={-25}
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        />

        {/* Act 3: 细节审视 —— 暗部噪点与多轮伪影（大素材高清晰度图解） */}
        <BeatWindow
          from={b("b7").from}
          to={b("b7").to}
          offsetY={-25}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <EmbeddedMedia
            src="image2-5/artifact_background.png"
            kind="image"
            large
            delay={b("b7").from + 2}
            label="ARTIFACT INSPECTION // MULTI-TURN NOISE & BANDING"
          />
        </BeatWindow>

        {/* Act 4: 竞品对比 —— Banana2 与 Google 迟滞（观点交替） */}
        <BeatWindow
          from={b("b8").from}
          to={b("b8").to}
          offsetY={-30}
          mode="slide"
          enterFrom="right"
          exitTo="left"
          linkOut={true}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
            <TextCard
              kicker="INDUSTRY COMPARISON"
              delay={b("b8").from + 4}
              lines={[
                { text: "Banana 2 在噪点控制上更优" },
                { text: "Google 图像模型迟迟未有大版本更新", accent: true },
              ]}
              sub="竞品迭代分化：OpenAI 持续推进，Google 节奏迟滞"
            />
            <FlickerText
              text="IMAGEN MODEL CADENCE // STALLED"
              fontSize={50}
              delay={b("b8").from + 10}
            />
          </div>
        </BeatWindow>

        {/* Act 5: 结尾收束 —— 观点结论层（独立图层无硬件视频遮挡） */}
        <BeatWindow
          from={b("b9").from}
          to={b("b9").to}
          offsetY={-340}
          mode="hold"
          enterFrom="right"
        >
          <TextCard
            kicker="FINAL VERDICT"
            delay={b("b9").from + 4}
            lines={[
              { text: "静待全面推送与深度实测", accent: true },
              { text: "看生产力与细节能否真正经受检验" },
            ]}
          />
        </BeatWindow>

        {/* Act 5: 结尾收束 —— 官方视频层（独立图层） */}
        <BeatWindow
          from={b("b9").from}
          to={b("b9").to}
          offsetY={70}
          mode="hold"
          enterFrom="right"
        >
          <EmbeddedMedia
            src="image2-5/clip_official_end.mp4"
            kind="video"
            width={1080}
            delay={b("b9").from + 8}
            startAtFrame={b("b9").from + 8}
            label="OFFICIAL CONCLUSION // TEST SOON"
          />
        </BeatWindow>
      </CameraRig>

      {/* 页眉页脚装饰小字 */}
      <Image25FrameChrome />

      {/* 底部逐字卡拉OK字幕 */}
      <WordKaraokeCaptions cues={image25Cues} />
    </AbsoluteFill>
  );
};
