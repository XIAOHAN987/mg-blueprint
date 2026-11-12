# MG Blueprint

给 AI Agent 用的知识讲解类视频工程，基于 Remotion。你提供口播和素材，Agent 按固定流程编排出带真实镜头运动的 MG 动画。

- **连续世界 + 真实镜头**：所有场景摆在同一张画布上，相机在其间推、拉、甩，到位即静止，带方向性运动模糊
- **素材满幅、文字够大**：不把素材缩成带边框的小卡片；全片最小字号 48px
- **资料可以直接进画面**：截图、图表、论文页按原始像素摆进世界，镜头可以推到任意区域
- **固定流程 + 自动自检**：素材体检 → 选摆法 → 分镜 → 编排 → 抽帧自检，自检是一条命令，会标出空画面

示例合成：`ParadigmV2`（3D 视频素材）、`GeminiV2`（录屏 + 截图资料）。

## 安装

**需要自己装的只有 Node.js（18 及以上）。** Remotion 等依赖不在仓库里，由下面的命令按 `package.json` 自动安装。

```bash
git clone https://github.com/XIAOHAN987/mg-blueprint.git
cd mg-blueprint
npm install
npm run studio
```

**第一次会比较慢，不是卡死：**

- `npm install` 要下载约 650MB 依赖，视网络需要几分钟。
- 第一次启动预览、抽帧或渲染时，要先把整个工程打包一次，通常 30–60 秒，期间终端可能没有输出。之后会快很多。

浏览器打开后，左上角选一个合成（如 `ParadigmV2`、`GeminiV2`）即可预览。渲染成 mp4：

```bash
npx remotion render src/index.ts ParadigmV2 out/paradigm-v2.mp4 --concurrency=2 --timeout=180000
```

| 项目 | 说明 |
|---|---|
| 浏览器 | 自动使用本机已装的 Chrome、Edge、Chromium 或 Brave（查找顺序见 `scripts/browsers.json`）；都没有时 Remotion 会自己下载一个。想指定别的浏览器，设置环境变量 `REMOTION_CHROME` 为可执行文件路径 |
| 字体 | 中文、西文、等宽三套字体都随项目放在 `public/fonts/`，渲染不需要联网 |
| ffmpeg | 不需要单独安装，Remotion 自带 |
| Python | 抽帧自检不需要 Python。只有 V2 流程第 1 步的素材体检脚本用到：`pip install -r scripts/requirements.txt` |
| 内存 | 16GB 内存的机器渲染时请保留 `--concurrency=2`，并发太高浏览器会被系统杀掉 |

