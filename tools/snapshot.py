"""실재고 일부를 떠서 시안용 data/lots.json 과 assets/lots/<lot>/ 이미지로 저장한다.

운영 API 는 다른 주소에서 불러올 수 없다(CORS 헤더 없음). 그래서 시안은 이 스냅숏만 읽는다.
기획안 23쪽 카드 규칙 5 · 39쪽 결정 19·24 를 여기서 적용한다:
  - 깨진 글자·일본어 제목은 등록할 때 걸러 낸다
  - 판매 기한이 지난 상품은 목록에 넣지 않는다
  - 제목은 모델과 사이즈, 아랫줄은 소재 · 색 · 각인

실행: python -I tools/snapshot.py   (저장소 루트에서)
"""
import concurrent.futures as cf
import datetime as dt
import html
import io
import json
import pathlib
import re
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image

BASE = "https://vintage.theone-biz.com"
ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "lots.json"
TITLES = ROOT / "data" / "titles.json"
IMG_DIR = ROOT / "assets" / "lots"

# (genre 코드, 이름, 가져올 수)
PLAN = [(1, "Bag", 56), (2, "Watch", 24), (3, "Jewelry", 20), (4, "Clothing", 16), (5, "Accessories", 16)]
BRAND_CAP = 6          # 한 카테고리 안에서 한 브랜드 최대 개수 — 첫 화면이 한 브랜드로만 차지 않게
GALLERY = 6            # 로트당 저장할 사진 수(실재고는 최대 26장)
UA = "Mozilla/5.0 (TheOne Vintage mockup snapshot)"

BRAND_NAME = {
    "HERMES": "Hermès", "LOUIS VUITTON": "Louis Vuitton", "CHANEL": "Chanel", "PRADA": "Prada",
    "ROLEX": "Rolex", "OMEGA": "Omega", "TIFFANY": "Tiffany & Co.", "BVLGARI": "Bulgari",
    "Van Cleef&Arpels": "Van Cleef & Arpels", "FENDI": "Fendi", "LOEWE": "Loewe", "GOYARD": "Goyard",
    "CARTIER": "Cartier", "BURBERRY": "Burberry", "FURLA": "Furla", "COACH": "Coach",
    "VALENTINO": "Valentino", "SEIKO": "Seiko", "CASIO": "Casio", "TUDOR": "Tudor",
    "miu miu": "Miu Miu", "NIKE": "Nike", "adidas": "Adidas", "kate spade": "Kate Spade",
}
# 제목·브랜드에 이 글자 밖의 것이 있으면 깨졌거나 일본어다
TITLE_OK = re.compile(r"^[A-Za-z0-9 .,'&()/\-+:;#×°\"!?%éèêëàâäôöûüçíñÉÈ’–—]+$")
GENERIC = {"shoulder", "tote", "hand", "boston", "clutch", "chain", "backpack", "pouch"}
# 제목 자리에 종류 단어 하나만 온 경우("Ring, Clou de H …") — 다음 칸을 제목으로 올린다
KIND_ONLY = {"ring", "brooch", "necklace", "bracelet", "bangle", "earrings", "earring", "pendant", "choker",
             "charm", "scarf", "muffler", "stole", "wallet", "pouch", "belt", "tie", "cap", "hat", "key ring"}


def get(url, binary=False, tries=3):
    for n in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read()
            return body if binary else body.decode("utf-8")
        except Exception as e:  # 네트워크 일시 오류만 재시도 — 마지막엔 그대로 올린다
            if n == tries - 1:
                raise
            print(f"  retry {n + 1} {url}: {e}", file=sys.stderr)
            time.sleep(1.5 * (n + 1))


def api(**kw):
    q = {"page": 1, "per_page": 20, "genre": "", "brand": "", "sort": "featured", "q": "", "kind": "", "ship": ""}
    q.update(kw)
    return json.loads(get(f"{BASE}/us/api/premium?" + urllib.parse.urlencode(q)))


def split_ref(name):
    """'126509　Rolex Cosmograph Daytona …' 처럼 품번 + 전각 공백으로 시작하면 품번을 떼어 낸다."""
    name = name.replace("　", "  ")
    ref = ""
    m = re.match(r"^([A-Z0-9][A-Z0-9\-./]{3,})\s{2,}(.*)$", name)
    if m:
        ref, name = m.group(1), m.group(2)
    return ref, re.sub(r"\s+", " ", name).strip()


def drop_words(text, words):
    for w in words:
        text = re.sub(r"(^|\s)" + re.escape(w) + r"(?=\s|$)", " ", text, flags=re.I)
    return re.sub(r"\s+", " ", text).strip()


