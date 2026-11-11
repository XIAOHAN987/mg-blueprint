import cv2, sys, glob, numpy as np, os
# python scripts/montage.py <glob> <out.jpg> [cols] [thumbw]
files = sorted(glob.glob(sys.argv[1])); out = sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4; tw = int(sys.argv[4]) if len(sys.argv) > 4 else 480
tiles = []
for f in files:
    im = cv2.imdecode(np.fromfile(f, dtype=np.uint8), cv2.IMREAD_COLOR)
    th = int(tw * im.shape[0] / im.shape[1]); im = cv2.resize(im, (tw, th), interpolation=cv2.INTER_AREA)
    lab = os.path.basename(f).split("-")[-1].split(".")[0]
    cv2.putText(im, lab, (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 4); cv2.putText(im, lab, (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    tiles.append(im)
rows = []
for i in range(0, len(tiles), cols):
    r = tiles[i:i + cols]
    while len(r) < cols: r.append(np.zeros_like(tiles[0]))
    rows.append(np.hstack(r))
cv2.imencode(".jpg", np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])[1].tofile(out); print(len(tiles), out)
