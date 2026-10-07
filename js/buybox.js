// 상세 정보 칸 v2 — 상세 창(모달)과 상세 페이지가 같이 쓴다
// 순서 = 상태 띠 → 브랜드·제목 → 달러(크게) → 등급표 → 문의 → 신뢰 · 도착일 → 메모 · 시세
// 더윈 4(요청서 대신 창에서 문의) · 5(달러 크게) · 6(가격 표기 전환) · 8(단단한 상자) · 14(등급표 보이게)
import { usd, jpy, esc, gradeName, GRADES, SCORES, exampleAuction, exampleBids, formatEnds, countdown, bidStep, shortDate, brandName } from './data.js?v=d257100269';
import { icon } from './icons.js?v=d257100269';
import { bandInfo, bandLeft, KIND_CLASS } from './card.js?v=d257100269';
import * as store from './store.js?v=d257100269';

const day = n => shortDate(new Date(Date.now() + n * 86400000));

// 보여 줄 상태 — 주소(?state=) > 검토 막대 > 이 브라우저의 문의 기록 > 데이터
export function lotState(lot) {
  const forced = new URLSearchParams(location.search).get('state') || store.setting('state');
  if (forced && forced !== 'auto') return forced;
  if (store.setting('sale') === 'B') return 'bidding';
  const mine = myInquiry(lot);
  if (mine) return mine.type === 'offer' ? 'offer-sent' : 'inquiry-sent';
  return lot.usd ? 'available' : 'price-request';
}

export function myInquiry(lot) {
  return store.get('offers').find(o => o.lot === lot.lot && o.status === 'waiting');
}

// 요율 단일 출처 — 형이 실값을 주면 이 한 곳만 바꾼다(10/6 결정 89 · 수수료 10% = 더윈 16). 바꾸기 전까지 화면에 "example rates" 표기
export const EXAMPLE_RATES = {
  fee: 0.10,                                                                                   // 구매자 수수료(낙찰가 대비)
  duty: { Bag: 0.09, Watch: 0.064, Jewelry: 0.065, Clothing: 0.16, Accessories: 0.08 },        // 관세(재질·품목별, 더윈 1)
  shipping: 120,                                                                               // DHL Express 미국행(더윈 15)
  box: 45,                                                                                     // 단단한 상자(선택, 더윈 8)
  cert: 60,                                                                                    // 감정서(선택, 더윈 10)
  cardMax: 10000,                                                                              // 카드 결제 상한(Loupe 모델)
  cardFee: 0.03,                                                                               // 카드 결제 수수료
  example: true,                                                                               // 실값으로 바꾸면 false → "example rates" 문구가 사라진다
};
export const RATES_LABEL = EXAMPLE_RATES.example ? ' · example rates until our rates are set' : '';
export function estimate(lot, { box = false } = {}) {
  const r = EXAMPLE_RATES;
  const duty = Math.round(lot.usd * (r.duty[lot.genre] ?? 0.08));
  const fee = Math.round(lot.usd * r.fee);
  const ship = r.shipping + (box ? r.box : 0);
  return { item: lot.usd, duty, fee, ship, total: lot.usd + duty + fee + ship };
}

function head(lot, sale, state) {
  const b = bandInfo(lot, sale, state === 'sold' ? 'sold' : 'auto');
  const live = b.ends && b.ends - Date.now() < 86400000;
  return `
    <p class="info-band ${b.tone ? 'is-' + b.tone : ''}"><span><span class="dot ${KIND_CLASS[b.code] === 'live' || !KIND_CLASS[b.code] ? '' : KIND_CLASS[b.code]}"></span>${bandLeft(b)}</span><span class="num" ${live ? `data-ends="${b.ends.getTime()}"` : ''}>${esc(b.right)}</span></p>
    <p class="info-lot"><span class="brand-label">${esc(brandName(lot.brand))}</span><span class="t13 muted">Lot ${esc(lot.lot)}</span></p>
    <h1 class="display info-title">${esc(lot.title)}</h1>
    ${lot.sub ? `<p class="info-sub">${esc(lot.sub)}</p>` : ''}`;
}

