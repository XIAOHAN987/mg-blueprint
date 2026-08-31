import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { CameraRig } from "./components/CameraRig";
import { GridBackground } from "./components/GridBackground";
import { DotMatrixBackground } from "./components/DotMatrixBackground";
import { BeatWindow } from "./components/BeatWindow";
import { EmbeddedMedia } from "./components/EmbeddedMedia";
import { TextCard } from "./components/TextCard";
import { NumberTicker } from "./components/NumberTicker";
import { WordKaraokeCaptions } from "./components/WordKaraokeCaptions";
import { OxFrameChrome } from "./OxFrameChrome";
import { oxAlphaBeatMap, oxAlphaCues } from "./beats/ox-alpha";
import { COLOR, EASE, FONT, TYPE } from "./theme";

/**
 * OX Alpha / GLM-5.3-Flash 口播视频（54s）
 * 严格仿照 ArchitectureSpecRecipe 结构：CameraRig + BeatWindow + EmbeddedMedia/TextCard
 * 素材用 EmbeddedMedia（伪3D飞入），文字用 TextCard，字幕用 WordKaraokeCaptions
 */

const sec = (s: number) => Math.round(s * 30);

export const OxAlphaVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { beats, stage } = oxAlphaBeatMap;
  const b = (id: string) => beats.find((x) => x.id === id)!;

  return (
    <AbsoluteFill style={{ background: COLOR.bg }}>
      <Audio src={staticFile("ox-alpha/voiceover.wav")} />

      <CameraRig beatMap={oxAlphaBeatMap} viewWidth={1920} viewHeight={1080}>
        <GridBackground width={stage.width} height={stage.height} />
        {/* 点阵动态氛围层：叠在网格之上，Perlin 噪点缓慢流动 */}
        <DotMatrixBackground opacity={0.4} />

        {/* b1 开场钩子：素材+标题（linkOut 盖住 b1→b2 间隙） */}
        <BeatWindow from={b("b1").from} to={b("b1").to} offsetY={-40} mode="stagger" enterFrom="bottom" exitTo="right" linkOut>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
            <TextCard
              kicker="BREAKING"
              delay={b("b1").from + 4}
              lines={[{ text: "一个代号 OX Alpha 的神秘大模型" }]}
            />
            <EmbeddedMedia
              src="ox-alpha/ox-alpha-teaser.jpg"
              kind="image"
              width={1200}
              delay={b("b1").from + 10}
              label="OX ALPHA // GLM-5.3-FLASH"
            />
          </div>
        </BeatWindow>

        {/* b2 空降 OpenRouter */}
        <BeatWindow from={b("b2").from} to={b("b2").to} offsetY={-40} mode="slide" enterFrom="right" exitTo="top">
          <EmbeddedMedia
            src="ox-alpha/openrouter-rank.png"
            kind="image"
            width={900}
            delay={b("b2").from + 4}
            label="OpenRouter 排名"
          />
        </BeatWindow>

        {/* b3 多模态能力 + 博主猜测：demo 视频全屏展示（b4 口播并入） */}
        <BeatWindow from={b("b3").from} to={b("b3").to} offsetY={10} mode="stagger" enterFrom="bottom" exitTo="left">
          <EmbeddedMedia
            src="ox-alpha/demo-frontend.mp4"
            kind="video"
            large
            delay={b("b3").from + 4}
            startAtFrame={b("b3").from + 4}
            label="多模态能力 // 前端设计还原"
          />
        </BeatWindow>

        {/* b5 Google 员工蹭热度（linkOut 盖住 b5→b6 间隙） */}
        <BeatWindow from={b("b5").from} to={b("b5").to} offsetY={-40} mode="punch" enterFrom="right" linkOut>
          <EmbeddedMedia
            src="ox-alpha/google-employees.jpg"
            kind="image"
            width={800}
            delay={b("b5").from + 4}
            label="Google 员工发帖蹭热度"
          />
        </BeatWindow>

        {/* b6 分词器指纹锁定 */}
        <BeatWindow from={b("b6").from} to={b("b6").to} offsetY={-40} mode="slide" enterFrom="right" exitTo="left">
          <TextCard
            kicker="INVESTIGATION"
            delay={b("b6").from + 4}
            lines={[
              { text: "分词器指纹 + 报错代码" },
              { text: "交叉比对，锁定国内团队", accent: true },
            ]}
            sub="线索迅速收敛"
          />
        </BeatWindow>

        {/* b7 智谱官方认领：核心揭示（linkOut 盖住 b7→b8 间隙） */}
        <BeatWindow from={b("b7").from} to={b("b7").to} offsetY={-40} mode="punch" linkOut>
          <TextCard
            kicker="OFFICIAL"
            delay={b("b7").from + 4}
            lines={[{ text: "GLM 5.3 Flash" }]}
            variant="quote"
            sub="智谱官方正式认领 // GLM 体系最新迭代底座"
          />
        </BeatWindow>

        {/* b8 参数规格：渐进揭示——说到哪出现哪，旧卡平滑缩小让位 */}
        <BeatWindow from={b("b8").from} to={b("b8").to} offsetY={-40} mode="hold">
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <SpecCard
              label="总参数"
              value={<NumberTicker fromVal={0} toVal={320} startFrame={b("b8").from + 6} suffix="B" />}
              accent={COLOR.accent}
              enterAt={b("b8").from}
              shrinkAt={b("b8").from + sec(1.7)}
            />
            <SpecCard
              label="激活参数"
              value={frame < b("b8").from + sec(1.7) + 20 ? (
                <NumberTicker fromVal={0} toVal={18} startFrame={b("b8").from + sec(1.7) + 4} suffix="B" />
              ) : "18B"}
              accent={COLOR.warm}
              enterAt={b("b8").from + sec(1.7)}
              shrinkAt={b("b8").from + sec(3.5)}
            />
            <SpecCard
              label="性能持平"
              value="POS 4.8"
              accent={COLOR.fg}
              enterAt={b("b8").from + sec(3.5)}
              shrinkAt={b("b8").from + sec(5.2)}
            />
            <SpecCard
              label="完全基于"
              value="中国芯片"
              accent={COLOR.danger}
              enterAt={b("b8").from + sec(5.2)}
            />
          </div>
        </BeatWindow>

        {/* b9 调用量：大数字展示（不重复用同一张图） */}
        <BeatWindow from={b("b9").from} to={b("b9").to} offsetY={-40} mode="slide" enterFrom="right" exitTo="top">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: TYPE.caption.size,
                color: COLOR.dim,
                letterSpacing: "0.12em",
              }}
            >
              OPENROUTER // 6 DAYS
            </div>
            <div
              style={{
                fontFamily: FONT.heading,
                fontSize: TYPE.hero.size,
                fontWeight: 700,
                color: COLOR.accent,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              <NumberTicker fromVal={0} toVal={23.2} decimals={1} startFrame={b("b9").from + 6} suffix="T" />
            </div>
            <div
              style={{
                fontFamily: FONT.body,
                fontSize: TYPE.body.size,
                color: COLOR.soft,
              }}
            >
              tokens 调用量
            </div>
          </div>
        </BeatWindow>

        {/* b10 价格：渐进揭示——说到哪出现哪，旧卡平滑缩小让位 */}
        <BeatWindow from={b("b10").from} to={b("b10").to} offsetY={-40} mode="hold">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <TextCard
              kicker="PRICING"
              delay={b("b10").from + 4}
              lines={[{ text: "价格方面" }]}
            />
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              <PriceCard
                label="输入"
                value={frame < b("b10").from + 20 ? (
                  <NumberTicker fromVal={0} toVal={0.4} decimals={1} startFrame={b("b10").from + 10} suffix=" 元" />
                ) : "0.4 元"}
                enterAt={b("b10").from + 8}
                shrinkAt={b("b10").from + sec(1.3)}
              />
              <PriceCard
                label="输出"
                value={frame < b("b10").from + sec(1.3) + 20 ? (
                  <NumberTicker fromVal={0} toVal={1.4} decimals={1} startFrame={b("b10").from + sec(1.3) + 4} suffix=" 元" />
                ) : "1.4 元"}
                enterAt={b("b10").from + sec(1.3)}
                shrinkAt={b("b10").from + sec(2.5)}
              />
              <PriceCard
                label="缓存"
                value={frame < b("b10").from + sec(2.5) + 20 ? (
                  <NumberTicker fromVal={0} toVal={0.115} decimals={3} startFrame={b("b10").from + sec(2.5) + 4} suffix=" 元" />
                ) : "0.115 元"}
                enterAt={b("b10").from + sec(2.5)}
                shrinkAt={b("b10").from + sec(3.8)}
              />
            </div>
            {frame >= b("b10").from + sec(3.8) ? (
              <div
                style={{
                  fontFamily: FONT.body,
                  fontSize: TYPE.body.size,
                  color: COLOR.warm,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                比 DeepSeek V4 Flash 更低
              </div>
            ) : null}
          </div>
        </BeatWindow>

        {/* b11 总结：用户评价视频（纯视频，文字由字幕层承载） */}
        <BeatWindow from={b("b11").from} to={b("b11").to} offsetY={10} mode="stagger" enterFrom="bottom" exitTo="top">
          <EmbeddedMedia
            src="ox-alpha/user-reviews.mp4"
            kind="video"
            large
            delay={b("b11").from + 4}
            startAtFrame={b("b11").from + 4}
            label="网友真实评价"
          />
        </BeatWindow>

        {/* b12 结尾：无出场动画，停留到最后一帧 */}
        <BeatWindow from={b("b12").from} to={b("b12").to} offsetY={-40} mode="slide" enterFrom="bottom" exitTo="right">
          <TextCard
            delay={b("b12").from + 2}
            lines={[{ text: "你上手测了吗" }]}
            variant="quote"
          />
        </BeatWindow>
      </CameraRig>

      {/* 字幕层（不吃相机变换） */}
      <WordKaraokeCaptions cues={oxAlphaCues} />

      {/* 页眉页脚装饰层 */}
      <OxFrameChrome />
    </AbsoluteFill>
  );
};

// ── 内部小组件 ──────────────────────────────────────────

/**
 * SpecCard —— 参数卡片，支持渐进揭示的平滑缩小让位。
 *
 * enterAt: 入场帧（从底部升起 + 淡入）
 * shrinkAt: 缩小让位帧（从当前尺寸平滑缩到 small，easeInOut）
 * 不传 shrinkAt 则一直保持大尺寸（最后一张卡）。
 */
const SpecCard: React.FC<{
  label: string;
  value: React.ReactNode;
  accent: string;
  enterAt: number;
  shrinkAt?: number;
}> = ({ label, value, accent, enterAt, shrinkAt }) => {
  const frame = useCurrentFrame();

  // 入场：从底部升起 + 淡入（22f）
  const enterT = interpolate(frame, [enterAt, enterAt + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const enterY = Math.round((1 - enterT) * 30);
  const enterOpacity = interpolate(enterT, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // 缩小让位：shrinkAt 帧开始，18f 内平滑缩到 small（easeInOut）
  const shrinkT = shrinkAt !== undefined
    ? interpolate(frame, [shrinkAt, shrinkAt + 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE.smooth,
      })
    : 0;

  // 尺寸插值：大 → 小
  const valueSize = interpolate(shrinkT, [0, 1], [TYPE.display.size, 44]);
  const padV = interpolate(shrinkT, [0, 1], [32, 16]);
  const padH = interpolate(shrinkT, [0, 1], [44, 24]);
  const gap = interpolate(shrinkT, [0, 1], [12, 8]);
  const opacity = interpolate(shrinkT, [0, 1], [1, 0.7]);
  const borderAlpha = interpolate(shrinkT, [0, 1], [0.1, 0.06]);
  const bgAlpha = interpolate(shrinkT, [0, 1], [0.03, 0.02]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: Math.round(gap),
        padding: `${Math.round(padV)}px ${Math.round(padH)}px`,
        borderRadius: 16,
        border: `1px solid rgba(255,255,255,${borderAlpha})`,
        background: `rgba(255,255,255,${bgAlpha})`,
        opacity: enterOpacity * opacity,
        transform: `translateY(${enterY}px)`,
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: TYPE.caption.size,
          color: COLOR.dim,
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.heading,
          fontSize: Math.round(valueSize),
          fontWeight: 700,
          color: accent,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
};

/**
 * PriceCard —— 价格卡片，支持渐进揭示的平滑缩小让位。
 * 同 SpecCard 的 enterAt/shrinkAt 机制。
 */
const PriceCard: React.FC<{
  label: string;
  value: React.ReactNode;
  enterAt: number;
  shrinkAt?: number;
}> = ({ label, value, enterAt, shrinkAt }) => {
  const frame = useCurrentFrame();

  const enterT = interpolate(frame, [enterAt, enterAt + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const enterY = Math.round((1 - enterT) * 24);
  const enterOpacity = interpolate(enterT, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  const shrinkT = shrinkAt !== undefined
    ? interpolate(frame, [shrinkAt, shrinkAt + 16], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE.smooth,
      })
    : 0;

  const valueSize = interpolate(shrinkT, [0, 1], [TYPE.title.size, 40]);
  const padV = interpolate(shrinkT, [0, 1], [24, 14]);
  const padH = interpolate(shrinkT, [0, 1], [32, 20]);
  const gap = interpolate(shrinkT, [0, 1], [10, 6]);
  const opacity = interpolate(shrinkT, [0, 1], [1, 0.7]);
  const borderAlpha = interpolate(shrinkT, [0, 1], [0.08, 0.05]);
  const bgAlpha = interpolate(shrinkT, [0, 1], [0.02, 0.01]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: Math.round(gap),
        padding: `${Math.round(padV)}px ${Math.round(padH)}px`,
        borderRadius: 14,
        border: `1px solid rgba(255,255,255,${borderAlpha})`,
        background: `rgba(255,255,255,${bgAlpha})`,
        opacity: enterOpacity * opacity,
        transform: `translateY(${enterY}px)`,
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: TYPE.caption.size,
          color: COLOR.dim,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: Math.round(valueSize),
          fontWeight: 700,
          color: COLOR.warm,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
};
