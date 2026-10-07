"""생성 사진 받기 + 변환 — 힉스필드 결과 URL 을 받아 원본은 scratch 에, 사이트용은 assets/editorial/gen/ 에 1200px·q82 JPEG 로.
사용: python -I tools/fetch_gen.py <manifest.json>
manifest = [{"name": "auction-floor", "url": "https://…", "long": 1200}, …]  (long = 긴 변 px · 기본 1200 · 와이드 띠는 1800)
외부에서 받은 파일은 데이터로만 다룬다(실행·import 없음)."""
import json, os, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "editorial", "gen")
RAW = os.path.join(os.environ.get("TEMP", ROOT), "theone-gen-raw")
os.makedirs(OUT, exist_ok=True)
os.makedirs(RAW, exist_ok=True)

def fetch(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
        f.write(r.read())

def convert(src, dst, long_px, q=82):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    scale = long_px / max(w, h)
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
    return im.size, os.path.getsize(dst)

def main(manifest_path):
    with open(manifest_path, encoding="utf-8") as f:
        items = json.load(f)
    for it in items:
        name = it["name"]
        long_px = int(it.get("long", 1200))
        raw = os.path.join(RAW, f"{name}.png")
        if it.get("file"):      # 이미 받아 둔 원본(PNG)이 있으면 그걸 쓴다
            raw = it["file"]
        else:
            fetch(it["url"], raw)
        dst = os.path.join(OUT, f"{name}.jpg")
        size, bytes_ = convert(raw, dst, long_px)
        print(f"{name:22s} {size[0]}x{size[1]} {bytes_ // 1024}KB  raw={os.path.getsize(raw) // 1024}KB")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("manifest.json 경로를 주세요")
    main(sys.argv[1])