function priceBlock(lot) {
  if (!lot.usd) {
    return `<div class="info-price"><p class="price lg ask">Price on request</p>
      <p class="t13 muted">The source has not published a price for this lot. Ask and we reply within one business day.</p></div>`;
  }
  // 형 확정(10/6 · 결정 88): 상품가를 크게, 엔화는 작게(더윈 5·6). 총액은 아래 항목별 표에서
  return `<div class="info-price" data-note="가격 표기 = 상품가 크게 + 엔화 작게(더윈 5·6 · 형 확정 10/6 결정 88). 미국 도착 총액은 상세 '항목별 총액' 표와 청구서에서." data-ref="더윈 5·6 · 결정 88">
    <p class="price lg">${usd(lot.usd)}</p>
    <p class="yen">≈ ${jpy(lot.jpy)} · item price · US-delivered total itemised below</p></div>`;
}

// 등급표 — 들어갔을 때 바로 보이게(더윈 14). S~D 척도와 외관·내부 1~3을 한 칸에
function gradeTable(lot) {
  const g = lot.grade;
  const scale = (list, on, names) => list.map(v => `<span class="${v === on ? 'is-on' : ''}" title="${names ? gradeName(v) : ''}">${v}</span>`).join('');
  if (!g) {
    return `<div class="grade-box is-na" data-note="등급표가 상세에 들어가자마자 보이게(더윈 14). 이 상품은 원천에 등급이 없다 — 현재 사이트 문장 그대로." data-ref="더윈 14">
      <p class="label">Condition</p>
      <p class="t13">Not graded. The source did not publish a grade for this lot — ask and we'll send detailed photos before you commit.</p></div>`;
  }
  return `<a class="grade-box" href="#condition" data-note="등급표가 상세에 들어가자마자 보이게(더윈 14). S~D 뜻과 1~3 척도는 현재 How it works 정의." data-ref="더윈 14">
    <div class="grade-row"><p class="label">Overall</p><p class="grade-scale">${scale(GRADES.map(x => x.rank), g.overall, true)}</p><p class="grade-name">${gradeName(g.overall)}</p></div>
    ${g.exterior ? `<div class="grade-row"><p class="label">Exterior</p><p class="grade-scale">${scale(SCORES, g.exterior)}</p><p class="grade-name t13 muted">1 cleanest</p></div>` : ''}
    ${g.interior ? `<div class="grade-row"><p class="label">Interior</p><p class="grade-scale">${scale(SCORES, g.interior)}</p><p class="grade-name t13 muted">3 most wear</p></div>` : ''}
  </a>`;
}

// 문의 칸 — 요청서 대신 이 창 안에서(더윈 4). 모양 유지 상자 체크(더윈 8)
function inquiryForm(lot, mode) {
  const offer = mode === 'offer';
  const amount = Math.round((lot.usd || 1000) * 0.9 / 10) * 10;
  return `<form class="inquiry" data-inquiry data-mode="${mode}" hidden novalidate>
    <p class="label">${offer ? 'Make an offer' : 'Inquire about this lot'}</p>
    ${offer ? `<label class="field"><span>Your offer (USD)</span>
      <span class="money"><span aria-hidden="true">$</span><input class="input num" inputmode="numeric" name="amount" value="${amount}"></span></label>` : ''}
    <label class="field"><span>Email *</span><input class="input" type="email" name="email" autocomplete="email" required></label>
    <label class="field"><span>Message</span><textarea class="input" name="message" rows="3">${offer ? '' : `Hi — is Lot ${esc(lot.lot)} still available, and what would the delivered total be to my state?`}</textarea></label>
    <label class="check" data-note="에르메스처럼 각이 중요한 가방은 박스 크기에 따라 배송비가 크게 달라진다 — 쉐입 무너짐 없이 배송 + 추가요금 동의 체크칸(더윈 8). 요금은 조사 필요." data-ref="더윈 8">
      <input type="checkbox" name="box"> <span><b>Ship in a rigid box to keep the shape.</b> Larger boxes cost more to ship — we'll include the extra in your quote.</span></label>
    <p class="field-error" data-inquiry-error role="alert"></p>
    <div class="btn-pair"><button class="btn" type="submit">${offer ? 'Send offer' : 'Send inquiry'}</button>
      <button class="btn ghost" type="button" data-inquiry-cancel>Cancel</button></div>
    <p class="t13 muted">No payment now. We reply within one business day.</p>
  </form>`;
}

