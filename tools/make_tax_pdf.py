# 미국 세무사·변호사 확인 질문지 — TheOne Vintage US · 한국어 PDF (reportlab · 맑은 고딕)
# 형 10/8: 운송사·결제사 같은 바뀔 수 있는 디테일은 빼고, 세법 리스크 + 고소(법적) 리스크를 전체적으로 묻는다.
# 출력: Downloads/미국-세무사-질문지-2026-10-08.pdf + docs/ 사본 · 실행: python -I tools/make_tax_pdf.py
import os, shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether

pdfmetrics.registerFont(TTFont("Malgun", "C:/Windows/Fonts/malgun.ttf"))
pdfmetrics.registerFont(TTFont("MalgunB", "C:/Windows/Fonts/malgunbd.ttf"))

INK = colors.HexColor("#111412"); BODY = colors.HexColor("#3F4542"); MUTED = colors.HexColor("#69706B")
LINE = colors.HexColor("#D9D8D2"); WARN = colors.HexColor("#A8231A"); TILE = colors.HexColor("#F3F2EF")

S = {
    "title": ParagraphStyle("title", fontName="MalgunB", fontSize=20, leading=26, textColor=INK, spaceAfter=4),
    "meta": ParagraphStyle("meta", fontName="Malgun", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=10),
    "lead": ParagraphStyle("lead", fontName="Malgun", fontSize=10, leading=15.5, textColor=BODY),
    "part": ParagraphStyle("part", fontName="MalgunB", fontSize=15, leading=20, textColor=INK, spaceBefore=18, spaceAfter=2),
    "h2": ParagraphStyle("h2", fontName="MalgunB", fontSize=12.5, leading=17, textColor=INK, spaceBefore=12, spaceAfter=3),
    "why": ParagraphStyle("why", fontName="Malgun", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=6),
    "q": ParagraphStyle("q", fontName="MalgunB", fontSize=10.5, leading=15.5, textColor=INK),
    "qmust": ParagraphStyle("qmust", fontName="MalgunB", fontSize=10.5, leading=15.5, textColor=WARN),
    "now": ParagraphStyle("now", fontName="Malgun", fontSize=9.3, leading=14, textColor=MUTED),
    "bullet": ParagraphStyle("bullet", fontName="Malgun", fontSize=9.6, leading=14.5, textColor=BODY, leftIndent=10),
    "ans": ParagraphStyle("ans", fontName="Malgun", fontSize=9.3, leading=14, textColor=MUTED),
    "foot": ParagraphStyle("foot", fontName="Malgun", fontSize=8.5, leading=12, textColor=MUTED),
}
def P(text, style): return Paragraph(text, S[style])

N = 0
def question(title, must=False, now=None, bullets=(), ans=None):
    global N; N += 1
    st = "qmust" if must else "q"
    rows = [[P(f"{'★' if must else ''}{N}", st), P(title, st)]]
    if now: rows.append(["", P(now, "now")])
    for b in bullets: rows.append(["", P("· " + b, "bullet")])
    if ans: rows.append(["", P("답 → " + ans, "ans")])
    t = Table(rows, colWidths=[11 * mm, 159 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
        ("LINEBELOW", (0, -1), (-1, -1), 0.5, LINE), ("BACKGROUND", (0, 0), (-1, -1), TILE if must else colors.white),
    ]))
    return KeepTogether([t, Spacer(1, 5)])

story = []
story.append(P("미국에서 팔기 전에 확인할 것 — TheOne Vintage US", "title"))
story.append(P("2026년 10월 8일 · 작성 사토시 · 전달 윤(의뢰처) → 미국 세무사(CPA) · 법률 항목은 세무사가 변호사 확인이 필요하다고 표시해 주시면 됩니다. ★ = 미국 공개 전 반드시 답이 필요한 항목", "meta"))