def title_parts(brand, name):
    ref, name = split_ref(name)
    parts = [p.strip() for p in name.split(",") if p.strip()]
    noise = {brand, BRAND_NAME.get(brand, brand), "Hermes"} | ({ref} if ref else set())
    head = drop_words(parts[0] if parts else name, noise)
    if head.lower() in KIND_ONLY and len(parts) > 1:
        parts = [parts[1], head] + parts[2:]
        head = drop_words(parts[0], noise)
    m = re.match(r"^(.*\S)\s+(shoulder bag|handbag|hand bag|bag)$", head, flags=re.I)
    if m and m.group(1).lower() not in GENERIC:
        head = m.group(1)
    head = head[:1].upper() + head[1:]
    sub = [f"Ref. {ref}"] if ref else []
    for p in parts[1:]:
        p = re.sub(r"/(\w+) Metallic parts", lambda x: " · " + x.group(1).capitalize() + " hardware", p)
        p = re.sub(r"\bMetallic parts\b", "hardware", p)
        sub += [s.strip() for s in p.split(" · ") if s.strip()]
    return head, " · ".join(sub[:3])


def is_clean(it):
    _, name = split_ref(it["name"])
    return (it["brand"] != "Others" and TITLE_OK.match(name) and TITLE_OK.match(it["brand"])
            and not re.search(r"\bHerm s\b", name))


def not_expired(it, now):
    if not it.get("ends"):
        return True
    return dt.datetime.fromisoformat(it["ends"].replace("Z", "+00:00")) > now


def pick(genre, need, now):
    """기본 정렬은 브랜드별로 몰려 나온다(첫 80개가 전부 한 브랜드). 그래서 상위 브랜드를 돌며 고르게 뽑는다."""
    brands = [b for b in api(genre=genre, facets=1).get("brands", []) if b["name"] != "Others"]
    chosen, seen = [], set()
    for b in brands[:12]:
        got = 0
        for page in range(1, 4):
            items = api(page=page, genre=genre, brand=b["cd"], sort="new").get("items", [])
            for it in items:
                if it["lot"] in seen or not (is_clean(it) and not_expired(it, now)):
                    continue
                seen.add(it["lot"])
                chosen.append(it)
                got += 1
                if got >= BRAND_CAP or len(chosen) >= need:
                    break
            if not items or got >= BRAND_CAP or len(chosen) >= need:
                break
            time.sleep(0.2)
        if len(chosen) >= need:
            break
    # 브랜드가 번갈아 나오게 섞는다 — 첫 줄 네 칸이 한 브랜드로 차지 않게
    by = {}
    for it in chosen:
        by.setdefault(it["brand"], []).append(it)
    mixed = []
    while any(by.values()):
        for k in list(by):
            if by[k]:
                mixed.append(by[k].pop(0))
    return mixed


