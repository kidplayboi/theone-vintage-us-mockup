// 상세 오른쪽 칸 — 판매 방식에 따라 두 가지(25쪽), 상품이 거치는 상태별 화면(29쪽)
// 순서는 세 곳 모두 같은 정품 → 상품 → 가격 → 상태 → 버튼(17쪽 · 결정 6)
import { usd, jpy, esc, gradeName, exampleAuction, formatEnds, countdown, bidStep, shortDate } from './data.js?v=ffe41d4f8e';
import { icon } from './icons.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';

const day = n => shortDate(new Date(Date.now() + n * 86400000));

// 실제로 보여 줄 상태 — 검토 막대에서 고른 값이 우선, 아니면 데이터와 이 브라우저의 제안 기록대로
export function lotState(lot) {
  const forced = new URLSearchParams(location.search).get('state') || store.setting('state');
  if (forced && forced !== 'auto') return forced;
  if (store.setting('sale') === 'B') return 'bidding';
  const mine = store.get('offers').find(o => o.lot === lot.lot && o.status === 'waiting');
  if (mine) return mine.type === 'offer' ? 'offer-sent' : 'requested';
  return lot.usd ? 'available' : 'price-request';
}

export function myOffer(lot) {
  return store.get('offers').find(o => o.lot === lot.lot && o.status === 'waiting');
}

function head(lot) {
  return `
    <p class="auth"><span class="auth-check" aria-hidden="true">${icon.check}</span>Authenticated in Tokyo</p>
    <p class="brand-label">${esc(lot.brand)}</p>
    <h1 class="display d30 buy-title">${esc(lot.title)}</h1>
    ${lot.sub ? `<p class="t13 muted">${esc(lot.sub)}</p>` : ''}`;
}

function rankChips(lot) {
  const g = lot.grade;
  if (!g) return '<a class="rank-chips" href="#condition"><span>Not graded</span></a>';
  return `<a class="rank-chips" href="#condition" aria-label="Condition: Rank ${esc(g.overall)}, see scorecard">
    <span>Rank ${esc(g.overall)}</span>${g.exterior ? `<span>Exterior ${esc(g.exterior)}</span>` : ''}${g.interior ? `<span>Interior ${esc(g.interior)}</span>` : ''}</a>`;
}

function priceLine(lot) {
  if (!lot.usd) {
    return `<p class="buy-price"><span>Price on request</span></p>
      <p class="t13 muted">The source has not published a price for this lot. Ask and we reply within one business day.</p>`;
  }
  return `<p class="buy-price"><span class="num">${usd(lot.usd)}</span><span class="label">≈ ${jpy(lot.jpy)}</span></p>
    <p class="t13 muted">US-delivered total confirmed within one business day.</p>
    <p class="one-piece label"><span class="dot" aria-hidden="true"></span>One piece only · Ships from Japan</p>`;
}

// 예상 도착 — 오늘 + 회신 1영업일 + 확정 1일 + 배송 6–10일(현재 사이트 문구). 검수 소요일은 운영 확인 필요(결정 45)
function addBusinessDays(d, n) {
  const x = new Date(d);
  while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() % 6) n -= 1; }
  return x;
}
export function deliveryWindow(from = new Date()) {
  const confirm = new Date(addBusinessDays(from, 1).getTime() + 86400000);
  const early = new Date(confirm.getTime() + 6 * 86400000);
  const late = new Date(confirm.getTime() + 10 * 86400000);
  return { confirmBy: shortDate(addBusinessDays(from, 2)), range: `${shortDate(early)} – ${shortDate(late)}` };
}

function delivery() {
  const w = deliveryWindow();
  return `<div class="deliver" data-note="Baymard #543: '배송 2일'보다 '5/4–5/6 도착'이 테스트에서 낫다. 단 손님은 날짜를 약속으로 받는다 → 'Estimated' 표기. 계산 = 회신 1영업일 + 확정 1일 + 배송 6–10일(현재 사이트 문구). 도쿄 검수 소요일은 운영 확인 필요." data-ref="17쪽 6번 · 결정 45">
    <p><span class="label">Estimated delivery</span><b class="num">${w.range}</b></p>
    <p class="t13 muted">To your door in the US if you confirm by ${w.confirmBy}. Duties prepaid.</p></div>`;
}

