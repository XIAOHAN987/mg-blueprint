# DeepSeek Harness 科普视频 · 优化交接文档

> 写给接手的模型/工程师：本文档包含项目现状、已验证的规则、待优化项与具体执行方案。
> 读完本文档即可直接开工，不需要重新摸索。

---

## 0. 快速启动

```bash
cd mg-blueprint   # 仓库根目录
./node_modules/.bin/remotion studio src/index.ts --port=3101
# 浏览器打开 http://localhost:3101，左上角切换到 DeepseekVideo 合成（60s/1800帧）
```

渲染出片（仅在用户确认后）：
```bash
./node_modules/.bin/remotion render src/index.ts DeepseekVideo out/deepseek.mp4 --codec h264 --crf 16 --concurrency=2
```
**必须 `--concurrency=2`**：本机 16GB 内存，8 并发会杀掉 Chrome 标签页（报 "got no response"）。
`remotion.config.ts` 会自动找本机 Chrome，找不到时由 Remotion 下载；也可用环境变量 `REMOTION_CHROME` 指定。

---

## 1. 项目结构与现状

```
paperclip-template/
├─ public/deepseek/          # 素材（已从 D:\DEEPSEEK 复制并改 ASCII 名）
│  ├─ voiceover.mp3          # 口播 59.47s
│  ├─ captions.srt           # 34 句字幕（源文件，勿改）
│  ├─ github-stars.mp4       # 1728x1080 4.4s  GitHub 点星录屏
│  ├─ chassis-3d.mp4         # 1280x720  10s   白膜 3D 汽车底盘
│  ├─ pipeline.mp4           # 1280x720  8s    自动化流水线
│  ├─ setup-steps.mp4        # 1728x1080 8.9s  繁琐启动步骤录屏
│  ├─ harness-home.png       # 1080x500  官网首页（含"一切皆插件"标题）
│  └─ harness-features.png   # 1080x540  官网三特性图（内核/插件/配置层）
├─ src/
│  ├─ Deepseek.tsx           # 正片组装（13 个 beat）
│  ├─ beats/deepseek.ts      # 分镜表（beat 时间/相机 zoom）
│  ├─ beats/deepseek-cues.ts # SRT 解析产物（34 cues，字幕数据源）
│  ├─ beats/schema.ts        # BeatMap 类型定义
│  └─ components/
│     ├─ CameraRig.tsx       # 相机系统（见第 2 节铁律）
│     ├─ GridBackground.tsx  # 细网格蓝图背景（3x 超大平面，静止）
│     ├─ BeatWindow.tsx      # beat 显隐协议（末尾 12 帧淡出上浮）
│     ├─ EmbeddedMedia.tsx   # 视频/截图嵌入容器（伪3D飞入+标签）
│     ├─ HighlightCallout.tsx# 截图区域高亮框
│     ├─ TextCard.tsx        # 文字观点卡 normal/warning/quote
│     ├─ FeatureCards.tsx    # 能力卡片组
│     ├─ SrtCaptions.tsx     # SRT cue 驱动底部字幕
│     ├─ OutlineTitle.tsx    # 描边空心大字（demo 用，正片未用）
│     ├─ BitRow.tsx / TrackList.tsx / CdDisc.tsx  # demo 组件（可参考风格）
│     └─ Captions.tsx        # beat 驱动字幕（demo 用，正片用 SrtCaptions）
```

### 当前 13 beat 结构（问题所在）

