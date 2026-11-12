import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { cues } from "./cues/new-paradigm";
import type { Move, T } from "./space";
import { EASE, ID, VIEW_H, VIEW_W, compose, frameOn, prog } from "./space";
import { Clip, Place, World } from "./World";
import { C, Counter, F, Plate, Rise, RollSwap } from "./type";
import { Captions, PORTAL_COVER_R, portalChild, tileParent } from "./kit";

/**
 * ParadigmV2 —— 「新范式」前 24 秒重做（验证片段）。
 *
 * 世界布局（全部在同一张连续画布上，相机在其间移动）：
 *   S1 标题 ──甩镜──▶ SQ 提问 ──推进问号的点──▶ V1 小龙虾（满幅）
 *   ──向左甩镜──▶ V2 门店（满幅）──拉出──▶ S3A 接口往返（V2 缩成一块屏）
 *   ──甩镜──▶ S3B 慢 ──甩镜──▶ S3C Token
 */

const f = (sec: number) => Math.round(sec * 30);

// ───────────── 世界坐标 ─────────────
const S1: T = ID;
const SQ: T = { x: 2500, y: 900, s: 1, r: -6 };

/** 问号的"点"：圆心在 SQ 里的位置与半径。点里装着整个视频世界 */
const DOT = { x: 1530, y: 800, r: 60 };
/** 视频世界：原点 = V1 左上角。用 portalChild 换算，圆盘半径用 PORTAL_COVER_R 才能盖住整个画幅 */
const DISC_R = PORTAL_COVER_R;
const VL: T = portalChild(SQ, DOT);
const V1: T = VL;
const V2_LOCAL: T = { x: -2500, y: 0, s: 1, r: 0 };
const V2: T = compose(VL, V2_LOCAL);

/** S3A 里那块"屏"的位置：V2 满幅画面拉出后正好落在这里 */
const TILE = { x: 110, y: 210, w: 640, h: 360 };
const S3A: T = tileParent(V2, TILE);
const S3B: T = compose(S3A, { x: 2300, y: -160, s: 1, r: 5 });
const S3C: T = compose(S3A, { x: 2560, y: 1420, s: 0.8, r: -4 });

// ───────────── 时间轴（帧） ─────────────
const K = {
  toQuestion: 70,
  pushIn: 113,
  pushDone: 137,
  v1Start: 75,
  toStores: 281,
  v2Start: 285,
  pullOut: 522,
  pullDone: 547,
  toSlow: 624,
  toToken: 659,
};

export const PARADIGM_MOVES: Move[] = [
  { at: K.toQuestion, dur: 16, to: frameOn(SQ), ease: EASE.whip },
  { at: K.pushIn, dur: K.pushDone - K.pushIn, to: frameOn(V1), ease: EASE.push },
  { at: K.toStores, dur: 15, to: frameOn(V2), ease: EASE.whip },
  { at: K.pullOut, dur: K.pullDone - K.pullOut, to: frameOn(S3A), ease: EASE.push },
  { at: K.toSlow, dur: 14, to: frameOn(S3B), ease: EASE.whip },
  { at: K.toToken, dur: 14, to: frameOn(S3C), ease: EASE.whip },
];

const abs = (x: number, y: number): React.CSSProperties => ({ position: "absolute", left: x, top: y });
const heavy: React.CSSProperties = { fontFamily: F.cn, fontWeight: 900, color: C.paper };

