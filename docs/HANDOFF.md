# 이어받기 — TheOne Vintage US 시안 (갱신 2026-10-07 새벽)

정본 순서: **이 파일 → README 변경 로그 → `docs/design/refs/2026-10-06-v4-lock.md`(결정 68~120 · §12 레퍼런스 대조) → git log**. 진행 상황을 메모리에 두지 않는다.

## 지금 상태
- 라이브 https://kidplayboi.github.io/theone-vintage-us-mockup/ = 커밋 `6a9f0bb` · 꼬리표 `v=3da9e83b46`. 트리 깨끗(푸시 완료).
- 마지막 슬라이스 = **레퍼런스 나란히 대조(Bezel · Loupe · Fashionphile vs 홈·목록·상세) → 상세 채움 7건**(결정 114~120). 기각 6건은 전부 "없는 데이터"(§12).
- 검증 끝: 로컬 12페이지×3폭 + 라이브 새 컨텍스트 8회 — 콘솔 0 · 404 0 · 가로 넘침 0.

## 다음 후보(형이 방향 지정)
1. 홈·목록 잔여 갭 — §12 L3(Featured 캐러셀 · 보류) · 홈 사진 비율 재측정(결정 114 뒤 45% → ?). 카드 "Condition" 줄(L1)은 미등급 116개 소음이라 보류.
2. 사진 생성 — 힉스필드 MCP 404 그대로. 자리표시 **8곳**(`grep -n 'data-ph=' *.html js/lotsections.js`), 컷·프롬프트·파일명 = `docs/design/refs/2026-10-06-v5-images.md`. 생성되면 `.ph` → `<img>` 교체 + 1200px q82 변환.
3. 이전 제안 중 미선택: 스냅숏 제목 정규화 · New this week 다양성 · Live now 브랜드 중복 제거 · photo-row 크기 · 썸네일 점.

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
