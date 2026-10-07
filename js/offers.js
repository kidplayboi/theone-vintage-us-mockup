// My page v4 — 까사 마이페이지 네 칸(더윈 9): 할 일 / 진행 중 / 결과 확정 / 완료. 할 일 있는 칸만 amber(결정 77)
// 낙찰·수락 행은 펼치면 정산표(더윈 10), 결제는 pay.html(결정 78). 입찰(B)과 정가·제안(A)은 칸 이름과 예시 행만 다르다
import { usd, esc, cardImg, lotUrl, shortDate, fullName, exampleAuction, bidStep, localParts } from './data.js?v=699d9b4d94';
import { startPage } from './page.js?v=699d9b4d94';
import { paintNotes } from './review.js?v=699d9b4d94';
import { toast } from './chrome.js?v=699d9b4d94';
import { estimate, EXAMPLE_RATES, RATES_LABEL } from './buybox.js?v=699d9b4d94';
import * as store from './store.js?v=699d9b4d94';

const CELLS = {
  B: {
    action: { label: 'Needs your action', hint: 'Outbid, or an invoice to pay' },
    progress: { label: 'Bidding now', hint: "You're the highest bidder" },
    confirmed: { label: 'Won · to pay', hint: 'Invoice ready' },
    won: { label: 'Shipped & done', hint: 'On the way or delivered' },
  },
  A: {
    action: { label: 'Needs your action', hint: 'A reply is waiting' },
    progress: { label: 'In progress', hint: 'Waiting on us' },
    confirmed: { label: 'Accepted · to pay', hint: 'Total confirmed' },
    won: { label: 'Shipped & done', hint: 'On the way or delivered' },
  },
};
let data;
let filter = '';
const open = new Set();

const day = n => shortDate(new Date(Date.now() + n * 86400000));
const bidding = () => store.setting('sale') === 'B';
const when = d => { const p = localParts(d, store.setting('tz')); return `${p.date} · ${p.time}`; };
const payUrl = (lot, extra = '') => `pay.html?lot=${encodeURIComponent(lot.lot)}${extra}`;

// 낙찰·수락 행 — 이 브라우저에서 결제했으면 '완료' 칸으로 옮겨 간다(pay.html 이 기록)
function wonRow(lot, amount, extra) {
  const paid = store.get('payments')[lot.lot];
  if (!paid) {
    return { lot, cell: 'confirmed', badge: `Pay by ${day(2)}`, tone: 'action', mine: amount, price: amount, settle: true,
      sub: `${bidding() ? 'Won' : 'Accepted'} ${day(-1)} · invoice ready`, action: `<a class="btn small" href="${payUrl(lot, extra)}">Pay now</a>` };
  }
  const done = paid.state === 'complete';
  return { lot, cell: 'won', badge: done ? 'Delivered' : 'Paid · in escrow', tone: 'live', mine: amount, price: amount, settle: true, paid,
    sub: done ? `Delivered · payment released` : `Paid ${shortDate(new Date(paid.at))} · inspecting and packing in Tokyo`,
    action: `<a class="btn ghost small" href="${payUrl(lot, extra)}">Track</a>` };
}

