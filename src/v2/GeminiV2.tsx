import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import type { Move, T } from "./space";
import { EASE, ID, compose, frameOn, prog } from "./space";
import { Clip, Place, World } from "./World";
import { C, Counter, F, Plate, Rise, RollSwap } from "./type";
import { cues } from "./cues/gemini37";
import { Captions, Doc, anchorParent } from "./kit";

/**
 * GeminiV2 —— 通用性测试：换一套完全不同的素材（深色录屏 + 截图资料），
 * 只用 space / World / type / kit 里的通用件来编排，0–21 秒。
 *
 * 素材体检结论（编排依据）：
 *   launch.mp4  2560×1380 录屏，纯黑底，内容只在中间一栏 x≈790–1650；15.8s
 *               → 只取中间栏，黑底直接融进黑色世界，不加边框；放慢到 0.61 倍
 *               → 第 5.7s 停在榜单推文上，位置 (828,572)，与 arena.png 等比例重合
 *   arena.png   742×806 截图，分辨率低 → 最多放大约 1.2 倍，不做局部特写
 *   price.png   1510×830 白底图表 → 可放大约 1.6 倍，左上有空白区可压字
 *
 * 资料与口播的出入（按流程要求如实记录，正式出片前应换成对应的资料）：
 *   口播说"智能指数得分 56、仅次于 GPT-5.6 Tera"，arena.png 实际是 WebDev 榜第 8 名、1588 分；
 *   口播说"定价下调一半"，price.png 里只有 $0.40 这一个数，没有调价前后的对比。
 */

const f = (sec: number) => Math.round(sec * 30);
const BLUE = "#4C8DFF";
const BG = "#000000";

// ───────────── 世界坐标 ─────────────
const S1: T = ID;
/** 录屏按原始像素建坐标系：1.15 倍显示，取景窗对准中间栏 */
const VD: T = { x: 70 - 790 * 1.15, y: -440 * 1.15, s: 1.15, r: 0 };
/** 榜单截图：摆在录屏第 5.7 秒那条推文的原位 */
const ARENA_PX = { x: 0, y: 0, w: 742, h: 806 };
const ARENA: T = compose(VD, { x: 828, y: 572, s: 1, r: 0 });
/** 第二场：截图移到画面右侧，左边留给数字 */
const S3: T = anchorParent(ARENA, ARENA_PX, { x: 960, y: 60, w: 884, h: 960 });
const S4: T = compose(S3, { x: 2400, y: -180, s: 1, r: 4 });
const S5: T = compose(S4, { x: 200, y: 1480, s: 1, r: -3 });
const PRICE_IN_S5: T = { x: -538, y: -197, s: 1.63, r: 0 };

const K = { toDoc: f(9.35), toSpeed: f(14.5), toPrice: f(19.0) };
const VIDEO_RATE = 0.61;

export const GEMINI_MOVES: Move[] = [
  { at: K.toDoc, dur: 20, to: frameOn(S3), ease: EASE.push },
  { at: K.toSpeed, dur: 15, to: frameOn(S4), ease: EASE.whip },
  { at: K.toPrice, dur: 15, to: frameOn(S5), ease: EASE.whip },
];

const abs = (x: number, y: number): React.CSSProperties => ({ position: "absolute", left: x, top: y });
const heavy: React.CSSProperties = { fontFamily: F.cn, fontWeight: 900, color: C.paper };

