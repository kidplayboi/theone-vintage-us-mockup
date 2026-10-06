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
