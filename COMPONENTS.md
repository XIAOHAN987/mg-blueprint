# 知识讲解类 MG 动画组件库 · 使用手册

> 给 AI 的交接文档：读完即可用这套组件库制作高级 MG 动画视频。
> 项目位置：`C:\Users\XIAOHAN\WorkBuddy\2026-08-19-15-22-38\paperclip-template`

---

## 0. 快速启动

```bash
cd C:\Users\XIAOHAN\WorkBuddy\2026-08-19-15-22-38\paperclip-template
./node_modules/.bin/remotion studio src/index.ts --port=3103
# 浏览器打开 http://localhost:3103，左上角切换 Composition
```

渲染出片（仅在用户确认后）：
```bash
./node_modules/.bin/remotion render src/index.ts <CompId> out/xx.mp4 --codec h264 --crf 16 --concurrency=4
```
**内存 32GB 可以用 `--concurrency=4`**（之前 16GB 单通道只能跑 2，现在 4 并发稳定）。如果还是卡（"got no response"），降到 2。

---

## 1. 核心架构（不可回退的铁律）

> ⚠️ **本节只适用于旧版 `CameraRig`（`src/components/`）。** 新片子用 `src/v2/` 的镜头系统，相机可以自由推拉摇移，流程见 [WORKFLOW-V2.md](WORKFLOW-V2.md)。


### 相机系统（CameraRig）
- **机位永远锁定舞台中心（1100, 625），只做 zoom（scale 0.95-1.15），绝不平移**
- 走位全部交给元素入场/退场动画
- 转场只在 beat 切换瞬间发生：Bezier 急滑 ~23 帧到位后完全静止
- 分段缓动：zoom in 用 `punch`（爆发式推近）、zoom out 用 `glide`（平滑拉远）、平移用 `whip`（突然加速）
- **Ghost trail**：转场瞬间绘制最近 3 帧残影（透明度/模糊递减），模拟运动模糊
- 无呼吸、无持续漂移、无匀速爬行

### 舞台与背景
- **GridBackground**：细网格蓝图背景（3x 超大平面，静止），打底
- **DotMatrixBackground**：Perlin 噪点点阵动态背景（叠在网格之上，opacity 0.4），提供"极光流动"氛围
- 屏幕空间暗角：radial-gradient 压在相机之上，四边微微压暗

### 元素交接（BeatWindow）
- 每个 beat 的内容包一层 `BeatWindow`：from 前不可见，[from, to-12] 可见，末尾 12 帧淡出上浮让位
- 默认锚定舞台中心（1100, 625），`offsetY` 微调垂直构图
- `fullBleed=true` 时锚定取景框左上（用于全屏素材段）

---

## 2. 组件清单（按用途分类）

### 文字系统

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **TextReveal** | 叙述性文字入场（整句/整段） | `preset`（14 种预设）、`delay`、`fontSize`、`color` |
| **FlickerText** | 关键词强调（0.5s 快速闪烁） | `text`、`duration`（帧数）、`flickerCount`、`letterFlickerIntensity`、`strokeColor`、`fillColor` |
| **TextCard** | 观点卡/金句（normal/warning/quote 三变体） | `kicker`（小标）、`lines`（支持 accent 关键词上色）、`sub`（副文案）、`variant` |
| **OutlineTitle** | 描边空心大字（标题落版） | `solid`（实心部分）、`outline`（描边部分）、`fontSize` |
| **NumberTicker** | 数字极速翻滚（里程表效果，0→目标值） | `fromVal`、`toVal`、`decimals`、`startFrame`、`duration`、`prefix`、`suffix` |

**NumberTicker 用法（数据展示必备）：**
```tsx
// 价格毫秒级跳字：¥ 0.0 → ¥ 0.4
¥ <NumberTicker fromVal={0} toVal={0.4} decimals={1} startFrame={beat.from + 8} duration={16} /> / M Tokens
// 调用量：1 → 20 万亿
<NumberTicker fromVal={1} toVal={20} startFrame={beat.from + 8} duration={20} suffix=" 万亿" />
// 参数：0 → 320B
<NumberTicker fromVal={0} toVal={320} startFrame={cardStart + 2} duration={16} suffix="B" />
```
- 用 `tabular-nums` 等宽数字，避免翻滚时宽度抖动
- `duration` 默认 16 帧（约 0.5 秒）——够快才有"里程表"感，给太多就拖
- 适用：价格、数量、参数、百分比、跑分，任何"展示一个数字"的场景

**TextReveal 14 种预设**：
- `per-character-rise`：逐字升起（常用）
- `staggered-fade-up`：逐词推进
- `soft-blur-in`：逐字模糊聚焦
- `line-by-line-slide`：逐行滑入
- `tracking-in`：字距收缩
- 其他：`spring-scale-in`、`micro-scale-fade`、`scale-down-fade`、`blur-out-up`、`focus-blur-resolve`、`mask-reveal-up`、`bottom-up-letters`、`top-down-letters`、`short-slide-right`

**分工原则**：TextReveal 负责叙述性文字入场，FlickerText 负责关键词强调（先叙述、再强调）。

### 素材嵌入

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **EmbeddedMedia** | 视频/截图嵌入卡片（伪3D 右侧飞入） | `src`、`kind`（video/image）、`width`（可选，不传自动）、`delay`、`startFromSec`、`label`、`scroll`（长内容滚动）、`scrollHeight`、`scrollDuration` |
| **SpotlightMedia** | 全屏聚光素材段（小框→放大下移→停住） | `src`、`kind`、`delay`、`zoomAt`（放大开始帧）、`caption`（叠加文字） |
| **HighlightCallout** | 截图关键区域高亮框 | `x/y/w/h`（相对容器百分比）、`label`、`delay`、`accent`（默认蓝） |

**EmbeddedMedia vs SpotlightMedia**：
- EmbeddedMedia：素材作为"嵌入卡片"，不占满画面（适合录屏/截图展示）
- SpotlightMedia：素材作为"全屏主体"，小框入场后放大下移成为画面主体（适合需要展示细节的视频/图片）

**EmbeddedMedia 容器尺寸规则（v3，防忽大忽小）：**
- **不传 `width`**（推荐）：组件读素材宽高比自动算——宽≤1400、高≤760 安全区内自适应，竖图下限 640。横图宽、竖图窄，同比例素材大小稳定，不会忽大忽小
- **传 `width`**：固定宽度（兼容旧调用）
- **长内容（长截图/长网页/长表格）**：传 `scroll={true}`，容器固定 1000×620，素材在容器内**慢速微漫游**——不是把整图滚到底，而是只挪一小段（`scrollAmount` 默认 150px 的克制位移），匀速铺满整个分镜口播时长（约 15-20px/秒，电影运镜感，能看清每行字）。传 `scrollEndFrame={beat.to}` 让漫游铺满分镜；用 `scrollAmount` 微调位移量
- **判断**：普通素材→不传 width 自适应；明显很长（截图高度 >> 宽度）→ 加 `scroll={true}` 慢速漫游

