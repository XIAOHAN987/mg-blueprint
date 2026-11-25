// 渲染封装（自动把 Remotion 打包与缓存放到工程同盘 .tmp/，结束自动清理，避免挤爆 C 盘）：
//   node scripts/render.mjs <合成ID> [输出路径=out/<合成ID>.mp4] [额外 remotion render 参数...]
//   npm run render                                     # 无参数时默认渲染 ParadigmV2 → out/paradigm-v2.mp4
import { tmpDir, cleanupTmp, checkTmpSpace } from "./tmp.mjs";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rawArgs = process.argv.slice(2);
const id = rawArgs[0] && !rawArgs[0].startsWith("-") ? rawArgs[0] : "ParadigmV2";
const defaultOut = id === "ParadigmV2" ? "out/paradigm-v2.mp4" : `out/${id}.mp4`;
const hasExplicitOut = rawArgs[0] && !rawArgs[0].startsWith("-") && rawArgs[1] && !rawArgs[1].startsWith("-");
const outPath = hasExplicitOut ? rawArgs[1] : defaultOut;
const extra = rawArgs.slice(rawArgs[0]?.startsWith("-") ? 0 : hasExplicitOut ? 2 : 1);

const hasFlag = (name) => extra.some((a) => a === name || a.startsWith(`${name}=`));
const defaults = [];
if (!hasFlag("--codec")) defaults.push("--codec", "h264");
if (!hasFlag("--crf")) defaults.push("--crf", "17");
if (!hasFlag("--concurrency")) defaults.push("--concurrency=2");
if (!hasFlag("--timeout")) defaults.push("--timeout=180000");

fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
checkTmpSpace("[渲染]");
console.log(`[渲染] 合成：${id} → ${outPath}`);
console.log(`[渲染] 临时缓存目录：${tmpDir}（结束后自动清理）`);

const cliEntry = path.resolve("node_modules/@remotion/cli/remotion-cli.js");
const renderArgs = ["render", "src/index.ts", id, outPath, ...defaults, ...extra];

let res;
try {
  if (fs.existsSync(cliEntry)) {
    res = spawnSync(process.execPath, [cliEntry, ...renderArgs], { stdio: "inherit", env: process.env });
  } else {
    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    res = spawnSync(npx, ["remotion", ...renderArgs], { stdio: "inherit", env: process.env, shell: process.platform === "win32" });
  }
} finally {
  cleanupTmp();
}

process.exit(res?.status ?? 1);
