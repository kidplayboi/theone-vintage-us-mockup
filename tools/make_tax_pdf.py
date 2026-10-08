# 미국 세무사 상담 가이드 — TheOne Vintage US · 한국어 PDF (reportlab · 맑은 고딕)
# 형 10/8: ① 운송사·결제사 같은 바뀔 수 있는 디테일 제거 ② 판매 주체·소싱 경로는 단정하지 않는다(의뢰처가 채움)
#          ③ 의뢰처 = 미국 영주권자 · 사업자·신고를 이미 했을 수 있음 → "본인 상황에 맞게 상담하도록 무엇을 물을지" 가이드
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
    "check": ParagraphStyle("check", fontName="Malgun", fontSize=9.8, leading=16, textColor=BODY),
    "foot": ParagraphStyle("foot", fontName="Malgun", fontSize=8.5, leading=12, textColor=MUTED),
}
def P(text, style): return Paragraph(text, S[style])
BLANK = '<font color="#9AA09B">______________________</font>'

N = 0
def question(title, must=False, now=None, bullets=(), ans=None):
    global N; N += 1
    st = "qmust" if must else "q"
    rows = [[P(f"{'★' if must else ''}{N}", st), P(title, st)]]
    if now: rows.append(["", P(now, "now")])
    for b in bullets: rows.append(["", P("· " + b, "bullet")])
    if ans: rows.append(["", P("답 → " + ans, "ans")])
    t = Table(rows, colWidths=[15 * mm, 155 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
        ("LINEBELOW", (0, -1), (-1, -1), 0.5, LINE), ("BACKGROUND", (0, 0), (-1, -1), TILE if must else colors.white),
    ]))
    return KeepTogether([t, Spacer(1, 5)])

story = []
story.append(P("미국 세무사 상담 가이드 — TheOne Vintage US 온라인 판매", "title"))
story.append(P("2026년 10월 8일 · 작성 사토시 · 쓰는 사람 윤(의뢰처) · 세무사(CPA)와 상담할 때 무엇을 말하고 무엇을 물을지의 목록입니다. 본인 상황에 맞게 빈칸을 채우고 해당 없는 질문은 지우세요. ★ = 미국 공개 전 반드시 답이 필요한 항목", "meta"))

lead = Table([[P(
    "<b>이 문서의 쓰임</b><br/>"
    "· 사이트(TheOne Vintage US)는 중고 명품(가방 · 시계 · 주얼리 · 의류 등)을 <b>미국 소비자에게 달러로 판매</b>하는 온라인 경매·판매 사이트입니다. 손님은 입찰 또는 정가 구매 → 해외에서 검수 → 국제 특송으로 미국 배송. <b>관세를 우리가 선납(DDP)할지, 손님이 수령 시 직접 내게(DAP) 할지는 아직 결정 전</b>입니다.<br/>"
    "· 판매 법인의 형태 · 소재지 · 상품을 어디서 어떻게 가져오는지는 <b>의뢰처 본인이 가장 잘 아는 부분</b>이라 여기서 단정하지 않습니다. 아래 0번 체크리스트를 채워 세무사에게 먼저 설명하면, 1 · 2부 질문의 답이 본인 상황에 맞게 나옵니다.<br/>"
    "· 목표: <b>세금을 빠뜨려 추징당하거나 손님에게 고소당할 구멍을 공개 전에 막는 것.</b> 세무사가 \"이건 변호사 영역\" 이라고 하는 항목은 그렇게 표시해 달라고 하세요.", "lead")]],
    colWidths=[170 * mm])
lead.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.6, LINE), ("BACKGROUND", (0, 0), (-1, -1), TILE), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
story.append(lead)

