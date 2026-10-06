"""배포 전 캐시 꼬리표 — 우리 JS·CSS 주소 전부에 같은 ?v=<내용 해시>를 붙인다.

GitHub Pages 는 파일을 10분 캐시한다. 재배포 직후 새 모듈과 옛 모듈이 섞이면
"does not provide an export named …" 로 페이지가 깨진다(2026-10-06 로컬에서 실제로 재현).
모든 import·<script>·<link> 가 같은 꼬리표를 쓰면 한 버전 묶음으로만 불린다.

실행: python -I tools/stamp.py   (저장소 루트에서, 커밋 직전)
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = sorted([*ROOT.glob("*.html"), *ROOT.glob("js/*.js")])
SOURCES = sorted([*ROOT.glob("js/*.js"), *ROOT.glob("css/*.css"), ROOT / "data" / "lots.json"])

# 우리 상대 경로만: './x.js' · 'js/x.js' · 'css/x.css' · './js/x.js' — http(s) 주소는 건드리지 않는다
REF = re.compile(r"""(?P<q>['"])(?P<path>(?:\./)?(?:js/|css/)?[\w-]+\.(?:js|css))(?:\?v=[0-9a-f]+)?(?P=q)""")


def digest():
    h = hashlib.sha256()
    for f in SOURCES:
        # 꼬리표 자체는 해시에서 뺀다 — 안 그러면 실행할 때마다 값이 바뀐다
        h.update(re.sub(rb"\?v=[0-9a-f]+", b"", f.read_bytes()))
    return h.hexdigest()[:10]


def main():
    v = digest()
    changed = 0
    for f in FILES:
        text = f.read_text(encoding="utf-8")
        new = REF.sub(lambda m: f"{m['q']}{m['path']}?v={v}{m['q']}", text)
        if new != text:
            f.write_text(new, encoding="utf-8")
            changed += 1
    # lots.json 주소도 같은 꼬리표로
    data_js = ROOT / "js" / "data.js"
    t = data_js.read_text(encoding="utf-8")
    t2 = re.sub(r"fetch\('data/lots\.json(?:\?v=[0-9a-f]+)?'\)", f"fetch('data/lots.json?v={v}')", t)
    if t2 != t:
        data_js.write_text(t2, encoding="utf-8")
        changed += 1
    print(f"stamp v={v} · {changed} files updated")


if __name__ == "__main__":
    main()
