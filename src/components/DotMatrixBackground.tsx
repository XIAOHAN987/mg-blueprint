import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  Renderer,
  Camera,
  Mesh,
  Plane,
  Program,
  RenderTarget as OglRenderTarget,
} from "ogl";

/**
 * DotMatrixBackground —— Remotion 适配版点阵动态背景。
 *
 * 基于 Originkit Dot Matrix，做了三处 Remotion 化改造：
 * 1. uTime 由 useCurrentFrame() 驱动（确定性渲染，预览和出片完全一致）
 * 2. 去掉 RAF 循环，每帧由 React 渲染触发一次 render
 * 3. 调色板换成深蓝灰点阵，透明度压低，叠加在 GridBackground 之上做氛围层
 *
 * 默认参数（专业科普调）：
 * - frequency 2.5（Perlin 噪点中等密度）
 * - speed 0.4（极慢流动，不抢戏）
 * - cellSize 18（点距，比默认细）
 * - gamma 6（对比度拉高，亮部稀疏）
 * - paletteBias -2（整体压暗）
 */

const perlinVertexShader = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;

const perlinFragmentShader = `#version 300 es
precision mediump float;
uniform float uFrequency;
uniform float uTime;
uniform float uSpeed;
uniform float uValue;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  uv = (uv - 0.5) * vec2(aspect, 1.0) + 0.5;
  float hue = abs(snoise(vec3(uv * uFrequency, uTime * uSpeed)));
  vec3 rainbowColor = hsv2rgb(vec3(hue, 1.0, uValue));
  fragColor = vec4(rainbowColor, 1.0);
}`;

const dotVertexShader = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;

const dotFragmentShader = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform int uPaletteCount;
uniform vec3 uPalette[10];
uniform float uPaletteA[10];
uniform float uCellSize;
uniform float uGamma;
uniform float uPaletteBias;
out vec4 fragColor;

