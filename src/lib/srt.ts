/**
 * 极简 SRT 解析：把字幕文件解析成带秒级时间码的句子数组。
 * 真实项目中：SRT 的每句时间码直接作为 beat 的时间边界，
 * 保证口播 / 字幕 / 相机三条轨道同源对齐。
 */

export type SrtCue = {
  index: number;
  startSec: number;
  endSec: number;
  text: string;
};

const toSec = (t: string): number => {
  // "00:01:23,456"
  const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  return (
    Number(m[1]) * 3600 +
    Number(m[2]) * 60 +
    Number(m[3]) +
    Number(m[4]) / 1000
  );
};

export const parseSrt = (srt: string): SrtCue[] => {
  return srt
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      const lines = block.split(/\r?\n/);
      const timeLine = lines.find((l) => l.includes("-->")) ?? "";
      const [start, end] = timeLine.split("-->").map((s) => s.trim());
      const textLines = lines.slice(lines.indexOf(timeLine) + 1);
      return {
        index: i + 1,
        startSec: toSec(start),
        endSec: toSec(end),
        text: textLines.join(" ").trim(),
      };
    })
    .filter((c) => c.text.length > 0);
};
