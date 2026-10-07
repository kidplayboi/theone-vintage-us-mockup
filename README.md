# TheOne Vintage US — 리뉴얼 시안 사이트

`TheOne-Vintage-US-리뉴얼-기획안-v2.pdf`(41쪽)와 형이 모은 레퍼런스(captures-all 31묶음)를 바탕으로 만든 클릭 가능한 정적 시안이다. 서버 연결 없음 — 실재고 일부(125개)를 스냅숏으로 담았고, 문의·입찰·관심·메모·결제 기록은 보는 사람 브라우저에만 남는다.

- 공개 주소: https://kidplayboi.github.io/theone-vintage-us-mockup/
- 디자인 결정의 출처: [`docs/design/refs/2026-10-06-v4-lock.md`](docs/design/refs/2026-10-06-v4-lock.md) (**v4** — 레퍼런스 락 · 서체 · 색 역할표 · 결제 플로우 · 결정 68~87) · 규칙표 [`v4-rules`](docs/design/refs/2026-10-06-v4-rules.md)(GitHub 디자인 스킬 85개 파일에서 뽑은 규칙 A~G) · 브리프 [`v4-brief`](docs/design/refs/2026-10-06-v4-brief.md) · 이전 판 [`v3-lock`](docs/design/refs/2026-10-06-v3-lock.md) · [`v2-plan`](docs/design/refs/2026-10-06-v2-plan.md) · [`v1`](docs/design/refs/2026-10-06-us-mockup.md)