# 0. 체크리스트
story.append(P("0. 상담 전에 세무사에게 먼저 말할 내 상황(빈칸 채우기)", "part"))
story.append(P("이 10줄이 정확해야 아래 질문의 답이 맞습니다. 모르는 칸은 \"모름\" 이라고 적고 세무사에게 그것부터 물어보세요.", "why"))
checks = [
    "판매 주체 — 사업자 형태(개인사업자 / LLC / 법인 등) · 설립 주 · 설립 연도 · EIN 유무: " + BLANK,
    "이미 신고·납부하고 있는 것(연방 소득세 · 주 소득세 · 판매세 등록 주 · 급여세 등): " + BLANK,
    "본인 신분 — 미국 영주권자(세법상 거주자) · 거주 주 · 다른 나라에 세금 신고하는 곳이 있는지: " + BLANK,
    "상품을 가져오는 경로 — 어느 나라의 어떤 경매 · 딜러 · 공급처인지, 물건을 내가 사서 되파는지(재고 소유) 손님 대신 사 주는지(대행): " + BLANK,
    "물건이 미국으로 떠나는 나라(발송국)와 검수·보관 장소: " + BLANK,
    "해외에 내 명의 또는 내 지분의 법인 · 은행 계좌 · 파트너 회사가 있는지: " + BLANK,
    "미국 안에 창고 · 직원 · 사무실 · 재고가 있거나 생길 예정인지: " + BLANK,
    "손님이 내는 돈의 구성(낙찰가 · 구매자 수수료 · 배송비 · 관세 — 선납할지 손님 직접 납부할지 · 선택 서비스)과 결제 수단: " + BLANK,
    "예상 규모 — 첫해 미국 매출 · 거래 건수 · 매출이 많이 나올 주: " + BLANK,
    "취급 품목 중 특수한 것(야생동물 가죽 · 귀금속 · 고가 시계)과 평균 단가: " + BLANK,
]
ct = Table([[P(f"{i+1}.", "check"), P(c, "check")] for i, c in enumerate(checks)], colWidths=[9 * mm, 161 * mm])
ct.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4), ("LEFTPADDING", (0, 0), (-1, -1), 2)]))
story.append(ct)

# ── 1부 세무 ──
story.append(P("1부. 세무 리스크 — 무엇을 물을까", "part"))
story.append(P("A. 판매세(Sales tax)", "h2"))
story.append(P("사이트에 \"판매세 없음\" 이라고 써도 되는지, 나중에 주 정부가 소급 추징할 수 있는지가 걸려 있습니다.", "why"))
story.append(question("내 사업자 구조와 발송 방식(해외 → 미국 소비자 직배송)에서 주(state)별 판매세 징수 의무가 언제 생기나요?", True,
    now="원격 판매자 기준(주별 연 매출액 · 거래 건수)이 내 경우에 어떻게 적용되는지, 기준을 넘긴 뒤 등록이 늦으면 어떤 불이익이 있는지.",
    ans="의무 발생 기준 · 지연 등록 위험"))
story.append(question("이미 판매세를 등록한 주가 있다면 그대로 쓰면 되나요? 없다면 어느 주부터, 어떤 순서로 등록·징수·신고해야 하나요?", True,
    bullets=["간소화 협약 가입 가능 여부 · 자동 계산 소프트웨어 권장안 · 연간 비용 추정"],
    ans="절차 · 비용"))
story.append(question("과세표준 — 손님이 내는 금액 중 무엇에 판매세가 붙나요?", True,
    bullets=["낙찰가 · 구매자 수수료 · 배송비 · 선납 관세 · 제3자 감정서(서비스) · 보호 포장 — 항목별 과세 여부(주마다 다르면 대표적인 차이)", "관세를 손님에게 전가한 금액도 과세표준에 들어가는지"],
    ans="항목별 O/X"))
story.append(question("내가 사서 되파는 구조(본인 판매)와 손님 대신 사 주는 구조(대행)에서 판매세 의무자 · 과세표준 · 신고 방식이 어떻게 다른가요? 어느 쪽이 유리한가요?",
    ans="구조별 차이 · 권장"))