def strip_tags(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def detail(lot):
    s = get(f"{BASE}/us/lot/{lot}")
    photos = []
    for u in re.findall(r'(?:data-src|src)="(https://vintage\.theone-biz\.com/img/p/[0-9a-f]+\.jpg)"', s):
        if u not in photos:
            photos.append(u)
    cond = re.search(r'<div class="cond">(.*?)</div>\s*<table class="specs">', s, flags=re.S)
    grade = {}
    notes = []
    if cond:
        for rk in re.findall(r'<span class="rk[^"]*">(.*?)</span>', cond.group(1), flags=re.S):
            t = strip_tags(rk)
            m = re.match(r"^(Overall|Exterior|Interior)\s+(\S+)$", t)
            if m:
                grade[m.group(1).lower()] = m.group(2)
        notes = [strip_tags(li).rstrip(" .") for li in re.findall(r"<li>(.*?)</li>", cond.group(1), flags=re.S)]
    specs = {}
    table = re.search(r'<table class="specs">(.*?)</table>', s, flags=re.S)
    if table:
        for k, v in re.findall(r"<tr><th>(.*?)</th><td>(.*?)</td></tr>", table.group(1), flags=re.S):
            specs[strip_tags(k)] = strip_tags(v)
    return photos, grade or None, notes, specs


def save_images(lot, photos):
    out = IMG_DIR / lot
    out.mkdir(parents=True, exist_ok=True)
    saved = 0
    for i, url in enumerate(photos[:GALLERY]):
        im = Image.open(io.BytesIO(get(url, binary=True))).convert("RGB")
        im.thumbnail((1000, 1000))
        im.save(out / f"{i}.jpg", "JPEG", quality=78, optimize=True, progressive=True)
        if i == 0:
            card = im.copy()
            card.thumbnail((600, 600))
            card.save(out / "card.jpg", "JPEG", quality=78, optimize=True, progressive=True)
        saved += 1
    return saved


def build(it, genre_name):
    photos, grade, notes, specs = detail(it["lot"])
    title, sub = title_parts(it["brand"], it["name"])
    n = save_images(it["lot"], photos)
    return {
        "lot": it["lot"], "brand": BRAND_NAME.get(it["brand"], it["brand"]), "genre": genre_name,
        "title": title, "sub": sub, "name": it["name"],
        "usd": it["usd"], "jpy": it["jpy"], "kind": it["kind"], "ship": it["ship"],
        "ends": it.get("ends") or "", "line": it.get("line") or "",
        "itemType": specs.get("Item type", ""), "size": specs.get("Size / details", ""),
        "listed": specs.get("Listed", ""), "until": specs.get("Available until", ""),
        "grade": grade, "notes": notes, "photos": n, "photoTotal": len(photos),
    }


def arrange(lots):
    """첫 화면 순서: 카테고리를 번갈아, 카테고리 안에서는 브랜드를 번갈아, 가격 미공개(0)는 맨 뒤."""
    lots = [x for x in lots if not x["title"].lower().startswith("other lines")]
    by_genre = {}
    for x in lots:
        by_genre.setdefault(x["genre"], []).append(x)
    for g, xs in by_genre.items():
        by_brand = {}
        for x in sorted(xs, key=lambda x: -x["usd"]):
            by_brand.setdefault(x["brand"], []).append(x)
        mixed = []
        while any(by_brand.values()):
            for b in list(by_brand):
                if by_brand[b]:
                    mixed.append(by_brand[b].pop(0))
        # $300 이상 → 그 아래 → 가격 미공개 순. 첫 화면은 이 카테고리의 대표 상품으로 채운다
        by_genre[g] = sorted(mixed, key=lambda x: 0 if x["usd"] >= 300 else (1 if x["usd"] else 2))
    pattern = ["Bag", "Watch", "Bag", "Jewelry", "Bag", "Accessories", "Watch", "Clothing"]
    out = []
    while any(by_genre.values()):
        for g in pattern:
            if by_genre.get(g):
                out.append(by_genre[g].pop(0))
    return out


def add_dims(lots):
    """사진 확대(PhotoSwipe)는 원본 가로세로를 미리 알아야 한다 — 저장된 파일에서 잰다."""
    for x in lots:
        x["dims"] = []
        for i in range(x["photos"]):
            with Image.open(IMG_DIR / x["lot"] / f"{i}.jpg") as im:
                x["dims"].append(list(im.size))


def retitle():
    """네트워크 없이 제목·순서만 다시 계산한다: python -I tools/snapshot.py --retitle"""
    d = json.loads(DATA.read_text(encoding="utf-8"))
    raw = {v: k for k, v in BRAND_NAME.items()}
    hand = json.loads(TITLES.read_text(encoding="utf-8")) if TITLES.exists() else {}
    for x in d["lots"]:
        x["title"], x["sub"] = title_parts(raw.get(x["brand"], x["brand"]), x["name"])
        if x["lot"] in hand:  # 결정 24 규칙으로 손으로 정리한 제목(등록 단계에서 사람이 하는 일의 예시)
            x["title"], x["sub"] = hand[x["lot"]]
        x["edited"] = x["lot"] in hand
    keep = arrange(d["lots"])
    for gone in {x["lot"] for x in d["lots"]} - {x["lot"] for x in keep}:
        for f in (IMG_DIR / gone).glob("*.jpg"):
            f.unlink()
        (IMG_DIR / gone).rmdir()
    add_dims(keep)
    d["lots"] = keep
    d["meta"]["graded"] = sum(1 for x in keep if x["grade"])
    DATA.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"retitled {len(keep)} lots · graded {d['meta']['graded']}")


def main():
    now = dt.datetime.now(dt.timezone.utc)
    facets = api(facets=1)
    picks = []
    for genre, name, need in PLAN:
        got = pick(genre, need, now)
        print(f"{name}: {len(got)}/{need}")
        picks += [(it, name) for it in got]

    lots = []
    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(build, it, g): it["lot"] for it, g in picks}
        for f in cf.as_completed(futs):
            try:
                lots.append(f.result())
            except Exception as e:
                print(f"  skip {futs[f]}: {e}", file=sys.stderr)
    lots = arrange(lots)
    add_dims(lots)

    usd_rates = [x["jpy"] / x["usd"] for x in lots if x["usd"]]
    meta = {
        "snapshotAt": now.strftime("%Y-%m-%d"),
        "total": facets.get("total") or sum(c["n"] for c in facets.get("categories", [])),
        "categories": facets.get("categories", []),
        "rate": round(sorted(usd_rates)[len(usd_rates) // 2], 2) if usd_rates else None,
        "graded": sum(1 for x in lots if x["grade"]),
    }
    DATA.write_text(json.dumps({"meta": meta, "lots": lots}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"saved {len(lots)} lots · graded {meta['graded']} · rate {meta['rate']} → {DATA}")


if __name__ == "__main__":
    retitle() if "--retitle" in sys.argv else main()