// ───────────── S1：AI 越来越快 ─────────────
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const delays = [33, 40, 45, 49];
  const bar = prog(frame, 52, 9);
  return (
    <>
      <Rise text="AI 发展" at={9} stagger={3} style={{ ...heavy, ...abs(150, 200), fontSize: 150 }} />
      <div style={{ ...heavy, ...abs(140, 400), fontSize: 350, lineHeight: 1.1, whiteSpace: "nowrap" }}>
        {Array.from("越来越快").map((ch, i) => {
          const p = prog(frame, delays[i], 11);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `translateX(${(1 - p) * 620}px) skewX(${-26 + p * 18}deg)`,
                opacity: Math.min(1, p * 4),
                color: i === 3 ? C.red : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      {/* 速度线：跟着每个字冲进来 */}
      {delays.map((d, i) => {
        const p = prog(frame, d - 2, 14, EASE.inOut);
        if (p <= 0 || p >= 1) return null;
        return (
          <div
            key={i}
            style={{
              ...abs(0, 470 + i * 78),
              width: 900,
              height: 10,
              background: i === 3 ? C.red : C.paper,
              transform: `translateX(${2100 - p * 3200}px)`,
            }}
          />
        );
      })}
      <div
        style={{
          ...abs(150, 830),
          width: 1420,
          height: 22,
          background: C.red,
          transformOrigin: "0 50%",
          transform: `scaleX(${bar})`,
        }}
      />
    </>
  );
};

// ───────────── SQ：还需要专用工具吗？ ─────────────
const SceneQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = prog(frame, 88, 16, EASE.inOut);
  const ring = prog(frame, 100, 16);
  return (
    <>
      <Rise
        text="Agent 执行任务"
        at={78}
        stagger={1}
        style={{ ...heavy, ...abs(140, 215), fontSize: 92, color: "rgba(244,243,239,0.72)", fontWeight: 700 }}
      />
      <Rise text="还需要" at={82} stagger={2} style={{ ...heavy, ...abs(132, 340), fontSize: 215 }} />
      <div style={{ ...abs(140, 610), display: "flex", alignItems: "center", gap: 26 }}>
        <Plate at={88} bg={C.red} color={C.paper} size={190}>
          专用工具
        </Plate>
        <Rise text="吗" at={96} style={{ ...heavy, fontSize: 215 }} />
      </div>
      {/* 问号的钩：点由视频世界的圆盘充当 */}
      <svg style={abs(DOT.x - 200, DOT.y - 600)} width={400} height={520} viewBox="0 0 400 520">
        <path
          d="M 70 190 A 130 130 0 1 1 285 288 C 230 330 200 370 200 455"
          fill="none"
          stroke={C.red}
          strokeWidth={84}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      {ring > 0 && ring < 1 && (
        <div
          style={{
            ...abs(DOT.x - DOT.r, DOT.y - DOT.r),
            width: DOT.r * 2,
            height: DOT.r * 2,
            borderRadius: "50%",
            border: `6px solid ${C.paper}`,
            transform: `scale(${1 + ring * 1.5})`,
            opacity: 1 - ring,
          }}
        />
      )}
    </>
  );
};

// ───────────── V1 上的文字（小龙虾 → Codex → 范式在改变） ─────────────
const OverV1: React.FC = () => {
  const frame = useCurrentFrame();
  // 第一行被第二行打断：不等它停够，直接被顶飞
  const kick = prog(frame, 222, 10, EASE.in);
  const typed = "Codex".slice(0, Math.max(0, Math.floor((frame - 190) / 2.4)));
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  const arrow = prog(frame, 174, 10);
  return (
    <>
      {kick < 1 && (
        <div
          style={{
            ...abs(90, 70),
            display: "flex",
            alignItems: "center",
            gap: 26,
            transform: `translateY(${-kick * 330}px) rotate(${-kick * 5}deg)`,
            transformOrigin: "0 100%",
          }}
        >
          <Plate at={158} enter="drop" bg={C.red} size={120}>
            小龙虾
          </Plate>
          <svg width={150} height={60} viewBox="0 0 150 60">
            <path
              d="M 4 30 H 138 M 108 6 L 140 30 L 108 54"
              fill="none"
              stroke={C.ink}
              strokeWidth={12}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - arrow}
            />
          </svg>
          <Plate at={184} enter="wipe" bg={C.ink} color={C.termGreen} size={112} font={F.mono}>
            <span>{typed}</span>
            <span style={{ opacity: cursorOn ? 1 : 0 }}>▌</span>
          </Plate>
        </div>
      )}
      <div style={{ ...abs(90, 70), display: "flex", alignItems: "flex-start", gap: 0 }}>
        <Plate at={224} enter="wipe" bg={C.ink} size={132}>
          底层范式
        </Plate>
        <Plate at={244} enter="flip" bg={C.red} size={132}>
          正在改变
        </Plate>
      </div>
    </>
  );
};