function exampleRows() {
  const pick = i => data.lots[i];
  if (bidding()) {
    const l2 = pick(2), l4 = pick(4), l17 = pick(17);
    const a2 = exampleAuction(l2), a4 = exampleAuction(l4);
    const high = a2.bid + bidStep(a2.bid);
    const max = a4.bid + bidStep(a4.bid) * 2;
    return [
      { lot: l2, cell: 'action', badge: 'Outbid', tone: 'ending', mine: a2.bid, price: high, sub: `High bid ${usd(high)} · ends ${when(a2.ends)}`,
        action: `<a class="btn small" href="${lotUrl(l2)}&sale=B&state=outbid">Raise bid</a>` },
      { lot: l4, cell: 'progress', badge: 'Highest bidder', tone: 'live', mine: max, price: a4.bid, sub: `Your max ${usd(max)} · ends ${when(a4.ends)}`,
        action: `<a class="btn ghost small" href="${lotUrl(l4)}&sale=B&state=leading">View</a>` },
      wonRow(pick(9), pick(9).usd, ''),
      { lot: l17, cell: 'won', badge: 'Shipped', tone: 'live', mine: l17.usd, price: l17.usd, settle: true, sub: `Arrives ${day(4)} – ${day(8)} · DHL Express`,
        action: `<a class="btn ghost small" href="${payUrl(l17, '&state=shipped')}">Track</a>` },
    ];
  }
  const off = (lot, k) => Math.round(lot.usd * k / 10) * 10;
  const l2 = pick(2), l4 = pick(4), l9 = pick(9), l17 = pick(17);
  return [
    { lot: l2, cell: 'action', badge: `Counter ${usd(off(l2, 0.96))}`, tone: 'action', mine: off(l2, 0.9), price: l2.usd, sub: `Reply by ${day(2)}`,
      action: `<a class="btn small" href="${lotUrl(l2)}&sale=A&state=counter">Reply</a>` },
    { lot: l4, cell: 'progress', badge: 'Offer sent', tone: 'quiet', mine: off(l4, 0.88), price: l4.usd, sub: `Sent ${day(-1)}`,
      action: `<a class="btn ghost small" href="${lotUrl(l4)}&sale=A&state=offer-sent">View</a>` },
    wonRow(l9, off(l9, 0.93), `&sale=A&offer=${off(l9, 0.93)}`),
    { lot: l17, cell: 'won', badge: 'Shipped', tone: 'live', mine: off(l17, 0.95), price: l17.usd, settle: true, sub: `Arrives ${day(4)} – ${day(8)} · DHL Express`,
      action: `<a class="btn ghost small" href="${payUrl(l17, `&sale=A&offer=${off(l17, 0.95)}&state=shipped`)}">Track</a>` },
  ];
}

function rows() {
  const mine = store.get('offers').filter(o => o.status === 'waiting').map(o => {
    const lot = data.lots.find(x => x.lot === o.lot);
    return lot && { lot, mine: o.type === 'offer' ? o.amount : null, price: lot.usd, cell: 'progress', tone: 'quiet', badge: o.type === 'offer' ? 'Offer sent' : 'Inquiry sent',
      sub: `Sent ${shortDate(new Date(o.at))}${o.box ? ' · rigid box' : ''}`, action: `<button class="btn ghost small" type="button" data-withdraw="${esc(lot.lot)}">Cancel</button>` };
  }).filter(Boolean);
  const ex = store.setting('examples') ? exampleRows().map(r => ({ ...r, example: true })) : [];
  const exIds = new Set(ex.map(r => r.lot.lot));
  // 이 브라우저에서 pay.html 로 실제 결제한 로트 — 예시 행과 겹치지 않는 것만 '완료' 칸에
  const paid = Object.entries(store.get('payments')).filter(([id]) => !exIds.has(id)).map(([id, p]) => {
    const lot = data.lots.find(x => x.lot === id);
    if (!lot) return null;
    const done = p.state === 'complete';
    return { lot, cell: 'won', badge: done ? 'Delivered' : 'Paid · in escrow', tone: 'live', mine: lot.usd, price: lot.usd, settle: true, paid: p,
      sub: done ? 'Delivered · payment released' : `Paid ${shortDate(new Date(p.at))} · inspecting and packing in Tokyo`,
      action: `<a class="btn ghost small" href="${payUrl(lot)}">Track</a>` };
  }).filter(Boolean);
  return [...ex.filter(r => r.cell === 'action'), ...mine, ...paid, ...ex.filter(r => r.cell !== 'action')];
}

// 정산표(더윈 10) — 낙찰가 · 수수료 10%(더윈 16) · 관세(재질별, 더윈 1) · 배송 + 단단한 상자(더윈 8) · 감정서 · 총액. 요율은 정책 확정 전 예시
function settlement(r) {
  const paid = r.paid;
  const e = estimate({ ...r.lot, usd: r.mine || r.lot.usd }, { box: paid ? paid.box : true });
  const cert = paid && paid.cert ? EXAMPLE_RATES.cert : 0;
  const total = paid ? paid.total : e.total + cert;
  return `<tr class="settle-row"><td colspan="5"><div class="settle">
    <p class="label">${paid ? 'Paid' : 'Invoice'}${RATES_LABEL}</p>
    <table class="total">
      <tr><td>${bidding() ? 'Hammer price' : 'Accepted offer'}</td><td class="num">${usd(r.mine || r.lot.usd)}</td></tr>
      <tr><td>Buyer's fee<span>${Math.round(EXAMPLE_RATES.fee * 100)}% of the hammer price</span></td><td class="num">${usd(e.fee)}</td></tr>
      <tr><td>Import duties<span>Rate by material · ${esc(r.lot.genre.toLowerCase())}</span></td><td class="num">${usd(e.duty)}</td></tr>
      <tr><td>Shipping · DHL Express<span>${(paid ? paid.box : true) ? `Incl. rigid box +${usd(EXAMPLE_RATES.box)}` : 'Tokyo to your door, insured'}</span></td><td class="num">${usd(e.ship)}</td></tr>
      <tr><td>Certificate of authenticity<span>Optional</span></td><td class="num">${cert ? usd(cert) : '<span class="muted">—</span>'}</td></tr>
      <tr class="sum"><td>Total to your door</td><td class="num">${usd(total)}</td></tr>
    </table></div></td></tr>`;
}

