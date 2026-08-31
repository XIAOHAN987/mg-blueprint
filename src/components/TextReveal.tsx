import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

/**
 * TextReveal —— Remotion 适配版文字入场（SnapCn TextReveal 改造）。
 *
 * 核心机制：整句按「词」或「字」为单位，逐个有节奏地入场（fade + slide + blur/scale/tracking），
 * 支持镜像退场（元素按入场反方向退出）。
 *
 * 与原版差异：
 * - 去 SnapCn 主题系统，直接用 props 传色
 * - 保留 14 种预设，默认用专业科普调（per-character-rise / soft-blur-in / line-by-line-slide）
 * - 全部 useCurrentFrame 驱动，确定性渲染
 */

export type TextRevealUnit = "character" | "word" | "line" | "block";
export type TextRevealEffect = "fade" | "slide" | "blur" | "scale" | "mask" | "tracking";
export type TextRevealDirection = "up" | "down" | "left" | "right";
export type TextRevealEasing = "smooth" | "snappy" | "overshoot" | "linear" | "spring" | [number, number, number, number];
export type TextRevealExit = "none" | "mirror";

export type TextRevealPreset =
  | "soft-blur-in"
  | "per-character-rise"
  | "bottom-up-letters"
  | "top-down-letters"
  | "spring-scale-in"
  | "micro-scale-fade"
  | "scale-down-fade"
  | "blur-out-up"
  | "focus-blur-resolve"
  | "line-by-line-slide"
  | "mask-reveal-up"
  | "tracking-in"
  | "short-slide-right"
  | "staggered-fade-up";

export interface TextRevealSettings {
  unit: TextRevealUnit;
  effects: TextRevealEffect[];
  direction: TextRevealDirection;
  distance: number;
  blurAmount: number;
  scaleFrom: number;
  trackingFrom: number;
  stagger: number;
  enterDuration: number;
  easing: TextRevealEasing;
  exit: TextRevealExit;
  exitDirection: TextRevealDirection;
  exitDistance: number;
  exitBlur: number;
  exitDuration: number;
  exitStagger: number;
  align: "left" | "center" | "right";
  fontSize: number;
  color: string;
  fontWeight: number | string;
  letterSpacing: string;
}

const DEFAULTS: TextRevealSettings = {
  unit: "word",
  effects: ["fade", "slide"],
  direction: "up",
  distance: 24,
  blurAmount: 8,
  scaleFrom: 0.9,
  trackingFrom: 0.5,
  stagger: 2,
  enterDuration: 18,
  easing: "smooth",
  exit: "none",
  exitDirection: "up",
  exitDistance: 14,
  exitBlur: 8,
  exitDuration: 14,
  exitStagger: 1,
  align: "center",
  fontSize: 72,
  color: "#EDEDED",
  fontWeight: 600,
  letterSpacing: "-0.03em",
};