function statePanel(lot, state) {
  const mine = myInquiry(lot);
  const amount = mine && mine.amount ? mine.amount : Math.round((lot.usd || 1000) * 0.9 / 10) * 10;
  const P = {
    'inquiry-sent': `<div class="panel"><p class="label">Inquiry sent</p><p>We'll email you by <b>${day(1)}</b> with availability and your delivered total.</p>
      <button type="button" class="text-link t13" data-withdraw>Cancel inquiry</button></div>`,
    'offer-sent': `<div class="panel"><p class="label">Your offer</p><p class="price">${usd(amount)}</p><p>We'll reply by <b>${day(1)}</b>. No payment until you accept.</p>
      <button type="button" class="text-link t13" data-withdraw>Withdraw offer</button></div>`,
    counter: `<div class="panel is-alert"><p class="label">Counteroffer · reply by ${day(2)}</p><p class="price">${usd(Math.round(amount * 1.06 / 10) * 10)}</p>
      <p>Your offer was ${usd(amount)}. Accept to hold this price for two days.</p>
      <div class="btn-pair"><button class="btn" type="button" data-fake="Counteroffer accepted">Accept</button><button class="btn ghost" type="button" data-fake="Counteroffer declined">Decline</button></div></div>`,
    accepted: `<div class="panel"><p class="label">Accepted · pay by ${day(2)}</p>
      <table class="mini-total"><tr><td>Item</td><td class="num">${usd(amount)}</td></tr><tr><td>Duties · fee · shipping</td><td class="num">In your invoice</td></tr>
      <tr class="sum"><td>Total, delivered</td><td class="num">$ —</td></tr></table>
      <a class="btn block" href="pay.html?lot=${encodeURIComponent(lot.lot)}&amp;sale=A&amp;offer=${amount}">View invoice and pay</a></div>`,
    sold: `<div class="panel"><p class="label">Sold · ${day(-6)}</p><p>This piece has found its owner. Sign in to see the sold price.</p><a class="btn ghost block" href="#similar">See similar pieces</a></div>`,
    expired: `<div class="panel"><p class="label">No longer available</p><p>This lot is no longer available. Here are similar pieces.</p><a class="btn ghost block" href="#similar">See similar pieces</a></div>`,
  };
  return P[state] || '';
}

function actions(lot, state) {
  if (['sold', 'expired', 'accepted', 'counter'].includes(state)) return statePanel(lot, state);
  const panel = statePanel(lot, state);
  if (state === 'price-request') {
    return `${panel}<div class="info-actions one" data-actions><button class="btn" type="button" data-inquire="inquiry">Ask for price</button></div>${inquiryForm(lot, 'inquiry')}`;
  }
  return `${panel}<div class="info-actions" data-actions ${panel ? 'hidden' : ''}>
      <button class="btn" type="button" data-inquire="inquiry">Inquire</button>
      <button class="btn ghost" type="button" data-inquire="offer">Make an offer</button></div>
    ${inquiryForm(lot, 'inquiry')}${inquiryForm(lot, 'offer')}`;
}

// 입찰 기록 — 접었다 펴는 목록(Loupe "Bid History (15)" · Bezel "View bids · 19 bids" · 결정 118). 입찰자는 익명 꼬리표, 숫자는 예시
function bidHistory(lot, state) {
  const h = exampleBids(lot);
  const extra = state === 'outbid' ? 1 : 0;
  return `<details class="bid-history" data-note="경매 상세의 관례 — Loupe 'Bid History (15)' · Bezel 'View bids'. 현재가만 있고 기록이 없으면 경매처럼 안 읽힌다(10/6 대조). 입찰자는 익명 꼬리표(Catawiki·BaT 식), 금액은 호가 단위로 내려간다. 예시값(결정 118)." data-ref="Loupe 로트 · Bezel 상세 · 결정 118">
    <summary><span>Bid history</span><span class="muted num">${h.total + extra} bids</span>${icon.down}</summary>
    <ol>${h.rows.map((r, i) => `<li><span class="num">${usd(r.amount)}</span><span class="muted">${esc(r.who)}${i === 0 ? ' · leading' : ''}</span><span class="muted num">${esc(r.ago)}</span></li>`).join('')}</ol>
    ${h.earlier ? `<p class="t13 muted">and ${h.earlier} earlier bid${h.earlier > 1 ? 's' : ''}</p>` : ''}
  </details>`;
}

