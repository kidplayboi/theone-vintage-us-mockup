// My page — 까사 마이페이지 네 칸(더윈 9): 바로 대응 필요 / 진행 중 / 결과 확정 / 낙찰 완료
// 낙찰·확정 행은 펼치면 정산표(더윈 10): 낙찰가 · 관세 · 수수료 · 배송비 · 감정서(필요 시) = 총액
import { usd, esc, cardImg, lotUrl, shortDate, fullName } from './data.js?v=20c3d06a4d';
import { startPage } from './page.js?v=20c3d06a4d';
import { paintNotes } from './review.js?v=20c3d06a4d';
import { toast } from './chrome.js?v=20c3d06a4d';
import { estimate } from './buybox.js?v=20c3d06a4d';
import * as store from './store.js?v=20c3d06a4d';

const CELLS = {
  action: { label: 'Needs action', hint: 'Reply or pay', tone: 'alert' },
  progress: { label: 'In progress', hint: 'Waiting on us', tone: 'quiet' },
  confirmed: { label: 'Result confirmed', hint: 'Total confirmed', tone: 'navy' },
  won: { label: 'Won', hint: 'Paid · on the way', tone: 'ok' },
};
let data;
let filter = '';
const open = new Set();

const day = n => shortDate(new Date(Date.now() + n * 86400000));

function rows() {
  const mine = store.get('offers').filter(o => o.status === 'waiting').map(o => {
    const lot = data.lots.find(x => x.lot === o.lot);
    return lot && { lot, mine: true, kind: o.type, offer: o.type === 'offer' ? o.amount : null, cell: 'progress', badge: o.type === 'offer' ? 'Offer sent' : 'Inquiry sent', sub: `Sent ${shortDate(new Date(o.at))}${o.box ? ' · rigid box' : ''}` };
  }).filter(Boolean);
  if (!store.setting('examples')) return mine;
  const pick = i => data.lots[i];
  const ex = [
    { lot: pick(2), offer: Math.round(pick(2).usd * 0.9 / 10) * 10, cell: 'action', badge: `Counter ${usd(Math.round(pick(2).usd * 0.96 / 10) * 10)}`, sub: `Reply by ${day(2)}` },
    { lot: pick(4), offer: Math.round(pick(4).usd * 0.88 / 10) * 10, cell: 'progress', badge: 'Offer sent', sub: `Sent ${day(-1)}` },
    { lot: pick(9), offer: Math.round(pick(9).usd * 0.93 / 10) * 10, cell: 'confirmed', badge: 'To pay', sub: `Accepted ${day(-1)} · pay by ${day(1)}`, settle: true },
    { lot: pick(17), offer: Math.round(pick(17).usd * 0.95 / 10) * 10, cell: 'won', badge: 'Shipped', sub: `Arrives ${day(4)} – ${day(8)} · FedEx`, settle: true },
  ].map(r => ({ ...r, example: true }));
  return [...ex.filter(r => r.cell === 'action'), ...mine, ...ex.filter(r => r.cell !== 'action')];
}

function action(r) {
  if (r.cell === 'action') return `<a class="btn small" href="${lotUrl(r.lot)}&state=counter">Reply</a>`;
  if (r.cell === 'confirmed') return `<a class="btn small" href="${lotUrl(r.lot)}&state=accepted">Pay</a>`;
  if (r.cell === 'won') return `<button class="btn ghost small" type="button" data-track>Track</button>`;
  if (r.mine) return `<button class="btn ghost small" type="button" data-withdraw="${esc(r.lot.lot)}">Cancel</button>`;
  return `<a class="btn ghost small" href="${lotUrl(r.lot)}">View</a>`;
}

// 정산표 — 금액은 조사 전. 검토 막대 '가격 표기: 총액 예상'이면 예시 요율로 채운다(수수료 10% = 더윈 16)
function settlement(r) {
  const ex = store.setting('priceMode') === 'total';
  const e = estimate({ ...r.lot, usd: r.offer || r.lot.usd }, { box: true });
  const v = n => (ex ? usd(n) : '<span class="muted">In your quote</span>');
  return `<tr class="settle-row"><td colspan="5"><div class="settle">
    <p class="label">Settlement${ex ? ' · example rates' : ''}</p>
    <table class="total">
      <tr><td>Hammer price</td><td class="num">${usd(r.offer || r.lot.usd)}</td></tr>
      <tr><td>Import duties<span>By material</span></td><td class="num">${v(e.duty)}</td></tr>
      <tr><td>Service fee</td><td class="num">${v(e.fee)}</td></tr>
      <tr><td>Shipping · FedEx<span>Incl. rigid box and surcharges</span></td><td class="num">${v(e.ship)}</td></tr>
      <tr><td>Certificate of authenticity<span>If requested</span></td><td class="num"><span class="muted">—</span></td></tr>
      <tr class="sum"><td>Total</td><td class="num">${ex ? usd(e.total) : '$ —'}</td></tr>
    </table></div></td></tr>`;
}

function render() {
  const list = rows();
  const counts = Object.fromEntries(Object.keys(CELLS).map(k => [k, list.filter(r => r.cell === k).length]));
  document.querySelector('[data-cells]').innerHTML = Object.entries(CELLS).map(([k, c], i) => `
    <button type="button" class="o-cell${k === 'action' && counts[k] ? ' is-alert' : ''}" data-filter="${k}" aria-pressed="${filter === k}">
      <span class="roman">${['I', 'II', 'III', 'IV'][i]}</span>
      <span class="o-count num">${counts[k]}</span>
      <span class="o-label">${c.label}</span><span class="t13 muted">${c.hint}</span></button>`).join('');
  const shown = filter ? list.filter(r => r.cell === filter) : list;
  const body = document.querySelector('[data-rows]');
  if (!shown.length) {
    body.innerHTML = `<tr><td colspan="5"><div class="o-empty"><p class="display d2">Nothing here yet</p>
      <p class="muted">Inquire or make an offer on any lot and it will show here.</p>
      <a class="btn ghost" href="index.html#lots">Browse lots</a></div></td></tr>`;
  } else {
    body.innerHTML = shown.map((r, i) => `
      <tr${r.example ? ' class="is-example"' : ''}>
        <td><a class="o-lot" href="${lotUrl(r.lot)}"><img src="${cardImg(r.lot)}" alt="" width="56" height="56" loading="lazy">
          <span><b>${esc(fullName(r.lot))}</b><span class="t13 muted">${esc(r.sub)}</span></span></a></td>
        <td class="r o-money">${r.offer ? usd(r.offer) : (r.kind === 'inquiry' ? '—' : '—')}</td>
        <td class="r o-money">${r.lot.usd ? usd(r.lot.usd) : 'On request'}</td>
        <td class="r"><span class="badge ${CELLS[r.cell].tone}">${esc(r.badge)}</span>
          ${r.settle ? `<button type="button" class="text-link t13 o-settle" data-settle="${i}" aria-expanded="${open.has(r.lot.lot)}">Settlement</button>` : ''}</td>
        <td class="r">${action(r)}</td>
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
      return;
    }
    if (e.target.closest('[data-track]')) toast('Tracking appears here once the carrier scans the parcel');
  });
  window.addEventListener('store:change', e => { if (['settings', 'offers', '*'].includes(e.detail.key)) render(); });
  render();
}

main();