> ⚠️ 滚动**禁止**"把整图滚到底"——那会让速度飙到 300-400px/秒，字迹飞速滑过全糊。正确做法是克制的微漫游（只挪 150px 左右），慢到能看清。

### 流程/机制图

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **FlowDiagram** | 节点-连线机制图（连线逐步绘制） | `nodes`（节点数组）、`edges`（连线数组）、`activeNodeId`（当前讲解节点高亮） |
| **DrawPathFlow** | 流程图线条逐步绘制（带流动圆点） | 同 FlowDiagram，但连线用 strokeDashoffset 逐步绘制，支持 `flow: true`（流动圆点表示执行流） |
| **FeatureCards** | 能力/要点卡片组（逐张 stagger 上浮） | `items`（卡片数组）、`delay`、`cardWidth` |
| **CodeCardGroup** | 通用「代码组件卡」组（弹射入场） | `items`（CodeCardItem 数组）、`expandAt`、`collapseAt`、`staggerGap` |

**CodeCardGroup 用法（AI 传内容，组件焊死样式+入场）：**

```tsx
<CodeCardGroup
  expandAt={b("b3").from + 55}
  items={[
    { name: "StaggerItem", desc: "错峰进 · 统一出", en: "STAGGER", icon: "stagger" },
    { name: "SlideInItem", desc: "侧滑入 · 停中心", en: "SLIDE", icon: "slide" },
    { name: "API 网关", desc: "统一入口 · 限流鉴权", en: "GATEWAY", icon: "grid" },
  ]}
/>
```

- **内容**：`items` 传 `{ name, desc, en, icon }`——name=主标题、desc=一行描述、en=右上角英文徽章、icon=迷你示意图
- **icon**：内置预设 `stagger/slide/punch/breath/pulse/grid`，或传自定义 React 节点
- **样式焊死**：序号 + 英文徽章 + 示意图 + 细线分区 + 名称 + 描述
- **入场焊死**：每张卡独立 spring 弹射（damping16/stiffness200/mass0.5 过冲回弹），`staggerGap` 控制错峰（默认 5 帧）
- **适用**：任何"一组卡片"场景——动效原语/产品功能/特性对比/技术栈。卡片数量 2-6 张最佳

**CodeCardGroup vs FeatureCards**：
- FeatureCards：逐张 stagger 上浮的简洁要点卡（无图标徽章），适合纯文字要点
- CodeCardGroup：带序号+英文徽章+迷你示意图的"代码组件卡"，适合展示"一组有结构的东西"（组件/功能/模块）

### 分镜内过渡

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **CrossStage** | 分镜内两段内容的交叉位移过渡（消灭硬切） | `showFrom`、`showTo`（该段内容显示的全局帧区间）、`fadeDur`（过渡时长，默认14帧）、`shift`（位移幅度，默认26px） |

### 入场姿态

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **PerspectiveCard** | 2.5D 空间微透视翻板入场（幅度焊死≤16deg，防过头） | `enterFrame`、`preset`（press/fan/bifold）、`index`、`count`、`side` |

**PerspectiveCard 用法（三预设，AI 只能选不能自由调角度）：**
```tsx
// press：单面板从斜上方下压翻平（rotateX 14deg→0）
<PerspectiveCard enterFrame={beat.from + 6} preset="press">...</PerspectiveCard>

// fan：多卡扇形展开（rotateX 16deg + 按 index 的 rotateY 扇形）
{items.map((item, i) => (
  <PerspectiveCard key={i} enterFrame={cardStart} preset="fan" index={i} count={items.length}>...</PerspectiveCard>
))}

// bifold：左右对开门合拢（rotateY ±8deg→0）
<PerspectiveCard enterFrame={beat.from + 6} preset="bifold" side="left">...</PerspectiveCard>
<PerspectiveCard enterFrame={beat.from + 6} preset="bifold" side="right">...</PerspectiveCard>
```
- **幅度锁死 ≤16deg**：克制的"微透视"，给卡片实体感，不做 90deg 大翻转（那会廉价）
- 内建 spring 微过冲（scale 0.85→1.025→1.0），沉稳落位
- **禁止**自己调 rotate 角度——要 3D 就用这三个预设，防止做成 Keynote 式炫酷翻转

**CrossStage 用法（同一 beat 内先后切换两段内容时）：**

```tsx
{/* 同一个 beat 内，先放图A，到 11s 换成图B，交界处无缝咬合 */}
<CrossStage showFrom={beat.from} showTo={beat.from + 150}>
  <EmbeddedMedia src="xxx/图A.png" kind="image" delay={beat.from + 4} />
</CrossStage>
<CrossStage showFrom={beat.from + 150} showTo={beat.to}>
  <EmbeddedMedia src="xxx/图B.png" kind="image" delay={beat.from + 150} />
</CrossStage>
```

- **解决什么**：分镜内两段式展示用 `frame < t ? <A/> : <B/>` 会瞬间硬切（掉帧感）。CrossStage 让 A 结束前 14 帧平滑隐退（上移+淡出）、B 起始 14 帧渐入咬合（下移归位+淡入），交界处重叠无缝
- **vs BeatWindow**：BeatWindow 管 beat（口播段）**之间**的转场；CrossStage 管**同一 beat 内部**两段内容的先后切换
- **适用**：一个口播段里要"先展示这个、再换成那个"（如：先放截图A再换成截图B、先架构图再参数卡）

**FlowDiagram vs DrawPathFlow**：
- FlowDiagram：连线用 spring 淡入，适合"架构展示"
- DrawPathFlow：连线用 strokeDashoffset 逐步绘制（像电路连通），适合"机制拆解"

### 装饰层

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **FrameChrome** | 页眉页脚小字装饰层 | `beatId`（页脚左下跟随 beat 变化方法论编号） |
| **WordKaraokeCaptions** | **中文逐字卡拉OK字幕（中文视频首选）**——正在说的字纯白+强调色下划线 | `cues`（字幕数组） |
| **SrtCaptions** | SRT cue 整句底部字幕（英文/非逐字场景） | `cues`（字幕数组，从 SRT 解析） |
| **Captions** | beat 驱动底部字幕（demo 用） | `beats`（分镜表） |

