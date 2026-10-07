# 이어받기 — TheOne Vintage US 시안 (갱신 2026-10-07 밤)

정본 순서: **이 파일 → README 변경 로그 → `docs/design/refs/2026-10-06-v4-lock.md`(결정 68~120 · §12 레퍼런스 대조) → git log**. 진행 상황을 메모리에 두지 않는다.

## 지금 상태 (2026-10-07 밤)
- 라이브 https://kidplayboi.github.io/theone-vintage-us-mockup/ = **이 커밋(10/7 밤 2차 · 결정 132~135: 헤더 sticky + 세리프 워드마크 · 판매 방식 색 = 글자 · 비회원 가격 마스킹 · 검사관 2차 17건)**. 직전 = 남은 것 전부(130·131) · 배치 AI 티 10건(129) · 3b6a052 서체 v6(128) · 180f59c 피드백 4건(125~127). 꼬리표는 `git log -1` 의 stamp 값. 직전 = 78ebc58 히어로 풀블리드(124) · 6ef4913 목록 Bezel 형식 + 카드 띠 제거(122·123) · 4c1ce07 사진 8/8(121).
- 10/7 슬라이스 둘: ① 레퍼런스 대조 보드(v4-lock §13 · https://claude.ai/artifact/VHB7bzJEVtuQqGm7z26djf) → 사진 자리표시 8/8 실사진(힉스필 MCP · 15컷 → 9컷 · 원본 `Downloads/theone-gen-raw-2026-10-07`) ② 목록 = Featured 띠 + 접힌 Filters + 카드 메타 줄(`js/featured.js` 신규 · `js/card.js` v5).
- 검증 끝: 로컬 7페이지×폭(shop 1440/768/390 · home 1440/390 · lot · saved · states) 404 0 · 콘솔 0 · 넘침 0 · 메타 줄 넘침 0 · 첫 화면 글자색 목록 11 → 5 · 홈 10 → 5.

## 다음 (형 방향 10/7 확정 — v4-lock §13 끝 "형 방향")
1. ✅ 목록 Bezel 형식 + 카드 띠 제거(결정 122·123). 남은 것: Featured 띠 실제 운영 선정 기준(의뢰처). 390 tz 줄은 라벨 + 셀렉트 한 줄 39px 로 정리(131).
2. ✅ **홈 다듬기**(§13 H1~H3): 히어로 풀블리드(124) · 브랜드 흰 바탕 · 큰 제목 1회 · 카테고리 줄 아래로(129) · 도쿄 사진 띠 + New/Live 레일 다양성 + 제목 정리(131). 검사관 S1~S4 는 내가 판단(131: 모노 대문자 라벨 X · 대문자 제목 X · 기억 요소 = 세리프 큰 제목 · 도쿄타워 사진 4컷 재생성) — 형이 뒤집으면 새 번호.
3. ✅ **How it works 리듬**(§13 W1 · 결정 130): 사진 2:1 + '01. 제목' + 문단 여섯 줄 교대 · 글 7,084 → 4,161 · 상자 13 → 0 · 아이콘 0 · 비율 2종(21:9 띠 + 2:1) · 첫 화면 사진 12 → 38%.
- 형 10/7 밤 요구 수위: "다른 사이트보다 잘나면 잘나야지 부족한 건 없어야 함 · 전체 비주얼 → UX/UI 전부 디테일" — 매 슬라이스 끝에 §13 방식 수치 재측정 + 깃헙 오픈소스(Dawn · Vercel Commerce · v4-rules 85파일) 구조 대조를 근거로 남긴다.
4. **글자색 스윕**(§13 C1): 한 화면 9~11 → 3.
- ✅ 제목 정규화 · New this week 다양성 · Live now 브랜드 중복(131) · ✅ 검사관 2차 17건(135). 남은 미선택 = 썸네일 점. 다음 = 검사관 3차 결과 반영 → 4번 글자색 스윕 잔여(회색 글 목록 첫 화면 43.7% → 재측정).
- 🆕 형 10/7 밤 결정: 헤더 sticky(132) · 까사 색은 글자에만(133 — 의뢰처가 칸을 고집하면 번호 새로) · **비회원 가격 마스킹(134 · 결정 58 뒤집음)** — 로그인 상태 토글 = 마스트 Log in → sign-in.html 폼 / Sign out.

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
- 백그라운드 탭(형이 다른 창 보는 중)에선 Chrome 이 CSS 애니메이션을 멈춘다 → 열린 상세 창이 `sheet-in` 첫 프레임(opacity 0 · currentTime 0)에 묶여 캡처에 안 찍힘. 2.5초 뒤 1. 계측 아티팩트 — 창을 앞으로 가져오거나 길게 기다려 다시 잰다
- 공유 Playwright 창의 localStorage 는 형이 누른 설정(A/B 모드)이 그대로다 — 수치 재기 전 모드 확인(10/7 A 모드라 Live 구획이 빈 상태로 측정됨)
- `[data-rate]` 셀렉터가 `<body data-rate>` 에 맞아 본문이 통째로 바뀜 → `data-fx-rate`
- CSS 변수 안 `url()` = CSS 파일 기준 → mask 는 인라인
- 공용 타일 `% 패딩`을 flex 띠에 재사용 → 내용 폭 0(로고 안 보임·에러 없음) → px
- `.live` 클래스가 `.badge.live` 와 충돌 → `.live-sec`
- 생성 사진: 프롬프트에 "Tokyo" 만 있어도 창밖에 도쿄타워가 자동으로 들어간다(4컷) → "anonymous mid-rise skyline, no towers, no landmarks, no red-and-white structures" 명시. 로고 교훈("no logos" 부족)과 같은 꼴
- 제목 정리 regex: 성별 꼬리를 낱말 단위로 지우면 "- Men's &" 가 남는다 → 문구 통째 + 끊긴 꼬리 `-/&` 정리 한 번 더. 테스트 = 스냅숏 125개 전수 before→after 출력해 눈으로
- `inline-grid; place-items:center` 안에 빈 `<span>` 이 있으면 둘째 줄을 차지해 아이콘이 위로 뜬다(마스트 하트 · 형 캡처) → `:empty { display:none }`
- 세리프 워드마크 18px 는 390 에서 166px — 메뉴 40 + 오른쪽 157 과 합쳐 358 을 넘어 마스트가 두 줄(80px) → 420↓ 16px/.03em
- 운영 스냅숏 제목에 `&amp;` 가 문자 그대로 들어 있다("Men's &amp; Boys'") → cleanTitle 첫 줄에서 `&` 로. esc() 가 화면에서 다시 감싼다
- `.site-top` 을 sticky 로 두면 상세의 fixed 따라오는 바(72px)가 헤더(109px) 위에 겹쳐 카테고리 줄 37px 이 삐져나온다 → `.page-lot .site-top { position: relative }`
- 생성 사진: 가방 여러 점 = 같은 토트 복제 → 실루엣 종류를 낱낱이 적는다(41~45)
