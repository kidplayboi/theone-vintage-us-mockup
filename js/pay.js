// 결제 v4 — 낙찰 → 청구서(3일) → 결제 · 에스크로 → 검수·포장(도쿄) → 배송 → 수령(3일 신고) → 완료(결정 78 · v4-lock §7)
// 서버가 없으니 결제 기록은 이 브라우저에만 남고, My page 행이 그 기록을 읽어 '완료' 칸으로 옮긴다
import { usd, esc, cardImg, lotUrl, shortDate, fullName, brandName, gradeName, exampleAuction, gradeOf } from './data.js?v=82afc97f2e';
import { startPage } from './page.js?v=82afc97f2e';
import { paintNotes } from './review.js?v=82afc97f2e';
import { toast } from './chrome.js?v=82afc97f2e';
import { estimate, EXAMPLE_RATES } from './buybox.js?v=82afc97f2e';
import { icon } from './icons.js?v=82afc97f2e';
import * as store from './store.js?v=82afc97f2e';

const DAY = 86400000;
const day = n => shortDate(new Date(Date.now() + n * DAY));
export const PAY_STATES = ['won', 'invoice', 'paid', 'packed', 'shipped', 'delivered', 'complete'];
// 요율은 전부 buybox.js EXAMPLE_RATES 한 곳에서(결정 89) — 여기선 이름만 빌린다
const CARD_MAX = EXAMPLE_RATES.cardMax;
const CARD_FEE = EXAMPLE_RATES.cardFee;
const CERT = EXAMPLE_RATES.cert;
const RATE_NOTE = EXAMPLE_RATES.example ? 'Example rates until our rates are set' : 'Rates as published';
const SHIP_TO = { name: 'Jordan Lee', line1: '418 W 14th St, Apt 5B', line2: 'New York, NY 10014', phone: '+1 (212) 555-0147' }; // 예시 주소

let data;
let lot;
let sale = 'B';
let hammer = 0;
let state = 'invoice';
const ui = { method: '', box: true, cert: false };
const $ = sel => document.querySelector(sel);

function pickLot(params) {
  const id = params.get('lot');
  // 주소에 로트가 없으면 My page 예시의 '낙찰 · 결제 대기' 로트와 같은 것
  return data.lots.find(x => x.lot === id) || (data.lots[9] && data.lots[9].usd ? data.lots[9] : data.lots.find(x => x.usd));
}

// 보여 줄 상태 — 주소(?state=) > 검토 막대 > 이 브라우저의 결제 기록 > 청구서
function currentState(params) {
  const forced = params.get('state');
  if (PAY_STATES.includes(forced)) return forced;
  const rv = store.setting('payState');
  if (rv && rv !== 'auto') return rv;
  const rec = store.get('payments')[lot.lot];
  return rec ? rec.state : 'invoice';
}

// 청구서 줄 — 더윈 1(관세 재질별) · 8(단단한 상자) · 10(항목) · 16(수수료 10%). 전부 예시 요율
function invoice(opts) {
  const e = estimate({ ...lot, usd: hammer }, { box: false });
  const rows = [
    [sale === 'B' ? 'Hammer price' : 'Accepted offer', `${sale === 'B' ? `${exampleAuction(lot).bids} bids` : 'Your offer, accepted'}`, hammer],
    ["Buyer's fee", `${Math.round(EXAMPLE_RATES.fee * 100)}% of the hammer price`, e.fee],
    ['Import duties', `Rate by material · ${lot.genre.toLowerCase()}`, e.duty],
    ['Shipping · DHL Express', 'Tokyo to your door, insured', EXAMPLE_RATES.shipping],
  ];
  if (opts.box) rows.push(['Rigid box', 'Keeps the shape in transit', EXAMPLE_RATES.box]);
  if (opts.cert) rows.push(['Certificate of authenticity', 'Issued in Tokyo', CERT]);
  let total = rows.reduce((s, r) => s + r[2], 0);
  const over = total > CARD_MAX;
  if (opts.method === 'card' && !over) {
    const fee = Math.round(total * CARD_FEE);
    rows.push(['Card processing', `${Math.round(CARD_FEE * 100)}%`, fee]);
    total += fee;
  }
  return { rows, total, over };
}

const COPY = {
  won: ['You won this lot', () => `Your invoice is ready. Pay by ${day(2)} and we'll inspect, pack and ship it from Tokyo. Your payment is held until the piece is delivered.`],
  invoice: ['You won this lot', () => `Pay by ${day(2)} and we'll inspect, pack and ship it from Tokyo. Your payment is held until the piece is delivered.`],
  paid: ["Paid — we're on it", () => 'Your payment is held in escrow. We inspect and pack in Tokyo within 2–3 business days, then DHL takes 6–10 days to your door.'],
  packed: ['Inspected and packed', () => 'Checked by hand against the auction notes and packed in Tokyo. DHL picks it up next.'],
  shipped: ['On its way', () => `DHL Express from Tokyo, arriving ${day(4)} – ${day(8)}. Duties are prepaid, so there is nothing to pay at the door.`],
  delivered: ['Delivered', () => 'Check the piece against the lot notes. You have three days to report a problem; after that your payment is released to the seller.'],
  complete: ['All done', () => 'Your payment has been released. Thank you — we hope you love it.'],
};