// 입찰(B) — 마감·입찰 수·리저브는 예시값
function bidBox(lot, state) {
  const a = exampleAuction(lot);
  const step = bidStep(a.bid);
  let bid = a.bid;
  let line = '';
  if (state === 'leading') line = '<p class="bid-line ok"><span class="dot"></span>You\'re the highest bidder</p>';
  if (state === 'outbid') { bid = a.bid + step; line = `<p class="bid-line warn"><span class="dot ending"></span>You've been outbid — ${usd(bid)} is the new high bid</p>`; }
  if (state === 'extended') line = '<p class="bid-line"><span class="dot reserve"></span>A late bid added 5 minutes</p>';
  // 낙찰 — 결제는 pay.html(청구서 · 수단 · 상태 타임라인, 결정 78)
  if (state === 'won') {
    return `<div class="bid-box"><div class="bid-cells">
      <div><p class="label">You won</p><p class="price lg">${usd(bid)}</p><p class="t13 muted">${a.bids} bids</p></div>
      <div><p class="label">Ended</p><p class="bid-when">${day(-1)}</p></div></div>
      <p class="bid-row"><span><span class="dot"></span> Sold to you</span><span class="muted">Pay by ${day(2)}</span></p></div>
      <a class="btn block" href="pay.html?lot=${encodeURIComponent(lot.lot)}">View invoice and pay</a>
      <p class="t13 muted">Hammer price, buyer's fee, duties and shipping in one invoice. Your payment is held until the piece is delivered.</p>`;
  }
  if (state === 'reserve-not-met' || state === 'sold') {
    return `<div class="bid-box"><div class="bid-cells">
      <div><p class="label">${state === 'sold' ? 'Sold for' : 'Final bid'}</p><p class="price">${state === 'sold' ? 'Sign in' : usd(bid)}</p></div>
      <div><p class="label">Ended</p><p class="bid-when">${day(-1)}</p></div></div>
      <p class="bid-row">${state === 'sold' ? 'Sold to the highest bidder' : '<span><span class="dot reserve"></span> Reserve not met</span>'}</p></div>
      ${state === 'sold' ? '<a class="btn ghost block" href="#similar">See similar pieces</a>'
        : '<button class="btn block" type="button" data-offer-open-b>Make an offer to the seller</button>'}`;
  }
  const ends = state === 'extended' ? new Date(Date.now() + 299000) : a.ends;
  const reserve = { nearly: ['reserve', 'Reserve nearly met'], met: ['', 'Reserve met'], not: ['ending', 'Reserve not met'], none: ['', 'No reserve'] }[a.reserve];
  const hot = ends - Date.now() < 3600000;
  return `
    <div class="bid-box">
      <div class="bid-cells">
        <div><p class="label">Current bid</p><p class="price lg">${usd(bid)}</p><p class="t13 muted">≈ ${jpy(Math.round(bid * (lot.jpy / (lot.usd || 1))))} · ${a.bids + (state === 'outbid' ? 1 : 0)} bids</p></div>
        <div><p class="label">Ends</p><p class="bid-when">${formatEnds(ends, store.setting('tz'))}</p><p class="t13 ${hot ? 'warn' : 'muted'} num"><span data-ends="${ends.getTime()}">${countdown(ends)}</span></p></div>
      </div>
      <p class="bid-row"><span><span class="dot ${reserve[0]}"></span> ${reserve[1]}</span><span class="muted">Extended bidding</span></p>
    </div>
    ${bidHistory(lot, state)}
    ${line}
    ${store.get('signedIn') ? '' : `<div class="bid-gate" data-note="로그아웃이면 입찰 칸 = 'Register to bid'(Loupe 상세 · Bezel 'SIGN UP'). 현재가는 숨기지 않는다. 문의는 계정 없이도 된다(운영 사이트 FAQ)." data-ref="결정 58">
      <a class="btn block" href="sign-in.html?mode=create&amp;next=${encodeURIComponent('lot.html?id=' + lot.lot)}">Register to bid</a>
      <p class="t13 muted">Bidding needs an account. <a class="text-link" href="sign-in.html?next=${encodeURIComponent('lot.html?id=' + lot.lot)}">Log in</a></p></div>`}
    <form class="bid-form" data-bid-form novalidate ${store.get('signedIn') ? '' : 'hidden'}>
      <label class="visually-hidden" for="max-bid">Your max bid</label>
      <input class="input num" id="max-bid" inputmode="numeric" placeholder="Your max bid · ${usd(bid + step)} or more" data-bid-input>
      <div class="bid-steps">${[1, 2, 4].map(k => `<button class="btn ghost small" type="button" data-step="${bid + step * k}">+${usd(step * k)}</button>`).join('')}</div>
      <p class="field-error" data-bid-error role="alert"></p>
      <button class="btn block" type="submit">Place bid</button>
    </form>
    <p class="t13 muted">Example auction — times, bids and reserve are illustrative in this preview.</p>`;
}