## v4 에서 바뀐 것 (형 v3 피드백 "숨막힘 · 어지러움 · 디테일")
- **서체** Schibsted Grotesk 500 → **Inter 1벌**(디스플레이 300 · 본문 400 · UI 500). 16종 나란히 렌더 뒤 결정(v4-lock §3). 대문자 변환 0곳.
- **홈 구획 9 → 5**: 히어로(흰) → Live now(초록 띠) → Browse(카테고리 + **브랜드 로고 행**) → How it works → Ending soon 표. 검은 facts 띠 · 탭 · 신뢰 카드 · 판매기록 · Why · 최근 본 상품 삭제.
- **카드 = 까사 정보 구조의 정돈판**: 머리 띠(마감 현지 시각 · 카운트다운 · 진행막대) → 사진 타일(등급 원 · 북마크 hover → 폴더 1·2·3 · hover 시세 비교) → 브랜드 · 이름 · 가격 · 상태 배지. 띠 색이 상태(초록 → 1시간 안 **빨강** → 끝남 회색), 숫자는 흰색. 390폭은 띠 대신 가격 줄의 알약.
- **색 역할표**(v4-lock §4): 초록은 머리띠 · Live 띠 · 주 CTA 세 자리만. 구획은 상자가 아니라 여백과 hairline 으로. 테두리 카드 0, 그림자는 오버레이에만.
- **결제 플로우 신설** `pay.html`: 낙찰 → 청구서(3일) → 결제 · 에스크로 → 검수 · 포장(도쿄) → 배송 → 수령(3일 신고) → 완료. 청구서 1장(낙찰가 · 수수료 10% · 관세 · DHL + 단단한 상자 · 감정서 · 총액), 카드($10,000 까지 +3%)/송금. Catawiki · Chrono24 · Loupe · Bezel · Baymard 조사(v4-lock §7). 수치는 정책 확정 전 예시.
- **시간대**: 운영 사이트 'Your local time'(미국 7개 · 도쿄 · UTC)을 홈 Live 카드와 목록에. 기본 = 기기 시간대.
- **판매 방식 색 = 두 가지**(의뢰처 요청 → 형 조정 10/6 · 결정 94·95): 경매(Live bid 실시간 + Time limit 블라인드) 초록 · 고정가(Mall) 슬레이트가 목록 탭 · 카드 띠 · 배지 · 상세 점에 같은 토큰으로. 종료 임박은 띠가 아니라 **카운트다운 숫자가 빨간 알약**으로. "Time limit = 블라인드 입찰"은 의뢰처 확인 항목.
- **10/6 저녁 형 피드백 3건**(결정 97~99): 상세 "항목별 총액" 회원 전용(가입 CTA) · 홈 Live 구획 바탕 연한 회녹(진초록+흰 눈부심 해소) · 목록 필터 위계(판매 방식 세그먼트+아이콘 / 카테고리 연한 칩 / 도구 라벨).
- **목록 필터 보강**(형 10/6 · 결정 100): 카테고리 칩 아이콘 8 + 경매 주력 셋(Bags · Watches · Jewelry) 앞에 모음 · 브랜드 = 칩(주요 8 + More brands 40) · Sale type 숫자는 고른 카테고리·브랜드 안의 수 · Express/Classic 은 "별도 판매 프로그램 · 재고 0" 설명(정의는 의뢰처 확인).
- **채움 4건**(형 10/6 · 결정 101~104): 칩 줄 한 줄 스크롤 + More brands 고정 · Price/Condition 필터 · 카드 hover 두 번째 사진 + 빠른 입찰 · 홈 "New this week" 레일 + 히어로 무대 깊이.
- **의뢰처 피드백 3건**(10/6 · 결정 105~107): 필터 줄 Brand → Category 순서 · 입찰 모드 엔화 표기 · **How it works 를 까사 소개 구조로 재구성**(사실 칸 4 → 한계 3 → 다리 → 대상 → 검증 → 전 과정 6 → 5단계 → 비용 → 요금 → 운영 기반 → FAQ). 세부 문구·실적은 의뢰처 자료 오면 교체.
- **눈 편한 글 패스**(형 10/6 · 결정 108·109): 구획 여백 96 · 문단 52ch · 행간 1.6 · 카드 글줄 위계(브랜드 회색 작게 · 입찰 수 제거) · 홈 3단계 문장 축약 · 미등급 스코어카드 2칸 · 검토 막대 결정 원장 링크 삭제(원장은 `docs/design/refs/`).
- **사진 자리표시 7곳**(결정 110 · 생성 도구 404로 보류): `<figure class="ph" data-ph="…">` — 위치·비율·파일명은 [`v5-images`](docs/design/refs/2026-10-06-v5-images.md). 생성되면 같은 자리를 `<img>`로. 입찰 상세에 "Ask about this lot" 추가(결정 111).
- **hover 전환·모바일**(형 10/6 · 결정 112·113): 카드 두 번째 사진은 크로스페이드만 · 390에선 필터를 "Filters (n)" 버튼 뒤로(Sale type만 노출) · 터치 타깃 40/36px.
- **레퍼런스 나란히 대조 → 상세 채움**(형 10/6 밤 "뭐가 부족한지 안 보인다" · v4-lock §12 · 결정 114~120): Bezel·Loupe·Fashionphile 와 홈·목록·상세를 같은 폭으로 캡처해 표로 대조. 갭 7건 채움 — 사진이 타일을 채우게(여백 8→4%) · 상세 "About this piece"(원천 카탈로그 한 줄 인용 + 2열 사양표 `js/lotsections.js`) · Included 행 · "Before it ships" 4개 · Bid history 접이식 · "Ask our Tokyo team" 블록 · 브랜드 띠. 기각 6건(Just sold 티커 · Staff pick · 리뷰 · 조회 수 · 소매가 대비 · 캡션 사진)은 전부 **없는 데이터**라 지어내지 않음.
- **레퍼런스 대조 보드 → 사진 생성·교체**(형 10/7 "홈·목록·How 다 부족 · 시니어급이 안 된다" · v4-lock §13 · 결정 121): 홈·목록·How it works 를 Bezel·Loupe·1stDibs·Fashionphile·StockX·Casa 와 같은 폭으로 29장 나란히 놓고 수치로 대조(사진 비율 · 글자 수 · 글자색 수 · 길이). 판정 = 토큰은 동급, 빠진 건 ①분위기 있는 사진 ②페이지 안 명암 전환 ③같은 요소 반복(+글·색 양). ①부터 — 힉스필 MCP(gpt-image 2.5 · Nano Banana 2.1)로 15컷 생성, 브랜드 무늬가 보인 5컷은 기각 후 무늬 없는 가죽으로 재생성, **자리표시 8곳 전부 실사진**(`assets/editorial/gen/` · 원본 Downloads/theone-gen-raw-2026-10-07). How it works 검수 사진이 632×1500 으로 늘어나던 버그(img height 속성 vs aspect-ratio) 수정. 히어로 후보 2컷(가방 · 시계)은 형 선택 대기. 다음 = 목록 Bezel 형식(Featured 캐러셀 + 접힌 Filters) · 카드 띠 제거 · 홈 다듬기.
- **목록 Bezel 형식 + 카드 띠 제거**(형 10/7 "Bezel shop 형식 따와서 · 빡빡한 부분 비우고" · 결정 122·123): 목록 = 제목 → **Featured 띠**(현재가 높은 순 6점 · 사진 + Current bid + Ends in · `js/featured.js`) → Sale type 세그먼트 + **Filters 버튼**(브랜드 · 카테고리 · 검색 · 가격 · 상태 · 페이지당은 접힘 — 운영 분류 1:1 유지) + 정렬 → 카드. 카드는 진초록 머리 띠를 빼고 **메타 1줄**(판매 방식 점 · 마감 현지 시각 · 남은 시간 · 1시간 안 빨간 알약)로 — 카드 한 곳(`js/card.js`)이라 홈 레일 · 상세 Similar · 저장도 같이. 색 설명문 삭제. 실측: 첫 화면 글자색 목록 11 → 5 · 홈 10 → 5, 상품 사진 y 600 → 307.
- **홈 히어로 = 풀블리드 사진**(형 10/7 Loupe 캡처 "이런 게 존나 이쁘다" · 결정 124): 누끼 무대·꼬리표·점(`js/hero.js`) 삭제 → 어두운 매크로 사진 한 장이 화면 폭 전부 + 왼쪽 아래 한 문장 + 오른쪽 아래 흰 버튼 1(Loupe 구조). 사진 = 힉스필 생성 `hero-clasp.jpg`(녹색 가죽 · 금 잠금 · 흰 장갑), 대안 2컷(`hero-movement` · `hero-loupe`)은 파일명만 바꾸면 됨. 카드 hover 두 번째 사진이 겹쳐 보이던 것(multiply)도 수정.
- **형 10/7 피드백 4건**(결정 125~127): 히어로 글 = 숫자 빼고 한 문장 + 디스플레이 세리프(Cormorant Garamond · 히어로 한 자리만) · 상세 칸 밀도 — 도구 4개를 제목 옆 아이콘으로, Condition·사실 3줄을 접이식 행 2개로(Shopify Dawn `collapsible_tab` · Vercel Commerce 5덩어리 구조), 상세 창 "Full lot page" 버튼을 오른쪽 위로 · About 사양표 행 14px, 미등급 로트는 빈 스코어카드 대신 한 문장.
- **서체 체계 v6**(형 10/7 "타이포 배치 아쉬움 · AI 티" · 결정 128): 편집 제목(페이지 h1 · 섹션 h2 36곳)은 Cormorant Garamond 500, 상품명·가격·카드·UI 는 Inter — 1stDibs(Cardinal 세리프 제목)·Loupe(Romano 디스플레이) 와 같은 '세리프 제목 + 그로테스크 본문' 짝. Inter 숫자 디스플레이 300 → 400(Bezel 400 실측). 카탈로그 인용은 세리프 이탤릭. 워터멜론 MCP 히어로 3종 소스 대조(제목 clamp·행간 1.02·CTA 화살표).
- **배치 AI 티 10건**(10/7 디자인 검사관 보고 · 결정 129): 홈에 큰 제목 한 번(Live 구획 = 가운데 세리프 "Premium Auction" 최대 112px + 한 줄 + 카드 4장 · 흰 머리 카드 삭제) · "→ 더 보기" 머리 6 → 끝 3 · 카드 4줄(리저브는 사진 위 꼬리표) · 브랜드 줄 흰 바탕 · 홈 카테고리 줄을 히어로 아래로 · 버튼 짝 → 글 링크 · 눈썹 라벨·그림자·4px·초록 chip 락 위반 정리 · 마감 결함 2건. 회색 상자 26 → 18.
- **형 결정(10/6 · v4-lock §11)**: 가격 표기 = 상품가 크게(토글 삭제) · 요율 = 실값 교체 예정(`js/buybox.js` `EXAMPLE_RATES` 한 곳) · 결제 정책 = 미정이라 3일/보관/3일 예시 유지 · 범위 밖 4건(Ending soon 정렬 · 브랜드 8 · 입찰 기본 · 목록 타일) 전부 유지 · 로고 유지.

