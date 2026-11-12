"""素材体检：python scripts/asset_check.py <素材文件或文件夹> [输出目录=out/inspect]
对每个视频输出：尺寸/帧率/时长、四边平均色、内部剪辑点、带时间戳的总览图。
对每张图片输出：尺寸、在 1920×1080 画幅里不糊的最大放大倍率。"""
try:
    import cv2, numpy as np
except ImportError:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    print("缺少依赖：这个脚本需要 opencv-python 和 numpy。")
    print("请先运行： pip install -r scripts/requirements.txt")
    print("装好后重新运行本命令。不要跳过这一步改用别的办法。")
    sys.exit(2)
import sys, os, glob
sys.stdout.reconfigure(encoding="utf-8")

def read_img(p): return cv2.imdecode(np.fromfile(p, dtype=np.uint8), cv2.IMREAD_COLOR)
def write_img(p, im): cv2.imencode(".jpg", im, [cv2.IMWRITE_JPEG_QUALITY, 82])[1].tofile(p)
def hexc(bgr): return "#%02X%02X%02X" % (int(bgr[2]), int(bgr[1]), int(bgr[0]))

def video(p, out):
    cap = cv2.VideoCapture(p); fps = cap.get(5) or 30; n = cap.get(7); w, h = int(cap.get(3)), int(cap.get(4)); dur = n / fps
    print(f"\n[视频] {os.path.basename(p)}  {w}x{h}  {fps:.1f}fps  {dur:.1f}s")
    print(f"  满幅放大倍率: {max(1920 / w, 1080 / h):.2f}x" + ("  (>1.5 会糊，避免再推近)" if max(1920 / w, 1080 / h) > 1.5 else ""))
    step = max(0.5, dur / 16); tiles = []; prev = None; cuts = []; edges = []
    t = 0.0
    while t < dur:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
        if not ok: break
        small = cv2.resize(f, (64, 36)).astype(np.float32)
        if prev is not None and np.abs(small - prev).mean() > 28: cuts.append(round(t, 2))
        prev = small
        if abs(t / step - round(t / step)) < 1e-6 or len(tiles) == 0:
            pass
        t += 0.1
    for i in range(int(dur / step) + 1):
        tt = min(i * step, dur - 0.05); cap.set(cv2.CAP_PROP_POS_MSEC, tt * 1000); ok, f = cap.read()
        if not ok: continue
        edges.append([f[:, :16].reshape(-1, 3).mean(0), f[:, -16:].reshape(-1, 3).mean(0), f[:16].reshape(-1, 3).mean(0), f[-16:].reshape(-1, 3).mean(0)])
        th = cv2.resize(f, (480, int(480 * h / w)))
        cv2.putText(th, f"{tt:.1f}s", (6, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 4); cv2.putText(th, f"{tt:.1f}s", (6, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        tiles.append(th)
    e = np.array(edges); mean = e.mean(0); spread = e.std(0).mean()
    print("  四边平均色  左 %s  右 %s  上 %s  下 %s" % tuple(hexc(c) for c in mean))
    print(f"  边缘颜色随时间波动: {spread:.0f}  " + ("(稳定：可把背景色延伸成场地，无边框融合)" if spread < 14 else "(不稳定：背景杂，文字必须用色块牌，转场不要靠背景融合)"))
    print("  疑似内部剪辑点(秒): " + (", ".join(map(str, cuts[:20])) if cuts else "无") + "  ← 镜头落定可以对在这些时间上")
    rows = []
    for i in range(0, len(tiles), 4):
        r = tiles[i:i + 4]
        while len(r) < 4: r.append(np.zeros_like(tiles[0]))
        rows.append(np.hstack(r))
    op = os.path.join(out, os.path.splitext(os.path.basename(p))[0] + ".jpg"); write_img(op, np.vstack(rows)); print("  总览图: " + op + "  ← 必须打开看：主体在哪、哪块区域一直是空的")

def image(p):
    im = read_img(p); h, w = im.shape[:2]
    print(f"\n[图片] {os.path.basename(p)}  {w}x{h}")
    print(f"  整张适配画幅的倍率: {min(1920 / w, 1080 / h):.2f}x；建议最大放大 1.6x，即取景矩形宽度不小于 {int(1920 / 1.6)}px" + ("  (图片本身不足这个宽度：不要做局部特写)" if w < 1920 / 1.6 else ""))
    print(f"  底色: {hexc(np.median(np.concatenate([im[:8].reshape(-1,3), im[-8:].reshape(-1,3)]), 0))}")

if __name__ == "__main__":
    target = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else "out/inspect"; os.makedirs(out, exist_ok=True)
    files = sorted(glob.glob(os.path.join(target, "*"))) if os.path.isdir(target) else [target]
    for p in files:
        ext = p.lower().rsplit(".", 1)[-1]
        if ext in ("mp4", "mov", "webm", "mkv"): video(p, out)
        elif ext in ("png", "jpg", "jpeg", "webp"): image(p)