function stepHTML(key, idx, i, opts, rec) {
  const done = i < idx;
  const now = i === idx;
  const paidAt = rec ? shortDate(new Date(rec.at)) : day(0);
  const text = {
    won: ['Won', `${day(-1)} · ${sale === 'B' ? `hammer ${usd(hammer)} · ${exampleAuction(lot).bids} bids` : `offer ${usd(hammer)} accepted`}`],
    invoice: [`Invoice · pay by ${day(2)}`, done ? `Paid ${paidAt}` : 'Card up to $10,000 or bank transfer. Nothing else is charged later — not on arrival, not after.'],
    paid: ['Paid · held in escrow', done || now ? `${usd(rec ? rec.total : invoice(opts).total)} held until the piece is delivered.` : 'Your payment is held until the piece is delivered.'],
    packed: ['Inspected & packed in Tokyo', `Checked by hand against the auction notes, then packed${opts.box ? ' in a rigid box' : ''}. 2–3 business days.`],
    shipped: ['Shipped', `DHL Express · arrives ${done || now ? `${day(4)} – ${day(8)}` : `about ${day(9)} – ${day(13)} if you pay today`}. Tracking number by email.`],
    delivered: ['Delivered', 'Three days to report a problem. After that, your payment is released.'],
    complete: ['Complete', 'Payment released. Receipt and certificate (if ordered) are in your email.'],
  }[key];
  let actions = '';
  if (now && key === 'shipped') actions = `<div class="tl-actions"><button class="btn ghost small" type="button" data-fake="Tracking opens at dhl.com once the parcel is scanned">Track with DHL</button></div>`;
  if (now && key === 'delivered') actions = `<div class="tl-actions"><button class="btn small" type="button" data-received>Everything's fine</button><button class="btn ghost small" type="button" data-fake="Describe the problem and we reply within one business day">Report a problem</button></div>`;
  return `<li class="${done ? 'is-done' : ''}${now ? 'is-now' : ''}"><span class="tl-dot" aria-hidden="true">${done ? icon.check : ''}</span>
    <div><b>${text[0]}</b><p>${text[1]}</p>${actions}</div></li>`;
}

function leftHTML(idx, opts, rec) {
  const g = gradeOf(lot);
  return `
    <div class="pay-lot">
      <img src="${cardImg(lot)}" alt="" width="96" height="96">
      <div><span class="brand-label">${esc(brandName(lot.brand))}</span><b>${esc(lot.title)}</b>
        <p>Lot ${esc(lot.lot)} · ${g ? `Rank ${esc(g.overall)} · ${esc(gradeName(g.overall))}` : 'Not graded'} · <a class="text-link" href="${lotUrl(lot)}">View lot</a></p></div>
    </div>
    <ol class="tl" aria-label="Order status">${PAY_STATES.map((k, i) => stepHTML(k, idx, i, opts, rec)).join('')}</ol>`;
}

function rowsHTML(rows, total) {
  return `<table class="total">
    ${rows.map(([k, sub, v]) => `<tr><td>${k}${sub ? `<span>${sub}</span>` : ''}</td><td class="num">${usd(v)}</td></tr>`).join('')}
    <tr class="sum"><td>Total to your door</td><td class="num">${usd(total)}</td></tr>
  </table>`;
}

function shipToHTML() {
  return `<div class="ship-to">
    <span class="label">Ship to</span>
    <b>${SHIP_TO.name}</b><span>${SHIP_TO.line1}</span><span>${SHIP_TO.line2}</span>
    <span class="t13 muted">${SHIP_TO.phone} · customs may call about your parcel</span>
    <button class="text-link" type="button" data-fake="Changing the address is not part of this preview">Change address</button>
  </div>`;
}

