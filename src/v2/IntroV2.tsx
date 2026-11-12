import React from "react";
import { AbsoluteFill, Audio, Freeze, Img, staticFile, useCurrentFrame } from "remotion";
import { NewParadigmVideo } from "../NewParadigmVideo";
import { GeminiV2 } from "./GeminiV2";
import { ParadigmV2 } from "./ParadigmV2";
import { cues as rawCues } from "./cues/intro";
import type { Cue, Rect } from "./kit";
import { Captions, Ground, Doc, PORTAL_COVER_R, lookAt, portalChild, tileParent } from "./kit";
import type { Move, T } from "./space";
import { EASE, ID, VIEW_H, VIEW_W, compose, frameOn, prog } from "./space";
import { Place, World } from "./World";
import { C, Counter, F, Plate, Rise, RollSwap } from "./type";

/**
 * IntroV2 —— mg-blueprint 介绍视频（2 分 03 秒）。
 *
 * 素材卡：
 *   voiceover.mp3 / captions.srt   口播 123 秒，69 句
 *   github.png      2515×1230 仓库页截图，够清晰，可以推到局部（约 2.4 倍）
 *   check.png       1880×1176 真实的自检总览图（ParadigmV2），第 3 格是标红的空画面
 *   assets-sheet.jpg 1920×1350 真实的素材体检总览图（门店视频）
 *   p-*.jpg         各合成的静帧，用于"一张一张看图"和全景里的缩略图
 *   新旧对比与镜头演示不贴 mp4，直接把 NewParadigmVideo / ParadigmV2 / GeminiV2 嵌进来实时渲染
 *
 * 世界布局：开场标题 A → 推进句号里的圆点 → 满幅新版动画 P1 → 拉出成 B 里的一块屏，
 * 之后的 16 个站位排成 4 列蛇形网格，镜头依次甩过去；讲"无限大的画布"时拉远看全景。
 */

const f = (sec: number) => Math.round(sec * 30);
const TOTAL = 3700;

// ───────────── 世界坐标 ─────────────
const A: T = ID;
const DOT = { x: 905, y: 846, r: 44 };
const P1: T = portalChild(A, DOT);
const TILE_B: Rect = { x: 90, y: 110, w: 1056, h: 594 };
const B: T = tileParent(P1, TILE_B);
const at = (x: number, y: number, r = 0): T => compose(B, { x, y, s: 1, r });
const C1 = at(2500, 0, 3);
const C2 = at(5000, 0, -3);
const D1 = at(7500, 0, 2);
const D2 = at(7500, 1500, -2);
const E = at(5000, 1500, 3);
const Fs = at(2500, 1500, -3);
const G = at(0, 1500, 2);
const H1 = at(0, 3000, -3);
const H2 = at(2500, 3000, 2);
const H3 = at(5000, 3000, 0);
const I1 = at(7500, 3000, -2);
const I2 = at(7500, 4500, 0);
const I3 = at(5000, 4500, 3);
const I4 = at(2500, 4500, -2);
const J = at(0, 4500, 3);
const Ks = at(0, 6000, 0);

const TILE_G: Rect = { x: 800, y: 150, w: 1056, h: 594 };
const G_TILE: T = compose(G, { x: TILE_G.x, y: TILE_G.y, s: TILE_G.w / VIEW_W, r: 0 });
const SHEET: T = compose(H3, { x: 377, y: 205, s: 0.62, r: 0 });
const RED_CELL: Rect = { x: 890, y: -20, w: 570, h: 320.6 };
const GITHUB: T = compose(Ks, { x: 55, y: 30, s: 0.72, r: 0 });
const STAR_RECT: Rect = { x: 1300, y: 20, w: 800, h: 450 };
const OVERVIEW_RECT: Rect = { x: -400, y: -300, w: 10560, h: 5940 };

// ───────────── 时间轴（帧） ─────────────
const K = {
  pushDot: 168,
  inDot: 192,
  pullB: 309,
  toOld: 513,
  toNew: 768,
  toD1: 954,
  toD2: 1146,
  toE: 1362,
  toF: 1494,
  toG: 1719,
  fillG: 1809,
  toH1: 1944,
  toH2: 2055,
  toH3: 2334,
  pushRed: 2421,
  backH3: 2553,
  toI1: 2664,
  overview: 2763,
  toI2: 2859,
  toI3: 3021,
  toI4: 3192,
  toJ: 3357,
  toK: 3516,
  pushStar: 3588,
};