**授权提醒**：本仓库代码是 MIT 协议，但它依赖的 Remotion 有自己的授权条款——个人和小团队免费，达到一定规模的公司商用需要购买授权。商用前请查看 [Remotion 官方授权说明](https://www.remotion.dev/docs/license)。

## 怎么用

### 你不会写代码也能用

这套工程是给你的 **AI Agent**（Claude Code / Cursor / Codex 等）准备的。Agent 需要能看图，不能看图的模型做不好这件事。

**1. 把素材放进 `public/<项目名>/`**

| 素材 | 说明 |
|---|---|
| 口播音频 | `.wav` / `.mp3` |
| 字幕文件 | `.srt`，和音频对齐（剪映、必剪都能导出） |
| 视频、录屏 | `.mp4`，尽量给高分辨率 |
| 截图、图表 | `.png` / `.jpg`，尽量给原图，分辨率低会限制镜头能推多近 |

素材不齐也可以开始，Agent 会先问你几个问题（见流程第 0 步）。

<details>
<summary><b>没有字幕文件（SRT）怎么办</b></summary>

字幕文件记录了每句话从第几秒说到第几秒。Agent 听不到音频，画面和口播能不能对上全靠它，所以它是唯一不能省的素材。

- **已经有录音**：把音频拖进剪映或必剪，用"识别字幕"功能生成字幕，导出时勾选"字幕导出"并选 SRT 格式。菜单名称和是否需要会员随版本变化，找不到时搜"剪映 导出 SRT"。
- **只有文稿，还没录音**：用任意配音工具把文稿转成语音。很多配音工具会同时给出 SRT；没有的话，把生成的音频再按上一条识别一次。
- **什么都没有**：先让 Agent 帮你写文稿，确认后再走上一条。

</details>

**2. 对你的 Agent 说这段话**

```
用 mg-blueprint 帮我做一条视频，严格按 WORKFLOW-V2.md 的流程走，第 0、1、5 步不能跳过。
素材在 public/<项目名>/ 里。
先把素材体检的结论和分镜方案告诉我，我确认后再做；
做完先给我看抽帧总览图，我确认后再渲染。
```

**3. 看、提意见、出片**

Agent 会给你看总览图或启动预览。你说现象就行（"字太小""这里空了""转场太快"），确认后它渲染出 mp4。

### 给 Agent 和开发者

**唯一的流程文档是 [WORKFLOW-V2.md](WORKFLOW-V2.md)。** 新片子一律用 `src/v2/`，照着 `src/v2/ParadigmV2.tsx` 和 `src/v2/GeminiV2.tsx` 的写法做。

```bash
npm install                                        # 装依赖
npm run studio                                     # 预览，改代码即热更新
node scripts/srt2cues.mjs <字幕.srt> <名字>           # SRT 转字幕数据
node scripts/stills.mjs <合成ID>                     # 抽帧自检：自动选帧，输出 out/check-*.png
npx remotion render src/index.ts <合成ID> out/x.mp4 --concurrency=2 --timeout=180000
```

## 项目结构

```
src/
├─ v2/                  # 当前的镜头系统，新片子用这里
│  ├─ space.ts              # 世界坐标与相机插值
│  ├─ World.tsx             # 相机容器、运动模糊、满幅视频
│  ├─ type.tsx              # 文字动效：逐字升起、色块牌、同槽位接力、滚动数字
│  ├─ kit.tsx               # 资料页、任意矩形取景、转场坐标换算、字幕
│  ├─ cues/                 # 由 srt2cues.mjs 生成的字幕数据
│  ├─ ParadigmV2.tsx        # 示例：3D 视频素材
│  └─ GeminiV2.tsx          # 示例：录屏 + 截图资料
├─ fonts.ts             # 字体加载（中文字体随项目分发）
├─ components/ recipes/ beats/   # 旧版（见下）
└─ Root.tsx             # 合成注册

scripts/
├─ stills.mjs           # 自动选帧 + 拼总览图 + 空画面检测（不需要 Python）
├─ srt2cues.mjs         # SRT 转字幕数据
├─ asset_check.py       # 素材体检
└─ locate.py            # 在录屏里定位一张截图

public/                 # 素材与字体
WORKFLOW-V2.md          # 制作流程（给 Agent）
```

## 旧版（仅供参考）

`src/components/`、`src/recipes/`、`src/beats/` 是第一版：相机锁在舞台中心、只做轻微缩放，内容以卡片形式切换。对应的合成（`NewParadigmVideo`、`DeepseekVideo`、`PaperclipDemo`、`OxAlphaVideo`、`Image25Video`）仍然可以预览和渲染，文档是 [COMPONENTS.md](COMPONENTS.md) 和 [HANDOFF.md](HANDOFF.md)。

**新片子不要按旧文档做。** 旧版里的图表类组件（流程图、终端、数据标尺等）可以拿来放进 V2 的场景里，但相机、转场和排版规则以 `WORKFLOW-V2.md` 为准。

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

## 致谢

- [Originkit](https://originkit.dev/)：Dot Matrix / Flicker Text 组件原型
- [SnapCn](https://snapcn.dev/)：TextReveal / AnswerStream / TerminalSimulator 组件原型
- [Remotion](https://remotion.dev/)：视频渲染框架

## License

MIT