> **字幕组件选型**：中文口播视频**必须用 `WordKaraokeCaptions`**（逐字高亮，替代 snapcn karaoke 的中文不适配——snapcn 会把整句当一个词、行间叠屏）。英文或不需要逐字高亮时用 `SrtCaptions`。

### 特殊组件（demo 用，可参考风格）

| 组件 | 用途 |
|---|---|
| **BitRow** | 像素风二进制位行（5x7 像素网格数字 + 红色位号） |
| **TrackList** | 文件清单列表（虚线连接） |
| **CdDisc** | 伪 3D 光盘（rotateX + 轨道绘制 + 激光扫描） |

---

## 3. 分镜表（beats）制作流程

### 3.1 从 SRT 生成字幕数据

```bash
# 在项目根目录执行
node -e "
const fs = require('fs');
const srt = fs.readFileSync('public/xxx/captions.srt', 'utf8');
const toSec = t => { const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/); return +m[1]*3600 + +m[2]*60 + +m[3] + +m[4]/1000; };
const cues = srt.split(/\r?\n\r?\n/).map(b => b.trim()).filter(Boolean).map((b, i) => {
  const lines = b.split(/\r?\n/);
  const tl = lines.find(l => l.includes('-->')) || '';
  const [s, e] = tl.split('-->').map(x => x.trim());
  return { start: +toSec(s).toFixed(3), end: +toSec(e).toFixed(3), text: lines.slice(lines.indexOf(tl)+1).join(' ').trim() };
}).filter(c => c.text);
fs.writeFileSync('src/beats/xxx-cues.ts', 'export type Cue = { start: number; end: number; text: string };\n\nexport const xxxCues: Cue[] = ' + JSON.stringify(cues, null, 2) + ';\n');
console.log('cues:', cues.length);
"
```

### 3.2 归并 beat（口播句 → 视觉段落）

- 3-5 句口播归并为一个 beat（5-8 秒）
- 每个 beat 对应一个视觉主体（文字卡/素材嵌入/流程图/全屏聚光）
- beat 时间区间从 SRT 时间码换算（秒 × 30 = 帧）

### 3.3 分镜表模板

```ts
import type { BeatMap } from "./schema";

const C = { x: 1100, y: 625 }; // 舞台中心锁定

export const xxxBeatMap: BeatMap = {
  fps: 30,
  stage: { width: 2200, height: 1250 },
  beats: [
    { id: "b1", from: 0, to: 142, camera: { ...C, scale: 1.0 }, note: "钩子" },
    { id: "b2", from: 144, to: 311, camera: { ...C, scale: 1.05 }, note: "问题" },
    // ...
  ],
};
```

**相机原则**：
- 所有 beat 的 `camera.x/y` 锁定舞台中心（1100, 625）
- 只做 zoom（scale 0.95-1.15）：zoom in（推近）用 punch 缓动、zoom out（拉远）用 glide 缓动
- 转场窗口：切 beat 前 5 帧启动，切后 18 帧内到位，之后静止

---

## 4. 组装正片（Composition）

### 4.1 标准结构

```tsx
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraRig } from "./components/CameraRig";
import { GridBackground } from "./components/GridBackground";
import { DotMatrixBackground } from "./components/DotMatrixBackground";
import { BeatWindow } from "./components/BeatWindow";
import { FrameChrome } from "./components/FrameChrome";
import { SrtCaptions } from "./components/SrtCaptions";
// ... 其他组件

export const XxxVideo: React.FC = () => {
  const { beats, stage } = xxxBeatMap;
  const b = (id: string) => beats.find((x) => x.id === id)!;

  return (
    <AbsoluteFill style={{ background: "#050607" }}>
      <Audio src={staticFile("xxx/voiceover.mp3")} />

      <CameraRig beatMap={xxxBeatMap} viewWidth={1920} viewHeight={1080}>
        <GridBackground width={stage.width} height={stage.height} />
        <DotMatrixBackground opacity={0.4} />

        {/* 每个 beat 包一层 BeatWindow */}
        <BeatWindow from={b("b1").from} to={b("b1").to}>
          {/* 内容组件 */}
        </BeatWindow>

        {/* ... */}
      </CameraRig>

      {/* 页眉页脚装饰层 */}
      <FrameChrome beatId={b("b1").id} />

      {/* 屏幕空间暗角 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 75% 70% at 50% 46%, transparent 62%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      <SrtCaptions cues={xxxCues} />
    </AbsoluteFill>
  );
};
```

### 4.2 注册 Composition

```tsx
// src/Root.tsx
<Composition
  id="XxxVideo"
  component={XxxVideo}
  durationInFrames={1800} // 总帧数（秒 × 30）
  fps={30}
  width={1920}
  height={1080}
/>
```

---

## 5. 素材规范

### 5.1 素材准备

- **视频素材**：MP4，横屏（16:9），建议 1280x720 或 1920x1080
- **截图**：PNG，横屏，建议 1080x500 以上
- **口播音频**：MP3，与 SRT 时间码对齐
- **SRT 字幕**：标准 SRT 格式，每句一行

### 5.2 素材存放

```
public/xxx/
├─ voiceover.mp3       # 口播
├─ captions.srt        # 字幕（源文件）
├─ video1.mp4          # 视频素材（ASCII 文件名）
├─ screenshot1.png     # 截图素材
└─ ...
```

### 5.3 素材播放决策（AI 自动判断）

**核心问题**：素材可能超长（用户上传 10s+ 视频），但口播只有 5s——完整播放会拖节奏，裁掉又可能丢掉关键信息。

**决策规则**（AI 按此表自动判断，用户在分镜表 `note` 里可覆盖）：

| 素材时长与口播对比 | 口播段落特征 | 决策策略 | 实现方案 |
|---|---|---|---|
| **素材 > 口播** | 口播短（< 8s） | **截取高光** | `EmbeddedMedia` 裁剪到口播结束，`startFromSec` 选最精彩段落 |
| **素材 > 口播** | 口播长（≥ 8s） | **完整聚光** | `SpotlightMedia` 放完为止，随后 fade out 让位给下一个 beat |
| **素材 ≈ 口播**（误差 < 1.5s） | 单一主题 | **完整铺满** | `EmbeddedMedia` / `SpotlightMedia` 自然播完 |
| **素材 < 口播**（差额 ≥ 2s） | 前半段叙事，后半段结论 | **动效接力（Relay Mode）** | **严禁画面定格死锁，严禁生硬 loop**。前半段播放视频，播完瞬间无缝接力切入 MG 架构卡/对比卡/代码卡（如 `RenameScriptCard`、`HarnessSecurityCard`），承接后半句升华 |

