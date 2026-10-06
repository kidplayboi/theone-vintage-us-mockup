# TheOne Vintage US — 리뉴얼 시안 사이트

`TheOne-Vintage-US-리뉴얼-기획안-v2.pdf`(41쪽)를 클릭할 수 있는 정적 사이트로 옮긴 시안이다. 서버 연결 없음 — 실재고 일부(125개)를 스냅숏으로 담았고, 요청·제안·관심·메모는 보는 사람 브라우저에만 남는다.

- 공개 주소: https://kidplayboi.github.io/theone-vintage-us-mockup/
- 디자인 결정의 출처: [`docs/design/refs/2026-10-06-us-mockup.md`](docs/design/refs/2026-10-06-us-mockup.md) (v1 락 · 결정 27~51) · [`docs/design/refs/2026-10-06-v2-plan.md`](docs/design/refs/2026-10-06-v2-plan.md) (**v2** — 형 피드백·더윈.txt 16항목 매핑·운영 사이트 분류 복원·PDF 서체 체계)

## 화면
| 페이지 | 기획안 |
|---|---|
| `index.html` 홈 — PDF 표지형 히어로 · 까사식 첫 소개 · 카테고리 · **운영 사이트 분류 전부**(판매 방식·카테고리 9·브랜드·정렬·페이지당·검색·시간대·쪽 번호) · 카드(초록 상태 띠) · 마감/판매 표 · 연출 사진 · 최근 본 상품 | 19~22쪽 · 더윈 3·5·12 |
| 카드 클릭 = 상세 창 / `lot.html?id=…` 상세 페이지 — 사진 확대·장수 · 등급표 · 큰 달러 · 창 안 문의(단단한 상자 체크) · 스코어카드 · 항목별 총액 · 낙찰 결과 · 따라오는 바 | 23~29쪽 · 더윈 1·2·4·5·7·8·14 |
| `how-it-works.html` · `how-we-grade.html` | 26 · 30쪽 |
| `offers.html` My page(까사 네 칸 · 정산표) · `saved.html` 관심 폴더 · `sign-in.html` | 11 · 31쪽 · 더윈 9·10 |
| `states.html` 상태 모음(검토용) | 24 · 29쪽 |

맨 위 검은 막대는 **시안 도구**다(제품 아님). 판매 방식 A(정가·제안)/B(입찰) 전환, **가격 표기(상품가 / 총액 예상 · 더윈 6)**, 메모 핀 켜기, 상세 상태 미리보기, 보내기 실패 흉내, 예시 데이터 끄기를 여기서 한다.

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
- 서체: Cormorant Garamond (Google Fonts, OFL) · Pretendard (OFL)

상품 사진·이름·가격은 vintage.theone-biz.com 실재고(2026-10-06 스냅숏)다. 인트로 영상은 2026-10-01 제작분, `assets/editorial/gen/` 연출 사진 6장은 2026-10-06 힉스필드(GPT Image 2.5) 생성 — 로고·글자 없는 분위기 사진이고 판매 상품이 아니다.
