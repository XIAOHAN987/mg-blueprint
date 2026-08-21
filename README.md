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

```bash
# 安装依赖
npm install

# 启动 Studio 预览（改代码保存即热更新）
npm run studio
# 浏览器打开 http://localhost:3000，左上角切换 Composition

# 渲染出片（用户确认后）
npm run render
```

## 项目结构

```
src/
├─ components/          # 组件库
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
├─ Demo.tsx             # demo 合成（CD/8bit 科普）
├─ Deepseek.tsx         # DeepSeek 视频合成
└─ Root.tsx             # Composition 注册

public/               # 素材（视频/截图/音频/字幕）
├─ deepseek/              # DeepSeek 视频素材
└─ ...

COMPONENTS.md         # 组件库使用手册（给 AI 的交接文档）
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