## 의뢰처 전달 메모
- 홈 "Brands" 행의 워드마크 8개(`assets/brands/*.svg`)는 위키미디어 공용의 Public domain 글자 로고 파일입니다. 저작권은 없지만 **상표권은 각 브랜드 소유**이며, 실서비스 게재 여부는 의뢰처의 판단 사항입니다(리셀 플랫폼 Fashionphile · Rebag · WGACA 는 글자 로고를 씁니다). 시안에서는 참고용으로만 씁니다.
- 수수료·관세·배송·상자·감정서·카드 한도 수치는 전부 예시이며 화면에 "example rates" 로 표시됩니다. 실값이 정해지면 `js/buybox.js` 의 `EXAMPLE_RATES` 한 곳만 바꿉니다.

## 화면 (여러 페이지짜리 사이트)
| 페이지 | 하는 일 |
|---|---|
| `index.html` 홈 | 한 문장 히어로 · **Live now 띠**(흰 머리 카드 + 카드 3장 + 다음 마감 카운트다운 + 시간대) · Browse(카테고리 타일 + 브랜드 로고 8) · How it works 3단계 + 사진 2장 · **Ending soon 표** 8행 |
| `shop.html` 목록 | **운영 사이트 분류 전부** — 판매 방식 탭 4 · 카테고리 9(개수) · 브랜드 40(개수 · 머리줄 `Brands ▾` 패널) · 정렬 · 페이지당 20/50/100 · 검색 · 시간대 · 쪽 번호 · Premium/Express/Classic |
| 카드 클릭 = 상세 창 / `lot.html?id=…` | 사진·장수 · Current bid / Ends · Register to bid · 호가 버튼 · 등급표 · 문의(단단한 상자) · 스코어카드 · 항목별 총액 |
| `pay.html?lot=…` 결제 | 7상태 타임라인(점 + 글) · 청구서 · 결제 수단 · 배송지(전화번호 이유) · 결제하면 My page 행이 '완료' 칸으로 |
| `how-it-works.html` · `how-we-grade.html` | 안내 |
| `offers.html` My page(까사 네 칸 · 정산표 · Pay now) · `saved.html`(폴더 3) · `sign-in.html` | 계정 |
| `states.html` | 상태 모음(검토용) — 카드 8상태 · 상세 상태 · 결제 상태 링크 |

