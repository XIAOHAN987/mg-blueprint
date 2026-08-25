# MG Blueprint

高信息密度、冷静克制的知识讲解类 Remotion MG 动画模板工程。

伪 3D、镜头呼吸、防 PPT 感——用代码实现专业科普视频的质感。

## 特性

- **锁定居中相机系统**：机位永远钉在舞台中心，只做 zoom（punch/glide/whip 分段缓动 + ghost trail 运动模糊拖尾）
- **点阵动态背景**：Perlin 噪点点阵（ogl WebGL），极光般缓慢流动
- **细网格蓝图背景**：标志性网格，3x 超大平面，相机怎么拉都不穿帮
- **文字系统**：TextReveal（14 种预设的叙述入场）+ FlickerText（关键词 0.5s 快速闪烁）+ TextCard（观点卡三变体）+ OutlineTitle（描边空心大字）
- **素材嵌入**：EmbeddedMedia（伪 3D 飞入卡片）+ SpotlightMedia（全屏聚光：小框→放大下移→停住）+ HighlightCallout（截图高亮框）
- **流程图**：FlowDiagram（架构展示）+ DrawPathFlow（机制拆解，线条逐步绘制+流动圆点）+ FeatureCards（能力卡片组）
- **装饰层**：FrameChrome（页眉页脚小字）+ SrtCaptions（SRT 驱动字幕）
- **分镜表驱动**：SRT 字幕 → beat 归并 → 分镜表 JSON → 组件组装，口播/字幕/相机三条轨道同源对齐

## 快速开始

### 给创作者（你不会写代码也能用）

这套库是给你的 **AI Agent**（Claude / Cursor / WorkBuddy 等）准备的。你不需要懂代码，只要：

**1. 准备素材**（放进 `public/` 目录）：

| 素材 | 必需? | 说明 |
|---|---|---|
| 口播音频 | 推荐 | `.wav` / `.mp3`，你念一遍稿子 |
| 字幕文件 | 推荐 | `.srt`，和音频对齐的字幕（剪映/必剪可导出） |
| 录屏/产品片段 | 可选 | `.mp4`，要展示的画面 |
| 截图/图片 | 可选 | `.png`，要讲解的界面 |

> 没素材也能先看效果：直接跑 `npm run studio`，左上角切到 `HardwareAnalysisRecipe` 或 `ArchitectureSpecRecipe`，这两个是自带的完整示例。

**2. 对你的 Agent 说一句话**：

```
用 mg-blueprint 这套组件库帮我做一条视频。
素材在 public/ 里：口播是 xxx.wav，字幕是 xxx.srt，还有 xxx.mp4 录屏。
先读 COMPONENTS.md 和 /recipes 里的样例，严格仿照它们的写法。
必须用 atoms 原子组件（StaggerGroup/SnapText/CameraDrift/SpecDivider），遵守第9章红线清单。
做完启动 Studio 让我预览，我确认后再渲染。
```

**3. 预览 + 确认 + 出片**：Agent 会启动预览给你看，你说"这里不对"它就改，确认后渲染出 mp4。

---

### 给开发者（或 Agent 自己读）

**工作流**（严格按此顺序，不要跳步）：

1. **读规范**：先读 `COMPONENTS.md` 全文——里面有原子组件用法（第7章）、时序插槽（第8章）、负向红线（第9章）、素材播放决策（5.x 章）
2. **读样例**：读 `/recipes/HardwareAnalysisRecipe.tsx` 和 `/recipes/ArchitectureSpecRecipe.tsx`，新分镜必须严格仿照它们的 DOM 深度与动效调用方式
3. **素材归位**：让用户把素材放进 `public/<项目名>/`
4. **生成分镜表**：SRT 字幕 → 归并成 beat → 写进 `src/beats/<项目名>.ts`（**beat 边界 = 口播句子边界，相邻 beat 不重叠**——见 5.7 铁律）
5. **组装合成**：新建 `src/<项目名>.tsx`，用 atoms 原子组件 + recipes 的结构组装，注册到 `Root.tsx`
6. **预览迭代**：`npm run studio`，改代码保存即热更新，**迭代期不要渲染**（太慢）
7. **渲染出片**：用户确认后 `npm run render`