export const INTRO_MOVES: Move[] = [
  { at: K.pushDot, dur: 24, to: frameOn(P1), ease: EASE.push },
  { at: K.pullB, dur: 24, to: frameOn(B), ease: EASE.push },
  { at: K.toOld, dur: 15, to: frameOn(C1) },
  { at: K.toNew, dur: 15, to: frameOn(C2) },
  { at: K.toD1, dur: 15, to: frameOn(D1) },
  { at: K.toD2, dur: 15, to: frameOn(D2) },
  { at: K.toE, dur: 15, to: frameOn(E) },
  { at: K.toF, dur: 15, to: frameOn(Fs) },
  { at: K.toG, dur: 15, to: frameOn(G) },
  { at: K.fillG, dur: 20, to: lookAt(G, TILE_G), ease: EASE.push },
  { at: K.toH1, dur: 18, to: frameOn(H1) },
  { at: K.toH2, dur: 15, to: frameOn(H2) },
  { at: K.toH3, dur: 15, to: frameOn(H3) },
  { at: K.pushRed, dur: 20, to: lookAt(SHEET, RED_CELL), ease: EASE.push },
  { at: K.backH3, dur: 20, to: frameOn(H3), ease: EASE.push },
  { at: K.toI1, dur: 15, to: frameOn(I1) },
  { at: K.overview, dur: 34, to: lookAt(B, OVERVIEW_RECT), ease: EASE.push },
  { at: K.toI2, dur: 26, to: frameOn(I2), ease: EASE.push },
  { at: K.toI3, dur: 15, to: frameOn(I3) },
  { at: K.toI4, dur: 15, to: frameOn(I4) },
  { at: K.toJ, dur: 15, to: frameOn(J) },
  { at: K.toK, dur: 15, to: frameOn(Ks) },
  { at: K.pushStar, dur: 22, to: lookAt(GITHUB, STAR_RECT), ease: EASE.push },
];

// ───────────── 字幕：把从词中间断开的相邻两句合并显示 ─────────────
const mergeCues = (cues: Cue[], firstOfPair: number[]): Cue[] => {
  const out: Cue[] = [];
  for (let i = 0; i < cues.length; i++) {
    if (firstOfPair.includes(i + 1) && cues[i + 1]) {
      out.push({ start: cues[i].start, end: cues[i + 1].end, text: cues[i].text + cues[i + 1].text });
      i++;
    } else out.push(cues[i]);
  }
  return out;
};
const CUES = mergeCues(rawCues, [2, 6, 28, 30, 52, 59]);

// ───────────── 小工具 ─────────────
const abs = (x: number, y: number): React.CSSProperties => ({ position: "absolute", left: x, top: y });
const heavy: React.CSSProperties = { fontFamily: F.cn, fontWeight: 900, color: C.paper };
const dimText = "rgba(244,243,239,0.7)";
const typed = (text: string, frame: number, start: number, cps = 1.3) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) * cps)));

/** 把另一个合成嵌进来当画面：local 是那个合成自己的帧号 */
const Embed: React.FC<{ local: number; children: React.ReactNode }> = ({ local, children }) => (
  <div data-asset style={{ position: "absolute", left: 0, top: 0, width: VIEW_W, height: VIEW_H, overflow: "hidden" }}>
    <Freeze frame={Math.max(0, Math.round(local))}>{children}</Freeze>
  </div>
);

const Poster: React.FC<{ src: string }> = ({ src }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: VIEW_W, height: VIEW_H }} />
);

/** 角标：压在嵌入画面右上角 */
const Corner: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", right: 70, top: 56, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
    {children}
  </div>
);

// ───────────── A：开场标题 ─────────────
const SceneOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const dot = prog(frame, 150, 12);
  return (
    <>
      <Rise text="哈喽，大家好" at={8} stagger={2} style={{ ...heavy, ...abs(140, 70), fontSize: 84, fontWeight: 700, color: dimText }} />
      <div style={{ ...abs(140, 200), display: "flex", alignItems: "center", gap: 26 }}>
        <Rise text="我用" at={42} style={{ ...heavy, fontSize: 110 }} />
        <Plate at={f(2.3)} enter="drop" bg={C.red} size={110} font={F.num}>
          Fable 5.2
        </Plate>
      </div>
      <Rise text="把动画组件" at={f(3.7)} stagger={2} style={{ ...heavy, ...abs(130, 380), fontSize: 215 }} />
      <Rise text="重构了" at={f(4.75)} stagger={3} style={{ ...heavy, ...abs(130, 640), fontSize: 215, color: C.red }} />
      {/* 句号：圆点里装着下一场 */}
      <div
        style={{
          ...abs(DOT.x - DOT.r - 14, DOT.y - DOT.r - 14),
          width: (DOT.r + 14) * 2,
          height: (DOT.r + 14) * 2,
          borderRadius: "50%",
          border: `8px solid ${C.red}`,
          boxSizing: "border-box",
          transform: `scale(${dot})`,
        }}
      />
    </>
  );
};

