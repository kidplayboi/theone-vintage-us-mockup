# 미국 세무사(CPA) 질문지 — TheOne Vintage US · 한국어 PDF (reportlab · 맑은 고딕)
# 출력: Downloads/미국-세무사-질문지-2026-10-08.pdf + 레포 docs/ 사본
import io, os, shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak

pdfmetrics.registerFont(TTFont("Malgun", "C:/Windows/Fonts/malgun.ttf"))
pdfmetrics.registerFont(TTFont("MalgunB", "C:/Windows/Fonts/malgunbd.ttf"))

INK = colors.HexColor("#111412"); BODY = colors.HexColor("#3F4542"); MUTED = colors.HexColor("#69706B")
LINE = colors.HexColor("#D9D8D2"); BRAND = colors.HexColor("#0C2219"); WARN = colors.HexColor("#A8231A"); TILE = colors.HexColor("#F3F2EF")

S = {
    "title": ParagraphStyle("title", fontName="MalgunB", fontSize=20, leading=26, textColor=INK, spaceAfter=4),
    "meta": ParagraphStyle("meta", fontName="Malgun", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=10),
    "lead": ParagraphStyle("lead", fontName="Malgun", fontSize=10, leading=15.5, textColor=BODY, spaceAfter=4),
    "h2": ParagraphStyle("h2", fontName="MalgunB", fontSize=13, leading=18, textColor=INK, spaceBefore=14, spaceAfter=3),
    "why": ParagraphStyle("why", fontName="Malgun", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=6),
    "q": ParagraphStyle("q", fontName="MalgunB", fontSize=10.5, leading=15.5, textColor=INK),
    "qmust": ParagraphStyle("qmust", fontName="MalgunB", fontSize=10.5, leading=15.5, textColor=WARN),
    "body": ParagraphStyle("body", fontName="Malgun", fontSize=9.8, leading=15, textColor=BODY),
    "now": ParagraphStyle("now", fontName="Malgun", fontSize=9.3, leading=14, textColor=MUTED),
    "bullet": ParagraphStyle("bullet", fontName="Malgun", fontSize=9.6, leading=14.5, textColor=BODY, leftIndent=10, bulletIndent=0),
    "ans": ParagraphStyle("ans", fontName="Malgun", fontSize=9.3, leading=14, textColor=MUTED),
    "foot": ParagraphStyle("foot", fontName="Malgun", fontSize=8.5, leading=12, textColor=MUTED),
}

def P(text, style="body"): return Paragraph(text, S[style])

def question(n, title, must=False, now=None, bullets=(), ans=None):
    rows = [[P(f"{'★' if must else ''}{n}", "qmust" if must else "q"), P(title, "qmust" if must else "q")]]
    if now: rows.append(["", P(now, "now")])
    for b in bullets: rows.append(["", P("· " + b, "bullet")])
    if ans: rows.append(["", P("답 → " + ans, "ans")])
    t = Table(rows, colWidths=[11 * mm, 159 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
        ("LINEBELOW", (0, -1), (-1, -1), 0.5, LINE),
        ("BACKGROUND", (0, 0), (-1, -1), TILE if must else colors.white),
    ]))
    return KeepTogether([t, Spacer(1, 5)])

story = []
story.append(P("미국 세무사에게 확인할 것 — TheOne Vintage US", "title"))
story.append(P("2026년 10월 8일 · 작성 사토시 · 전달 윤(의뢰처) → 미국 CPA · 답은 번호별로 적어 주시면 됩니다. ★ = 미국 공개 전 반드시 답이 필요한 항목", "meta"))

