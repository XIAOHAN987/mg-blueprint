// 把 SRT 字幕转成合成里用的字幕数据，避免手抄时间码抄错：
//   node scripts/srt2cues.mjs public/<项目名>/captions.srt <名字>
// 生成 src/v2/cues/<名字>.ts，在合成里：
//   import { cues } from "./cues/<名字>";   <Captions cues={cues} />
import fs from "node:fs";
import path from "node:path";

const [srtPath, name] = process.argv.slice(2);
if (!srtPath || !name) {
  console.error("用法：node scripts/srt2cues.mjs <字幕.srt> <名字>");
  process.exit(2);
}
if (!fs.existsSync(srtPath)) {
  console.error("找不到字幕文件：" + srtPath + "\n没有 SRT 时请向用户要，不要自己猜时间码。");
  process.exit(1);
}
const toSec = (t) => {
  const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(t.trim());
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4].padEnd(3, "0").slice(0, 3) / 1000 : NaN;
};
const text = fs.readFileSync(srtPath, "utf8").replace(/^\uFEFF/, "");
const cues = [];
for (const block of text.split(/\r?\n\s*\r?\n/)) {
  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const ti = lines.findIndex((l) => l.includes("-->"));
  if (ti < 0) continue;
  const [a, b] = lines[ti].split("-->");
  const start = toSec(a);
  const end = toSec(b);
  const body = lines.slice(ti + 1).join(" ");
  if (Number.isFinite(start) && Number.isFinite(end) && body) cues.push({ start, end, text: body });
}
if (!cues.length) {
  console.error("没有解析出任何字幕，请检查文件是不是标准 SRT：" + srtPath);
  process.exit(1);
}
const out = path.resolve("src/v2/cues", `${name}.ts`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  `// 由 scripts/srt2cues.mjs 从 ${srtPath.split(path.sep).join("/")} 生成，不要手改；字幕变了就重新生成。\n` +
    `import type { Cue } from "../kit";\n\nexport const cues: Cue[] = ${JSON.stringify(cues, null, 2)};\n`,
);
const last = cues[cues.length - 1];
console.log(`已生成 ${path.relative(process.cwd(), out)}：${cues.length} 句，结束于 ${last.end.toFixed(2)} 秒（30 帧下约 ${Math.ceil(last.end * 30)} 帧）`);