// ───────────── B：适用范围 ─────────────
const SceneScope: React.FC = () => (
  <>
    <Rise text="适用于" at={K.pullB + 14} style={{ ...heavy, ...abs(1200, 110), fontSize: 84, fontWeight: 700, color: dimText }} />
    <Plate at={f(11.0)} enter="wipe" bg={C.paper} color={C.ink} size={150} style={abs(1200, 230)}>
      知识分享
    </Plate>
    <Rise text="口播视频" at={f(11.9)} stagger={2} style={{ ...heavy, ...abs(1196, 440), fontSize: 150 }} />
    <Plate at={f(13.4)} enter="flip" bg={C.red} size={104} style={abs(90, 760)}>
      带视觉能力的模型
    </Plate>
    <Rise text="都能接入" at={f(15.5)} stagger={2} style={{ ...heavy, ...abs(1100, 730), fontSize: 170 }} />
  </>
);

// ───────────── D1：准备素材 ─────────────
const FILES = [
  { name: "口播.mp3", at: f(35.3), color: C.red },
  { name: "字幕.srt", at: f(36.0), color: C.green },
  { name: "录屏.mp4", at: f(36.7), color: "#4C8DFF" },
  { name: "截图.png", at: f(37.2), color: C.paper },
];
const ScenePrepare: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Rise text="这套流程" at={K.toD1 + 8} style={{ ...heavy, ...abs(140, 90), fontSize: 90, fontWeight: 700, color: dimText }} />
      <Rise text="非常简单" at={f(32.6)} stagger={2} style={{ ...heavy, ...abs(130, 200), fontSize: 215 }} />
      <Rise text="开始前只做一件事" at={f(33.8)} stagger={1} style={{ ...heavy, ...abs(140, 520), fontSize: 80, fontWeight: 700, color: dimText }} />
      <Plate at={f(34.8)} enter="wipe" bg={C.red} size={104} style={abs(140, 660)}>
        素材放进文件夹
      </Plate>
      {/* 文件夹 */}
      <div
        style={{
          ...abs(1120, 120),
          width: 690,
          height: 800,
          boxSizing: "border-box",
          border: `6px solid ${C.paper}`,
          clipPath: `inset(0 0 ${(1 - prog(frame, f(34.6), 14)) * 100}% 0)`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 52, color: C.ink, background: C.paper, padding: "14px 30px 18px" }}>
          public/我的视频/
        </div>
        {FILES.map((file, i) => {
          const p = prog(frame, file.at, 12);
          if (p <= 0) return null;
          return (
            <div
              key={file.name}
              style={{
                ...abs(34, 130 + i * 160),
                display: "flex",
                alignItems: "center",
                gap: 30,
                transform: `translateY(${(1 - p) * -130}px)`,
                opacity: Math.min(1, p * 3),
              }}
            >
              <div style={{ width: 96, height: 96, background: file.color }} />
              <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 78, color: C.paper }}>{file.name}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ───────────── D2：发给 AI ─────────────
const PROMPT = ["用 mg-blueprint 帮我做一条视频，", "严格按 WORKFLOW-V2.md 的流程走。", "先给我看素材体检和分镜方案，", "做完先给我看抽帧总览图。"];
const ScenePrompt: React.FC = () => {
  const frame = useCurrentFrame();
  const start = K.toD2 + 22;
  let budget = Math.max(0, Math.floor((frame - start) * 1.15));
  const second = "素材在 public/我的视频/";
  return (
    <>
      <Rise text="把这段话" at={K.toD2 + 10} style={{ ...heavy, ...abs(120, 110), fontSize: 110 }} />
      <Plate at={f(40.0)} enter="drop" bg={C.red} size={120} style={abs(120, 270)}>
        发给 AI 助手
      </Plate>
      <Rise text="提示词在简介里" at={f(38.9)} stagger={1} style={{ ...heavy, ...abs(124, 500), fontSize: 70, fontWeight: 700, color: dimText }} />
      <div
        style={{
          ...abs(900, 100),
          width: 930,
          height: 470,
          background: C.paper,
          boxSizing: "border-box",
          padding: "44px 46px",
          fontFamily: F.cn,
          fontWeight: 700,
          fontSize: 50,
          lineHeight: 1.9,
          color: C.ink,
          clipPath: `inset(0 ${(1 - prog(frame, K.toD2 + 6, 14)) * 100}% 0 0)`,
        }}
      >
        {PROMPT.map((line, i) => {
          const shown = line.slice(0, budget);
          budget = Math.max(0, budget - line.length);
          return (
            <div key={i} style={{ whiteSpace: "nowrap", height: 95 }}>
              {shown}
            </div>
          );
        })}
      </div>
      {frame >= f(42.4) && (
        <div
          style={{
            ...abs(900, 620),
            width: 930,
            boxSizing: "border-box",
            background: C.red,
            padding: "26px 46px 32px",
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 60,
            color: C.paper,
            whiteSpace: "nowrap",
            clipPath: `inset(0 ${(1 - prog(frame, f(42.4), 12)) * 100}% 0 0)`,
          }}
        >
          {typed(second, frame, f(42.6), 0.6)}
          <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}>▌</span>
        </div>
      )}
    </>
  );
};

// ───────────── E：先看素材 ─────────────
const SceneLook: React.FC = () => {
  const frame = useCurrentFrame();
  const scan = prog(frame, K.toE + 20, 60, EASE.inOut);
  return (
    <>
      <Rise text="先用眼睛" at={K.toE + 10} stagger={2} style={{ ...heavy, ...abs(110, 120), fontSize: 130 }} />
      <Plate at={f(46.6)} enter="wipe" bg={C.paper} color={C.ink} size={140} style={abs(110, 300)}>
        看一遍素材
      </Plate>
      <Plate at={f(48.2)} enter="drop" bg={C.red} size={110} style={abs(110, 600)}>
        构图 · 留白
      </Plate>
      <Place t={{ x: 880, y: 130, s: 0.5, r: 0 }} w={1920} h={1350}>
        <Doc
          src="intro/assets-sheet.jpg"
          w={1920}
          h={1350}
          marks={[
            { x: 8, y: 6, w: 464, h: 78, at: f(48.3), color: C.red },
            { x: 968, y: 276, w: 464, h: 62, at: f(48.7), color: C.red },
            { x: 488, y: 1010, w: 464, h: 64, at: f(49.1), color: C.red },
          ]}
        />
        {scan > 0 && scan < 1 && (
          <div style={{ ...abs(scan * 1920 - 8, 0), width: 16, height: 1350, background: C.red, opacity: 0.85 }} />
        )}
      </Place>
    </>
  );
};

// ───────────── F：只约束底层，编排跟内容走 ─────────────
const CHIPS = ["镜头", "缓动", "运动模糊", "字号"];
const ROWS = [
  ["0:00", "标题", "推进圆点"],
  ["0:17", "新旧对比", "甩镜"],
  ["0:45", "素材体检", "取景到局部"],
];
const SceneCore: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Rise text="核心思路" at={K.toF + 10} style={{ ...heavy, ...abs(120, 60), fontSize: 80, fontWeight: 700, color: dimText }} />
      {/* 上层：编排 */}
      {frame >= f(53.5) && (
        <div style={{ ...abs(120, 180), width: 1680 }}>
          <Plate at={f(53.6)} enter="wipe" bg={C.red} size={92}>
            编排 · 跟着你的内容走
          </Plate>
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            {ROWS.map((row, i) => {
              const p = prog(frame, f(55.2) + i * 7, 12);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 40,
                    alignItems: "center",
                    border: "4px solid rgba(244,243,239,0.5)",
                    padding: "8px 30px 12px",
                    fontFamily: F.cn,
                    fontWeight: 700,
                    fontSize: 56,
                    color: C.paper,
                    opacity: Math.min(1, p * 3),
                    transform: `translateX(${(1 - p) * 120}px)`,
                  }}
                >
                  <span style={{ fontFamily: F.mono, color: dimText, width: 190 }}>{row[0]}</span>
                  <span style={{ width: 560 }}>{row[1]}</span>
                  <span style={{ color: C.red }}>→ {row[2]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* 底层：锁死 */}
      <div
        style={{
          ...abs(120, 690),
          width: 1680,
          height: 230,
          boxSizing: "border-box",
          border: `6px solid ${C.paper}`,
          clipPath: `inset(0 ${(1 - prog(frame, f(51.0), 14)) * 100}% 0 0)`,
        }}
      />
      <Plate at={f(51.2)} enter="wipe" bg={C.paper} color={C.ink} size={84} style={abs(120, 690)}>
        底层动效 · 锁死
      </Plate>
      {CHIPS.map((chip, i) => {
        const p = prog(frame, f(52.0) + i * 6, 12);
        return (
          <div
            key={chip}
            style={{
              ...abs(170 + i * 395, 828),
              ...heavy,
              fontSize: 60,
              opacity: Math.min(1, p * 3),
              transform: `translateY(${(1 - p) * 40}px)`,
            }}
          >
            {chip}
          </div>
        );
      })}
    </>
  );
};

// ───────────── G：点头之后开始排 ─────────────
const SceneBuild: React.FC = () => (
  <>
    <Rise text="你点头" at={K.toG + 12} stagger={3} style={{ ...heavy, ...abs(110, 150), fontSize: 190 }} />
    <Rise text="它动手" at={f(58.5)} stagger={3} style={{ ...heavy, ...abs(110, 390), fontSize: 190, color: C.red }} />
    <Rise text="排画面" at={f(59.3)} stagger={2} style={{ ...heavy, ...abs(118, 640), fontSize: 110, fontWeight: 700, color: dimText }} />
  </>
);

// ───────────── H1：自检 ─────────────
const SceneCheckTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const stamp = prog(frame, f(67.4), 9);
  return (
    <>
      <Rise text="生成完，还要跑一次" at={K.toH1 + 12} stagger={1} style={{ ...heavy, ...abs(140, 90), fontSize: 88, fontWeight: 700, color: dimText }} />
      <Rise text="自检" at={f(66.2)} stagger={4} style={{ ...heavy, ...abs(120, 210), fontSize: 430, lineHeight: 1.1 }} />
      {stamp > 0 && (
        <div
          style={{
            ...abs(1010, 480),
            border: `12px solid ${C.red}`,
            borderRadius: 24,
            color: C.red,
            fontFamily: F.cn,
            fontWeight: 900,
            fontSize: 140,
            lineHeight: 1.15,
            padding: "10px 44px 20px",
            whiteSpace: "nowrap",
            background: "rgba(12,13,16,0.9)",
            transform: `rotate(-7deg) scale(${2.5 - 1.5 * stamp})`,
            opacity: Math.min(1, stamp * 2.5),
          }}
        >
          这点很重要
        </div>
      )}
    </>
  );
};

// ───────────── H2：以前一张一张看 ─────────────
const SINGLES = ["p-0015", "p-0101", "p-0152", "p-0242", "p-0311", "p-0401"];
const SceneOneByOne: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = f(69.4);
  const idx = Math.max(0, Math.floor((frame - t0) / 16));
  const cur = SINGLES[idx % SINGLES.length];
  const flip = prog(frame, t0 + idx * 16, 8);
  return (
    <>
      <Plate at={K.toH2 + 12} enter="wipe" bg={C.paper} color={C.ink} size={92} style={abs(110, 70)}>
        以前
      </Plate>
      <Rise text="一张一张看图" at={f(69.6)} stagger={2} style={{ ...heavy, ...abs(400, 78), fontSize: 100 }} />
      <div style={{ ...abs(100, 215), width: 1100, height: 619, overflow: "hidden", border: `6px solid ${C.paper}` }}>
        <Img
          src={staticFile(`intro/${cur}.jpg`)}
          style={{ width: 1100, height: 619, display: "block", transform: `translateX(${(1 - flip) * 1100}px)` }}
        />
      </div>
      <div style={{ ...abs(100, 855), fontFamily: F.num, fontWeight: 900, fontSize: 96, color: dimText }}>
        第 {idx + 1} 张
      </div>
      <Rise text="看不出前后帧" at={f(71.5)} stagger={1} style={{ ...heavy, ...abs(1256, 240), fontSize: 92 }} />
      <Rise text="有什么关系" at={f(72.6)} stagger={1} style={{ ...heavy, ...abs(1256, 350), fontSize: 92 }} />
      <Plate at={f(73.9)} enter="drop" bg={C.paper} color={C.ink} size={96} style={abs(1256, 500)}>
        效率低
      </Plate>
      {frame >= f(74.9) && (
        <div style={{ ...abs(1256, 650), display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: F.num, fontWeight: 900, fontSize: 56, color: dimText }}>TOKEN</span>
          <Counter to={48000} at={f(74.9)} dur={40} style={{ fontSize: 104, color: C.red, lineHeight: 1 }} />
        </div>
      )}
      <Plate at={f(76.2)} enter="wipe" bg={C.red} size={84} style={abs(1256, 800)}>
        问题还难发现
      </Plate>
    </>
  );
};

