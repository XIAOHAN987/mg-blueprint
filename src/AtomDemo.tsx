import React from "react";
import { AbsoluteFill } from "remotion";
import { StaggerGroup } from "./components/atoms/StaggerGroup";
import { SnapText } from "./components/atoms/SnapText";
import { SpecDivider } from "./components/atoms/SpecDivider";
import { GridBackground } from "./components/GridBackground";
import { DotMatrixBackground } from "./components/DotMatrixBackground";

/**
 * AtomDemo —— 新原子组件手感演示（v2 修正排版）。
 *
 * 单焦点：一个超大主标 + 一组错峰要点，大留白。
 * 不堆视频、不堆多层，回到组件库"冷静克制"的调性。
 */
export const AtomDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#050607" }}>
      <GridBackground width={2200} height={1250} />
      <DotMatrixBackground opacity={0.35} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
        }}
      >
        {/* 主标弹射（字阶焊死 hero） */}
        <SnapText
          text="真正丝滑的动画"
          sub="MOTION ASYMMETRY"
          size="hero"
          startFrame={3}
        />

        {/* 分区细线（抢跑展开） */}
        <SpecDivider label="TWO RULES" startFrame={10} width={480} />

        {/* 错峰两条（interval=4，整套波浪展开） */}
        <StaggerGroup startFrame={16} from="bottom" gap={30}>
          <div style={ruleStyle}>
            <span style={numStyle}>01</span> 运动不对称 · 进稳停 / 出甩走
          </div>
          <div style={ruleStyle}>
            <span style={numStyle}>02</span> 动画接力 · 画面不空 / 不等
          </div>
        </StaggerGroup>
      </div>
    </AbsoluteFill>
  );
};

const ruleStyle: React.CSSProperties = {
  fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
  fontSize: 40,
  fontWeight: 600,
  color: "#EDEDED",
  letterSpacing: "0.02em",
  textRendering: "geometricPrecision",
};

const numStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  color: "#4C8DFF",
  marginRight: 20,
  fontWeight: 700,
};
