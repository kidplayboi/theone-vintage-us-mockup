// 로트 카드 — 기획안 23·24쪽. 카드 한 장에 판매 조건을 다 담는다
import { usd, jpy, cardImg, lotUrl, esc, exampleAuction, countdown, daysUntil, shortDate } from './data.js?v=ffe41d4f8e';
import { icon } from './icons.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';
import { toast } from './chrome.js?v=ffe41d4f8e';

// 카드 맨 위 라벨 한 줄 — 판매 방식(A/B)과 상태에 따라 바뀐다
function terms(lot, sale, state) {
  if (state === 'sold') {
    return `<span>Sold · ${shortDate(new Date(Date.now() - 6 * 86400000))}</span><span class="hide-sm">Sign in for price</span>`;
  }
  if (sale === 'B') {
    const a = exampleAuction(lot);
    const soon = a.ends - Date.now() < 3600000;
    return `<span>Bid<b class="num">${usd(a.bid)}</b></span>
      <span class="${soon ? 'warn' : ''}"><span class="hide-sm">Ends in </span><span class="num" data-ends="${a.ends.getTime()}">${countdown(a.ends)}</span></span>`;
  }
  if (!lot.usd) return `<span>Price on request</span><span>Ask us</span>`;
  const left = lot.until ? daysUntil(lot.until) : 999;
  const right = left <= 30
    ? `<span class="${left <= 7 ? 'warn' : ''}">Until ${shortDate(lot.until)}</span>`
    : `<span class="hide-sm">Offers OK</span>`;
  return `<span><span class="hide-sm">Price</span><b class="num">${usd(lot.usd)}</b><span class="show-sm"> · Offers</span></span>${right}`;
}

// 초록 라벨은 사실일 때만: 등록 14일 안(실데이터) · 입찰 방식의 최소가 없음(예시값) — 결정 43
function signal(lot, sale) {
  if (sale === 'B') return exampleAuction(lot).reserve === 'none' ? 'No reserve' : '';
  const snap = document.body.dataset.snapshot;
  if (!lot.listed || !snap) return '';
  const days = (new Date(snap) - new Date(lot.listed)) / 86400000;
  return days >= 0 && days <= 14 ? 'New' : '';
}

export function cardHTML(lot, { sale = 'A', state = 'auto', note = '' } = {}) {
  const saved = Boolean(store.get('saved')[lot.lot]);
  const flag = state === 'sold' ? '' : signal(lot, sale);
  const rank = lot.grade && lot.grade.overall;
  const sold = state === 'sold';
  return `
  <article class="card${sold ? ' is-sold' : ''}" data-reveal data-lot="${esc(lot.lot)}" ${note ? `data-note="${esc(note)}"` : ''}>
    <div class="card-media">
      <img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy" decoding="async">
      ${sold ? '<span class="sold-mark">Sold</span>' : ''}
      ${rank ? `<span class="rank-badge">Rank ${esc(rank)}</span>` : ''}
      ${flag ? `<span class="new-badge">${flag}</span>` : ''}
      <button class="card-save" type="button" data-save aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save'}: ${esc(lot.title)}">${saved ? icon.heartOn : icon.heart}</button>
      <button class="card-quick" type="button" data-quick>Quick view</button>
    </div>
    <div class="card-body">
      <p class="card-terms">${terms(lot, sale, state)}</p>
      <p class="brand-label">${esc(lot.brand)}</p>
      <h3 class="card-title"><a href="${lotUrl(lot)}">${esc(lot.title)}</a></h3>
      <p class="card-sub">${esc(lot.sub) || '&nbsp;'}</p>
      <p class="card-foot label"><span>Lot ${esc(lot.lot)}</span><span>${lot.jpy ? '≈ ' + jpy(lot.jpy) : ''}</span></p>
    </div>
  </article>`;
}

// 저장 하트 · 빠른 보기 — 카드 묶음 바깥 한 곳에서 받는다
export function bindCards(root, lots, { onQuick } = {}) {
  root.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const lot = lots.find(x => x.lot === card.dataset.lot);
    if (!lot) return;
    if (e.target.closest('[data-save]')) {
      e.preventDefault();
      toggleSave(lot, e.target.closest('[data-save]'));
    } else if (e.target.closest('[data-quick]') && onQuick) {
      e.preventDefault();
      onQuick(lot);
    }
  });
}

export function toggleSave(lot, btn, folder = 0) {
  const saved = store.get('saved');
  const on = !saved[lot.lot];
  if (on) saved[lot.lot] = folder; else delete saved[lot.lot];
  store.set('saved', saved);
  const name = store.get('folders')[folder];
  toast(on ? `Saved to ${name}` : 'Removed from saved');
  document.querySelectorAll(`.card[data-lot="${CSS.escape(lot.lot)}"] [data-save]`).forEach(b => paintSave(b, on, lot));
  if (btn && !btn.closest('.card')) paintSave(btn, on, lot);
  return on;
}

function paintSave(btn, on, lot) {
  btn.setAttribute('aria-pressed', String(on));
  if (btn.closest('.card')) {
    btn.innerHTML = on ? icon.heartOn : icon.heart;
    btn.setAttribute('aria-label', `${on ? 'Remove from saved' : 'Save'}: ${lot.title}`);
  }
}

// 남은 시간 — 화면에 있는 카운트다운을 1초마다 한 번에 갱신
let ticker;
export function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    document.querySelectorAll('[data-ends]').forEach(el => {
      el.textContent = countdown(new Date(Number(el.dataset.ends)));
    });
  }, 1000);
}