export const PRESETS: Record<TextRevealPreset, Partial<TextRevealSettings>> = {
  "soft-blur-in": {
    unit: "character",
    effects: ["fade", "slide", "blur"],
    direction: "up",
    distance: 16,
    blurAmount: 12,
    stagger: 1,
    enterDuration: 27,
    easing: "smooth",
    letterSpacing: "-0.05em",
  },
  "per-character-rise": {
    unit: "character",
    effects: ["fade", "slide"],
    direction: "up",
    distance: 32,
    stagger: 1,
    enterDuration: 21,
    easing: "snappy",
    letterSpacing: "-0.05em",
  },
  "bottom-up-letters": {
    unit: "character",
    effects: ["fade", "slide"],
    direction: "up",
    distance: 46,
    stagger: 3,
    enterDuration: 12,
    easing: [0.18, 1, 0.32, 1],
    letterSpacing: "-0.05em",
  },
  "top-down-letters": {
    unit: "character",
    effects: ["fade", "slide"],
    direction: "down",
    distance: 46,
    stagger: 3,
    enterDuration: 12,
    easing: [0.18, 1, 0.32, 1],
    letterSpacing: "-0.05em",
  },
  "spring-scale-in": {
    unit: "word",
    effects: ["fade", "scale"],
    scaleFrom: 0.7,
    stagger: 3,
    enterDuration: 11,
    easing: "overshoot",
  },
  "micro-scale-fade": {
    unit: "block",
    effects: ["fade", "scale"],
    scaleFrom: 0.96,
    enterDuration: 18,
    easing: [0.32, 0.72, 0, 1],
  },
  "scale-down-fade": {
    unit: "block",
    effects: ["fade", "slide", "scale"],
    direction: "up",
    distance: 8,
    scaleFrom: 1.04,
    enterDuration: 16,
    easing: "smooth",
    exit: "mirror",
    exitDirection: "up",
    exitDistance: 8,
    exitDuration: 11,
  },
  "blur-out-up": {
    unit: "word",
    effects: ["fade", "slide", "blur"],
    direction: "up",
    distance: 10,
    blurAmount: 6,
    stagger: 1,
    enterDuration: 17,
    easing: "smooth",
    exit: "mirror",
    exitDirection: "up",
    exitDistance: 14,
    exitBlur: 8,
    exitDuration: 14,
    exitStagger: 1,
  },
  "focus-blur-resolve": {
    unit: "block",
    effects: ["fade", "slide", "blur", "scale"],
    direction: "up",
    distance: 14,
    blurAmount: 14,
    scaleFrom: 1.01,
    enterDuration: 23,
    easing: "smooth",
    exit: "mirror",
    exitDirection: "up",
    exitDistance: 10,
    exitBlur: 10,
    exitDuration: 16,
  },
  "line-by-line-slide": {
    unit: "line",
    effects: ["fade", "slide"],
    direction: "right",
    distance: 48,
    stagger: 4,
    enterDuration: 27,
    easing: "smooth",
    exit: "mirror",
    exitDirection: "right",
    exitDistance: 48,
    exitDuration: 18,
    exitStagger: 2,
    align: "left",
  },
  "mask-reveal-up": {
    unit: "line",
    effects: ["slide", "mask"],
    direction: "up",
    distance: 30,
    stagger: 3,
    enterDuration: 23,
    easing: "smooth",
    exit: "mirror",
    exitDirection: "up",
    exitDistance: 22,
    exitDuration: 16,
    exitStagger: 2,
  },
  "tracking-in": {
    unit: "block",
    effects: ["fade", "blur", "tracking"],
    blurAmount: 12,
    trackingFrom: 0.5,
    enterDuration: 30,
    easing: "spring",
  },
  "short-slide-right": {
    unit: "word",
    effects: ["fade", "slide"],
    direction: "right",
    distance: 24,
    stagger: 3,
    enterDuration: 16,
    easing: "snappy",
  },
  "staggered-fade-up": {
    unit: "word",
    effects: ["fade", "slide"],
    direction: "up",
    distance: 20,
    stagger: 4,
    enterDuration: 12,
    easing: "linear",
  },
};

function splitText(text: string, unit: TextRevealUnit): string[] {
  switch (unit) {
    case "character":
      return Array.from(text);
    case "word":
      return text.split(" ").filter((w) => w.length > 0);
    case "line":
      return text.split("\n");
    case "block":
      return [text];
  }
}

function springEase(t: number): number {
  return 1 - Math.exp(-7 * t) * Math.cos(4.5 * t);
}

function resolveEasing(easing: TextRevealEasing): (t: number) => number {
  if (Array.isArray(easing)) {
    return Easing.bezier(easing[0], easing[1], easing[2], easing[3]);
  }
  switch (easing) {
    case "smooth":
      return Easing.bezier(0.22, 1, 0.36, 1);
    case "snappy":
      return Easing.bezier(0.2, 0.8, 0.2, 1);
    case "overshoot":
      return Easing.bezier(0.34, 1.56, 0.64, 1);
    case "spring":
      return springEase;
    case "linear":
      return (t: number) => t;
  }
}

const EXIT_EASING = Easing.bezier(0.64, 0, 0.78, 0);

function enterOffset(direction: TextRevealDirection, distance: number): { x: number; y: number } {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
  }
}

function exitOffset(direction: TextRevealDirection, distance: number): { x: number; y: number } {
  const from = enterOffset(direction, distance);
  return { x: -from.x + 0, y: -from.y + 0 };
}

/**
 * TextReveal —— 防线的最后一道闸。
 *
 * 只允许 Agent 传 text / preset / delay / totalFrames / color / align。
 * fontSize / stagger / distance 等参数全部走预设，不给自由发挥的机会——
 * 自由发挥 = 字阶失控 = 排版崩溃的根源。
 */