**为什么短视频严禁定格或粗暴 loop**：
1. **定格死锁**：实拍或 3D 概念视频播放完毕后若无后继，停留在最后一帧会产生“播放器死机卡顿”的劣质感；
2. **生硬 loop**：叙事型视频（如小人跑路、操作报错、保安举盾）具有明确的动作终点，硬 loop 会导致视觉抽搐与剧烈跳帧（jump cut）；
3. **接力（Relay）的叙事优势**：科技口播的长 Beat 通常由“场景引入”与“观点升华”组成。前半段用具象视频吸睛，后半段用高信息密度 MG 卡承载干货，音画对齐最严密。

**AI 的判断逻辑**：
1. 读素材时长（ffprobe）和口播时长（SRT 时间码）
2. 若素材不足以覆盖长 Beat，检查分镜口播的语意断点（通常在第 7-8 秒），拆分为两个子时序（如 `b6.from ~ b6.from+240` 播视频，`b6.from+240 ~ b6.to` 播接力动效卡）
3. 若素材超长，按上表决策嵌入截取或全屏聚光

**用户覆盖**：如果用户对某个素材有特殊要求（"这段必须放完"或"这段只要 3 秒"），在分镜表的 `note` 里标注，AI 优先听用户的。

### 5.4 素材使用规范

- **视频**：`<OffthreadVideo src={staticFile("xxx/video1.mp4")} muted startFrom={秒 × 30} />`（OffthreadVideo 比 Video 更稳定）
- **截图**：`<Img src={staticFile("xxx/screenshot1.png")} />`
- **嵌入卡片**：`<EmbeddedMedia src="xxx/video1.mp4" kind="video" width={1120} delay={b("b1").from + 4} label="标签" />`
- **全屏聚光**：`<SpotlightMedia src="xxx/video1.mp4" kind="video" delay={b("b1").from + 4} zoomAt={18} caption="叠加文字" />`

**素材播放决策示例**：
- 汽车白模视频（10s）+ 口播"就像一辆只有底盘、发动机和接口的车"（3s）→ 口播 < 8s → EmbeddedMedia 嵌入卡片，startFromSec 选中间段（如 3s）
- 汽车白模视频（10s）+ 口播"这辆车没有车身、没有内饰、没有电子设备，只有底盘、发动机和标准化接口"（8s）→ 口播 ≥ 8s → SpotlightMedia 全屏聚光，完整播放 10s，口播结束后 fade out

---

## 5.5 动效原语层（smooth-motion 移植版）

**核心定位**：mg-blueprint 做节拍编排层（beat 结构/相机/组件组装），smooth-motion 做出入场原语层（单个元素的进/出场动效）。

### 缓动基座（src/motion/motion.ts）

| 缓动 | 用途 | 曲线 |
|---|---|---|
| `easeOutExpo` | 进场 | 起步极快，末端指数减速，稳稳停住（无回弹） |
| `easeInQuint` | 出场 | 起步温柔，末端猛烈甩出（先慢后快） |
| `easeInCubic` | 穿透缩放 | 接近立方加速，穿透瞬间足够"剧" |

### 四个动效原语（src/motion/primitives.tsx）

| 原语 | 行为 | 关键 props |
|---|---|---|
| `StaggerItem` | 多元素错峰进场停稳，随统一出场甩出 | `from`（进场方向）、`exitTo`（出场方向）、`travel` |
| `SlideInItem` | 单元素从任意侧滑入停在中心（带 6° 倾斜回正 + 抛物线沉浮的惯性感） | `from`、`exitTo` |
| `PunchThroughItem` | 中心停稳后原地急剧放大 14 倍穿透视野消失（末段过曝提亮 + 快速淡出） | `startFrame`、`holdFrames`、`punchFrames`（默认 14） |
| `CameraBreath` | 场景级极缓慢推近（scale 1→1.05 + 微漂移），消除死画面 | `from`、`to`、`driftX` |

### 转场接力铁律（必须遵守）

1. **接力时机**：新场景必须在旧场景出场走完 40% 时进场（OVERLAP = exitDur × 0.4 ≈ 6f @ exitDur=16）
2. **场景背景透明**：所有场景背景必须全部透明，底色统一铺在根容器，否则接力重叠期新场景的不透明背景会把还没飞完的旧元素整个盖住
3. **帧数区间**：进场 22-26f（0.73-0.87s）、出场 14-16f、stagger 相邻 4-8f、穿透 14-15f
4. **出场方向**：一个场景内必须统一（所有元素同方向走），场景之间可交替（右 → 上 → 穿透 → 下）

### 编排决策规则（"结构化自主"方案）

**底层参数锁死不让 Agent 碰**（缓动曲线、帧数区间、上述铁律）；**Agent 自由决策的只有编排层**：

- **进场方向就近原则**：元素在画面靠上就从上进、靠左就从左进
- **出场方向场景间交替**：避免连续两场同方向的单调感
- **原语选型**：单主角 → PunchThrough 穿透；多元素 → Stagger 错峰 / SlideIn 滑入

### BeatWindow 集成（v2 丝滑转场版）

```tsx
// 旧版：末尾 12 帧淡出上浮
<BeatWindow from={b("b1").from} to={b("b1").to}>
  <TextCard lines={...} />
</BeatWindow>

// 新版：用 smooth-motion 原语做丝滑出入场
<BeatWindow
  from={b("b1").from}
  to={b("b1").to}
  mode="stagger"        // stagger/slide/punch
  enterFrom="bottom"    // 进场方向
  exitTo="right"        // 出场方向
>
  <TextCard lines={...} />
</BeatWindow>
```

**转场接力示例**（beat 之间）：

```tsx
// b1 的元素在 b1.to - 16 帧开始出场（16 帧出场时长）
// b2 的元素在 b1.to - 6 帧开始进场（b1 出场走 40% 时进场，OVERLAP = 16 × 0.4 ≈ 6）
<BeatWindow from={b("b1").from} to={b("b1").to} mode="stagger" enterFrom="bottom" exitTo="right">
  <TextCard lines={...} />
</BeatWindow>
<BeatWindow from={b("b1").to - 6} to={b("b2").to} mode="slide" enterFrom="left" exitTo="top">
  <EmbeddedMedia ... />
</BeatWindow>
```

---

## 5.6 转场接力编排规则（v2）

### 出场方向序列（场景间交替，避免单调+动势冲突）

```
右 → 上 → 穿透 → 下 → 右 → 上 → 穿透 → 下 → ...
```