const Slot: React.FC<{ bg: string; color?: string; size: number; font?: string; children: React.ReactNode }> = ({
  bg,
  color = C.paper,
  size,
  font = F.cn,
  children,
}) => (
  <div
    style={{
      display: "inline-block",
      background: bg,
      color,
      fontFamily: font,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.18,
      padding: `${size * 0.1}px ${size * 0.3}px ${size * 0.14}px`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

// ───────────── S1 右侧文字：戏称 → 正名 → 升级 ─────────────
const TitleSide: React.FC = () => {
  const X = 1130;
  return (
    <>
      <RollSwap
        height={140}
        style={{ ...abs(X, 120), width: 760 }}
        items={[
          { at: 8, node: <Slot bg={C.paper} color={C.ink} size={92}>沉寂许久</Slot> },
          { at: f(2.5), node: <Slot bg={C.paper} color={C.ink} size={92}>终于放出</Slot> },
        ]}
      />
      {/* 外号刚站稳就被正名顶掉 */}
      <RollSwap
        height={200}
        dur={9}
        style={{ ...abs(X, 290), width: 760 }}
        items={[
          {
            at: f(1.05),
            node: (
              <div style={{ ...heavy, fontSize: 98, lineHeight: 1.6, color: "rgba(244,243,239,0.82)" }}>
                “美国大豆包”
              </div>
            ),
          },
          {
            at: f(2.75),
            node: <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 172, lineHeight: 1.1, color: C.paper }}>Gemini</div>,
          },
        ]}
      />
      <Plate at={f(3.75)} enter="flip" bg={BLUE} color={BG} size={138} font={F.num} style={abs(X, 500)}>
        3.7 Flash
      </Plate>
      <RollSwap
        height={150}
        style={{ ...abs(X, 760), width: 760 }}
        items={[
          { at: f(5.6), node: <Slot bg={C.ink} size={96}>依旧是 Flash</Slot> },
          { at: f(7.25), node: <Slot bg={C.red} size={96}>能力大幅升级</Slot> },
        ]}
      />
    </>
  );
};

// ───────────── S3 左侧：智能指数 56 ─────────────
const ScoreSide: React.FC = () => (
  <>
    <Plate at={K.toDoc + 14} enter="wipe" bg={C.paper} color={C.ink} size={92} style={abs(90, 110)}>
      最新智能指数
    </Plate>
    <Counter
      to={56}
      at={f(11.0)}
      dur={34}
      style={{ ...abs(70, 215), fontSize: 470, lineHeight: 1, color: BLUE, letterSpacing: "-0.03em" }}
    />
    <Rise text="榜单得分" at={K.toDoc + 22} stagger={2} style={{ ...heavy, ...abs(96, 690), fontSize: 72, fontWeight: 700, color: "rgba(244,243,239,0.7)" }} />
    <Plate at={f(12.55)} enter="drop" bg={C.red} size={74} style={abs(90, 830)}>
      仅次于 GPT-5.6 Tera
    </Plate>
  </>
);

// ───────────── S4：输出速度 340 tokens/s ─────────────
const SceneSpeed: React.FC = () => {
  const frame = useCurrentFrame();
  const at = K.toSpeed + 8;
  const rows = [0, 1, 2, 3];
  return (
    <>
      {/* token 流：右上角一排排色块高速掠过 */}
      <div style={{ ...abs(1200, 70), width: 900, height: 430, overflow: "hidden" }}>
        {rows.map((r) =>
          [0, 1, 2, 3, 4].map((i) => {
            const w = 80 + ((i * 53 + r * 97) % 170);
            const speed = 46 + r * 13;
            const x = ((i * 330 + r * 120 + (frame - at) * speed) % 1500) - 300;
            return (
              <div
                key={`${r}-${i}`}
                style={{
                  ...abs(x, 20 + r * 104),
                  width: w,
                  height: 62,
                  background: (i + r) % 3 === 0 ? BLUE : "rgba(244,243,239,0.16)",
                }}
              />
            );
          }),
        )}
      </div>
      <Rise text="输出速度" at={at} stagger={2} style={{ ...heavy, ...abs(140, 70), fontSize: 130 }} />
      <Plate at={f(15.3)} enter="flip" bg={BLUE} color={BG} size={200} style={abs(130, 240)}>
        断层领先
      </Plate>
      <Rise text="峰值" at={f(16.8)} style={{ ...heavy, ...abs(140, 640), fontSize: 110, fontWeight: 700, color: "rgba(244,243,239,0.7)" }} />
      {frame >= f(16.8) && (
        <Counter to={340} at={f(16.8)} dur={30} style={{ ...abs(400, 520), fontSize: 400, lineHeight: 1, color: C.paper, letterSpacing: "-0.03em" }} />
      )}
      <Rise text="tokens/秒" at={f(17.3)} stagger={1} style={{ ...abs(1130, 760), fontFamily: F.mono, fontWeight: 700, fontSize: 110, color: BLUE }} />
    </>
  );
};

// ───────────── S5：价格图表上压字 ─────────────
const ScenePrice: React.FC = () => (
  <>
    <Place t={PRICE_IN_S5} w={1510} h={830}>
      <Doc
        src="gemini37/price.png"
        w={1510}
        h={830}
        radius={14}
        marks={[{ x: 884, y: 468, w: 78, h: 190, at: K.toPrice + 22, color: C.red }]}
      />
    </Place>
    <Plate at={K.toPrice + 10} enter="wipe" bg={C.ink} size={104} style={abs(70, 285)}>
      官方定价
    </Plate>
    <Plate at={K.toPrice + 20} enter="drop" bg={C.red} size={168} style={abs(70, 440)}>
      直降一半
    </Plate>
  </>
);

/** embedded：被别的合成嵌进去当画面用时，不出声音和字幕 */
export const GeminiV2: React.FC<{ checkFrames?: unknown; embedded?: boolean }> = ({ embedded }) => {
  const frame = useCurrentFrame();
  const lift = prog(frame, K.toDoc - 2, 8, EASE.inOut);
  const feedOut = prog(frame, K.toDoc + 2, 16, EASE.inOut);

  return (
    <AbsoluteFill style={{ background: BG }}>
      {!embedded && <Audio src={staticFile("gemini37/voiceover.wav")} />}

      <World start={frameOn(S1)} moves={GEMINI_MOVES}>
        {/* 录屏：只留中间一栏，黑底融进世界 */}
        {feedOut < 1 && (
          <Place t={VD} w={2560} h={1380} style={{ opacity: 1 - feedOut }}>
            <Clip
              src="gemini37/launch.mp4"
              start={0}
              seconds={5.76}
              rate={VIDEO_RATE}
              w={2560}
              h={1380}
              style={{ clipPath: "inset(440px 975px 0 790px)" }}
            />
          </Place>
        )}

        {frame < K.toDoc + 24 && (
          <Place t={S1} style={{ opacity: 1 - feedOut }}>
            <TitleSide />
          </Place>
        )}

        {/* 资料：从录屏里那条推文的原位"长"出来 */}
        {lift > 0 && frame < K.toSpeed + 20 && (
          <Place t={ARENA} w={742} h={806}>
            <Doc
              src="gemini37/arena.png"
              w={742}
              h={806}
              opacity={lift}
              marks={[{ x: 86, y: 424, w: 430, h: 33, at: f(11.9), color: BLUE }]}
            />
          </Place>
        )}
        {frame >= K.toDoc && frame < K.toSpeed + 20 && (
          <Place t={S3}>
            <ScoreSide />
          </Place>
        )}

        {frame >= K.toSpeed - 2 && frame < K.toPrice + 20 && (
          <Place t={S4}>
            <SceneSpeed />
          </Place>
        )}
        {frame >= K.toPrice - 2 && (
          <Place t={S5}>
            <ScenePrice />
          </Place>
        )}
      </World>

      {!embedded && <Captions cues={cues} />}
    </AbsoluteFill>
  );
};