lead = Table([[P(
    "<b>사업 전제(먼저 알아야 할 것)</b><br/>"
    "· 일본 법인(도쿄)이 일본 딜러 전용 경매에서 중고 명품(가방 · 시계 · 주얼리 · 의류 등)을 확보해 <b>미국 개인 소비자</b>에게 달러로 판매하는 웹사이트. 미국 법인 · 창고 · 직원은 현재 없음(가정).<br/>"
    "· 손님은 사이트에서 입찰(경매) 또는 정가 구매 → 도쿄에서 검수 → 국제 특송으로 미국 배송. 관세는 선납해 <b>수령 시 추가 비용 없음</b>을 약속할 예정. 운송사 · 결제대행사는 아직 안 정함.<br/>"
    "· 손님이 내는 돈 = 낙찰가 + 구매자 수수료 + 배송비 + 관세 + 선택 서비스(보호 포장 · 제3자 감정서). 결제는 카드 · 은행 송금.<br/>"
    "· <b>아직 안 정한 핵심</b>: 우리가 물건을 사서 되파는 구조(재고 소유)인지, 손님 대신 사 주는 대행(에이전트) 구조인지 — 세금과 법적 책임이 모두 달라지는 지점이라 두 경우를 나눠 답해 주시면 좋겠습니다.<br/>"
    "· 목표: <b>세금을 빠뜨려 추징당하거나, 손님에게 고소당할 구멍을 공개 전에 전부 막는 것.</b> 아래에 없는 위험이 보이면 추가로 적어 주십시오.", "lead")]],
    colWidths=[170 * mm])
lead.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.6, LINE), ("BACKGROUND", (0, 0), (-1, -1), TILE), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
story.append(lead)

# ── 1부 세무 ──
story.append(P("1부. 세무 리스크", "part"))
story.append(P("A. 판매세(Sales tax)", "h2"))
story.append(P("사이트에 \"판매세 없음\" 이라고 써도 되는지, 나중에 주 정부가 소급 추징할 수 있는지가 걸려 있습니다.", "why"))
story.append(question("미국 실체가 없는 외국 판매자가 해외에서 직배송하는 경우, 주(state)별 판매세 징수 의무가 생기나요?", True,
    now="원격 판매자 기준(주별 연 매출액 · 거래 건수)이 외국 법인에도 똑같이 적용되는 것으로 알고 있습니다 — 맞는지, 예외 주가 있는지, 기준을 넘긴 뒤 등록이 늦으면 어떤 불이익이 있는지.",
    ans="의무 발생 여부 · 기준 · 지연 등록 위험"))
story.append(question("넘기면 어느 주부터, 어떤 순서로 등록·징수·신고해야 하나요? 자동화 방법과 비용은요?", True,
    bullets=["외국 법인이 등록할 때 필요한 미국 납세번호 · 대리인", "간소화 협약 가입 가능 여부 · 자동 계산 소프트웨어 권장안 · 연간 비용 추정"],
    ans="절차 · 비용 · 선행 조건"))
story.append(question("과세표준 — 손님이 내는 금액 중 무엇에 판매세가 붙나요?", True,
    bullets=["낙찰가 · 구매자 수수료 · 배송비 · 선납 관세 · 제3자 감정서(서비스) · 보호 포장 — 항목별 과세 여부(주마다 다르면 대표적인 차이)", "관세를 손님에게 전가한 금액도 과세표준에 들어가는지"],
    ans="항목별 O/X"))
story.append(question("경매·대행 구조에 따라 세법상 '판매자'가 달라지나요?",
    now="① 우리가 확보해 되파는 경우(본인 판매) ② 손님 위임으로 대신 낙찰받고 수수료만 받는 경우(에이전트). 두 경우 판매세 의무자 · 과세표준 · 신고 방식의 차이와 권장 구조.",
    ans="구조별 차이 · 권장"))
