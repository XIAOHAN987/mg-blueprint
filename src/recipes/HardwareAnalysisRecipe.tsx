import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { CameraRig } from "../components/CameraRig";
import { GridBackground } from "../components/GridBackground";
import { OutlineTitle } from "../components/OutlineTitle";
import { BitRow } from "../components/BitRow";
import { TrackList } from "../components/TrackList";
import { CdDisc } from "../components/CdDisc";
import { Captions } from "../components/Captions";
import { demoBeatMap } from "../beats/demo";

/**
 * 元素从不「卸载」—— 它们一直在舞台上，
 * 只是随着相机移动被路过、或用透明度退成背景。
 * 这就是消除 PPT 感的关键结构。
 */

const TRACKS = [
  { name: "背叛", file: "Track01.cda" },
  { name: "牵挂", file: "Track02.cda" },
  { name: "199玫瑰", file: "Track03.cda" },
  { name: "一亲红颜", file: "Track04.cda" },
  { name: "亲爱的你", file: "Track05.cda" },
  { name: "抛弃", file: "Track06.cda" },
  { name: "继续堕落", file: "Track07.cda" },
];

export const PaperclipDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { beats, stage } = demoBeatMap;
  const [b2, b3, b4] = [beats[1], beats[2], beats[3]];

  // 比特行：b3 起退成背景（不消失，只变淡变小）
  const bitDim = interpolate(frame, [b3.from, b3.from + 25], [1, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 标题：b2 起淡出到极弱
  const titleDim = interpolate(frame, [b2.from, b2.from + 25], [1, 0.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 清单：b4 起退成背景
  const listDim = interpolate(frame, [b4.from, b4.from + 25], [1, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 讲解位高亮：b2 期间依次点亮第 6、7、8 位
  const activeIndex =
    frame < b2.from + 60 ? -1 : frame < b2.from + 140 ? 5 : frame < b2.from + 200 ? 6 : 7;

  // 光盘数据轨写入进度：b4 期间 0.3 → 1
  const writeProgress = interpolate(
    frame,
    [b4.from + 20, b4.to - 20],
    [0.3, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <><AbsoluteFill style={{ background: "#050607" }}>
        <CameraRig beatMap={demoBeatMap} viewWidth={1920} viewHeight={1080}>
          <GridBackground width={stage.width} height={stage.height} />

          {/* 标题：中心偏上（约 500px 宽，水平居中于 x=1100） */}
          <div style={{ position: "absolute", left: 850, top: 250, opacity: titleDim }}>
            <OutlineTitle solid="8" outline="bit" fontSize={230} delay={8} />
          </div>

          {/* 比特行：画面中心（约 900px 宽） */}
          <div style={{ position: "absolute", left: 650, top: 636, opacity: bitDim }}>
            <BitRow
              bits={["0", "0", "0", "0", "0", "0", "1", "1"]}
              delay={b2.from + 10}
              activeIndex={activeIndex}
            />
          </div>

          {/* 音轨清单：画面中心（1080px 宽，水平居中） */}
          <div style={{ position: "absolute", left: 560, top: 500, width: 1080, opacity: listDim }}>
            <TrackList items={TRACKS} delay={b3.from + 12} />
          </div>

          {/* 光盘：画面中心（从右侧飞入后落定于此）；700px 盒子的视觉中心在 top+350 */}
          <div style={{ position: "absolute", left: 750, top: 300 }}>
            <CdDisc delay={b4.from + 8} writeProgress={writeProgress} />
          </div>
        </CameraRig>
        {/* 屏幕空间暗角：压在相机之上，四边微微压暗，画面更沉浸 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 75% 70% at 50% 46%, transparent 62%, rgba(0,0,0,0.5) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* 字幕固定在屏幕上（不进相机层） */}
        <Captions beats={beats} />
      </AbsoluteFill></>
  );
};