story.append(question("사업자(리셀러) 손님에게 팔 때 면세 처리 — 재판매 증명서를 어떻게 받고 얼마나 보관해야 하나요?", ans="절차 · 보관 기간"))
story.append(question("나중에 다른 판매자 물건을 중개하면 마켓플레이스 촉진자(marketplace facilitator)로서 플랫폼이 징수 의무자가 되나요?", ans="현재 · 확장 시"))
story.append(question("징수하지 않는 주에 대한 사용세(use tax) 통지·보고 의무가 있나요?", ans="해당 주 · 의무 내용"))

story.append(P("B. 관세·수입", "h2"))
story.append(P("관세를 우리가 선납(DDP)할지 손님이 직접 내게(DAP) 할지부터 정해야 합니다. 두 방식의 세금 · 책임 · 문구 차이를 묻습니다.", "why"))
story.append(question("관세를 우리가 선납(DDP)하는 것과 손님이 수령 시 직접 내는 것(DAP) — 세금 · 책임 · 비용 측면에서 어느 쪽이 유리한가요?", True,
    bullets=["선납(DDP): 수입자(Importer of Record)가 누구여야 하는지(내 미국 사업자 / 해외 발송 주체) · 보증(bond) · 통관 대리인 · 세율 오차와 추징 책임", "직접 납부(DAP): 손님이 운송사에 관세 + 통관 수수료를 따로 낼 때 우리 쪽에 남는 의무와, 사이트에 반드시 써야 하는 안내 문구", "혼합(기본은 DAP, 선택하면 DDP)이 가능한지와 그때의 세금 처리"],
    ans="권장 방식 · 각 방식의 필요 서류 · 문구"))
story.append(question("소액 면세(de minimis) 폐지 이후 전 건 관세 대상이 맞나요? 세율은 무엇을 기준으로 정해지나요?", True,
    bullets=["명품의 원산지(제조국)와 발송국이 다를 때 어느 기준으로 세율(상호관세 포함)이 붙는지", "품목(가죽 가방 · 손목시계 · 귀금속 · 의류)별 대략의 세율 — 사이트 요율표의 예시값이 현실적인지"],
    ans="세율 산정 기준 · 예시값 교정"))
story.append(question("중고품에 관세 특례가 있나요? 신고 가치는 내 매입가인가요, 손님 판매가인가요?", now="과소신고로 추징·벌금을 맞지 않으면서 손님 부담을 줄이는 기준이 있는지.", ans="신고 가치 기준 · 특례 유무"))
story.append(question("야생동물 가죽(악어 · 파이썬 · 도마뱀 등, CITES) 수입 — 허가 · 수수료 · 지연이 세무와 책임에 미치는 영향은요?", now="세무사 범위 밖이면 통관 전문가 추천을 부탁.", ans="추가 비용 · 추천"))
story.append(question("손님이 반품하면 역수출 시 관세 환급(duty drawback)이 가능한가요? 현실적인가요?", ans="가능 여부 · 절차 · 최소 금액"))

story.append(P("C. 소득세·사업 구조·영주권자 개인 신고", "h2"))
story.append(P("이미 있는 사업자 구조가 이 사업에 맞는지, 해외 소싱 때문에 새로 생기는 보고 의무가 있는지가 핵심입니다.", "why"))
story.append(question("지금 내 사업자 형태(개인사업자 / LLC / 법인)로 이 사업을 하는 게 맞나요? 바꾸는 게 유리하다면 무엇으로, 왜인가요?", True,
    bullets=["소득이 개인에게 바로 잡히는 구조(pass-through)와 법인 과세의 차이 · 자영업세 · 급여 vs 배당", "설립 주와 실제 판매가 일어나는 주의 관계(주 소득세 · 프랜차이즈세)", "분기 추정세 납부 · 장부 방식(현금 / 발생)"],
    ans="권장 구조 · 이유 · 바꿀 때 비용"))
story.append(question("상품을 해외에서 가져오는 구조에서, 해외의 법인 · 계좌 · 파트너 회사가 관련되면 영주권자인 내게 어떤 보고 의무가 생기나요?", True,
    bullets=["해외 금융계좌 보고(FBAR · FATCA 계열) · 해외 법인 지분 보고 · 해외 파트너와의 거래 가격(이전가격) 문제", "해외 공급처에 지급하는 대금(매입 · 수수료)에 원천징수나 신고가 필요한지"],
    ans="해당 보고 목록 · 기한"))