// ───────────── V2 上的文字（专用工具 = 一件事跑一家店） ─────────────
const Analogy: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 26,
      background: C.paper,
      color: C.ink,
      fontFamily: F.cn,
      fontWeight: 900,
      fontSize: 104,
      lineHeight: 1.18,
      padding: "10.4px 31px 14.6px",
      whiteSpace: "nowrap",
    }}
  >
    {a}
    <span style={{ color: C.red }}>→</span>
    {b}
  </div>
);

const SlotPlate: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <div
    style={{
      display: "inline-block",
      background: bg,
      color: C.paper,
      fontFamily: F.cn,
      fontWeight: 900,
      fontSize: 104,
      lineHeight: 1.18,
      padding: "10.4px 31px 14.6px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const OverV2: React.FC = () => (
  <>
    <Plate at={291} out={512} enter="wipe" bg={C.ink} size={104} style={abs(80, 50)}>
      以前的 Agent
    </Plate>
    <RollSwap
      height={160}
      out={510}
      style={{ ...abs(772, 50), width: 1100 }}
      items={[
        { at: f(10.9), node: <SlotPlate bg={C.ink}>模型能力不够</SlotPlate> },
        {
          at: f(12.13),
          node: (
            <SlotPlate bg={C.red}>
              必须用<span style={{ color: C.ink }}>专用工具</span>
            </SlotPlate>
          ),
        },
        { at: f(13.7), node: <Analogy a="看书" b="书店" /> },
        { at: f(15.13), node: <Analogy a="看电影" b="电影院" /> },
        { at: f(16.37), node: <Analogy a="吃饭" b="餐厅" /> },
      ]}
    />
  </>
);

// ───────────── S3A：每干一件事，调一次接口 ─────────────
const CALLS = [
  { name: "read_file()", at: 556 },
  { name: "edit_code()", at: 569 },
  { name: "run_tests()", at: 582 },
];

const SceneCalls: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = CALLS.filter((c) => frame >= c.at + 4).length;
  const stamp = prog(frame, f(19.8), 9, EASE.out);
  const rowX = 850;
  const chipW = 560;
  const modelX = 1580;
  return (
    <>
      <Plate at={540} enter="drop" bg={C.red} size={66} style={abs(TILE.x, TILE.y - 124)}>
        旧范式
      </Plate>
      <Rise text="每干一件事" at={538} stagger={2} style={{ ...heavy, ...abs(rowX, 96), fontSize: 124 }} />
      <Rise
        text="调一次接口"
        at={548}
        stagger={2}
        style={{ ...heavy, ...abs(rowX, 248), fontSize: 124 }}
        charColor={(i) => (i >= 3 ? C.red : undefined)}
      />

      {/* 右侧：模型 */}
      <div
        style={{
          ...abs(modelX, 470),
          width: 230,
          height: 410,
          border: `6px solid ${C.paper}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...heavy,
          fontSize: 76,
          writingMode: "vertical-rl",
          letterSpacing: "0.2em",
          clipPath: `inset(${(1 - prog(frame, 550, 14)) * 100}% 0 0 0)`,
        }}
      >
        模型
      </div>

      {CALLS.map((c, i) => {
        const p = prog(frame, c.at, 12);
        if (p <= 0) return null;
        const dim = 1 - stamp * 0.78;
        const y = 470 + i * 140;
        const trip = 0.5 - 0.5 * Math.cos((frame - c.at) / 5.5);
        const x0 = rowX + chipW + 20;
        const x1 = modelX - 34;
        return (
          <React.Fragment key={c.name}>
            <div
              style={{
                ...abs(rowX, y),
                width: chipW,
                height: 116,
                boxSizing: "border-box",
                border: `5px solid rgba(244,243,239,0.55)`,
                display: "flex",
                alignItems: "center",
                paddingLeft: 30,
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 62,
                color: C.paper,
                transform: `translateX(${(1 - p) * -90}px)`,
                opacity: Math.min(1, p * 3) * dim,
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                ...abs(x0, y + 55),
                width: (x1 - x0) * p,
                height: 6,
                background: "rgba(244,243,239,0.35)",
                opacity: dim,
              }}
            />
            <div
              style={{
                ...abs(x0 + (x1 - x0) * trip - 15, y + 43),
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: C.red,
                opacity: p * dim,
              }}
            />
          </React.Fragment>
        );
      })}

      {/* 屏下方：往返次数 */}
      {frame >= 556 && (
        <div style={{ ...abs(TILE.x, 650), display: "flex", alignItems: "baseline", gap: 24 }}>
          <Rise text="往返" at={556} style={{ ...heavy, fontSize: 96, color: "rgba(244,243,239,0.7)" }} />
          <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 210, color: C.red, lineHeight: 1 }}>
            ×{Math.max(1, shown)}
          </div>
        </div>
      )}

      {/* 安全可控：盖章 */}
      {stamp > 0 && (
        <div
          style={{
            ...abs(900, 520),
            border: `12px solid ${C.green}`,
            borderRadius: 26,
            background: "rgba(12,13,16,0.9)",
            color: C.green,
            fontFamily: F.cn,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 1.15,
            padding: "14px 54px 24px",
            whiteSpace: "nowrap",
            transform: `rotate(-7deg) scale(${2.6 - 1.6 * stamp})`,
            opacity: Math.min(1, stamp * 2.5),
          }}
        >
          安全可控
        </div>
      )}
    </>
  );
};

// ───────────── S3B：速度非常慢 ─────────────
const SceneSlow: React.FC = () => {
  const frame = useCurrentFrame();
  const at = K.toSlow + 8;
  const stretch = prog(frame, at + 2, 24, (t) => t);
  const bar = prog(frame, at + 4, 60, EASE.out) * 0.21;
  return (
    <>
      <Rise text="但是速度" at={at} stagger={1} style={{ ...heavy, ...abs(140, 110), fontSize: 150 }} />
      <div style={{ ...heavy, ...abs(132, 300), fontSize: 380, lineHeight: 1.12, whiteSpace: "nowrap" }}>
        <span>非常</span>
        <span
          style={{
            display: "inline-block",
            color: C.red,
            transformOrigin: "0 50%",
            transform: `scaleX(${1 + stretch * 1.05})`,
          }}
        >
          慢
        </span>
      </div>
      <div style={{ ...abs(140, 800), width: 1640, height: 40, background: "rgba(244,243,239,0.16)" }}>
        <div style={{ width: `${bar * 100}%`, height: "100%", background: C.red }} />
      </div>
      <div style={{ ...abs(140, 862), display: "flex", alignItems: "baseline", gap: 20, color: C.paper }}>
        <span style={{ ...heavy, fontSize: 64, fontWeight: 700, color: "rgba(244,243,239,0.7)" }}>等待响应</span>
        <Counter to={12.8} at={at} dur={70} decimals={1} suffix="s" style={{ fontSize: 84 }} />
      </div>
    </>
  );
};

// ───────────── S3C：Token 消耗很大 ─────────────
const SceneToken: React.FC = () => {
  const frame = useCurrentFrame();
  const at = K.toToken + 8;
  const fill = prog(frame, at + 2, 34, EASE.out);
  const over = fill > 0.56;
  return (
    <>
      <div style={{ ...abs(140, 90), display: "flex", alignItems: "center", gap: 30 }}>
        <Plate at={at} enter="wipe" bg={C.paper} color={C.ink} size={150} font={F.num}>
          TOKEN
        </Plate>
        <Rise text="消耗很大" at={at + 6} stagger={2} style={{ ...heavy, fontSize: 150 }} />
      </div>
      <Counter
        to={128400}
        at={at + 2}
        dur={36}
        style={{ ...abs(120, 300), fontSize: 400, lineHeight: 1.1, color: C.red, letterSpacing: "-0.02em" }}
      />
      {/* 上下文窗口：进度条冲破边框 */}
      <div
        style={{
          ...abs(140, 800),
          width: 1040,
          height: 86,
          boxSizing: "border-box",
          border: `6px solid ${C.paper}`,
        }}
      />
      <div
        style={{
          ...abs(140, 800),
          width: 1900 * fill,
          height: 86,
          background: over ? C.red : C.paper,
        }}
      />
      {over && (
        <Rise
          text="上下文窗口"
          at={at + 20}
          stagger={1}
          style={{ ...heavy, ...abs(170, 808), fontSize: 58, color: C.ink }}
        />
      )}
    </>
  );
};

/** embedded：被别的合成嵌进去当画面用时，不出声音和字幕 */
export const ParadigmV2: React.FC<{ checkFrames?: unknown; embedded?: boolean }> = ({ embedded }) => {
  const frame = useCurrentFrame();
  // 相机进到圆盘内部之后，圆盘悄悄换成整片灰色场地（此刻屏幕已被完全覆盖，观众看不到切换）
  const inside = frame >= K.pushDone;
  const discGrow = prog(frame, 94, 12);
  const landOn = frame >= 60 && frame < 400;
  const tileRadius = prog(frame, K.pullOut, 20, EASE.inOut) * 60;

  const landBox = inside
    ? { x: -3400, y: -900, w: 6400, h: 2900, radius: "0" }
    : {
        x: VIEW_W / 2 - DISC_R,
        y: VIEW_H / 2 - DISC_R,
        w: DISC_R * 2,
        h: DISC_R * 2,
        radius: "50%",
      };

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {!embedded && <Audio src={staticFile("new-paradigm/voiceover.wav")} />}

      <World start={frameOn(S1)} moves={PARADIGM_MOVES}>
        {frame < 96 && (
          <Place t={S1}>
            <SceneTitle />
          </Place>
        )}
        {frame >= 62 && frame < K.pushDone + 2 && (
          <Place t={SQ}>
            <SceneQuestion />
          </Place>
        )}

        {/* 第三场的内容先摆好：V2 拉出时它已经在周围 */}
        {frame >= K.pullOut - 2 && (
          <>
            <Place t={S3A}>
              <SceneCalls />
            </Place>
            <Place t={S3B}>
              <SceneSlow />
            </Place>
            <Place t={S3C}>
              <SceneToken />
            </Place>
          </>
        )}

        {/* 视频世界：问号的点 → 灰色场地 */}
        {landOn && (
          <Place t={VL}>
            <div
              style={{
                position: "absolute",
                left: landBox.x,
                top: landBox.y,
                width: landBox.w,
                height: landBox.h,
                borderRadius: landBox.radius,
                overflow: "hidden",
                background: C.land,
                clipPath: inside ? undefined : `circle(${discGrow * 50}% at 50% 50%)`,
              }}
            >
              {frame < K.toStores + 20 && (
                <div style={{ position: "absolute", left: -landBox.x, top: -landBox.y, width: VIEW_W, height: VIEW_H }}>
                  <Clip
                    src="new-paradigm/shot_1_choice.mp4"
                    start={K.v1Start}
                    seconds={8}
                    style={{
                      maskImage: "linear-gradient(90deg, transparent 0, #000 110px, #000 calc(100% - 110px), transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(90deg, transparent 0, #000 110px, #000 calc(100% - 110px), transparent 100%)",
                    }}
                  />
                  {inside && <OverV1 />}
                </div>
              )}
            </div>
          </Place>
        )}

        {frame >= K.toStores - 4 && frame < K.toSlow + 18 && (
          <Place t={V2} style={{ overflow: "hidden", borderRadius: tileRadius }}>
            <Clip src="new-paradigm/shot_2_stores.mp4" start={K.v2Start} seconds={8} rate={0.8} />
            <OverV2 />
          </Place>
        )}
      </World>

      {!embedded && <Captions cues={cues} />}
    </AbsoluteFill>
  );
};
