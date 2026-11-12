# 随项目分发的字体

渲染用到的三套字体都放在这里，由 `src/fonts.ts` 加载，渲染全程不需要联网。

| 文件 | 字体 | 说明 |
|---|---|---|
| `NotoSansSC-VF.ttf` | Noto Sans SC（思源黑体） | 中文，可变字重 100–900 |
| `Inter-latin-VF.woff2` | Inter | 西文与数字，仅拉丁字符子集 |
| `JetBrainsMono-latin-VF.woff2` | JetBrains Mono | 等宽，仅拉丁字符子集 |

三套字体均按 SIL Open Font License 1.1 授权，允许随软件再分发。
授权全文：https://openfontlicense.org/open-font-license-official-text/

后两个文件取自 Google Fonts。它们只含拉丁字符，箭头、乘号等符号会回退到中文字体或系统字体。
