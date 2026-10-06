// My offers — 손님이 답해야 하는 건을 첫 칸에(31쪽 · 결정 17). 예시 행 + 이 브라우저에서 보낸 제안·요청
import { usd, esc, cardImg, lotUrl, shortDate, fullName } from './data.js?v=ffe41d4f8e';
import { startPage } from './page.js?v=ffe41d4f8e';
import { paintNotes } from './review.js?v=ffe41d4f8e';
import { toast } from './chrome.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';

const STATUS = {
  reply: { label: 'Needs your reply', badge: 'Counter', tone: 'alert' },
  waiting: { label: 'Waiting on us', badge: 'Waiting', tone: 'quiet' },
  pay: { label: 'To pay', badge: 'To pay', tone: 'navy' },
  shipped: { label: 'On the way', badge: 'Shipped', tone: 'ok' },
};
let data;
let filter = '';

const day = n => shortDate(new Date(Date.now() + n * 86400000));

function rows() {
  const mine = store.get('offers').filter(o => o.status === 'waiting').map(o => {
    const lot = data.lots.find(x => x.lot === o.lot);
    return lot && { lot, mine: true, kind: o.type, offer: o.type === 'offer' ? o.amount : null, status: 'waiting', sub: `Sent ${shortDate(new Date(o.at))}` };
  }).filter(Boolean);
  if (!store.setting('examples')) return mine;
  const pick = i => data.lots[i];
  const ex = [
    { lot: pick(2), offer: Math.round(pick(2).usd * 0.9 / 10) * 10, status: 'reply', counter: Math.round(pick(2).usd * 0.96 / 10) * 10, sub: `Reply by ${day(2)}` },
    { lot: pick(4), offer: Math.round(pick(4).usd * 0.88 / 10) * 10, status: 'waiting', sub: `Sent ${day(-1)}` },
    { lot: pick(9), offer: Math.round(pick(9).usd * 0.93 / 10) * 10, status: 'pay', sub: `Accepted ${day(-1)} · pay by ${day(1)}` },
    { lot: pick(17), offer: Math.round(pick(17).usd * 0.95 / 10) * 10, status: 'shipped', sub: `Arrives ${day(4)} – ${day(8)}` },
  ].map(r => ({ ...r, example: true }));
  return [...mine, ...ex];
}

function action(r) {
  if (r.status === 'reply') return `<a class="btn small" href="${lotUrl(r.lot)}&state=counter">Reply</a>`;
  if (r.status === 'pay') return `<a class="btn small" href="${lotUrl(r.lot)}&state=accepted">Pay</a>`;
  if (r.status === 'shipped') return `<button class="btn ghost small" type="button" data-track>Track</button>`;
  if (r.mine) return `<button class="btn ghost small" type="button" data-withdraw="${esc(r.lot.lot)}">Withdraw</button>`;
  return `<a class="btn ghost small" href="${lotUrl(r.lot)}">View</a>`;
}

function render() {
  const list = rows();
  const counts = Object.fromEntries(Object.keys(STATUS).map(k => [k, list.filter(r => r.status === k).length]));
  document.querySelector('[data-cells]').innerHTML = Object.entries(STATUS).map(([k, s]) => `
    <button type="button" class="o-cell${k === 'reply' && counts[k] ? ' is-alert' : ''}" data-filter="${k}" aria-pressed="${filter === k}">
      <span class="label">${s.label}</span><span class="o-count num">${counts[k]}</span></button>`).join('');
  const shown = filter ? list.filter(r => r.status === filter) : list;
  const body = document.querySelector('[data-rows]');
  if (!shown.length) {
    body.innerHTML = `<tr><td colspan="5"><div class="o-empty"><p class="display d30">No offers yet</p>
      <p class="muted">Make an offer or send a request on any lot and it will show here.</p>
      <a class="btn ghost" href="index.html#lots">Browse lots</a></div></td></tr>`;
  } else {
    body.innerHTML = shown.map(r => `
      <tr${r.example ? ' class="is-example"' : ''}>
        <td><a class="o-lot" href="${lotUrl(r.lot)}"><img src="${cardImg(r.lot)}" alt="" width="56" height="56" loading="lazy">
          <span><b>${esc(fullName(r.lot))}</b><span class="label">${esc(r.sub)}</span></span></a></td>
        <td class="r num">${r.offer ? usd(r.offer) : (r.kind === 'request' ? 'Request' : '—')}</td>
        <td class="r num">${r.lot.usd ? usd(r.lot.usd) : 'On request'}</td>
        <td class="r"><span class="badge ${STATUS[r.status].tone}">${STATUS[r.status].badge}${r.counter ? ` ${usd(r.counter)}` : ''}</span></td>
        <td class="r">${action(r)}</td>
      </tr>`).join('');
  }
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
      toast('Offer withdrawn');
      render();
      return;
    }
    if (e.target.closest('[data-track]')) toast('Tracking appears here once the carrier scans the parcel');
  });
  window.addEventListener('store:change', e => { if (['settings', 'offers', '*'].includes(e.detail.key)) render(); });
  render();
}

main();