story.append(question("사업자(리셀러) 손님에게 파는 경우 면세 처리 — 재판매 증명서를 어떻게 받고 얼마나 보관해야 하나요?", ans="절차 · 보관 기간"))
story.append(question("나중에 다른 판매자 물건을 중개하면 마켓플레이스 촉진자(marketplace facilitator)로서 플랫폼이 징수 의무자가 되나요?", ans="현재 · 확장 시"))
story.append(question("징수하지 않는 주에 대한 사용세(use tax) 통지·보고 의무가 있나요?", ans="해당 주 · 의무 내용"))

story.append(P("B. 관세·수입", "h2"))
story.append(P("\"관세 선납 · 수령 시 추가 비용 없음\" 을 약속하려면 수입 책임이 누구에게 있는지가 정리돼야 합니다.", "why"))
story.append(question("관세 선납(DDP) 배송에서 미국 수입자(Importer of Record)는 누구여야 하나요?", True,
    bullets=["외국 법인(우리)이 비거주 수입자가 될 수 있는지 — 보증(bond) · 통관 대리인 · 미국 대리인 요건", "운송사가 대행하는 선납 서비스를 쓸 때 세금 책임이 어디에 남는지", "손님을 수입자로 두고 우리가 관세만 대납하는 구조의 문제점"],
    ans="권장 구조 · 필요 서류"))
story.append(question("소액 면세(de minimis) 폐지 이후 전 건 관세 대상이 맞나요? 세율은 무엇을 기준으로 정해지나요?", True,
    bullets=["명품의 원산지(유럽 제조)와 발송국(일본)이 다를 때 어느 기준으로 세율(상호관세 포함)이 붙는지", "품목(가죽 가방 · 손목시계 · 귀금속 · 의류)별 대략의 세율 — 사이트 요율표의 예시값이 현실적인지"],
    ans="세율 산정 기준 · 예시값 교정"))
story.append(question("중고품에 관세 특례가 있나요? 신고 가치는 낙찰가인가요, 손님 판매가인가요?", now="과소신고로 추징·벌금을 맞지 않으면서 손님 부담을 줄이는 기준이 있는지.", ans="신고 가치 기준 · 특례 유무"))
story.append(question("악어 · 파이썬 · 도마뱀 등 야생동물 가죽(CITES) 수입 — 허가 · 수수료 · 지연이 세무와 책임에 미치는 영향은요?", now="세무사 범위 밖이면 통관 전문가 추천을 부탁드립니다.", ans="추가 비용 · 추천"))
story.append(question("손님이 반품하면 역수출 시 관세 환급(duty drawback)이 가능한가요? 현실적인가요?", ans="가능 여부 · 절차 · 최소 금액"))

story.append(P("C. 미국 소득세·법인 구조", "h2"))
story.append(P("미국 법인이 필요하다는 말을 듣고 있습니다. 세금 부담 · 신고 의무와 비교하고 싶습니다.", "why"))
story.append(question("미국 법인 없이 판매할 때 미국 소득세 노출이 있나요?", True,
    bullets=["미국 사업 소득(ECI) · 고정사업장(PE) 판정 — 미·일 조세조약상 우리 구조(해외 발송 · 미국 직원 0 · 웹사이트)가 PE 가 되는지", "보호 신고(protective return)를 해 두는 게 맞는지 · 외국 법인 증빙 서류(W-8 계열)를 누구에게 내야 하는지"],
    ans="노출 여부 · 권장 신고"))
story.append(question("다음 중 무엇이 생기면 고정사업장(PE)이나 주 넥서스가 되나요?",
    bullets=["미국 창고 · 물류대행 재고", "미국 상주 직원 · 계약직 고객응대", "미국 은행 계좌 · 전화번호 · 주소(가상 오피스)", "미국 리셀러 · 제휴 판매"],
    ans="항목별 O/X"))