// ───────────── H3：一条命令，一张总览图 ─────────────
const CMD = "$ node scripts/stills.mjs ParadigmV2";
const SceneSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const say = "第 3 格那帧，再给点内容";
  return (
    <>
      <div
        style={{
          ...abs(110, 50),
          width: 1700,
          boxSizing: "border-box",
          border: "5px solid rgba(244,243,239,0.55)",
          padding: "16px 34px 22px",
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 64,
          color: C.termGreen,
          whiteSpace: "nowrap",
        }}
      >
        {typed(CMD, frame, K.toH3 + 12, 1.1)}
        <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}>▌</span>
      </div>
      {frame >= f(86.5) && frame < K.toI1 + 30 && (
        <div
          style={{
            ...abs(830, 730),
            background: C.paper,
            color: C.ink,
            fontFamily: F.cn,
            fontWeight: 900,
            fontSize: 72,
            padding: "18px 40px 26px",
            whiteSpace: "nowrap",
            transform: `translateY(${(1 - prog(frame, f(86.5), 12)) * 80}px)`,
            opacity: prog(frame, f(86.5), 6),
          }}
        >
          {typed(say, frame, f(86.7), 0.5)}
        </div>
      )}
    </>
  );
};

// ───────────── I1：镜头系统 ─────────────
const SceneCamera: React.FC = () => (
  <>
    <Rise text="这次改动最大的" at={K.toI1 + 10} stagger={1} style={{ ...heavy, ...abs(140, 170), fontSize: 92, fontWeight: 700, color: dimText }} />
    <Rise text="镜头系统" at={f(90.4)} stagger={3} style={{ ...heavy, ...abs(120, 300), fontSize: 300, lineHeight: 1.1 }} />
  </>
);