function invoiceHTML(idx, opts, rec) {
  const inv = invoice(opts);
  if (idx >= 2) {
    const total = rec ? rec.total : inv.total;
    const method = (rec ? rec.method : 'wire') === 'card' ? 'Card' : 'Bank transfer';
    return `<h2 class="display d3">Receipt</h2>
      <div class="invoice-paid"><b>Paid ${usd(total)} · ${rec ? shortDate(new Date(rec.at)) : day(0)}</b><span>${method} · held in escrow until delivered</span></div>
      ${rowsHTML(inv.rows, total)}
      ${shipToHTML()}
      <p class="pay-note">${RATE_NOTE}${EXAMPLE_RATES.example ? ' — fee, duties and shipping are placeholders.' : '.'}</p>`;
  }
  const signedIn = store.get('signedIn');
  const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
  return `<h2 class="display d3">Invoice</h2>
    <p class="invoice-due"><span>${RATE_NOTE}</span><b>Pay by ${day(2)}</b></p>
    ${rowsHTML(inv.rows, inv.total)}
    <label class="check"><input type="checkbox" name="box" ${opts.box ? 'checked' : ''}> <span><b>Rigid box to keep the shape</b> +${usd(EXAMPLE_RATES.box)} · recommended for structured bags</span></label>
    <label class="check"><input type="checkbox" name="cert" ${opts.cert ? 'checked' : ''}> <span><b>Certificate of authenticity</b> +${usd(CERT)} · optional, issued in Tokyo</span></label>
    <div class="pay-methods" role="radiogroup" aria-label="How to pay">
      <label class="radio" ${inv.over ? 'aria-disabled="true"' : ''}><input type="radio" name="method" value="card" ${opts.method === 'card' ? 'checked' : ''} ${inv.over ? 'disabled' : ''}>
        <span><b>Card</b><span class="t13">Up to ${usd(CARD_MAX)} · ${Math.round(CARD_FEE * 100)}% processing fee${inv.over ? ' · not available for this total' : ''}</span></span></label>
      <label class="radio"><input type="radio" name="method" value="wire" ${opts.method === 'wire' ? 'checked' : ''}>
        <span><b>Bank transfer</b><span class="t13">No fee · clears in 1–2 business days · details by email</span></span></label>
    </div>
    ${shipToHTML()}
    <p class="field-error" data-pay-error role="alert"></p>
    ${signedIn
      ? `<button class="btn block" type="button" data-pay-btn>Pay ${usd(inv.total)}</button>`
      : `<div class="lock-band">${icon.lock}Sign in to pay for this lot<a class="btn small" href="sign-in.html?next=${next}">Sign in</a></div>`}
    <p class="pay-note">Your payment is held until the piece is delivered. No other charges follow — not on arrival, not later.</p>`;
}

function render() {
  const params = new URLSearchParams(location.search);
  state = currentState(params);
  const idx = PAY_STATES.indexOf(state);
  const rec = store.get('payments')[lot.lot];
  const opts = rec ? { box: rec.box, cert: rec.cert, method: rec.method } : ui;
  const [title, lede] = COPY[state];
  $('[data-pay-title]').textContent = title;
  $('[data-pay-lede]').textContent = lede();
  $('[data-pay-crumb]').textContent = idx >= 2 ? 'Order' : 'Pay';
  $('[data-pay-left]').innerHTML = leftHTML(idx, opts, rec);
  $('[data-pay-invoice]').innerHTML = invoiceHTML(idx, opts, rec);
  paintNotes();
}

function pay(btn) {
  const err = $('[data-pay-error]');
  if (!ui.method) { err.textContent = "Choose how you'd like to pay."; $('[name="method"]').focus(); return; }
  err.textContent = '';
  btn.classList.add('is-loading');
  setTimeout(() => {
    const inv = invoice(ui);
    history.replaceState(null, '', `pay.html?lot=${encodeURIComponent(lot.lot)}${sale === 'A' ? `&sale=A&offer=${hammer}` : ''}`);
    if (store.setting('payState') !== 'auto') store.setSetting('payState', 'auto');
    store.update('payments', p => ({ ...p, [lot.lot]: { state: 'paid', at: Date.now(), method: ui.method, box: ui.box, cert: ui.cert, total: inv.total } }));
    toast(`Paid ${usd(inv.total)} — held until your lot is delivered`);
  }, 800);
}

async function main() {
  data = await startPage({ page: 'pay' });
  if (!data) return;
  const params = new URLSearchParams(location.search);
  lot = pickLot(params);
  sale = params.get('sale') === 'A' ? 'A' : 'B';
  hammer = Number(params.get('offer')) || (sale === 'A' ? Math.round((lot.usd || 1000) * 0.93 / 10) * 10 : exampleAuction(lot).bid);
  document.title = `Pay for ${fullName(lot)} — TheOne Vintage`;
  const root = $('[data-pay]');
  root.addEventListener('change', e => {
    if (e.target.name === 'box') ui.box = e.target.checked;
    else if (e.target.name === 'cert') ui.cert = e.target.checked;
    else if (e.target.name === 'method') ui.method = e.target.value;
    else return;
    render();
  });
  root.addEventListener('click', e => {
    const fake = e.target.closest('[data-fake]');
    if (fake) { e.preventDefault(); toast(fake.dataset.fake); return; }
    const payBtn = e.target.closest('[data-pay-btn]');
    if (payBtn) { pay(payBtn); return; }
    if (e.target.closest('[data-received]')) {
      store.update('payments', p => ({ ...p, [lot.lot]: { ...(p[lot.lot] || { at: Date.now(), method: 'wire', box: true, cert: false, total: invoice(ui).total }), state: 'complete' } }));
      if (store.setting('payState') !== 'auto') store.setSetting('payState', 'auto');
      history.replaceState(null, '', `pay.html?lot=${encodeURIComponent(lot.lot)}${sale === 'A' ? `&sale=A&offer=${hammer}` : ''}`);
      toast('Thank you — your payment has been released');
    }
  });
  window.addEventListener('store:change', e => { if (['settings', 'payments', 'signedIn', '*'].includes(e.detail.key)) render(); });
  render();
}

main();