story.append(question("해외 발송 주체가 내 사업자와 다른 회사라면(공급·검수·발송을 맡기는 경우) — 미국 쪽에서 그 회사의 소득세 · 고정사업장 문제가 생기나요? 나와의 계약은 어떻게 짜야 하나요?",
    ans="위험 여부 · 계약 권장"))
story.append(question("미국 안에 창고 · 직원 · 재고 · 사무실이 생기면 세금상 무엇이 달라지나요?", bullets=["주 소득세 넥서스 · 판매세 넥서스 · 재산세 · 급여세"], ans="항목별 영향"))
story.append(question("결제대행사가 국세청에 보내는 매출 보고(1099 계열)와 내 신고를 어떻게 맞추나요? 수수료 · 환불 · 관세 대납분이 매출로 잡히는 문제는요?", ans="처리 방법"))
story.append(question("환율 — 해외 매입은 현지 통화, 매출은 달러일 때 장부 환율 기준(거래일 · 월평균)과 환차손익 처리", ans="권장 기준"))
story.append(question("환불 · 가품 판정 환불이 나면 이미 낸 판매세 · 관세 · 소득은 어떻게 되돌리나요?", ans="수정 신고 · 환급 절차"))
story.append(question("기록 보존 — 매입 증빙(해외 영수증 · 경매 기록) · 인보이스 필수 항목 · 보존 기간 · 디지털 보관", ans="목록 · 기간"))

# ── 2부 법률 ──
story.append(P("2부. 고소·분쟁 리스크 — 세무사 범위 밖이면 변호사 확인 표시 부탁", "part"))
story.append(P("D. 소비자 보호·판매 약속", "h2"))
story.append(P("사이트가 손님에게 하는 약속 하나하나가 나중에 소송 근거가 됩니다. 어디까지 써도 되는지 확인합니다.", "why"))
story.append(question("\"판매세 없음\" · \"관세 선납, 수령 시 추가 비용 없음\" 또는 \"관세 별도, 수령 시 납부\" · \"100% 정품\" 같은 문구 — 연방 · 주 소비자법상 허위·과장 광고가 되지 않으려면 어떤 조건이 필요한가요?", True,
    ans="문구별 가능 여부 · 필요한 단서"))
story.append(question("중고 명품 판매에 묵시적 보증(implied warranty)이 붙나요? \"현 상태 그대로(as is)\" 고지가 유효한 주와 무효인 주가 있나요?", True,
    ans="유효 조건 · 주별 예외"))
story.append(question("환불 · 반품 · 취소 — 온라인 판매에서 법으로 보장되는 최소 권리(배송 지연 통지 · 환불 기한 등)가 있나요? 경매 낙찰도 같은가요?",
    now="사이트 가정: 낙찰 후 결제 기한 3일 · 수령 후 이의 제기 3일 · 환불 조건 미정.",
    ans="최소 의무 · 경매 특례"))
story.append(question("가품이 섞여 나갔을 때 — 모르고 팔았어도 상표권 침해 · 사기 책임이 생기나요? 제3자 감정(AI 감정 · 인증서)을 거쳤다는 사실이 책임을 줄여 주나요?", True,
    bullets=["손님 · 브랜드사 양쪽에서 올 수 있는 청구 유형과 보험 · 면책 구조", "감정 기록 · 사진 · 검수 기록을 어떻게 남겨야 방어가 되는지"],
    ans="책임 범위 · 방어 요건"))
story.append(question("상품 설명 · 상태 등급 · 사진과 실물이 다를 때의 책임 — 등급 기준을 공개하면 책임이 줄어드나요?", ans="권장 고지 방식"))
story.append(question("배송 중 분실 · 파손 · 수령 거부 · 결제 취소 사기(chargeback) — 책임 분배와 보험, 분쟁 시 증빙 요건", ans="권장 정책 · 증빙"))