// 예상 도착 — 오늘 + 회신 1영업일 + 확정 1일 + 배송 6–10일(현재 사이트 문구)
function addBusinessDays(d, n) {
  const x = new Date(d);
  while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() % 6) n -= 1; }
  return x;
}
export function deliveryWindow(from = new Date()) {
  const confirm = new Date(addBusinessDays(from, 1).getTime() + 86400000);
  return {
    confirmBy: shortDate(addBusinessDays(from, 2)),
    range: `${shortDate(new Date(confirm.getTime() + 6 * 86400000))} – ${shortDate(new Date(confirm.getTime() + 10 * 86400000))}`,
  };
}

function assurance() {
  const w = deliveryWindow();
  return `<ul class="assure">
    <li>${icon.check}<span>Authenticated and inspected by hand in our Tokyo office</span></li>
    <li>${icon.check}<span>Import duties prepaid — nothing to pay on arrival</span></li>
    <li data-note="Baymard #543: 배송 속도보다 도착 날짜. 계산 = 회신 1영업일 + 확정 1일 + 배송 6–10일. 검수 소요일은 운영 확인 필요." data-ref="결정 45">${icon.check}<span>Estimated delivery <b class="num">${w.range}</b> if you confirm by ${w.confirmBy}</span></li>
  </ul>`;
}

function tools(lot) {
  const saved = store.get('saved')[lot.lot];
  const folder = saved !== undefined ? store.get('folders')[saved] : '';
  return `
    <div class="info-tools" data-note="관심 폴더 · 공유 · 내 메모 · 시세 비교(더윈 2 · 기획안 11쪽)." data-ref="더윈 2">
      <button type="button" data-watch aria-expanded="false" aria-pressed="${saved !== undefined}">
        ${saved !== undefined ? icon.heartOn : icon.heart}<span>${saved !== undefined ? `Saved · ${esc(folder)}` : 'Save'}</span></button>
      <button type="button" data-share>${icon.share}<span>Share</span></button>
      <button type="button" data-note-toggle aria-expanded="false">${icon.note}<span>My note</span></button>
      <a href="lot.html?id=${encodeURIComponent(lot.lot)}#price" data-compare>${icon.compare}<span>Compare prices</span></a>
    </div>
    <div class="watch-pop" data-watch-pop hidden role="menu" aria-label="Save to a list">
      <p class="label">Save to</p>
      ${store.get('folders').map((f, i) => `<button type="button" role="menuitemradio" aria-checked="${saved === i}" data-folder="${i}">${esc(f)}</button>`).join('')}
      ${saved !== undefined ? '<button type="button" class="watch-remove" data-folder="-1">Remove from saved</button>' : ''}
    </div>
    <div class="private-note" data-note-box hidden>
      <label class="field"><span>Only you can see this note.</span>
        <textarea class="input" data-note-text rows="3" placeholder="e.g. Compare with the Rank A one before Friday">${esc(store.get('notes')[lot.lot] || '')}</textarea></label>
      <p class="t13 muted" data-note-status role="status"></p>
    </div>`;
}

// 입찰 모드에서도 질문은 계정 없이(FAQ "Not to ask" 약속 · 결정 111) — 상세 창 안에서 바로. 더 많은 사진·치수·총액을 묻는다
function askB(lot) {
  return `<div class="info-actions one" data-actions data-note="FAQ 가 '질문은 계정 없이' 라고 약속하는데 입찰 모드 상세엔 묻는 버튼이 없었다(10/6 점검). 정가 모드와 같은 문의 폼을 입찰 칸 아래에(결정 111)." data-ref="결정 111"><button class="btn ghost" type="button" data-inquire="inquiry">Ask about this lot</button></div>${inquiryForm(lot, 'inquiry')}`;
}

export function buyHTML(lot) {
  const state = lotState(lot);
  const sale = store.setting('sale');
  const body = sale === 'B'
    ? `${bidBox(lot, state)}${gradeTable(lot)}${askB(lot)}`
    : `${priceBlock(lot)}${gradeTable(lot)}${actions(lot, state)}`;
  return `${head(lot, sale, state)}<div class="info-body">${body}${assurance()}</div>${tools(lot)}`;
}