function render() {
  const cells = CELLS[bidding() ? 'B' : 'A'];
  const list = rows();
  const counts = Object.fromEntries(Object.keys(cells).map(k => [k, list.filter(r => r.cell === k).length]));
  document.querySelector('[data-cells]').innerHTML = Object.entries(cells).map(([k, c]) => `
    <button type="button" class="o-cell${k === 'action' && counts[k] ? ' is-alert' : ''}" data-filter="${k}" aria-pressed="${filter === k}">
      <span class="o-count num">${counts[k]}</span>
      <span class="o-label">${c.label}</span><span class="t13 muted">${c.hint}</span></button>`).join('');
  document.querySelector('[data-col-mine]').textContent = bidding() ? 'Your bid' : 'Your offer';
  document.querySelector('[data-col-price]').textContent = bidding() ? 'Current bid' : 'Price';
  const shown = filter ? list.filter(r => r.cell === filter) : list;
  const body = document.querySelector('[data-rows]');
  if (!shown.length) {
    body.innerHTML = `<tr><td colspan="5"><div class="o-empty"><p class="display d2">Nothing here yet</p>
      <p class="muted">${bidding() ? 'Place a bid on any live lot and it will show here.' : 'Inquire or make an offer on any lot and it will show here.'}</p>
      <a class="btn ghost" href="shop.html">Browse lots</a></div></td></tr>`;
  } else {
    body.innerHTML = shown.map((r, i) => `
      <tr${r.example ? ' class="is-example"' : ''}>
        <td><a class="o-lot" href="${lotUrl(r.lot)}"><img src="${cardImg(r.lot)}" alt="" width="56" height="56" loading="lazy">
          <span><b>${esc(fullName(r.lot))}</b><span class="t13 muted">${esc(r.sub)}</span></span></a></td>
        <td class="r o-money">${r.mine ? usd(r.mine) : '—'}</td>
        <td class="r o-money">${r.price ? usd(r.price) : 'On request'}</td>
        <td class="r"><span class="badge ${r.tone === 'quiet' ? '' : r.tone}">${esc(r.badge)}</span>
          ${r.settle ? `<button type="button" class="text-link t13 o-settle" data-settle="${i}" aria-expanded="${open.has(r.lot.lot)}">${r.paid ? 'Receipt' : 'Invoice'}</button>` : ''}</td>
        <td class="r">${r.action}</td>
      </tr>${r.settle && open.has(r.lot.lot) ? settlement(r) : ''}`).join('');
  }
  body.querySelectorAll('[data-settle]').forEach(b => b.addEventListener('click', () => {
    const r = shown[Number(b.dataset.settle)];
    if (open.has(r.lot.lot)) open.delete(r.lot.lot); else open.add(r.lot.lot);
    render();
  }));
  paintNotes();
}

async function main() {
  data = await startPage({ page: 'offers' });
  if (!data) return;
  const root = document.querySelector('[data-offers]');
  root.addEventListener('click', e => {
    const f = e.target.closest('[data-filter]');
    if (f) { filter = filter === f.dataset.filter ? '' : f.dataset.filter; render(); return; }
    const w = e.target.closest('[data-withdraw]');
    if (w) {
      store.update('offers', l => l.filter(o => !(o.lot === w.dataset.withdraw && o.status === 'waiting')));
      toast('Cancelled');
    }
  });
  window.addEventListener('store:change', e => { if (['settings', 'offers', 'payments', '*'].includes(e.detail.key)) render(); });
  render();
}

main();