story.append(P("E. 경매·결제 규제", "h2"))
story.append(question("온라인 경매를 운영하는 데 주별 경매인(auctioneer) 면허나 등록이 필요한가요?", True, ans="필요 주 · 조건"))
story.append(question("낙찰금을 배송 완료까지 보류(held until delivered)했다가 정산하는 구조가 송금업 · 에스크로 규제에 걸리나요?", True, now="걸리면 결제대행사의 에스크로 기능을 쓰는 등 대안이 있는지.", ans="해당 여부 · 대안"))
story.append(question("입찰 보증(카드 등록 · 보증금) · 미결제 낙찰자 패널티 · 재경매 — 허용 범위와 약관에 써야 할 내용", ans="허용 범위 · 약관 문구"))
story.append(question("손님 신원 확인 · 제재 대상 검사(OFAC 등) · 고가 현금성 거래 보고 의무 — 어디까지 해야 하나요?", ans="의무 범위 · 절차"))

story.append(P("F. 약관·개인정보·회사 정보·상표", "h2"))
story.append(question("미국 손님용 이용약관에 반드시 들어가야 할 조항(준거법 · 분쟁 해결 · 중재 · 집단소송 포기 · 책임 한도)", True, ans="필수 조항"))
story.append(question("개인정보 — 주별 개인정보법 적용 기준과 개인정보 처리방침 필수 내용 · 마케팅 메일(수신거부) 규정", ans="적용 여부 · 필수 내용"))
story.append(question("사이트에 표시해야 하는 사업자 정보(상호 · 주소 · 연락처)와 누락 시 문제", ans="필수 표시"))
story.append(question("브랜드 로고 · 상품 사진 · 브랜드명 사용 — 중고 재판매 사이트가 브랜드 상표를 어디까지 쓸 수 있나요(로고 이미지 vs 글자)?", ans="허용 범위 · 권장"))
story.append(question("위 항목 중 세무사 범위 밖이라 변호사 확인이 필요한 번호를 표시해 주시고, 추천할 분이 있으면 알려 주십시오.", ans="번호 목록 · 추천"))

story.append(P("G. 소싱 국가 쪽 세무(현지 세무사 몫 — 참고 공유)", "h2"))
story.append(question("상품을 가져오는 나라의 수출 면세 · 부가세 환급 요건과 증빙 · 그 나라와 미국 사이 조세조약 · 현지 법인이 있다면 그쪽 신고 — 미국 쪽 답과 교차 확인", ans="현지 세무사 답변 뒤 교차 확인"))

story.append(Spacer(1, 10))
story.append(P("<b>답을 받으면 사이트에서 바뀌는 곳</b> — 판매세 · 관세 답: 총액표 · 관세 선납/직접 납부 선택과 그 문구 / 사업 구조 · 사업자 정보 답: 푸터 · 약관 · 결제 구조 / 소비자 보호 · 정품 · 환불 답: 약관 · FAQ · 상품 설명 고지 / 결제 보류 답: \"결제금 보류\" 문구 유지 여부.", "foot"))
story.append(Spacer(1, 4))
story.append(P("시안: https://kidplayboi.github.io/theone-vintage-us-mockup/ · 의뢰처 운영 질문지(31문항)와 짝 · 이 문서는 상담 가이드이며 세무·법률 판단이 아닙니다.", "foot"))

OUT = "C:/Users/test/Downloads/미국-세무사-질문지-2026-10-08.pdf"
def footer(canvas, doc):
    canvas.saveState(); canvas.setFont("Malgun", 8); canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "TheOne Vintage US · 미국 세무사 상담 가이드 · 2026-10-08")
    canvas.drawRightString(190 * mm, 12 * mm, f"{doc.page}")
    canvas.restoreState()
doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
                        title="미국 세무사 상담 가이드 — TheOne Vintage US", author="사토시")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
shutil.copyfile(OUT, "C:/Users/test/theone-vintage-us-mockup/docs/미국-세무사-질문지-2026-10-08.pdf")
print("written", OUT, os.path.getsize(OUT), "bytes", "| questions", N)