// ───────────── J：提醒 ─────────────
const SceneNote: React.FC = () => (
  <>
    <Plate at={K.toJ + 12} enter="wipe" bg={C.paper} color={C.ink} size={92} style={abs(130, 90)}>
      提醒一下
    </Plate>
    <Rise text="口播 + 字幕" at={f(112.8)} stagger={2} style={{ ...heavy, ...abs(120, 260), fontSize: 215 }} />
    <Rise text="要提前备好" at={f(113.6)} stagger={2} style={{ ...heavy, ...abs(130, 510), fontSize: 130, fontWeight: 700, color: dimText }} />
    <Plate at={f(114.8)} enter="drop" bg={C.red} size={100} style={abs(130, 720)}>
      目前只在 Windows 上测过
    </Plate>
  </>
);

export const IntroV2: React.FC<{ checkFrames?: unknown }> = () => {
  const frame = useCurrentFrame();
  /** 拉远看全景的那一段：所有站位同时可见，嵌入的合成换成静帧以免同时渲染太多 */
  const ov = frame >= K.overview - 4 && frame < K.toI2 + 30;
  const live = (a: number, b: number) => frame >= a - 22 && frame < b + 26;
  const show = (a: number, b: number) => live(a, b) || ov;

  const insideDot = frame >= K.inDot;
  const tileRadius = prog(frame, K.pullB, 20, EASE.inOut) * 46;
  const fill = prog(frame, K.fillG, 20, EASE.inOut);

  // 旧版：先正常播，说到"再切一张"时跳到下一次换卡片
  const oldLocal = frame < 698 ? frame - 387 : 518 + (frame - 698);
  const newLocal = Math.min(700, 100 + (frame - 783) * 1.5);

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Audio src={staticFile("intro/voiceover.mp3")} />

      <World start={frameOn(A)} moves={INTRO_MOVES}>
        {/* 背景网格铺在世界上，跟着镜头动。开场一张，进了圆点之后换成大画布那张 */}
        {frame < K.inDot ? (
          <Ground rect={{ x: -480, y: -360, w: 2880, h: 1800 }} />
        ) : (
          <Place t={B} w={0} h={0} style={{ overflow: "visible" }}>
            <Ground rect={{ x: -2400, y: -1920, w: 14400, h: 11040 }} />
          </Place>
        )}
        {frame < K.inDot + 6 && (
          <Place t={A}>
            <SceneOpen />
          </Place>
        )}

        {/* B 的文字先摆好，P1 拉出时它已经在周围 */}
        {show(K.pullB, K.toOld) && frame >= K.pullB - 2 && (
          <Place t={B}>
            <SceneScope />
          </Place>
        )}

        {/* P1：句号里的新版动画，推进后满幅，再拉出成 B 里的一块屏 */}
        {frame >= 140 && (live(140, K.toOld) || ov) && (
          <Place t={P1} style={{ overflow: "visible" }}>
            {insideDot ? (
              <div style={{ position: "absolute", left: 0, top: 0, width: VIEW_W, height: VIEW_H, overflow: "hidden", borderRadius: tileRadius }}>
                {ov ? <Poster src="intro/p-0491.jpg" /> : <Embed local={frame - 42}><ParadigmV2 embedded /></Embed>}
              </div>
            ) : (
              <div
                style={{
                  position: "absolute",
                  left: VIEW_W / 2 - PORTAL_COVER_R,
                  top: VIEW_H / 2 - PORTAL_COVER_R,
                  width: PORTAL_COVER_R * 2,
                  height: PORTAL_COVER_R * 2,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: C.land,
                  clipPath: `circle(${prog(frame, 152, 12) * 50}% at 50% 50%)`,
                }}
              >
                <div style={{ position: "absolute", left: PORTAL_COVER_R - VIEW_W / 2, top: PORTAL_COVER_R - VIEW_H / 2, width: VIEW_W, height: VIEW_H }}>
                  <Embed local={150}>
                    <ParadigmV2 embedded />
                  </Embed>
                </div>
              </div>
            )}
          </Place>
        )}

        {/* C1：旧版 */}
        {show(K.toOld, K.toNew) && (
          <Place t={C1} style={{ overflow: "hidden" }}>
            {ov ? <Poster src="intro/p-old.jpg" /> : <Embed local={oldLocal}><NewParadigmVideo embedded /></Embed>}
            <Corner>
              <Plate at={K.toOld + 14} enter="wipe" bg={C.paper} color={C.ink} size={110}>
                旧版
              </Plate>
              <RollSwap
                height={150}
                style={{ width: 760, display: "flex", justifyContent: "flex-end" }}
                items={[
                  { at: f(20.4), node: <div style={{ ...heavy, position: "absolute", right: 0, fontSize: 88, background: C.ink, padding: "10px 28px 16px", whiteSpace: "nowrap" }}>中间一张小卡片</div> },
                  { at: f(22.3), node: <div style={{ ...heavy, position: "absolute", right: 0, fontSize: 88, background: C.ink, padding: "10px 28px 16px", whiteSpace: "nowrap" }}>切一张，再切一张</div> },
                  { at: f(24.1), node: <div style={{ ...heavy, position: "absolute", right: 0, fontSize: 88, background: C.red, padding: "10px 28px 16px", whiteSpace: "nowrap" }}>镜头是死的</div> },
                ]}
              />
            </Corner>
          </Place>
        )}

        {/* C2：新版，同一段口播同一批素材 */}
        {show(K.toNew, K.toD1) && (
          <Place t={C2} style={{ overflow: "hidden" }}>
            {ov ? <Poster src="intro/p-0137.jpg" /> : <Embed local={newLocal}><ParadigmV2 embedded /></Embed>}
            <Corner>
              <Plate at={K.toNew + 14} enter="wipe" bg={C.red} size={110}>
                现在
              </Plate>
              <RollSwap
                height={150}
                out={f(29.2)}
                style={{ width: 760 }}
                items={[
                  { at: f(26.7), node: <div style={{ ...heavy, position: "absolute", right: 0, fontSize: 88, background: C.ink, padding: "10px 28px 16px", whiteSpace: "nowrap" }}>同一段音频</div> },
                  { at: f(27.9), node: <div style={{ ...heavy, position: "absolute", right: 0, fontSize: 88, background: C.ink, padding: "10px 28px 16px", whiteSpace: "nowrap" }}>同一批素材</div> },
                ]}
              />
            </Corner>
          </Place>
        )}

        {show(K.toD1, K.toD2) && <Place t={D1}><ScenePrepare /></Place>}
        {show(K.toD2, K.toE) && <Place t={D2}><ScenePrompt /></Place>}
        {show(K.toE, K.toF) && <Place t={E}><SceneLook /></Place>}
        {show(K.toF, K.toG) && <Place t={Fs}><SceneCore /></Place>}

        {/* G：左边文字，右边一块屏；说到"铺满"时镜头推进这块屏 */}
        {show(K.toG, K.toH1) && (
          <>
            <Place t={G} style={{ opacity: ov ? 1 : 1 - fill }}>
              <SceneBuild />
            </Place>
            <Place t={G_TILE} style={{ overflow: "hidden", borderRadius: (1 - fill) * 40 }}>
              {ov ? <Poster src="intro/p-gem.jpg" /> : <Embed local={frame - 1650}><GeminiV2 embedded /></Embed>}
              {!ov && (
                <div style={{ position: "absolute", left: 70, top: 600, display: "flex", alignItems: "flex-end", gap: 0 }}>
                  <Plate at={f(61.9)} enter="wipe" bg={C.ink} size={130}>
                    最小字号
                  </Plate>
                  <Plate at={f(63.0)} enter="drop" bg={C.red} size={230} font={F.num}>
                    48px
                  </Plate>
                </div>
              )}
            </Place>
          </>
        )}

        {show(K.toH1, K.toH2) && <Place t={H1}><SceneCheckTitle /></Place>}
        {show(K.toH2, K.toH3) && <Place t={H2}><SceneOneByOne /></Place>}

        {/* H3：命令 + 真实的自检总览图，镜头推到标红的那一格再拉回 */}
        {show(K.toH3, K.toI1) && (
          <>
            <Place t={SHEET} w={1880} h={1176} style={{ clipPath: ov ? undefined : `inset(0 0 ${(1 - prog(frame, f(79.6), 14)) * 100}% 0)` }}>
              <Doc src="intro/check.png" w={1880} h={1176} marks={[{ x: 936, y: 26, w: 478, h: 272, at: f(80.9), color: C.red }]} />
              {frame < K.backH3 + 3 && (<>
              <div style={{ position: "absolute", left: 962, top: 96 }}>
                <Plate at={f(81.2)} enter="wipe" bg={C.red} size={30}>
                  空画面 · 自动标红
                </Plate>
              </div>
              <div style={{ position: "absolute", left: 962, top: 170 }}>
                <Plate at={f(82.8)} enter="drop" bg={C.paper} color={C.ink} size={30}>
                  小模型也有下限
                </Plate>
              </div>
              </>)}
            </Place>
            <Place t={H3}>
              <SceneSheet />
            </Place>
          </>
        )}

        {show(K.toI1, K.toI2) && <Place t={I1}><SceneCamera /></Place>}

        {/* I2：推进圆点 */}
        {show(K.toI2, K.toI3) && (
          <Place t={I2} style={{ overflow: "hidden" }}>
            {ov && frame < K.toI2 + 18 ? <Poster src="intro/p-0101.jpg" /> : <Embed local={Math.max(86, frame - 2800)}><ParadigmV2 embedded /></Embed>}
            <Corner>
              <Plate at={f(97.6)} enter="drop" bg={C.red} size={210} font={F.num}>
                ×18
              </Plate>
            </Corner>
          </Place>
        )}

        {/* I3：拉出成小屏 */}
        {show(K.toI3, K.toI4) && (
          <Place t={I3} style={{ overflow: "hidden" }}>
            {ov ? <Poster src="intro/p-0491.jpg" /> : <Embed local={Math.min(618, frame - 2559)}><ParadigmV2 embedded /></Embed>}
          </Place>
        )}

        {/* I4：截图原地长出来 */}
        {show(K.toI4, K.toJ) && (
          <Place t={I4} style={{ overflow: "hidden" }}>
            {ov ? <Poster src="intro/p-gem.jpg" /> : <Embed local={frame - 2972}><GeminiV2 embedded /></Embed>}
          </Place>
        )}

        {show(K.toJ, K.toK) && <Place t={J}><SceneNote /></Place>}

        {/* K：开源 */}
        {frame >= K.toK - 22 && (
          <>
            <Place t={GITHUB} w={2515} h={1230}>
              <Doc
                src="intro/github.png"
                w={2515}
                h={1230}
                radius={10}
                marks={[
                  { x: 494, y: 134, w: 206, h: 54, at: K.toK + 26, color: C.red },
                  { x: 1856, y: 138, w: 130, h: 46, at: K.pushStar + 26, color: C.red },
                ]}
              />
              <div style={{ position: "absolute", left: 1330, top: 262, display: "flex", gap: 18 }}>
                <Plate at={f(120.7)} enter="drop" bg={C.ink} size={58}>关注</Plate>
                <Plate at={f(121.2)} enter="drop" bg={C.red} size={58}>点赞</Plate>
                <Plate at={f(121.7)} enter="drop" bg={C.ink} size={58}>转发</Plate>
              </div>
            </Place>
            <Place t={Ks}>
              {frame < K.pushStar + 24 && (
                <Plate at={f(117.9)} enter="drop" bg={C.red} size={170} style={abs(1080, 560)}>
                  已开源
                </Plate>
              )}
            </Place>
          </>
        )}
      </World>

      {/* 全景时的屏幕固定文字 */}
      {frame >= f(92.9) && frame < K.toI2 + 8 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}>
          <Plate at={f(92.9)} out={K.toI2} enter="flip" bg={C.red} size={150}>
            一张无限大的画布
          </Plate>
        </div>
      )}

      <Captions cues={CUES} />
    </AbsoluteFill>
  );
};

export const INTRO_TOTAL = TOTAL;