export interface TextRevealProps {
  text: string;
  /** 必选预设（14 种，覆盖所有使用场景） */
  preset: TextRevealPreset;
  delay?: number;
  /** 总帧数（用于自动调度镜像退场），默认 1800 */
  totalFrames?: number;
  /** 覆盖文字颜色（默认 #EDEDED） */
  color?: string;
  /** 覆盖对齐方式 */
  align?: "left" | "center" | "right";
}

export const TextReveal: React.FC<TextRevealProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - (props.delay ?? 0);

  // 合并配置：defaults < preset（Agent 只能覆盖 color 和 align）
  const preset = PRESETS[props.preset];
  const merged = {
    ...DEFAULTS,
    ...preset,
    ...(props.color !== undefined ? { color: props.color } : {}),
    ...(props.align !== undefined ? { align: props.align } : {}),
  } as unknown as TextRevealSettings & { effects: TextRevealEffect[] | string };
  const exitDirection = (preset?.exitDirection ?? preset?.direction ?? DEFAULTS.direction) as TextRevealDirection;
  const rawEffects: TextRevealEffect[] | string = merged.effects;
  const cfg: TextRevealSettings = {
    ...merged,
    effects: Array.isArray(rawEffects) ? rawEffects : (rawEffects.split(",").map((e: string) => e.trim()) as TextRevealEffect[]),
    exitDirection,
  };

  const units = splitText(props.text, cfg.unit);
  const easeFn = resolveEasing(cfg.easing);

  // 镜像退场调度
  const tail = Math.max(0, units.length - 1);
  const enterEnd = cfg.enterDuration + tail * cfg.stagger;
  const totalFrames = props.totalFrames ?? 1800;
  const exitStart = cfg.exit === "mirror" ? Math.max(enterEnd, totalFrames - cfg.exitDuration - tail * cfg.exitStagger) : Infinity;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: cfg.align === "center" ? "center" : cfg.align === "right" ? "flex-end" : "flex-start",
        gap: cfg.unit === "word" ? "0.3em" : 0,
        fontFamily: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
        fontSize: cfg.fontSize,
        fontWeight: cfg.fontWeight,
        color: cfg.color,
        letterSpacing: cfg.letterSpacing,
        lineHeight: 1.2,
        textAlign: cfg.align,
        maxWidth: 1600,
      }}
    >
      {units.map((unit, i) => {
        const enterStart = i * cfg.stagger;
        const enterT = Math.max(0, Math.min(1, (t - enterStart) / cfg.enterDuration));
        const enterProgress = easeFn(enterT);

        // 镜像退场
        let exitProgress = 0;
        if (cfg.exit === "mirror" && t >= exitStart + i * cfg.exitStagger) {
          const exitT = Math.max(0, Math.min(1, (t - exitStart - i * cfg.exitStagger) / cfg.exitDuration));
          exitProgress = EXIT_EASING(exitT);
        }

        // 入场偏移
        const enterOff = enterOffset(cfg.direction, cfg.distance);
        const enterX = enterOff.x * (1 - enterProgress);
        const enterY = enterOff.y * (1 - enterProgress);

        // 退场偏移
        const exitOff = exitOffset(cfg.exitDirection, cfg.exitDistance);
        const exitX = exitOff.x * exitProgress;
        const exitY = exitOff.y * exitProgress;

        // 效果计算
        let opacity = 1;
        let blur = 0;
        let scale = 1;
        let tracking = 0;

        if (cfg.effects.includes("fade")) {
          opacity = enterProgress * (1 - exitProgress);
        }
        if (cfg.effects.includes("blur")) {
          blur = cfg.blurAmount * (1 - enterProgress) + cfg.exitBlur * exitProgress;
        }
        if (cfg.effects.includes("scale")) {
          scale = cfg.scaleFrom + (1 - cfg.scaleFrom) * enterProgress;
        }
        if (cfg.effects.includes("tracking")) {
          tracking = cfg.trackingFrom * (1 - enterProgress);
        }

        const x = enterX + exitX;
        const y = enterY + exitY;

        // 静止后取整到物理像素，消除亚像素抖动（文字 hinting 每帧重吸附导致的抖动）
        const resting = enterProgress >= 1 && exitProgress <= 0;
        const fx = resting ? Math.round(x) : x;
        const fy = resting ? Math.round(y) : y;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translate(${fx}px, ${fy}px) scale(${scale})`,
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
              letterSpacing: tracking > 0 ? `${tracking}em` : undefined,
              textRendering: "geometricPrecision",
            }}
          >
            {unit}
          </span>
        );
      })}
    </div>
  );
};