lead = Table([[P(
    "<b>사업 전제(세무사가 먼저 알아야 할 것)</b><br/>"
    "· 일본 법인(도쿄 사무실)이 일본 딜러 전용 경매에서 명품(가방 · 시계 · 주얼리 · 의류)을 낙찰받아 <b>미국 개인 소비자</b>에게 달러로 판매하는 웹사이트. 미국 법인 · 창고 · 직원은 현재 없음(가정 — 질문 15에서 확인).<br/>"
    "· 손님은 사이트에서 입찰(경매) 또는 정가 구매 → 낙찰 후 도쿄에서 검수 → DHL Express 로 미국 배송, <b>관세 선납(DDP)</b> 으로 수령 시 추가 비용 없음을 약속.<br/>"
    "· 손님이 내는 돈 = 낙찰가 + 구매자 수수료 + 배송비 + 관세 + 선택 서비스(단단한 상자 · Entrupy 감정서 $45). 결제는 카드 · 은행 송금(결제대행사 미정).<br/>"
    "· <b>아직 안 정한 핵심</b>: 우리가 물건을 사서 되파는 구조(재고 소유)인지, 손님 대신 사 주는 대행(에이전트) 구조인지 — 세금이 달라지는 지점이라 두 경우를 나눠 답해 주시면 좋겠습니다.", "lead")]],
    colWidths=[170 * mm])
lead.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.6, LINE), ("BACKGROUND", (0, 0), (-1, -1), TILE), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
story.append(lead)

# A
story.append(P("A. 판매세(Sales tax) — 미국 손님에게 세금을 붙여 받아야 하나", "h2"))
story.append(P("사이트에 \"No sales tax\" 라고 써도 되는지가 걸려 있습니다.", "why"))
story.append(question(1, "미국 실체가 없는 외국 판매자가 일본에서 직배송하는 경우, 주(state)별 판매세 징수 의무가 생기나요?", True,
    now="원격 판매자 경제적 넥서스(주별 연 $100,000 또는 200건 등)가 외국 법인에도 똑같이 적용되는 것으로 알고 있습니다 — 맞는지, 기준이 다른 주는 어디인지.",
    ans="의무 발생 여부 · 기준 · 외국 법인 예외 유무"))
story.append(question(2, "넥서스가 생기면 등록·징수·신고는 어떻게 하나요?", True,
    bullets=["어느 주부터 등록해야 하는지(매출이 먼저 쌓일 주: 캘리포니아 · 뉴욕 · 텍사스 · 플로리다 가정)", "간소화 협약(SST) 가입 가능 여부 · 자동화 소프트웨어(Avalara · TaxJar 등) 권장안과 비용", "외국 법인이 등록할 때 필요한 미국 납세번호(EIN 등)"],
    ans="절차 · 비용 · 선행 조건"))
story.append(question(3, "과세표준 — 손님이 내는 금액 중 무엇에 판매세가 붙나요?", True,
    bullets=["낙찰가 · 구매자 수수료 · 배송비 · 선납 관세 · 감정서(서비스) · 단단한 상자 — 항목별 과세 여부(주별 차이)", "관세를 손님에게 전가한 금액도 과세표준에 들어가는지"],
    ans="항목별 O/X(대표 주 기준)"))
story.append(question(4, "경매·대행 구조에 따라 세법상 '판매자'가 누구인지 달라지나요?",
    now="① 우리가 낙찰받아 되파는 경우(본인 판매) ② 손님 위임으로 대신 낙찰받고 수수료만 받는 경우(에이전트). 두 경우 판매세 의무자와 과세표준이 어떻게 다른지.",
    ans="구조별 차이 · 권장 구조"))
story.append(question(5, "리셀러(사업자) 손님에게 파는 경우 면세 처리 — 재판매 증명서(resale certificate)를 어떻게 받고 보관해야 하나요?",
    ans="절차 · 보관 기간"))
story.append(question(6, "마켓플레이스 촉진자(marketplace facilitator) 법이 우리 플랫폼에 해당하나요?",
    now="지금은 우리 물건만 팔지만, 나중에 다른 딜러 물건을 중개하면 플랫폼이 징수 의무자가 되는지.",
    ans="현재 · 확장 시"))
story.append(question(7, "징수하지 않는 주에 대해 사용세(use tax) 통지·보고 의무(콜로라도식 notice & report)가 있나요?",
    ans="해당 주 · 의무 내용"))