맨 위 검은 막대는 **시안 도구**다(제품 아님). 판매 방식 A(정가·제안)/**B(입찰, 기본)** 전환, 메모 핀, 상세 상태 미리보기, 결제 상태 미리보기, 보내기 실패 흉내, 예시 데이터 끄기를 여기서 한다.

## 데이터 다시 뜨기
```
python -I tools/snapshot.py            # 실재고 다시 수집(약 3분, 사진 포함)
python -I tools/snapshot.py --retitle  # 네트워크 없이 제목·순서만 다시 계산(data/titles.json 반영)
```

## 배포 전에 꼭
```
python -I tools/stamp.py   # 모든 JS·CSS 주소에 같은 ?v= 꼬리표 — 재배포 직후 새/옛 모듈이 섞여 깨지는 것 방지
```
로컬 확인은 캐시를 끄고(`?v=` 가 같으면 브라우저가 옛 CSS 를 쓴다 — 10/6 실측).

## 쓴 오픈소스 · 자료
- [PhotoSwipe 5.4.4](https://github.com/dimsemenov/PhotoSwipe) — 사진 확대(MIT)
- [Embla Carousel 8.6.0](https://github.com/davidjerleke/embla-carousel) — 사진 넘기기(MIT)
- [Lenis 1.3.26](https://github.com/darkroomengineering/lenis) — 부드러운 스크롤(MIT)
- 서체: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts, OFL) — Bezel 의 Riforma · Loupe 의 Söhne(유료) 공개 대체재
- 브랜드 워드마크 `assets/brands/*.svg`: 위키미디어 공용 Public domain(글자 로고) 파일. 상표는 각 회사 소유이며 시안 참고용으로만 쓴다.

상품 사진·이름·가격은 vintage.theone-biz.com 실재고(2026-10-06 스냅숏)다. 홈 히어로의 상품 4점(`assets/hero/`)은 같은 실재고 사진에서 흰 배경만 지운 것이다. 경매 마감 시각·입찰 수·리저브는 실재고 입찰이 아직 0이라 예시값이다. `assets/editorial/gen/` 연출 사진은 힉스필드 생성이며 v4 에서는 How it works 의 루페 검수(`inspect.jpg`) · 상자 포장(`packing.jpg` · `rigid_box.jpg`)에만 쓴다.