story.append(question("미국 법인 설립이 유리한가요? 설립하면 어떤 세무 의무와 비용이 생기나요?", True,
    bullets=["외국인 소유 법인의 정보 신고 · 주 프랜차이즈세 · 본사와의 거래 가격(이전가격) 문제", "설립 주 선택과 실제 판매가 일어나는 주의 관계", "미국 법인이 판매자가 되면 판매세 · 관세 · 결제대행사 계좌 문제가 쉬워지는지"],
    ans="권장 구조 · 연간 유지 비용 추정"))
story.append(question("결제대행사가 미국 국세청에 보내는 매출 보고(1099 계열)가 외국 법인에도 해당하나요? 우리 신고와 어떻게 맞추나요?", ans="해당 여부 · 처리"))
story.append(question("환율 — 달러 매출을 장부에 반영하는 기준(거래일 · 월평균 · 연평균)과 엔화 장부와의 차이 처리", ans="권장 기준"))
story.append(question("환불 · 가품 판정 환불이 나면 이미 낸 판매세 · 관세는 어떻게 되돌리나요?", ans="수정 신고 · 환급 절차"))
story.append(question("기록 보존 — 인보이스에 반드시 들어가야 할 항목, 보존 기간, 디지털 보관 가능 여부", ans="목록 · 기간"))

# ── 2부 법률 ──
story.append(P("2부. 고소·분쟁 리스크(세무사 범위 밖이면 변호사 확인 표시 부탁)", "part"))
story.append(P("D. 소비자 보호·판매 약속", "h2"))
story.append(P("사이트가 손님에게 하는 약속 하나하나가 나중에 소송 근거가 됩니다. 어디까지 써도 되는지 확인하고 싶습니다.", "why"))
story.append(question("\"판매세 없음\" · \"관세 선납, 수령 시 추가 비용 없음\" · \"100% 정품\" 같은 문구 — 미국 소비자법(연방 · 주)상 허위·과장 광고가 되지 않으려면 어떤 조건이 필요한가요?", True,
    ans="문구별 가능 여부 · 필요한 단서"))
story.append(question("중고 명품 판매에 묵시적 보증(implied warranty)이 붙나요? \"현 상태 그대로(as is)\" 고지가 유효한 주와 무효인 주가 있나요?", True,
    ans="유효 조건 · 주별 예외"))
story.append(question("환불 · 반품 · 취소 — 온라인 판매에서 법으로 보장되는 최소 권리가 있나요(배송 지연 시 통지 · 환불 기한 등)? 경매 낙찰도 같은가요?",
    now="사이트 가정: 낙찰 후 결제 기한 3일 · 수령 후 이의 제기 3일 · 환불 조건 미정.",
    ans="최소 의무 · 경매 특례"))
story.append(question("가품이 섞여 나갔을 때 — 모르고 팔았어도 상표권 침해 · 사기 책임이 생기나요? 제3자 감정(AI 감정 · 인증서)을 거쳤다는 사실이 책임을 줄여 주나요?", True,
    bullets=["손님 · 브랜드사 양쪽에서 올 수 있는 청구 유형과 보험 · 면책 구조", "감정 기록 · 사진 · 검수 기록을 어떻게 남겨야 방어가 되는지"],
    ans="책임 범위 · 방어 요건"))
story.append(question("상품 설명 · 등급(상태 등급) · 사진과 실물이 다를 때의 책임 — 등급 기준을 공개하면 책임이 줄어드나요?", ans="권장 고지 방식"))
story.append(question("배송 중 분실 · 파손 · 수령 거부 · 수취인 사기(chargeback) — 책임 분배와 보험, 분쟁 시 증빙 요건", ans="권장 정책 · 증빙"))