// 버튼 바로 아래 신뢰 세 줄 — 사이트에 이미 있는 약속만(결정 46)
function assurance() {
  return `<ul class="assure">
    <li>${icon.check}<span>Authenticated and inspected in our Tokyo office</span></li>
    <li>${icon.check}<span>Import duties prepaid — nothing to pay on arrival</span></li>
    <li>${icon.check}<span>No payment to request — we reply within one business day</span></li></ul>`;
}

function tools(lot) {
  const saved = store.get('saved')[lot.lot];
  const folder = saved !== undefined ? store.get('folders')[saved] : '';
  return `
    <div class="buy-tools">
      <button type="button" data-watch aria-expanded="false" aria-pressed="${saved !== undefined}">
        ${saved !== undefined ? icon.heartOn : icon.heart}<span>${saved !== undefined ? `Saved · ${esc(folder)}` : 'Watch'}</span></button>
      <button type="button" data-share>${icon.share}<span>Share</span></button>
      <button type="button" data-note-toggle aria-expanded="false">${icon.note}<span>Private note</span></button>
      <a href="#price">${icon.compare}<span>Compare prices</span></a>
    </div>
    <div class="watch-pop" data-watch-pop hidden role="menu" aria-label="Save to a list">
      <p class="label">Save to</p>
      ${store.get('folders').map((f, i) => `<button type="button" role="menuitemradio" aria-checked="${saved === i}" data-folder="${i}">${esc(f)}</button>`).join('')}
      ${saved !== undefined ? '<button type="button" class="watch-remove" data-folder="-1">Remove from saved</button>' : ''}
    </div>
    <div class="private-note" data-note-box hidden>
      <label class="field"><span>Only you can see this note.</span>
        <textarea class="input" data-note-text rows="3" placeholder="e.g. Compare with the Rank A one before Friday">${esc(store.get('notes')[lot.lot] || '')}</textarea>
      </label>
      <p class="t13 muted" data-note-status role="status"></p>
    </div>`;
}

// ── A: 정가와 가격 제안 ─────────────────────────────
function boxA(lot, state) {
  const offer = myOffer(lot);
  const amount = offer ? offer.amount : Math.round((lot.usd || 1000) * 0.9 / 10) * 10;
  const panels = {
    'offer-sent': `<div class="buy-panel">
        <p class="label">Your offer</p><p class="panel-big num">${usd(amount)}</p>
        <p class="t13">We'll reply by ${day(1)}. No payment until you accept.</p>
        <button type="button" class="text-link t13" data-withdraw>Withdraw offer</button></div>`,
    requested: `<div class="buy-panel">
        <p class="label">Request sent</p>
        <p class="t13">We'll email you by ${day(1)} with availability and your delivered total.</p></div>`,
    counter: `<div class="buy-panel is-alert">
        <p class="label">Counteroffer · reply by ${day(2)}</p>
        <p class="panel-big num">${usd(Math.round(amount * 1.06 / 10) * 10)}</p>
        <p class="t13">Your offer was ${usd(amount)}. Accept to lock this price for two days.</p>
        <div class="btn-pair"><button class="btn" type="button" data-fake="Counteroffer accepted">Accept</button>
        <button class="btn ghost" type="button" data-fake="Counteroffer declined">Decline</button></div></div>`,
    accepted: `<div class="buy-panel">
        <p class="label">Accepted · pay by ${day(2)}</p>
        <table class="mini-total"><tr><td>Lot price</td><td class="num">${usd(amount)}</td></tr>
        <tr><td>Fee, shipping, duties, inspection</td><td class="num">$X,XXX</td></tr>
        <tr class="sum"><td>Total, delivered</td><td class="num">$X,XXX</td></tr></table>
        <button class="btn block" type="button" data-fake="Payment is not part of this mockup">Pay now</button></div>`,
  };
  if (state === 'sold' || state === 'expired') {
    return `<div class="buy-panel">
      <p class="label">${state === 'sold' ? `Sold · ${day(-6)}` : 'No longer available'}</p>
      <p class="t15">${state === 'sold' ? 'This piece has found its owner. Sign in to see the sold price.' : 'This lot is no longer available. Here are similar pieces.'}</p>
      <a class="btn ghost block" href="#similar">See similar pieces</a></div>`;
  }
  if (state === 'price-request') {
    return `<div class="buy-actions one" data-actions>
      <button class="btn" type="button" data-request data-ask-price>Ask for price</button></div>
      <p class="t13 muted">We reply within one business day. No payment now.</p>${assurance()}`;
  }
  const actions = `<div class="buy-actions" data-actions>
      <button class="btn" type="button" data-request>Request this lot</button>
      <button class="btn ghost" type="button" data-offer-open aria-expanded="false" ${panels[state] ? 'hidden' : ''}>Make an offer</button></div>`;
  return `${panels[state] || ''}${actions}
    <form class="offer-form" data-offer-form hidden novalidate>
      <label class="field"><span>Your offer</span>
        <span class="money"><span aria-hidden="true">$</span><input class="input num" inputmode="numeric" data-offer-input value="${amount}" aria-describedby="offer-help"></span></label>
      <p class="t13 muted" id="offer-help" data-offer-help>Offers considered. We reply within one business day. No payment now.</p>
      <button class="btn block" type="submit">Send offer</button>
    </form>
    ${panels[state] ? '' : '<p class="t13 muted" data-offer-note>Offers considered. We reply within one business day. No payment now.</p>'}
    ${assurance()}${delivery()}`;
}

