import { Easing } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadNotoSansSC } from "@remotion/google-fonts/NotoSansSC";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

/**
 * theme.ts —— 全工程唯一设计 token 出口
 *
 * 铁律：组件不允许出现裸的色值 / 字号 / spring 参数。
 * 改主题 = 改这里，全工程生效。
 */

// ──────────────────────────── 字体（真加载）────────────────────────────

loadInter("normal", { weights: ["400", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true });
loadNotoSansSC("normal", { weights: ["400", "700"], subsets: ["chinese-simplified"], ignoreTooManyRequestsWarning: true });
loadJetBrainsMono("normal", { weights: ["400"], subsets: ["latin"], ignoreTooManyRequestsWarning: true });

export const FONT = {
  /** 标题：中文优先 Noto Sans SC，英文/数字 Inter */
  heading: "'Noto Sans SC', 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  /** 正文：同上，保持家族一致 */
  body: "'Noto Sans SC', 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  /** 等宽：代码/元数据/数字 */
  mono: "'JetBrains Mono', 'Consolas', monospace",
} as const;

// ──────────────────────────── 颜色 ────────────────────────────────────

export const COLOR = {
  /** 舞台底：经典高质感蓝图微光底色（剔除死黑，保持通透雾蓝至沉稳灰蓝） */
  bg: "radial-gradient(ellipse 85% 80% at 50% 48%, #3A4D6B 0%, #2B3A52 60%, #1F2B3E 100%)",
  /** 主文字 */
  fg: "#EDEDED",
  /** 弱化文字 45% */
  dim: "rgba(255,255,255,0.45)",
  /** 半弱化 55% */
  soft: "rgba(255,255,255,0.55)",
  /** 极弱化 28%（装饰层） */
  faint: "rgba(255,255,255,0.28)",
  /** 强调蓝（信息/链接/正向） */
  accent: "#4C8DFF",
  /** 警示红（风险/负向） */
  danger: "#E24B4A",
  /** 中性青灰（次要信息/注释） */
  steel: "#8B9DAF",
  /** 暖橙（结论/收益/亮点） */
  warm: "#E8A04C",
} as const;

// ──────────────────────────── 字级阶梯 ────────────────────────────────
// 铁律：只允许以下 5 级。24–44px 平庸区间禁用。
// 手机可读基线：素材内 UI 字 ≥48px 等效。

export const TYPE = {
  /** 超大标题/核心论点 */
  hero: { size: 200, weight: 700 as const, letterSpacing: "-0.03em", lineHeight: 1 },
  /** 大标题 */
  display: { size: 88, weight: 700 as const, letterSpacing: "-0.02em", lineHeight: 1.05 },
  /** 次级标题/观点卡 */
  title: { size: 64, weight: 700 as const, letterSpacing: "-0.02em", lineHeight: 1.1 },
  /** 正文/字幕（手机可读基线） */
  body: { size: 44, weight: 400 as const, letterSpacing: "0", lineHeight: 1.4 },
  /** 注释/装饰/元数据 */
  caption: { size: 20, weight: 400 as const, letterSpacing: "0.08em", lineHeight: 1.5 },
} as const;

// ──────────────────────────── 缓动（统一出口）─────────────────────────

export const EASE = {
  /** 进场：Expo 衰减——起步极快，末端指数级减速，稳稳停住 */
  outExpo: Easing.out(Easing.exp),
  /** 出场：Quint 加速——起步温柔，末端猛烈甩出 */
  inQuint: Easing.in(Easing.poly(5)),
  /** 穿透缩放 */
  inCubic: Easing.in(Easing.poly(3)),
  /** 通用平滑（TextReveal 私藏提拔为公共资源） */
  smooth: Easing.bezier(0.22, 1, 0.36, 1),
  /** 利落快速 */
  snappy: Easing.bezier(0.2, 0.8, 0.2, 1),
  /** 微过冲（克制的弹性，不夸张） */
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** 相机：whip 急推 */
  whip: Easing.bezier(0.7, 0, 0.25, 1),
  /** 相机：punch 爆发推近 */
  punch: Easing.bezier(0.75, 0, 0.3, 1),
  /** 相机：glide 平滑拉远 */
  glide: Easing.bezier(0.35, 0, 0.55, 1),
} as const;

// ──────────────────────────── Spring 预设（唯一出口）──────────────────

export const SPRING = {
  /** 沉稳落位（默认，观点卡/标题） */
  settle: { damping: 22, stiffness: 110, mass: 1 },
  /** 大标题更稳 */
  settleHeavy: { damping: 24, stiffness: 100, mass: 1 },
  /** 微弹（PerspectiveCard 翻板） */
  flip: { damping: 15, stiffness: 180, mass: 0.6 },
} as const;

// ──────────────────────────── 节奏（帧数规范）─────────────────────────

export const TEMPO = {
  /** 标准进场 */
  enter: 22,
  /** 标准出场 */
  exit: 16,
  /** 快速进场（关键词/强调） */
  enterFast: 14,
  /** 穿透 */
  punchThrough: 14,
  /** 错峰间隔 */
  stagger: 4,
} as const;

// ──────────────────────────── 布局 ────────────────────────────────────

export const LAYOUT = {
  /** 左右安全区 */
  marginX: 60,
  /** 上下安全区 */
  marginY: 28,
  /** 正文最大行宽 */
  maxWidth: 1500,
} as const;