# B
story.append(P("B. 관세·수입 — DDP(관세 선납)를 약속해도 되는 구조인가", "h2"))
story.append(P("사이트가 \"수령 시 추가 비용 없음\" 을 약속합니다. 수입자(IOR)가 누구인지에 따라 세금 책임이 바뀝니다.", "why"))
story.append(question(8, "DDP 배송에서 미국 수입자(Importer of Record)는 누구여야 하나요?", True,
    bullets=["외국 법인(우리)이 비거주 수입자로 IOR 이 될 수 있는지 — 관세 보증(customs bond) · 통관 브로커 · 미국 대리인 요건", "DHL 이 대신 처리하는 DDP 서비스의 세금상 책임 소재", "손님을 IOR 로 두고 우리가 관세만 대납하는 구조의 문제점"],
    ans="권장 구조 · 필요 서류"))
story.append(question(9, "2025년 미국 $800 면세(de minimis) 폐지 이후 — 전 건 관세 대상이 맞나요? 세율 기준은요?", True,
    bullets=["명품의 원산지(프랑스 · 이탈리아 · 스위스 제조)와 발송국(일본)이 다를 때 어느 나라 세율(상호관세 포함)이 적용되는지", "HTS 분류(가죽 핸드백 · 손목시계 · 귀금속 · 의류)별 대략 세율과 사이트 예시값(가방 9% · 시계 6.4% · 주얼리 6.5% · 의류 16% · 잡화 8%)이 현실적인지"],
    ans="세율 산정 기준 · 예시값 교정"))
story.append(question(10, "중고품(pre-owned)에 관세 특례가 있나요? 신고 가치는 낙찰가인가요, 손님 판매가인가요?",
    now="과소신고 위험을 피하면서 손님 부담을 줄이는 신고 기준이 있는지.",
    ans="신고 가치 기준 · 특례 유무"))
story.append(question(11, "악어 · 파이썬 · 도마뱀 가죽(CITES) 수입 — 세금·수수료 측면에서 무엇이 추가되나요?",
    now="허가(USFWS)·검사 수수료 · 통관 지연이 세무에 미치는 영향. 세무사 범위 밖이면 통관 브로커 추천을 부탁드립니다.",
    ans="추가 비용 · 추천 브로커"))
story.append(question(12, "손님이 반품하면 — 역수출 시 관세 환급(duty drawback)이 가능한가요? 절차와 현실성은요?",
    ans="가능 여부 · 절차 · 최소 금액"))

# C
story.append(P("C. 미국 소득세·법인 구조 — 미국 법인을 만들어야 하나", "h2"))
story.append(P("결제대행사 계좌 · 소비자 신뢰 · 판매세 등록 때문에 미국 법인이 필요하다는 말을 듣고 있습니다. 세금 부담과 비교하고 싶습니다.", "why"))
story.append(question(13, "미국 법인 없이 판매할 때 미국 소득세 노출이 있나요?", True,
    bullets=["미국 사업 소득(ECI) · 고정사업장(PE) 판정 — 미·일 조세조약상 우리 구조(도쿄 발송 · 미국 직원 0 · 웹사이트 서버)가 PE 가 되는지", "Form 1120-F 보호 신고(protective return)를 해 두는 게 맞는지 · W-8BEN-E 제출처(결제대행사 · 경매 플랫폼)"],
    ans="노출 여부 · 권장 신고"))
story.append(question(14, "다음 중 무엇이 생기면 PE(고정사업장)가 되나요?",
    bullets=["미국 창고 · 3PL 재고", "미국 상주 직원 또는 계약직 고객응대", "미국 은행 계좌 · 미국 전화번호 · 미국 주소(가상 오피스)", "미국 리셀러를 통한 판매"],
    ans="항목별 O/X"))