```bash
npm install        # 装依赖
npm run studio     # 预览（改代码即热更新）
npm run render     # 渲染出片（用户确认后）
```

## 项目结构

```
src/
├─ components/          # 组件库
│  ├─ atoms/               # 原子组件（焊死手感，Agent 只塞内容）
│  │  ├─ StaggerGroup.tsx    # 错峰进场合（interval=4 锁死，复合爆发）
│  │  ├─ SnapText.tsx        # 超大字阶弹射（hero≥88px / sub≤24px 焊死）
│  │  ├─ CameraDrift.tsx     # 素材推焦+微呼吸+视差（抹杀静态死图）
│  │  └─ SpecDivider.tsx     # 0.5px 极细线分区（替代卡片背景框）
│  ├─ CameraRig.tsx         # 相机系统（核心）
│  ├─ GridBackground.tsx    # 细网格蓝图背景
│  ├─ DotMatrixBackground.tsx # 点阵动态背景
│  ├─ BeatWindow.tsx        # beat 显隐协议
│  ├─ TextReveal.tsx        # 叙述性文字入场（14 种预设）
│  ├─ FlickerText.tsx       # 关键词闪烁强调
│  ├─ TextCard.tsx          # 观点卡（normal/warning/quote）
│  ├─ OutlineTitle.tsx      # 描边空心大字
│  ├─ EmbeddedMedia.tsx     # 素材嵌入卡片（伪3D飞入）
│  ├─ SpotlightMedia.tsx    # 全屏聚光素材段
│  ├─ HighlightCallout.tsx  # 截图高亮框
│  ├─ FlowDiagram.tsx       # 节点-连线机制图
│  ├─ DrawPathFlow.tsx      # 流程图线条逐步绘制
│  ├─ FeatureCards.tsx      # 能力卡片组
│  ├─ FrameChrome.tsx       # 页眉页脚装饰层
│  ├─ SrtCaptions.tsx       # SRT 驱动字幕
│  └─ ...
├─ beats/               # 分镜表
│  ├─ schema.ts             # BeatMap 类型定义
│  ├─ demo.ts               # demo 分镜表（CD/8bit 科普）
│  └─ deepseek.ts           # DeepSeek 视频分镜表
├─ recipes/             # Agent Few-Shot 基准样例（写新分镜必须仿照）
│  ├─ HardwareAnalysisRecipe.tsx  # 底层素材推焦+几何高亮+单点超大字阶
│  └─ ArchitectureSpecRecipe.tsx  # 冷灰底+锁定相机 zoom-only+单句核心论点
└─ Root.tsx             # Composition 注册

public/               # 素材（视频/截图/音频/字幕）
├─ deepseek/              # DeepSeek 视频素材
└─ ...

COMPONENTS.md         # 组件库使用手册（给 AI 的交接文档，含原子组件/时序插槽/红线清单）
HANDOFF.md            # 优化交接文档（历史）
```

## 组件使用

详见 [COMPONENTS.md](./COMPONENTS.md)（组件库使用手册，含常见模式代码模板、节奏构图色彩规范、迭代流程、故障排查）。

## 技术栈

- **Remotion 4.0**：React 驱动的视频渲染框架
- **React 18**：组件化 UI
- **TypeScript**：类型安全
- **ogl**：WebGL 库（点阵背景）
- **@remotion/transitions**：转场（TransitionSeries）
- **@remotion/paths**：路径动画（evolvePath）
- **@remotion/google-fonts**：字体加载
- **@remotion/shapes**：几何图形
- **@remotion/media-utils**：媒体工具

## 渲染配置

`remotion.config.ts` 已配置：
- 系统 Chrome 渲染（WorkBuddy 沙箱会拦截 headless shell 下载）
- `--concurrency=4`（32GB 内存，16GB 请降到 2）
- JPEG 帧格式（比 PNG 快）
- 覆盖输出

## 致谢

- [Originkit](https://originkit.dev/)：Dot Matrix / Flicker Text 组件原型
- [SnapCn](https://snapcn.dev/)：TextReveal / AnswerStream / TerminalSimulator 组件原型
- [Remotion](https://remotion.dev/)：视频渲染框架

## License

MIT
