// 로트 카드 v2 — 운영 사이트·까사 카드 문법: 맨 위 초록 상태 띠(판매 방식 · 기한 현지 시각 · 남은 시간),
// 사진 위 등급·출발지 배지, 달러 크게(더윈 5). 누르면 상세 창(더윈 4) — 새 탭으로 열면 전체 페이지
import { usd, jpy, cardImg, lotUrl, esc, exampleAuction, countdown, localParts, KIND, shortDate } from './data.js?v=20c3d06a4d';
import { icon } from './icons.js?v=20c3d06a4d';
import * as store from './store.js?v=20c3d06a4d';
import { toast } from './chrome.js?v=20c3d06a4d';

const HOUR = 3600000;
const DAY = 86400000;

// 남은 시간 문구 — 하루 넘으면 "145 days left", 하루 안이면 카운트다운
function remain(ends) {
  const ms = ends - Date.now();
  if (ms <= 0) return 'Ended';
  if (ms >= DAY) {
    const d = Math.floor(ms / DAY);
    return `${d} day${d > 1 ? 's' : ''} left`;
  }
  return countdown(ends);
}

// 맨 위 띠 — 상태에 따라 초록 / 빨강(1시간 안 · 더윈 12) / 회색(판매 완료)
export function bandInfo(lot, sale, state) {
  const tz = store.setting('tz');
  if (state === 'sold') return { tone: 'done', kind: 'Sold', date: shortDate(new Date(Date.now() - 6 * DAY)), time: '', right: '' };
  if (sale === 'B') {
    const a = exampleAuction(lot);
    return { tone: a.ends - Date.now() < HOUR ? 'hot' : '', kind: 'Live bid', ...localParts(a.ends, tz), right: remain(a.ends), ends: a.ends };
  }
  const kind = KIND[lot.kind] || 'Mall';
  if (!lot.ends) return { tone: '', kind, date: 'Buy it now', time: '', right: 'One piece' };
  const ends = new Date(lot.ends);
  return { tone: ends - Date.now() < HOUR ? 'hot' : '', kind, ...localParts(ends, tz), right: remain(ends), ends };
}

// 띠 왼쪽 글자 — 판매 방식 · 날짜 · 시각(좁은 화면은 시각을 뺀다)
export function bandLeft(b) {
  return `<span class="bk">${esc(b.kind)}</span>${b.date ? `<span class="bd"> · ${esc(b.date)}</span>` : ''}${b.time ? `<span class="bt"> · ${esc(b.time)}</span>` : ''}`;
}

function bandHTML(lot, sale, state) {
  const b = bandInfo(lot, sale, state);
  const live = b.ends && b.ends - Date.now() < DAY;
  return `<p class="card-band ${b.tone ? 'is-' + b.tone : ''}">
    <span>${bandLeft(b)}</span>
    <span class="num" ${live ? `data-ends="${b.ends.getTime()}"` : ''}>${esc(b.right)}</span></p>`;
}

export function cardHTML(lot, { sale = 'A', state = 'auto', note = '' } = {}) {
  const saved = Boolean(store.get('saved')[lot.lot]);
  const rank = lot.grade && lot.grade.overall;
  const sold = state === 'sold';
  const price = sale === 'B' ? exampleAuction(lot).bid : lot.usd;
  return `
  <article class="card${sold ? ' is-sold' : ''}" data-reveal data-lot="${esc(lot.lot)}" ${note ? `data-note="${esc(note)}"` : ''}>
    ${bandHTML(lot, sale, state)}
    <div class="card-media">
      <img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy" decoding="async">
      ${sold ? '<span class="sold-mark">Sold</span>' : ''}
      <span class="card-badges">
        <span class="badge-rank${rank ? '' : ' is-na'}">${rank ? `Rank ${esc(rank)}` : 'Not graded'}</span>
        <span class="badge-ship">${esc(lot.ship || 'JP')}</span>
      </span>
      <button class="card-save" type="button" data-save aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save'}: ${esc(lot.title)}">${saved ? icon.heartOn : icon.heart}</button>
    </div>
    <div class="card-body">
      <p class="brand-label">${esc(lot.brand)}</p>
      <h3 class="card-title"><a href="${lotUrl(lot)}" data-open>${esc(lot.title)}</a></h3>
      <p class="card-sub">${esc(lot.sub) || '&nbsp;'}</p>
      <p class="card-price">${price
        ? `<span class="price">${usd(price)}</span><span class="yen">${sale === 'B' ? 'current bid' : '≈ ' + jpy(lot.jpy)}</span>`
        : '<span class="price ask">Price on request</span>'}</p>
      <p class="card-lot">Lot ${esc(lot.lot)}</p>
    </div>
  </article>`;
}

// 저장 하트 · 카드 열기 — 카드 묶음 바깥 한 곳에서 받는다
export function bindCards(root, lots, { onOpen } = {}) {
  root.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const lot = lots.find(x => x.lot === card.dataset.lot);
    if (!lot) return;
    if (e.target.closest('[data-save]')) {
      e.preventDefault();
      toggleSave(lot, e.target.closest('[data-save]'));
      return;
    }
    // 보통 클릭 = 상세 창. 새 탭(⌘/Ctrl/Shift/가운데 버튼)은 전체 페이지로 그대로 간다
    const link = e.target.closest('[data-open]');
    if (link && onOpen && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) {
      e.preventDefault();
      onOpen(lot);
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

// 남은 시간 — 화면에 있는 카운트다운을 1초마다 한 번에 갱신, 1시간 안으로 들어오면 띠를 빨강으로
let ticker;
export function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    document.querySelectorAll('[data-ends]').forEach(el => {
      const ends = new Date(Number(el.dataset.ends));
      el.textContent = remain(ends);
      const band = el.closest('.card-band');
      if (band) band.classList.toggle('is-hot', ends - Date.now() < HOUR);
    });
  }, 1000);
}
