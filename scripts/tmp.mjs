// 将 Remotion 打包与渲染的临时缓存自动重定向到工程目录同盘的 .tmp/ 下，避免挤爆系统盘（如 C 盘）。
// 必须在 import @remotion/* 之前作为首行导入，保证 os.tmpdir() 与子进程从一开始就使用工程盘。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(".tmp");
const useSystem = process.env.MG_KEEP_SYS_TMP === "1";

let activeDir = os.tmpdir();
let ownDir = null;

if (!useSystem) {
  fs.mkdirSync(root, { recursive: true });
  // 启动时顺手清理超过 6 小时或上次异常中断遗留的旧 run-* 目录
  const cutoff = Date.now() - 6 * 3600 * 1000;
  try {
    for (const entry of fs.readdirSync(root)) {
      if (!entry.startsWith("run-")) continue;
      const full = path.join(root, entry);
      const m = /^run-(\d+)-/.exec(entry);
      const pid = m ? Number(m[1]) : NaN;
      let alive = false;
      if (Number.isFinite(pid) && pid > 0) {
        try {
          process.kill(pid, 0);
          alive = true;
        } catch (err) {
          alive = err?.code === "EPERM";
        }
      }
      if (!alive) {
        try {
          const st = fs.statSync(full);
          if (st.mtimeMs < cutoff || !alive) fs.rmSync(full, { recursive: true, force: true });
        } catch {
          // 忽略已被其他进程删掉或占用的目录
        }
      }
    }
  } catch {
    // 清理旧目录失败不影响主流程
  }

  ownDir = path.join(root, `run-${process.pid}-${Date.now()}`);
  fs.mkdirSync(ownDir, { recursive: true });
  process.env.TEMP = ownDir;
  process.env.TMP = ownDir;
  process.env.TMPDIR = ownDir;
  activeDir = ownDir;
}

export const tmpDir = activeDir;

let cleaned = false;
export const cleanupTmp = () => {
  if (cleaned || !ownDir) return;
  cleaned = true;
  try {
    fs.rmSync(ownDir, { recursive: true, force: true });
    if (fs.existsSync(root) && fs.readdirSync(root).length === 0) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  } catch {
    // Windows 句柄偶发延迟释放时，下次运行启动扫描会继续清理
  }
};

export const checkTmpSpace = (tag = "[缓存]") => {
  try {
    const stat = fs.statfsSync(tmpDir);
    const freeGB = (stat.bavail * stat.bsize) / 1e9;
    if (freeGB < 3) {
      console.warn(`${tag} 警告：临时目录 ${tmpDir} 所在盘剩余空间仅 ${freeGB.toFixed(2)} GB（<3 GB），打包或渲染可能失败。`);
      console.warn("       请先清理磁盘空间，或设置环境变量 TEMP/TMP 指向空间充足的磁盘。");
    }
  } catch {
    // 旧版 Node 不支持 statfsSync 时静默跳过
  }
};

process.on("exit", cleanupTmp);
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    cleanupTmp();
    process.exit(130);
  });
}