| beat | 帧区间 | 内容 | 当前形式 | 问题 |
|---|---|---|---|---|
| b1 | 0-142 | 钩子：热度高 | github-stars.mp4 小窗嵌入 | **应全屏** |
| b2 | 144-311 | 先判断适不适合 | 纯文字卡 | 无可视化 |
| b3 | 320-495 | 官方定义"一切皆插件" | 截图嵌入+高亮框 | OK，可加强 |
| b4 | 496-585 | 底盘车类比 | chassis-3d.mp4 小窗 | **应全屏+文字叠加** |
| b5 | 585-654 | 自带任务循环/调度 | pipeline.mp4 小窗 | 可全屏或保持 |
| b6 | 654-737 | 都要自己配置 | setup-steps.mp4 小窗 | **应全屏** |
| b7 | 746-851 | 框架本身很优秀 | 纯文字卡 | 无可视化 |
| b8 | 858-993 | 普通人不推荐 | 纯文字卡(红) | 无可视化 |
| b9 | 994-1134 | 目标是产出不是搭底层 | 纯文字卡 | 无可视化 |
| b10 | 1137-1367 | 成熟智能体已内置 | 标题+三卡片 | 可升级为架构对比图 |
| b11 | 1377-1532 | 适合研究架构的人 | 纯文字卡 | 无可视化 |
| b12 | 1536-1647 | 可以浅尝学原理 | 纯文字卡 | 无可视化 |
| b13 | 1647-1800 | 金句收束 | 纯文字卡(大) | 金句可以保留文字 |

**核心问题：13 个 beat 里 8 个是纯文字卡，违背规范第 1.3 条「能用图表、流程图、机制动画讲清楚的，绝不只靠大段文字」。视频素材全被缩成小窗，没有全屏展示时刻。**

---

## 2. 相机与动画铁律（已和用户逐轮确认，不要回退）

> ⚠️ **本节只适用于旧版 `CameraRig`（`src/components/`）。** 新片子用 `src/v2/` 的镜头系统，相机可以自由推拉摇移，流程见 [WORKFLOW-V2.md](WORKFLOW-V2.md)。


1. **机位永远锁定舞台中心 (1100, 625)，只做 zoom（scale 0.95-1.15），绝不平移**。走位全部交给元素入场/退场动画。
2. **相机只在 beat 切换瞬间动**：Bezier(0.45,0,0.2,1) 急滑 ~23 帧到位后完全静止；无呼吸、无持续漂移、无匀速爬行。用户明确反馈持续晃动"看着晕"。
3. **CameraRig 舞台 div 必须 `transformOrigin: "0 0"`**（默认值是元素中心，会导致所有元素系统性偏移 ~175px，已踩过）。
4. 元素 spring：damping 20-24，禁止强弹跳；入场 12-25 帧；stagger 相邻 4-9 帧。
5. 网格背景完全静止；屏幕空间暗角已加（Demo/Deepseek 里 CameraRig 之外的 radial-gradient 层）。
6. 字幕永远屏幕固定层（不进相机），由 SrtCaptions 按 cue 时间驱动。

---

## 3. 优化方案（按优先级执行）

### P0：全屏素材段（FullBleedMedia 组件）

新建 `FullBleedMedia.tsx`：
- 视频/图片 cover 铺满整个舞台可视区（2200x1250 或干脆 1920x1080 对齐取景框，因为它是唯一内容）
- 底部叠 40% 高黑色渐变 scrim（`linear-gradient(transparent 55%, rgba(0,0,0,0.85))`），保证字幕可读
- 文字标签/观点句直接叠在画面上（左下或居中偏下），而不是小窗顶部的标签牌
- 入场：scale 1.08→1.0 缓慢推近（素材内部 Ken Burns，这是唯一允许的"持续运动"，因为动的是素材不是相机）+ 淡入
- 退出：BeatWindow 协议照旧（末尾 12 帧淡出）

应用到：b1（github-stars）、b4（chassis-3d，叠加文字"只有底盘、发动机和接口的车"）、b6（setup-steps，叠加"但其他一切，都要自己研究配置"）。
b5（pipeline）可保持嵌入或小改全屏，看节奏。

### P1：机制/流程代码动画替换纯文字 beat

新建两个通用组件，优先做这两个：

**`FlowDiagram.tsx`（流程/架构图，线条逐步绘制）**
- 节点：圆角矩形/圆形，spring 缩放入场（damping 22）
- 连线：SVG path + `strokeDashoffset` 从全长到 0 逐步绘制（或用已装的 `@remotion/paths` 的 `evolvePath`）
- 箭头流动：小圆点沿 path 移动表示"执行流"
- 当前讲解节点 accent 色高亮，其余降透明度到 0.35