- **右出** → 下一个**从左进**（动势延续：元素从右飞出，新元素从左飞入，视觉上是"接力"）
- **上出** → 下一个**从下进**（动势延续：元素从上飞出，新元素从下飞入）
- **穿透出** → 下一个**从中心进**（动势延续：元素穿透视野消失，新元素从中心放大出现）
- **下出** → 下一个**从上进**（动势延续：元素从下飞出，新元素从上飞入）

**禁止**：
- ❌ 连续两场同方向（右出 → 右出，单调）
- ❌ 相邻镜头动势冲突（左入右出 → 下入上出，动势不和谐）

### 结尾处理（最后一个 beat 停住，不用出场动画）

```tsx
// 最后一个 beat 的 BeatWindow 不需要 exitTo，停住就行
<BeatWindow
  from={b("b13").from}
  to={b("b13").to}
  mode="slide"
  enterFrom="top"
  exitTo={null}  // 结尾不需要出场动画
>
  <FlickerText ... />
</BeatWindow>
```

### 转场打断（动势冲突时的缓冲）

如果相邻两个 beat 的动势冲突（比如左入右出 → 下入上出），用一个"打断动画"缓冲：

- **穿透打断**：中间插入一个 punch 穿透（中心放大→消失），切断前后动势
- **缩放打断**：中间插入一个 zoom in/out（相机推近/拉远），切断前后动势
- **淡入淡出打断**：中间插入一个 6 帧的黑屏淡入淡出，切断前后动势

**示例**（动势冲突时的打断）：

```tsx
// b1 左入右出
<BeatWindow from={b("b1").from} to={b("b1").to} mode="stagger" enterFrom="left" exitTo="right">
  <TextCard ... />
</BeatWindow>

// 打断：穿透（切断 b1 的右出和 b2 的上出）
<BeatWindow from={b("b1").to - 6} to={b("b1").to + 10} mode="punch" enterFrom="right">
  <OutlineTitle solid="打断" outline="过渡" />
</BeatWindow>

// b2 下入上出
<BeatWindow from={b("b1").to + 10} to={b("b2").to} mode="slide" enterFrom="bottom" exitTo="top">
  <EmbeddedMedia ... />
</BeatWindow>
```

### 进场方向就近原则（元素在画面靠上就从上进、靠左就从左进）

- 元素在画面靠上 → 从上进
- 元素在画面靠下 → 从下进
- 元素在画面靠左 → 从左进
- 元素在画面靠右 → 从右进
- 元素在画面中心 → 从中心进（punch 穿透）

### 元素分开入场/出场（画面内多个元素可以不同方向，但必须和谐）

**允许的组合**（动势和谐）：
- ✅ 标题从上入场 + 画面从下入场（垂直方向分离，上下对称）
- ✅ 标题从左入场 + 画面从右入场（水平方向分离，左右对称）
- ✅ 标题从上入场 + 画面从右入场（垂直+水平，动势不冲突）

**禁止的组合**（动势冲突）：
- ❌ 标题从下入场 + 画面从右入场（下+右，动势奇怪）
- ❌ 标题从左入场 + 画面从上入场（左+上，动势奇怪）
- ❌ 标题从下入场 + 画面从左入场（下+左，动势奇怪）
- ❌ 标题从右入场 + 画面从上入场（右+上，动势奇怪）

**出场规则**：
- 可以同步出场（所有元素同方向一起甩出）
- 可以分开出场（标题从上出 + 画面从下出，或标题从左出 + 画面从右出）
- 分开出场时必须和入场方向形成"对称"（入：上+下 → 出：上+下；入：左+右 → 出：左+右）

**示例**（元素分开入场/出场）：

```tsx
// 标题从上入场 + 画面从下入场（垂直分离）
<BeatWindow from={b("b1").from} to={b("b1").to} mode="stagger" enterFrom="top" exitTo="top">
  <TextCard lines={[{ text: "标题" }]} />
</BeatWindow>
<BeatWindow from={b("b1").from + 8} to={b("b1").to} mode="stagger" enterFrom="bottom" exitTo="bottom">
  <EmbeddedMedia ... />
</BeatWindow>

// 标题从左入场 + 画面从右入场（水平分离）
<BeatWindow from={b("b2").from} to={b("b2").to} mode="slide" enterFrom="left" exitTo="left">
  <TextCard lines={[{ text: "标题" }]} />
</BeatWindow>
<BeatWindow from={b("b2").from + 8} to={b("b2").to} mode="slide" enterFrom="right" exitTo="right">
  <EmbeddedMedia ... />
</BeatWindow>
```

### 原语选型（单主角 vs 多元素）

- **单主角**（一个素材/一个关键词）→ PunchThrough 穿透
- **多元素**（文字卡+素材嵌入/流程图）→ Stagger 错峰 / SlideIn 滑入

### 出入场快慢错落（enterRate / exitRate，不要全部统一速度）

元素入场和出场都可以做快慢效果，不要全部统一一个速度——有些可以提前进场、有些慢点进场，出场也是，部分同步出场即可。

```tsx
// StaggerItem / SlideInItem / BeatWindow 都支持 enterRate / exitRate 倍率
// <1 更快更提前，>1 更慢更拖后，默认 1
<BeatWindow enterRate={0.85} exitRate={1}>   // 进场稍快
<BeatWindow enterRate={1.15} exitRate={0.8}> // 进场稍慢，出场先走
```

全片错落应用（如 b1 进 0.85 / b2 出 0.8 / b4 进 1.15 / b5 进 0.9 出 1.1），需要同步出场的保持 1。

---

## 5.7 口播视频分镜铁律（v3，口播驱动必看）

**有 SRT 口播的视频（知识讲解/产品介绍），分镜表必须严格按口播时间线，不能套用"相邻 beat 重叠 6 帧接力"**：

1. **beat 边界 = 口播句子边界**：`from = 该段首句开始秒 × fps`，`to = 该段末句结束秒 × fps`
2. **相邻 beat 不重叠**：上一个画面在口播讲完那帧才走，下一个紧跟着进。重叠接力会让"口播还没说完画面就跳了"
3. **丝滑感靠 BeatWindow 进出场缓动在边界自然衔接**，不靠画面提前抢跑
4. **素材比 beat 长的嵌段**（如"跑步比喻"素材 8s 但只讲 3s）：让 beat 窗口匹配口播时长，素材用 loop 或自然播完，别"口播说完就切"

> 反面教训：套用 5.5 的"重叠 6 帧接力"做口播视频，会导致"9 秒才说费 TOKEN 但 6 秒就出动画""13 秒没讲完就跳下一个画面"——分镜表边界必须 = 口播边界。

---

