"""在视频里找一张截图出现的时间和位置：python scripts/locate.py <视频> <截图> [起始秒] [结束秒]
用于"资料从画面里原位长出来"的转场：输出的 时间 / 左上角坐标 / 比例 直接填进 anchorParent。"""
try:
    import cv2, numpy as np
except ImportError:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    print("缺少依赖：这个脚本需要 opencv-python 和 numpy。")
    print("请先运行： pip install -r scripts/requirements.txt")
    print("装好后重新运行本命令。不要跳过这一步改用别的办法。")
    sys.exit(2)
import sys
sys.stdout.reconfigure(encoding="utf-8")
v, im = sys.argv[1], sys.argv[2]
tpl = cv2.imdecode(np.fromfile(im, dtype=np.uint8), cv2.IMREAD_COLOR)
cap = cv2.VideoCapture(v); fps = cap.get(5) or 30; dur = cap.get(7) / fps
t0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0; t1 = float(sys.argv[4]) if len(sys.argv) > 4 else dur
h, w = tpl.shape[:2]; core = tpl[int(h * .2):int(h * .95), int(w * .1):int(w * .9)]; best = None
for t in np.arange(t0, t1, 0.2):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
    if not ok: break
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    for s in np.arange(0.5, 1.55, 0.05):
        tp = cv2.cvtColor(cv2.resize(core, None, fx=s, fy=s), cv2.COLOR_BGR2GRAY)
        if tp.shape[0] > g.shape[0] or tp.shape[1] > g.shape[1]: continue
        _, mx, _, loc = cv2.minMaxLoc(cv2.matchTemplate(g, tp, cv2.TM_CCOEFF_NORMED))
        if best is None or mx > best[0]: best = (mx, t, s, loc[0] - w * .1 * s, loc[1] - h * .2 * s)
if best is None: print("没有可比对的帧"); sys.exit(1)
print(f"匹配度 {best[0]:.2f}" + ("  (低于 0.8：不可靠，别用原位替换)" if best[0] < 0.8 else ""))
print(f"时间 {best[1]:.1f}s   截图左上角在视频像素 ({best[3]:.0f}, {best[4]:.0f})   截图相对视频的比例 {best[2]:.2f}")