应用场景：
- **b3 升级为混合段**：左边官网截图（缩小到 55% 宽嵌入），右边同步画"内核 + 插件插槽"机制图——一个中心圆（Cordis 内核）+ 周围 4-6 个插件块，连线逐个插入，呼应口播"一切皆插件"。harness-features.png 里有现成的三特性文案可参考（内核/插件能力/配置层）
- **b10 升级为对比架构图**：左列"DeepSeek Harness：内核 + 需自装插件（虚线框、灰色）"，右列"豆包/Codex/WorkBuddy：内核 + 内置执行逻辑/插件商店/记忆系统（实线框、蓝色）"，中间 VS 分隔。比现在的三卡片信息密度高且更符合专业科普语法

**`AnimatedCompare.tsx`（对比可视化）**
- **b8「不推荐」**：两根横向 bar 对比——"搭建配置耗时"（长，红色）vs "产出内容"（短，蓝色），bar 从 0 生长（spring），数字 count-up。一句口播"其实不推荐"配这个图，比红字卡有力得多
- 数据来源就按口播语义定性（不写精确数字，用相对比例 + 定性标注）

### P2：剩余文字 beat 的处理

- **b2**：改成两选项分岔小流程（FlowDiagram 复用）："要部署吗？→ 先判断 → 适合/不适合" 三个节点，比纯文字直观
- **b7+b8 合并或缩短**：b7（很优秀）保留文字卡但缩短到 ~2.5s，把省下的时间给 b8 的对比动画
- **b9**：与 b8 的对比图合并呈现（原因直接标注在 bar 下方），可省一个 beat
- **b11**：人群卡可以保留文字，但建议加一行小图标/标签 chips（"深度自定义" "Agent 架构" "插件开发"）
- **b12**：可并入 b11 的 beat 尾部（"感兴趣？浅尝学原理"作为 sub），压缩节奏
- **b13 金句**：保留纯文字大字（金句收束本来就该干净），可从 b12 省下的时间给它多停留 1s

### P3：节奏微调

- 口播 59.47s 但结构上是"钩子→定义→类比→转折→对比→收束"，当前 b7-b9 连续三个文字 beat（24.9s-37.8s 近 13 秒无素材无图形），是全片最闷的段落，P1/P2 主要就是为了解决这一段
- 合并后建议 beat 数从 13 减到 10-11 个

---

## 4. 执行检查清单（接手模型开工前自检）

- [ ] 先跑 Studio 预览当前版本，理解 13 个 beat 的节奏
- [ ] 新组件必须参数化（颜色/数据/延迟走 props），放到 src/components/
- [ ] 任何新 beat 内容必须包 BeatWindow，锚定舞台中心（1100,625），offsetY 微调
- [ ] 改完用抽帧验证（静帧命令如下，文件写出即成功，退出码可能报 1 属正常）：
  ```bash
  ./node_modules/.bin/remotion still src/index.ts DeepseekVideo out/check.png --frame=400
  ```
- [ ] 不要改 CameraRig 的 transformOrigin / 相机锁定逻辑 / 转场 23 帧窗口
- [ ] 全屏素材段注意：视频 muted（口播是唯一音轨），startFrom 单位是帧（秒×30）
- [ ] 用户确认前不要渲染 MP4（渲染 1800 帧约 15-20 分钟）

---

## 5. 用户偏好备忘（来自本次迭代）

- 讨厌相机持续晃动/平移，要"到位即静止"
- 讨厌元素跑偏出画面中心
- 喜欢光盘 demo（CdDisc）那种代码画的机制动画，明确想要更多这类
- 迭代必须在 Studio 预览里进行，不要动不动就渲染（慢）
- 反馈方式：说现象（"偏左了""太晃"），直接改，别长篇解释
