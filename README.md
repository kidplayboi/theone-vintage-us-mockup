# TheOne Vintage US — 리뉴얼 시안 사이트

`TheOne-Vintage-US-리뉴얼-기획안-v2.pdf`(41쪽)를 클릭할 수 있는 정적 사이트로 옮긴 시안이다. 서버 연결 없음 — 실재고 일부(125개)를 스냅숏으로 담았고, 요청·제안·관심·메모는 보는 사람 브라우저에만 남는다.

- 공개 주소: https://kidplayboi.github.io/theone-vintage-us-mockup/
- 디자인 결정의 출처: [`docs/design/refs/2026-10-06-us-mockup.md`](docs/design/refs/2026-10-06-us-mockup.md) (레퍼런스 락 · 결정 원장 27~51번)

## 화면
| 페이지 | 기획안 |
|---|---|
| `index.html` 홈 — 영상 히어로 · 신뢰 네 칸 · 카테고리 · 판매 방식 탭 · 그리드 · 마감 임박/최근 판매 · 최근 본 상품 | 19~22쪽 |
| `lot.html?id=…` 상세 — 사진 확대 · 오른쪽 칸 A/B · 스코어카드 · 총액/시세 · 따라오는 바 · 요청서 | 23~29쪽 |
| `how-it-works.html` · `how-we-grade.html` | 26 · 30쪽 |
| `offers.html` My offers · `saved.html` 관심 폴더 · `sign-in.html` | 11 · 31쪽 |
| `states.html` 상태 모음(검토용) | 24 · 29쪽 |

맨 위 검은 막대는 **시안 도구**다(제품 아님). 판매 방식 A(정가·제안)/B(입찰) 전환, 메모 핀 켜기, 상세 상태 미리보기, 보내기 실패 흉내, 예시 데이터 끄기를 여기서 한다.

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
- 서체: Bodoni Moda · Jost · JetBrains Mono (Google Fonts, OFL) · 시안 도구만 Pretendard(OFL)

상품 사진·이름·가격은 vintage.theone-biz.com 실재고(2026-10-06 스냅숏)다. 인트로 영상·연출 사진은 2026-10-01 제작분.