void main() {
  vec2 pix = gl_FragCoord.xy;
  float cell = max(uCellSize, 1.0);

  vec2 cellIdx = floor(pix / cell);
  vec2 cellCenter = (cellIdx + 0.5) * cell;
  vec3 col = texture(uTexture, cellCenter / uResolution.xy).rgb;
  float gray = 0.3 * col.r + 0.59 * col.g + 0.11 * col.b;
  gray = pow(clamp(gray, 0.0001, 1.0), uGamma);

  vec2 cellUV = fract(pix / cell) - 0.5;
  float dist = length(cellUV);
  float radius = clamp(gray + uPaletteBias, 0.0, 1.0) * 0.5;
  float aa = fwidth(dist) + 1e-4;
  float mark = 1.0 - smoothstep(radius - aa, radius + aa, dist);

  float g2 = clamp(gray + uPaletteBias, 0.0, 1.0);
  int cnt = max(uPaletteCount, 1);
  vec3 dotCol;
  float dotOpacity;
  if (cnt <= 1) {
    dotCol = uPalette[0];
    dotOpacity = uPaletteA[0];
  } else {
    float scaled = g2 * float(cnt - 1);
    int i0 = int(floor(scaled));
    i0 = clamp(i0, 0, cnt - 2);
    float f = scaled - float(i0);
    dotCol = mix(uPalette[i0], uPalette[i0 + 1], f);
    dotOpacity = mix(uPaletteA[i0], uPaletteA[i0 + 1], f);
  }
  fragColor = vec4(dotCol, mark * dotOpacity);
}`;

// 专业科普调色板：深蓝灰 → 冷静蓝 → 近白（点本身要亮，才能透过暗底看见）
const PAPERCLIP_COLORS = ["#2A4A75", "#6BA8FF", "#F0F4FF"];

const hexToVec3 = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

const MAX_COLORS = 10;

export const DotMatrixBackground: React.FC<{
  frequency?: number;
  speed?: number;
  cellSize?: number;
  gamma?: number;
  paletteBias?: number;
  /** 整体透明度（叠加在网格之上） */
  opacity?: number;
}> = ({
  frequency = 1,
  speed = 1,
  cellSize = 12,
  gamma = 4,
  paletteBias = -4,
  opacity = 0.4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const perlinMeshRef = useRef<Mesh | null>(null);
  const dotMeshRef = useRef<Mesh | null>(null);
  const renderTargetRef = useRef<OglRenderTarget | null>(null);
  const perlinProgramRef = useRef<Program | null>(null);
  const dotProgramRef = useRef<Program | null>(null);
  const glRef = useRef<any>(null);

  // 初始化 WebGL（只跑一次）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1920;
    const height = container.clientHeight || 1080;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: false,
      width,
      height,
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    rendererRef.current = renderer;
    glRef.current = gl;

    const camera = new Camera(gl, { near: 0.1, far: 100 });
    camera.position.set(0, 0, 3);
    camera.perspective({ aspect: width / height });
    cameraRef.current = camera;

    // Perlin 噪点 pass（输出到 render target）
    // 映射逻辑与原版 Originkit 一致：frequency/speed 走 UI→shader 映射
    const mapLinear = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
      outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
    const perlinProgram = new Program(gl, {
      vertex: perlinVertexShader,
      fragment: perlinFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uFrequency: { value: mapLinear(frequency, 1, 10, 0.3, 6) },
        uSpeed: { value: speed * 0.05 },
        uValue: { value: 1 },
        uResolution: { value: [width, height] },
      },
    });
    perlinProgramRef.current = perlinProgram;
    const perlinMesh = new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: perlinProgram,
    });
    perlinMeshRef.current = perlinMesh;

    const renderTarget = new OglRenderTarget(gl, { width, height });
    renderTargetRef.current = renderTarget;

    // 点阵 pass
    const rgb: [number, number, number][] = [];
    const alpha: number[] = [];
    for (let i = 0; i < MAX_COLORS; i++) {
      const src = PAPERCLIP_COLORS[i];
      if (src) {
        rgb.push(hexToVec3(src));
        alpha.push(1);
      } else {
        rgb.push([0, 0, 0]);
        alpha.push(0);
      }
    }

    const dotProgram = new Program(gl, {
      vertex: dotVertexShader,
      fragment: dotFragmentShader,
      uniforms: {
        uResolution: { value: [width, height] },
        uTexture: { value: renderTarget.texture },
        uPaletteCount: { value: PAPERCLIP_COLORS.length },
        uPalette: { value: rgb },
        uPaletteA: { value: alpha },
        uCellSize: { value: mapLinear(cellSize, 1, 100, 6, 60) },
        uGamma: { value: mapLinear(gamma, 1, 20, 0.5, 8) },
        uPaletteBias: { value: paletteBias * 0.05 },
      },
    });
    dotProgramRef.current = dotProgram;
    const dotMesh = new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: dotProgram,
    });
    dotMeshRef.current = dotMesh;

    return () => {
      if (gl.canvas && gl.canvas.parentElement === container) {
        container.removeChild(gl.canvas);
      }
      rendererRef.current = null;
      cameraRef.current = null;
      perlinMeshRef.current = null;
      dotMeshRef.current = null;
      renderTargetRef.current = null;
      perlinProgramRef.current = null;
      dotProgramRef.current = null;
      glRef.current = null;
    };
  }, []);

  // 每帧驱动：uTime = frame / fps，确定性渲染
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const perlinMesh = perlinMeshRef.current;
    const dotMesh = dotMeshRef.current;
    const renderTarget = renderTargetRef.current;
    const perlinProgram = perlinProgramRef.current;
    const dotProgram = dotProgramRef.current;
    if (
      !renderer ||
      !camera ||
      !perlinMesh ||
      !dotMesh ||
      !renderTarget ||
      !perlinProgram ||
      !dotProgram
    )
      return;

    perlinProgram.uniforms.uTime.value = frame / fps;
    renderer.render({ scene: perlinMesh, camera, target: renderTarget });
    renderer.render({ scene: dotMesh, camera });
  }, [frame, fps]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        pointerEvents: "none",
        lineHeight: 0,
      }}
    >
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
};