## 5.8 嵌入视频播放修复（EmbeddedMedia startAtFrame）

**普通 `<Video>` 跟随全局 Composition 时间轴**：某段视频在全片第 50 秒处，它就去找素材第 50 秒——素材只有 8 秒，会**定格在最后一帧静态图**。

修复：EmbeddedMedia 加 `startAtFrame` prop，内部用 `<Sequence from={startAtFrame} layout="none">` 把视频局部时间轴归零——全局第 50 秒时，视频从第 0 帧起播：

```tsx
<EmbeddedMedia
  src="xxx.mp4"
  kind="video"
  delay={b("b8").from + 10}
  startAtFrame={b("b8").from + 10}  // = 内容真正开始的全局帧
/>
```

**禁止**：给 `<Video>` 动态算 startFrom/trimBefore 来"定位"——那些 prop 只在挂载时生效一次且语义是"裁剪"不是"定位"，动态算会把时间轴搞乱锁死成静态图。

**视频渲染抖动**：保持普通 `<Video>` + `acceptableTimeShiftInSeconds={0.6}` 容忍寻址误差。**不要换 `<OffthreadVideo>`**——它有 seek 缓存 bug（并发渲染时视频流 seek 后缓存不失效，一直返回同一关键帧 → 卡成静态图）。

---

## 5.9 新增通用组件（2026-08 组件介绍视频沉淀）

| 组件 | 用途 |
|---|---|
| `PrimitiveCards` | 组件/能力卡片展开+合拢动画（一叠→横排展示+微动效→合拢滑出） |
| `FilmReel` | 历史视频/作品胶片滚动（横排+齿孔边框+缓慢匀速滚动） |
| `SpeedCurve` | 缓动速度-时间曲线可视化（easeOutExpo/easeInQuint 对照） |
| `TokenCounter` | 数字爆炸式上涨计数器（成本/数据冲击记忆点） |
| `WebpageThinking` | "用写网页思维做视频"对照演示（代码块逐行敲出+元素僵硬线性运动） |
| `WordKaraokeCaptions` | 中文逐字卡拉OK字幕（正在说的字纯白+强调色下划线，替代 snapcn karaoke 的中文不适配） |
| `LikeShareEnd` | 结尾点赞+转发 SVG 动画（弹入+回弹+脉冲） |

---

## 6. 常见模式（直接抄）

### 6.1 钩子段（GitHub 录屏 + 文字卡）

```tsx
<BeatWindow from={b("b1").from} to={b("b1").to} offsetY={-40}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
    <TextCard
      kicker="GitHub"
      delay={b("b1").from + 4}
      lines={[{ text: "XXX，正在爆火" }]}
    />
    <EmbeddedMedia
      src="xxx/github-stars.mp4"
      kind="video"
      width={1120}
      delay={b("b1").from + 10}
      label="github.com/xxx"
    />
  </div>
</BeatWindow>
```

### 6.2 问题段（分岔流程图）

```tsx
<BeatWindow from={b("b2").from} to={b("b2").to}>
  <FlowDiagram
    delay={b("b2").from + 4}
    width={1500}
    height={480}
    nodes={[
      { id: "q", x: 610, y: 30, w: 280, h: 96, title: "要跟这个热潮吗？", accent: "#E8E8E8" },
      { id: "judge", x: 640, y: 190, w: 220, h: 90, title: "先判断", accent: "#4C8DFF" },
      { id: "fit", x: 380, y: 350, w: 250, h: 88, title: "适合自己", desc: "再部署不迟", accent: "#3DBA7E" },
      { id: "unfit", x: 880, y: 350, w: 250, h: 88, title: "不适合", desc: "省下部署的时间", accent: "#E24B4A" },
    ]}
    edges={[
      { from: "q", to: "judge", accent: "#4C8DFF" },
      { from: "judge", to: "fit", accent: "#3DBA7E" },
      { from: "judge", to: "unfit", accent: "#E24B4A" },
    ]}
  />
</BeatWindow>
```

### 6.3 定义段（官网截图 + 高亮）

```tsx
<BeatWindow from={b("b3").from} to={b("b3").to} offsetY={-40}>
  <EmbeddedMedia
    src="xxx/harness-home.png"
    kind="image"
    width={1220}
    delay={b("b3").from + 4}
    label="XXX 官网"
  >
    <HighlightCallout
      x={6}
      y={41}
      w={27}
      h={24}
      label="官方定义：一切皆插件"
      delay={b("b3").from + 26}
    />
  </EmbeddedMedia>
</BeatWindow>
```

### 6.4 类比段（全屏聚光视频）

```tsx
<BeatWindow from={b("b4").from} to={b("b4").to} offsetY={-40}>
  <SpotlightMedia
    src="xxx/chassis-3d.mp4"
    kind="video"
    delay={b("b4").from + 4}
    startFromSec={2}
    zoomAt={18}
    caption="一辆只有底盘、发动机和接口的车"
  />
</BeatWindow>
```

### 6.5 转折段（文字卡 + 关键词闪烁）

```tsx
<BeatWindow from={b("b7").from} to={b("b7").to}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
    <TextReveal
      text="框架本身"
      fontSize={64}
      delay={b("b7").from + 4}
      preset="per-character-rise"
      color="#EDEDED"
    />
    <FlickerText
      text="是优秀的技术创新"
      fontSize={64}
      delay={b("b7").from + 18}
      duration={15}
      flickerCount={3}
      letterFlickerIntensity={12}
      strokeColor="#4C8DFF"
      fillColor="#4C8DFF"
    />
  </div>
</BeatWindow>
```

### 6.6 对比段（能力卡片组）

```tsx
<BeatWindow from={b("b10").from} to={b("b10").to}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
    <TextCard
      delay={b("b10").from + 4}
      lines={[{ text: "豆包 · Codex · WorkBuddy 已经内置" }]}
    />
    <FeatureCards
      delay={b("b10").from + 18}
      items={[
        { title: "Harness 执行逻辑", desc: "任务循环与插件调度开箱即用" },
        { title: "插件商店", desc: "能力即装即用，无需手写配置" },
        { title: "记忆系统", desc: "上下文与偏好长期沉淀" },
      ]}
    />
  </div>
</BeatWindow>
```

### 6.7 收束段（金句 + 关键词闪烁）

```tsx
<BeatWindow from={b("b13").from} to={b("b13").to}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
    <TextCard
      variant="quote"
      kicker="新技术热潮来袭"
      delay={b("b13").from + 4}
      lines={[{ text: "先分清你要的是" }]}
    />
    <FlickerText
      text="研究工具，还是生产力工具"
      fontSize={76}
      delay={b("b13").from + 22}
      duration={15}
      flickerCount={5}
      letterFlickerIntensity={10}
      strokeColor="#4C8DFF"
      fillColor="#EDEDED"
      restState="outline"
    />
  </div>
</BeatWindow>
```

