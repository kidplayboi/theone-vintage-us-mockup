# 이어받기 — TheOne Vintage US 시안 (갱신 2026-10-07 새벽)

정본 순서: **이 파일 → README 변경 로그 → `docs/design/refs/2026-10-06-v4-lock.md`(결정 68~120 · §12 레퍼런스 대조) → git log**. 진행 상황을 메모리에 두지 않는다.

## 지금 상태 (2026-10-07 새벽)
- 라이브 https://kidplayboi.github.io/theone-vintage-us-mockup/ = **이 커밋(10/7 홈 히어로 풀블리드 사진 · 결정 124 · hover 겹침 수정)**. 꼬리표는 `git log -1` 의 stamp 값. 직전 = 6ef4913 목록 Bezel 형식 + 카드 띠 제거(결정 122·123) · 4c1ce07 사진 8/8 교체(결정 121).
- 10/7 슬라이스 둘: ① 레퍼런스 대조 보드(v4-lock §13 · https://claude.ai/artifact/VHB7bzJEVtuQqGm7z26djf) → 사진 자리표시 8/8 실사진(힉스필 MCP · 15컷 → 9컷 · 원본 `Downloads/theone-gen-raw-2026-10-07`) ② 목록 = Featured 띠 + 접힌 Filters + 카드 메타 줄(`js/featured.js` 신규 · `js/card.js` v5).
- 검증 끝: 로컬 7페이지×폭(shop 1440/768/390 · home 1440/390 · lot · saved · states) 404 0 · 콘솔 0 · 넘침 0 · 메타 줄 넘침 0 · 첫 화면 글자색 목록 11 → 5 · 홈 10 → 5.

## 다음 (형 방향 10/7 확정 — v4-lock §13 끝 "형 방향")
1. ✅ 목록 Bezel 형식 + 카드 띠 제거(결정 122·123). 남은 것: Featured 띠 실제 운영 선정 기준(의뢰처) · 390 에서 tz 선택이 Featured 위에 놓이는 순서 재고.
2. **홈 다듬기**(§13 H1~H3): ✅ 히어로 = 풀블리드 사진(결정 124 · `hero-clasp.jpg` · 대안 `hero-movement` · `hero-loupe` · 밝은 2컷 `hero-bag` · `hero-watch` 도 assets 에 있음). 남은 것: 사진 띠 1~2(auction-wide · tokyo-office-wide 재사용) · 브랜드 타일 8 → 흰 바탕 워드마크 줄 · 카테고리 타일 재검토.
3. **How it works 리듬**(§13 W1): Loupe 식 "사진 + 번호 + 4줄" 한 리듬 · 글 7,084 → 약 3,500 · 칸 13 → 통합 · 비율 2종(풀블리드 21:9 + 본문 3:2/4:5).
4. **글자색 스윕**(§13 C1): 한 화면 9~11 → 3.
- 이전 미선택 제안(스냅숏 제목 정규화 · New this week 다양성 · Live now 브랜드 중복 · 썸네일 점)은 그 뒤.

## 형 몫(대기)
- 요율 실값 → `js/buybox.js` `EXAMPLE_RATES` 한 곳 + `example:false`(v4-lock §11 "89 대기" 표)
- 의뢰처: How it works 세부 문구·실적 · "Time limit = 블라인드 입찰" 확인 · Express/Classic 정의
- 브랜드 워드마크 게재 여부(상표 메모 = README "의뢰처 전달 메모")

## 작업 규칙(이 레포)
- 매 커밋 전 `python -I tools/stamp.py`(js/css 바뀌면). 로컬 검증 = `python -m http.server 8765 --bind 127.0.0.1` + Playwright `browser_run_code_unsafe` + CDP `Network.setCacheDisabled`. 라이브 = `?nc=` 폴링(Pages CDN 파일별 캐시 · 보통 40~60초).
- fullPage 캡처는 `[data-reveal]` 때문에 빈 구획으로 찍힌다 → 스크롤로 전부 켠 뒤 요소 캡처(계측 아티팩트 ≠ 결함).
- 새 기능 = 새 파일(`js/lotsections.js` 식). 글은 지어내지 않는다 — 원천 인용·운영 사실만. 디자인 결정은 전부 원장에 번호로.
- 시안 도구 막대(검은 띠)는 제품 아님: 판매 방식 A/B · 상태 · 예시 데이터 토글.

## 함정 기록(이번 세션)
- `[data-rate]` 셀렉터가 `<body data-rate>` 에 맞아 본문이 통째로 바뀜 → `data-fx-rate`
- CSS 변수 안 `url()` = CSS 파일 기준 → mask 는 인라인
- 공용 타일 `% 패딩`을 flex 띠에 재사용 → 내용 폭 0(로고 안 보임·에러 없음) → px
- `.live` 클래스가 `.badge.live` 와 충돌 → `.live-sec`