story.append(question(15, "미국 법인(LLC · C-corp) 설립이 유리한가요? 설립 시 세무 부담은요?", True,
    bullets=["외국인 소유 LLC 의 Form 5472 · 1120 · 주 프랜차이즈세 · 이전가격(일본 본사 ↔ 미국 법인 거래 가격)", "설립 주 선택(델라웨어 · 와이오밍 · 뉴욕 등)과 실제 판매가 일어나는 주의 넥서스 관계", "미국 법인이 판매자가 되면 판매세 · 관세(IOR) 처리가 쉬워지는지"],
    ans="권장 구조 · 연간 유지 비용 추정"))
story.append(question(16, "결제대행사(Stripe 등)가 발행하는 1099-K 와 우리 신고의 정합 — 외국 법인도 받나요? 받으면 어떻게 처리하나요?",
    ans="해당 여부 · 처리"))
story.append(question(17, "환율 — 달러 매출을 장부에 반영하는 환율 기준(거래일 · 월평균 · 연평균)과 엔화 장부와의 차이 처리",
    now="사이트는 ¥150.3 고정 환율로 달러 가격을 계산합니다(의뢰처 확인 전 가정값).",
    ans="권장 기준"))

# D
story.append(P("D. 결제 보류 · 서비스 매출 · 환불", "h2"))
story.append(question(18, "낙찰금을 배송 완료까지 보류(held until delivered)하는 구조가 송금업(money transmitter) · 에스크로 규제에 걸리나요?",
    now="세무사 범위 밖이면 변호사 추천을 부탁드립니다. 사이트 문구에 넣을지 결정이 걸려 있습니다.",
    ans="해당 여부 · 추천"))
story.append(question(19, "구매자 수수료 · Entrupy 감정서 · 단단한 상자는 상품 매출과 분리된 서비스 매출로 잡아야 하나요?",
    now="소득세와 판매세 양쪽에서 구분이 필요한지.",
    ans="구분 기준"))
story.append(question(20, "환불 · 가품 판정 환불이 나면 이미 낸 판매세 · 관세는 어떻게 되돌리나요?",
    ans="수정 신고 · 환급 절차"))
story.append(question(21, "기록 보존 — 인보이스에 반드시 들어가야 할 영문 항목, 보존 기간, 디지털 보관 가능 여부",
    ans="목록 · 기간"))

# E
story.append(P("E. 일본 쪽 확인(일본 세무사 몫 — 미국 세무사에겐 참고로 공유)", "h2"))
story.append(question(22, "일본 소비세 수출 면세 적용 요건과 증빙(수출 허가서 · DHL 운송장) · 일본 법인세상 미국 매출 처리 · 미·일 조약 신고",
    ans="일본 세무사 답변 뒤 미국 세무사와 교차 확인"))

story.append(Spacer(1, 10))
story.append(P("<b>답을 받으면 바뀌는 곳</b> — 1~3 · 7: 사이트 총액표의 \"No sales tax\" 가능 여부와 과세 항목 / 8~10: \"관세 선납 · 수령 시 추가 비용 없음\" 문구와 관세율 예시값 / 13~15: 회사 정보(푸터 · 약관)와 결제대행사 선택 / 18: \"결제금 보류\" 문구 유지 여부 / 19~20: 환불 정책 문장.", "foot"))
story.append(Spacer(1, 4))
story.append(P("시안: https://kidplayboi.github.io/theone-vintage-us-mockup/ · 의뢰처 질문지(31문항)와 짝 · 이 문서는 질문 목록이며 세무 판단이 아닙니다.", "foot"))

OUT = "C:/Users/test/Downloads/미국-세무사-질문지-2026-10-08.pdf"
def footer(canvas, doc):
    canvas.saveState(); canvas.setFont("Malgun", 8); canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "TheOne Vintage US · 미국 세무사 질문지 · 2026-10-08")
    canvas.drawRightString(190 * mm, 12 * mm, f"{doc.page}")
    canvas.restoreState()
doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
                        title="미국 세무사 질문지 — TheOne Vintage US", author="사토시")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
shutil.copyfile(OUT, "C:/Users/test/theone-vintage-us-mockup/docs/미국-세무사-질문지-2026-10-08.pdf")
print("written", OUT, os.path.getsize(OUT), "bytes")