---

## 7. 节奏与构图原则

### 7.1 节奏

- **beat 时长**：5-8 秒（3-5 句口播）
- **转场**：23 帧（0.77 秒），punch/glide/whip 分段缓动
- **文字入场**：12-25 帧，stagger 相邻 4-9 帧
- **关键词闪烁**：15 帧（0.5 秒），快速跳几下即停
- **素材入场**：spring（damping 22, stiffness 110），伪 3D 飞入或上浮

### 7.2 构图

- **主体居中**：所有内容锚定舞台中心（1100, 625）
- **单屏信息点**：3-5 个以内
- **文字层级**：kicker（小标）→ lines（主文案）→ sub（副文案）
- **素材层级**：EmbeddedMedia（嵌入卡片）→ SpotlightMedia（全屏聚光）
- **装饰层级**：GridBackground（网格）→ DotMatrixBackground（点阵）→ FrameChrome（页眉页脚）→ 暗角 → SrtCaptions（字幕）

### 7.3 色彩（skill 级别规范，所有 agent 必须遵守）

**核心原则**：深蓝灰底 + 冷静蓝强调 + 近白文字，禁止高饱和亮色/撞色/彩虹渐变。

#### 背景层

| 元素 | 色值 | 说明 |
|---|---|---|
| 舞台背景 | `#050607` | 深黑，所有 beat 的底色 |
| 网格细线 | `rgba(255,255,255,0.045)` | 1px 细网格 |
| 网格粗线 | `rgba(255,255,255,0.09)` | 5x5 粗网格 |
| 点阵（DotMatrixBackground） | `#2A4A75` → `#6BA8FF` → `#F0F4FF` | 深蓝灰系，opacity 0.4，Perlin 噪点流动 |
| 暗角 | `radial-gradient(ellipse 75% 70% at 50% 46%, transparent 62%, rgba(0,0,0,0.5) 100%)` | 屏幕空间四边压暗 |

#### 文字层

| 元素 | 色值 | 说明 |
|---|---|---|
| 主文字 | `#EDEDED` | 近白，所有正文/标题 |
| 辅助灰 | `rgba(255,255,255,0.45-0.65)` | kicker/sub/标签/页眉页脚 |
| 强调蓝 | `#4C8DFF` | 关键词/高亮框/连线/节点 |
| 警告红 | `#E24B4A` | 警告/否定/不推荐（仅 TextCard variant="warning" 和 FlickerText 警告段用） |
| 成功绿 | `#3DBA7E` | 正确/推荐/通过（仅对比段"适合"分支用） |
| 描边（OutlineTitle/FlickerText restState="outline"） | `rgba(255,255,255,0.22)` | 描边空心字 |

#### 素材层

| 元素 | 色值 | 说明 |
|---|---|---|
| 嵌入卡片背景 | `#0B0D10` | EmbeddedMedia/SpotlightMedia 的卡片底色 |
| 嵌入卡片边框 | `rgba(255,255,255,0.14)` | 1px 圆角边框 |
| 高亮框（HighlightCallout） | `#4C8DFF` | 3px 边框 + 外发光 |
| 流程图节点背景 | `#10141A` | FlowDiagram/DrawPathFlow 的节点底色 |
| 流程图连线 | `rgba(255,255,255,0.5)` | 默认连线色 |
| 流程图强调连线 | `#4C8DFF` / `#3DBA7E` / `#E24B4A` | 按语义上色（中性/正确/错误） |
| 流程图虚线 | `rgba(255,255,255,0.35)` | "需自建/缺失"的虚线节点 |

#### 装饰层

| 元素 | 色值 | 说明 |
|---|---|---|
| 页眉页脚小字 | `rgba(255,255,255,0.45)` | FrameChrome 的等宽字体小字 |
| 字幕 | `#FFFFFF` + `textShadow: 0 2px 10px rgba(0,0,0,0.95)` | SrtCaptions 的底部字幕 |

#### 禁止事项

- ❌ **高饱和亮色**：`#FF0000`、`#00FF00`、`#FFFF00` 等纯色系
- ❌ **撞色/彩虹渐变**：`linear-gradient(90deg, red, yellow, green, blue)`
- ❌ **暖色底**：`#FFF`、`#F5F5F5`、`#FAFAFA` 等浅色背景（除非是素材本身）
- ❌ **紫色/粉色**：`#FF00FF`、`#9C27B0` 等（除非是素材本身）
- ❌ **自定义强调色**：除 `#4C8DFF`/`#E24B4A`/`#3DBA7E` 外，不允许新增强调色

#### 例外

- **素材本身的颜色**（录屏/截图/AI 生成视频）不受限制，但嵌入时必须加 `EmbeddedMedia` 的深色边框 + 阴影，与背景融合
- **浅色素材**（如白底录屏）可加 `SpotlightMedia` 的底部 scrim（`linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)`）保证字幕可读

---

## 8. 迭代流程

1. **Studio 预览**：`./node_modules/.bin/remotion studio src/index.ts --port=3103`，改代码保存即热更新
2. **抽帧验证**：`./node_modules/.bin/remotion still src/index.ts XxxVideo out/check.png --frame=400`（文件写出即成功，退出码可能报 1 属正常）
3. **用户确认**：在 Studio 里拖时间轴逐 beat 检查，用户说"OK"才渲染
4. **渲染出片**：`./node_modules/.bin/remotion render src/index.ts XxxVideo out/xxx.mp4 --codec h264 --crf 16 --concurrency=2`

**禁止**：不要在迭代期渲染（900 帧约 10 分钟），只走 Studio 预览。

---

## 9. 故障排查

| 问题 | 原因 | 解决 |
|---|---|---|
| Studio 预览视频静态 | Video 组件兼容性问题 | 换 OffthreadVideo，硬刷新（Ctrl+Shift+R） |
| 抽帧/渲染卡死 | Chrome 冷启动 + 内存不足 | 32GB 内存用 `--concurrency=4`，如果还是卡降到 2，关闭其他 Chrome 标签页 |
| 元素跑偏出画面中心 | CameraRig 缺 `transformOrigin: "0 0"` | 检查 CameraRig 的舞台 div |
| 相机一直晃动 | 呼吸漂移没删干净 | 检查 CameraRig 的 keyframe 结构（hold→急滑→hold） |
| 素材加载失败 | 中文文件名 | 改成 ASCII 文件名 |

