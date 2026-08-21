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
| **EmbeddedMedia** | 视频/截图嵌入卡片（伪3D 右侧飞入） | `src`、`kind`（video/image）、`width`、`delay`、`startFromSec`（视频裁剪起点秒）、`label`（左上标签） |
| **SpotlightMedia** | 全屏聚光素材段（小框→放大下移→停住） | `src`、`kind`、`delay`、`zoomAt`（放大开始帧）、`caption`（叠加文字） |
| **HighlightCallout** | 截图关键区域高亮框 | `x/y/w/h`（相对容器百分比）、`label`、`delay`、`accent`（默认蓝） |

**EmbeddedMedia vs SpotlightMedia**：
- EmbeddedMedia：素材作为"嵌入卡片"，不占满画面（适合录屏/截图展示）
- SpotlightMedia：素材作为"全屏主体"，小框入场后放大下移成为画面主体（适合需要展示细节的视频/图片）

### 流程/机制图

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **FlowDiagram** | 节点-连线机制图（连线逐步绘制） | `nodes`（节点数组）、`edges`（连线数组）、`activeNodeId`（当前讲解节点高亮） |
| **DrawPathFlow** | 流程图线条逐步绘制（带流动圆点） | 同 FlowDiagram，但连线用 strokeDashoffset 逐步绘制，支持 `flow: true`（流动圆点表示执行流） |
| **FeatureCards** | 能力/要点卡片组（逐张 stagger 上浮） | `items`（卡片数组）、`delay`、`cardWidth` |

**FlowDiagram vs DrawPathFlow**：
- FlowDiagram：连线用 spring 淡入，适合"架构展示"
- DrawPathFlow：连线用 strokeDashoffset 逐步绘制（像电路连通），适合"机制拆解"

### 装饰层

| 组件 | 用途 | 关键参数 |
|---|---|---|
| **FrameChrome** | 页眉页脚小字装饰层 | `beatId`（页脚左下跟随 beat 变化方法论编号） |
| **SrtCaptions** | SRT cue 驱动底部字幕 | `cues`（字幕数组，从 SRT 解析） |
| **Captions** | beat 驱动底部字幕（demo 用） | `beats`（分镜表） |

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

| 素材时长 | 口播时长 | 决策 | 组件 |
|---|---|---|---|
| 素材 ≤ 口播 | — | **完整播放** | SpotlightMedia（全屏聚光） |
| 素材 > 口播 | 口播 < 8s | **裁到口播结束** | EmbeddedMedia（嵌入卡片，startFromSec 选最精彩段落） |
| 素材 > 口播 | 口播 ≥ 8s | **完整播放** | SpotlightMedia（全屏聚光，素材放完为止，口播结束后 fade out） |

**AI 的判断逻辑**：
1. 读素材时长（ffprobe）和口播时长（SRT 时间码）
2. 按上表决策用 EmbeddedMedia 还是 SpotlightMedia
3. 如果用 EmbeddedMedia，选素材的"最精彩段落"（通常是中间 1/3，避开开头结尾的淡入淡出）
4. 如果用 SpotlightMedia，素材放完后 fade out 让位给下一个 beat

**用户覆盖**：如果用户对某个素材有特殊要求（"这段必须放完"或"这段只要 3 秒"），在分镜表的 `note` 里标注，AI 优先听用户的。

**示例**：
- 汽车白模视频（10s）+ 口播"就像一辆只有底盘、发动机和接口的车"（3s）→ 口播 < 8s → EmbeddedMedia 嵌入卡片，startFromSec 选中间段
- 汽车白模视频（10s）+ 口播"这辆车没有车身、没有内饰、没有电子设备，只有底盘、发动机和标准化接口"（8s）→ 口播 ≥ 8s → SpotlightMedia 全屏聚光，完整播放 10s，口播结束后 fade out

### 5.4 素材使用

**注意**：素材文件名必须 ASCII（中文文件名会导致加载失败），复制到 public 时改名。

### 5.3 素材使用

- **视频**：`<OffthreadVideo src={staticFile("xxx/video1.mp4")} muted startFrom={秒 × 30} />`（OffthreadVideo 比 Video 更稳定）
- **截图**：`<Img src={staticFile("xxx/screenshot1.png")} />`
- **嵌入卡片**：`<EmbeddedMedia src="xxx/video1.mp4" kind="video" width={1120} delay={b("b1").from + 4} label="标签" />`
- **全屏聚光**：`<SpotlightMedia src="xxx/video1.mp4" kind="video" delay={b("b1").from + 4} zoomAt={18} caption="叠加文字" />`

**素材播放决策示例**：
- 汽车白模视频（10s）+ 口播"就像一辆只有底盘、发动机和接口的车"（3s）→ 口播 < 8s → EmbeddedMedia 嵌入卡片，startFromSec 选中间段（如 3s）
- 汽车白模视频（10s）+ 口播"这辆车没有车身、没有内饰、没有电子设备，只有底盘、发动机和标准化接口"（8s）→ 口播 ≥ 8s → SpotlightMedia 全屏聚光，完整播放 10s，口播结束后 fade out

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

**文件结束。** 用这套组件库做新视频时，只需要：准备素材 → 生成分镜表 → 组装 Composition → Studio 预览迭代 → 渲染出片。
