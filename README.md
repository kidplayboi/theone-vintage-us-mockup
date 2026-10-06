# TheOne Vintage US — 리뉴얼 시안 사이트

`TheOne-Vintage-US-리뉴얼-기획안-v2.pdf`(41쪽)와 형이 모은 레퍼런스(captures-all 31묶음)를 바탕으로 만든 클릭 가능한 정적 시안이다. 서버 연결 없음 — 실재고 일부(125개)를 스냅숏으로 담았고, 문의·입찰·관심·메모는 보는 사람 브라우저에만 남는다.

- 공개 주소: https://kidplayboi.github.io/theone-vintage-us-mockup/
- 디자인 결정의 출처: [`docs/design/refs/2026-10-06-v3-lock.md`](docs/design/refs/2026-10-06-v3-lock.md) (**v3** — 주 레퍼런스 Bezel · 결정 52~67) · 이전 판 [`v2-plan`](docs/design/refs/2026-10-06-v2-plan.md) · [`v1`](docs/design/refs/2026-10-06-us-mockup.md)

## 화면 (v3 — 한 페이지 랜딩이 아니라 여러 페이지짜리 사이트)
| 페이지 | 하는 일 |
|---|---|
| `index.html` 홈 | 무슨 사이트인지(숫자 + 하는 일) · 카테고리 · **경매 띠**(현재가·남은 시간) · 이번 주 로트 탭 · 신뢰 · 브랜드 · 판매 기록(회원) · Why |
| `shop.html` 목록 | **운영 사이트 분류 전부** — 판매 방식 탭 4 · 카테고리 9(개수) · 브랜드 40(개수) · 정렬 · 페이지당 20/50/100 · 검색 · 시간대 · 쪽 번호 · Premium/Express/Classic |
| 카드 클릭 = 상세 창 / `lot.html?id=…` | 사진·장수 · Current bid / Ends · Register to bid · 등급표 · 문의(단단한 상자) · 스코어카드 · 항목별 총액 |
| `how-it-works.html` · `how-we-grade.html` | 안내 |
| `offers.html` My page(까사 네 칸 · 정산표) · `saved.html` · `sign-in.html`(로그인/가입) | 계정 |
| `states.html` | 상태 모음(검토용) |

맨 위 검은 막대는 **시안 도구**다(제품 아님). 판매 방식 A(정가·제안)/**B(입찰, 기본)** 전환, 가격 표기(상품가 / 총액 예상 · 더윈 6), 메모 핀, 상세 상태 미리보기, 보내기 실패 흉내, 예시 데이터 끄기를 여기서 한다.

## 데이터 다시 뜨기
```
python -I tools/snapshot.py            # 실재고 다시 수집(약 3분, 사진 포함)
python -I tools/snapshot.py --retitle  # 네트워크 없이 제목·순서만 다시 계산(data/titles.json 반영)
```

## 배포 전에 꼭
```
python -I tools/stamp.py   # 모든 JS·CSS 주소에 같은 ?v= 꼬리표 — 재배포 직후 새/옛 모듈이 섞여 깨지는 것 방지
```

## 쓴 오픈소스
- [PhotoSwipe 5.4.4](https://github.com/dimsemenov/PhotoSwipe) — 사진 확대(MIT)
- [Embla Carousel 8.6.0](https://github.com/davidjerleke/embla-carousel) — 사진 넘기기(MIT)
- [Lenis 1.3.26](https://github.com/darkroomengineering/lenis) — 부드러운 스크롤(MIT)
- 서체: [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk) (Google Fonts, OFL) — Bezel 의 Riforma(유료) 대신

상품 사진·이름·가격은 vintage.theone-biz.com 실재고(2026-10-06 스냅숏)다. 홈 히어로의 상품 4점(`assets/hero/`)은 같은 실재고 사진에서 흰 배경만 지운 것이다. 경매 마감 시각·입찰 수는 실재고 입찰이 아직 0이라 예시값이다. `assets/editorial/gen/` 연출 사진은 힉스필드 생성이며 v3 에서는 How it works 의 '단단한 상자 포장' 한 곳에만 쓴다.