// ── B: 입찰 — 마감 시각·입찰 수·리저브는 예시값 ─────────────
function boxB(lot, state) {
  const a = exampleAuction(lot);
  const step = bidStep(a.bid);
  let bid = a.bid;
  let line = '';
  if (state === 'leading') line = '<p class="bid-line ok"><span class="dot"></span>You\'re the highest bidder</p>';
  if (state === 'outbid') { bid = a.bid + step; line = `<p class="bid-line warn"><span class="dot ending"></span>You've been outbid — ${usd(bid)} is the new high bid</p>`; }
  if (state === 'extended') line = '<p class="bid-line"><span class="dot reserve"></span>A late bid added 5 minutes</p>';
  if (state === 'reserve-not-met' || state === 'sold') {
    return `<div class="bid-box"><div class="bid-cells">
        <div><p class="label">${state === 'sold' ? 'Sold for' : 'Final bid'}</p><p class="bid-big num">${state === 'sold' ? 'Sign in' : usd(bid)}</p></div>
        <div><p class="label">Ended</p><p class="bid-when">${day(-1)}</p></div></div>
        <p class="bid-row">${state === 'sold' ? 'Sold to the highest bidder' : '<span><span class="dot reserve"></span> Reserve not met</span>'}</p></div>
      ${state === 'sold' ? '<a class="btn ghost block" href="#similar">See similar pieces</a>'
        : '<button class="btn block" type="button" data-offer-open-b>Make an offer to the seller</button><p class="t13 muted">The reserve wasn\'t met — you can still make an offer.</p>'}`;
  }
  const ends = state === 'extended' ? new Date(Date.now() + 299000) : a.ends;
  const reserve = { nearly: ['reserve', 'Reserve nearly met'], met: ['', 'Reserve met'], not: ['ending', 'Reserve not met'], none: ['', 'No reserve'] }[a.reserve];
  return `
    <div class="bid-box">
      <div class="bid-cells">
        <div><p class="label">Current bid</p><p class="bid-big num">${usd(bid)}</p><p class="label">${a.bids + (state === 'outbid' ? 1 : 0)} bids</p></div>
        <div><p class="label">Ends</p><p class="bid-when">${formatEnds(ends)} <span class="dot" aria-hidden="true"></span></p>
          <p class="label warn"><span class="num" data-ends="${ends.getTime()}">${countdown(ends)}</span> left</p></div>
      </div>
      <p class="bid-row"><span><span class="dot ${reserve[0]}" aria-hidden="true"></span> ${reserve[1]}</span><span class="muted">Extended bidding</span></p>
    </div>
    ${line}
    <form class="bid-form" data-bid-form novalidate>
      <label class="visually-hidden" for="max-bid">Your max bid</label>
      <input class="input num" id="max-bid" inputmode="numeric" placeholder="Your max bid · ${usd(bid + step)} or more" data-bid-input>
      <div class="bid-steps">${[1, 2, 4].map(k => `<button class="btn ghost small" type="button" data-step="${bid + step * k}">+${usd(step * k)}</button>`).join('')}</div>
      <p class="field-error" data-bid-error role="alert"></p>
      <div class="btn-pair" data-actions><button class="btn" type="submit">Place bid</button></div>
    </form>
    <p class="t13 muted">Bidding is a mockup of option B — times, bids and reserve are examples.</p>`;
}

export function buyHTML(lot) {
  const state = lotState(lot);
  const sale = store.setting('sale');
  const body = sale === 'B' ? boxB(lot, state) : `${priceLine(lot)}${rankChips(lot)}${boxA(lot, state)}`;
  return `${head(lot)}<div class="buy-body">${body}</div>${tools(lot)}`;
}