story.append(P("E. 경매·결제 규제", "h2"))
story.append(question("온라인 경매를 운영하는 데 주별 경매인(auctioneer) 면허나 등록이 필요한가요? 외국 법인에도 적용되나요?", True, ans="필요 주 · 외국 법인 적용"))
story.append(question("낙찰금을 배송 완료까지 보류(held until delivered)했다가 정산하는 구조가 송금업 · 에스크로 규제에 걸리나요?", True, now="걸리면 결제대행사의 에스크로 기능을 쓰는 등 대안이 있는지.", ans="해당 여부 · 대안"))
story.append(question("입찰 보증(카드 등록 · 보증금) · 미결제 낙찰자 패널티 · 재경매 — 미국에서 허용되는 범위와 약관에 써야 할 내용", ans="허용 범위 · 약관 문구"))
story.append(question("손님 신원 확인 · 제재 대상 검사(OFAC 등) · 고가 거래 보고 의무 — 어디까지 해야 하나요?", ans="의무 범위 · 절차"))

story.append(P("F. 약관·개인정보·회사 정보", "h2"))
story.append(question("미국 손님용 이용약관에 반드시 들어가야 할 조항(준거법 · 분쟁 해결 · 중재 · 집단소송 포기 · 책임 한도)과, 외국 법인이 넣어도 유효한지", True, ans="필수 조항 · 유효성"))
story.append(question("개인정보 — 미국 주별 개인정보법(캘리포니아 등) 적용 기준과 개인정보 처리방침에 필요한 내용 · 마케팅 메일(수신거부) 규정", ans="적용 여부 · 필수 내용"))
story.append(question("사이트에 표시해야 하는 회사 정보(법인명 · 주소 · 연락처)와, 미국 주소 · 전화 없이 운영할 때의 문제", ans="필수 표시 · 권장"))
story.append(question("브랜드 로고 · 상품 사진 · 브랜드명 사용 — 중고 재판매 사이트가 브랜드 상표를 어디까지 쓸 수 있나요(로고 이미지 vs 글자)?", ans="허용 범위 · 권장"))
story.append(question("위 항목 중 세무사 범위 밖이라 변호사 확인이 필요한 번호를 표시해 주시고, 추천할 분이 있으면 알려 주십시오.", ans="번호 목록 · 추천"))

story.append(P("G. 일본 쪽(일본 세무사 몫 — 참고 공유)", "h2"))
story.append(question("일본 소비세 수출 면세 요건과 증빙 · 일본 법인세상 미국 매출 처리 · 미·일 조약 신고 — 미국 쪽 답과 교차 확인", ans="일본 세무사 답변 뒤 교차 확인"))

story.append(Spacer(1, 10))
story.append(P("<b>답을 받으면 바뀌는 곳</b> — 판매세 · 관세 답: 사이트 총액표와 \"추가 비용 없음\" 문구 / 법인 · 회사 정보 답: 푸터 · 약관 · 결제 구조 / 소비자 보호 · 정품 · 환불 답: 약관 · FAQ · 상품 설명 고지 / 결제 보류 답: \"결제금 보류\" 문구 유지 여부.", "foot"))
story.append(Spacer(1, 4))
story.append(P("시안: https://kidplayboi.github.io/theone-vintage-us-mockup/ · 의뢰처 운영 질문지(31문항)와 짝 · 이 문서는 질문 목록이며 세무·법률 판단이 아닙니다.", "foot"))

OUT = "C:/Users/test/Downloads/미국-세무사-질문지-2026-10-08.pdf"
def footer(canvas, doc):
    canvas.saveState(); canvas.setFont("Malgun", 8); canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "TheOne Vintage US · 미국 세무·법률 확인 질문지 · 2026-10-08")
    canvas.drawRightString(190 * mm, 12 * mm, f"{doc.page}")
    canvas.restoreState()
doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
                        title="미국 세무·법률 확인 질문지 — TheOne Vintage US", author="사토시")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
shutil.copyfile(OUT, "C:/Users/test/theone-vintage-us-mockup/docs/미국-세무사-질문지-2026-10-08.pdf")
print("written", OUT, os.path.getsize(OUT), "bytes", "| questions", N)