---

## 10. 待启用组件（备用）

- **AnswerStream**（AI 问答界面动画）：发送按钮微距→硬切→答案逐字流出+卡片落地+相机拉远，适合做"AI 产品功能演示"视频
- **TerminalSimulator**（终端命令行演示）：微距发送按钮→硬切→命令面板打字→终端输出滚动+相机 whip/punch 运镜+运动模糊拖尾，适合做"命令行/代码演示"视频
- **DrawPathFlow**（流程图线条逐步绘制）：已在组件库，适合做"机制拆解"视频

启用时需要剥掉 SnapCn 主题系统/色板/字体依赖，换成深蓝灰系。

---

## 7. 原子组件层（atoms/ —— 焊死手感，Agent 只塞内容）

**这一层是为了防"Agent 实现缩水"**：规范写得再全，Agent 也会随手写 `<div>` 平铺。atoms 把动效手感、时序、字阶全部焊死在组件里，Agent 只能往里塞内容，结构上物理不可能写歪。

| 组件 | 焊死的东西 | 用法 |
|---|---|---|
| `StaggerGroup` | interval=4 帧（锁死，>8 帧大脑识别为串行）；进场强制复合（位移+scale0.93→1+透明度前25%拉满）；出场统一方向加速甩走 | `<StaggerGroup startFrame={x} exitStartFrame={y}><A/><B/></StaggerGroup>` |
| `SnapText` | overflow 遮罩裁切 + translateY(40→0) 弹射 + 复合微缩放；字阶焊死 hero≥88px / sub≤24px，禁 24-44px 中间字号 | `<SnapText text="主标" sub="次级" size="hero" startFrame={x}/>` |
| `CameraDrift` | 任何素材包进来强制非线性推焦+微呼吸+微暗角加深；focal=true 前景推近更快（视差） | `<CameraDrift src="x.mp4" kind="video" startAtFrame={x}/>` |
| `SpecDivider` | 0.5px 极细线+等宽编码标签分区，替代所有卡片背景框/阴影/大圆角 | `<SpecDivider label="SECTION" startFrame={x}/>` |

**Agent 调用铁律**：能整段用 atoms 就用 atoms，不要拆回 StaggerItem/SlideInItem 裸拼。

## 8. 强制时序插槽（Stagger Timeline Slot）

极客湾的流畅感来自"上一个动作没停稳，下一个已经抢跑几帧"。任何分镜的元素必须分配到这 4 个 Slot，**严禁等上一个动画完全结束再启动**：

| Slot | 触发相对帧 | 动作 | 动效参数（本库调性） |
|---|---|---|---|
| Slot 0 (Camera) | Frame 0 | 底层素材 CameraDrift 推焦+微暗角加深 | easeInOut 240f 推焦 |
| Slot 1 (Hero Title) | Frame 3 | SnapText 超大主标从遮罩底部弹射 | easeOutExpo 16f 稳停 |
| Slot 2 (Annotation) | Frame 8 | SpecDivider 引线/高亮几何块抢跑展开 | 0→100% 8f 完成 |
| Slot 3 (Meta Data) | Frame 12 | 底部极简参数/次级文字浮现 | opacity 0→1 + translateY 15→0 |

## 9. 代码级负向红线（AGENT CODE GENERATION CONSTRAINTS, VIOLATIONS WILL BE REJECTED）

```markdown
1. NO 元素孤立淡入淡出（纯 opacity 0→1）—— 必须复合位移+缩放
2. NO stagger interval > 8 帧 —— 锁死 4 帧（StaggerGroup 已内建）
3. NO 裸 <Img>/<Video> —— 必须包 CameraDrift 或 EmbeddedMedia
4. NO 垂直堆叠超过 1 个主论点每屏 —— 单焦点节拍
5. 字号禁止落在 24-44px 区间 —— 要么 ≥88px Hero，要么 ≤22px Meta/Spec
6. NO 高饱和亮色/撞色/彩虹渐变 —— 深蓝灰底 + 冷静蓝强调
7. NO 等上一个动画完全结束再启动下一个 —— 按 Slot 表抢跑
```

### 红线 3 详解：素材必须装容器（违反 = 画面崩坏的头号来源）

**任何素材（图片/视频/录屏/截图）都不允许直接 `<Img>` 或 `<Video>` 裸贴在画面上**——裸素材没有边框、没有入场、没有推焦，会像"一张图糊在屏幕上"，画面瞬间崩坏。

❌ **违规（画面崩坏的根源）**：
```tsx
<Img src={staticFile("xxx/screenshot.png")} style={{ width: 800 }} />  // 裸贴！
<Video src={staticFile("xxx/clip.mp4")} />  // 裸贴！
```

✅ **正确（素材必须装进容器组件）**：
```tsx
// 嵌入卡片（不占满画面，录屏/截图展示）
<EmbeddedMedia src="xxx/screenshot.png" kind="image" width={900} delay={beat.from + 4} startAtFrame={beat.from + 4} />

// 全屏聚光（素材作为画面主体，放大展示细节）
<SpotlightMedia src="xxx/clip.mp4" kind="video" delay={beat.from + 4} zoomAt={beat.from + 30} />

// 素材需要持续推焦呼吸感时，再叠 CameraDrift
<CameraDrift src="xxx/screenshot.png" kind="image" width={900} startAtFrame={beat.from + 4} focal />
```

**判断口诀**：只要你想在画面上放任何图片/视频，第一反应必须是"用哪个容器装它"，而不是"贴上去"。容器负责边框/圆角/入场/阴影/推焦，你只管用。


## 10. recipes/ 样例工程（Agent 的 Few-Shot 基准）

`/recipes` 里是两个官方基准样例，**Agent 写新分镜时必须严格仿照它们的 DOM 深度与动效调用方式**，禁止退化回劣质网页模板：

- `HardwareAnalysisRecipe.tsx`（原光碟/8bit demo）：底层素材推焦 + 几何色块高亮 + 单点超大字阶的标准实现
- `ArchitectureSpecRecipe.tsx`（原 Deepseek 讲解）：冷灰/纯黑底 + 锁定相机 zoom-only + 单句核心论点的标准实现

给 Agent 的 Prompt 里写明：**"必须严格仿照 /recipes/HardwareAnalysisRecipe.tsx 或 /recipes/ArchitectureSpecRecipe.tsx 的 DOM 深度与动效调用方式编写新分镜"**。

---

**文件结束。** 用这套组件库做新视频时，只需要：准备素材 → 生成分镜表 → 组装 Composition → Studio 预览迭代 → 渲染出片。
