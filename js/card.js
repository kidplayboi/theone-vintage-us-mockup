// 로트 카드 v3 — Bezel 상품 칸(ref-bezel-s01) + WGACA 누끼 타일(ref-wgaca-s01)
// 운영 사이트 카드 띠의 정보(판매 방식 · 기한 현지 시각 · 남은 시간)는 사진 위 알약 + 아랫줄로 옮겼다(결정 56).
// 입찰(B)은 Bezel 경매 카드처럼 Current bid | Ends in 두 칸. 1시간 안이면 빨강(더윈 12). 누르면 상세 창(더윈 4)
import { usd, jpy, cardImg, lotUrl, esc, exampleAuction, countdown, localParts, KIND, shortDate } from './data.js?v=9d7fdc12f6';
import { icon } from './icons.js?v=9d7fdc12f6';
import * as store from './store.js?v=9d7fdc12f6';
import { toast } from './chrome.js?v=9d7fdc12f6';

const HOUR = 3600000;
const DAY = 86400000;

// 남은 시간 문구 — 하루 넘으면 "145 days left", 하루 안이면 카운트다운
export function remain(ends) {
  const ms = ends - Date.now();
  if (ms <= 0) return 'Ended';
  if (ms >= DAY) {
    const d = Math.floor(ms / DAY);
    return `${d} day${d > 1 ? 's' : ''} left`;
  }
  return countdown(ends);
}

// 판매 방식 · 기한 — 상세 창·상세 페이지·카드가 같이 쓴다
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

// 판매 방식 · 날짜 · 시각(좁은 화면은 시각을 뺀다)
export function bandLeft(b) {
  return `<span class="bk">${esc(b.kind)}</span>${b.date ? `<span class="bd"> · ${esc(b.date)}</span>` : ''}${b.time ? `<span class="bt"> · ${esc(b.time)}</span>` : ''}`;
}

function pill(b, sale) {
  if (b.tone === 'done') return '<span class="card-pill is-done">Sold</span>';
  if (sale !== 'B' && b.kind === 'Mall') return '';
  return `<span class="card-pill${b.tone === 'hot' ? ' is-hot' : ''}">${icon.bolt}${esc(b.kind)}</span>`;
}

function liveAttr(b) {
  return b.ends && b.ends - Date.now() < DAY ? `data-ends="${b.ends.getTime()}"` : '';
}

export function cardHTML(lot, { sale = 'A', state = 'auto', note = '' } = {}) {
  const saved = Boolean(store.get('saved')[lot.lot]);
  const rank = lot.grade && lot.grade.overall;
  const b = bandInfo(lot, sale, state);
  const sold = b.tone === 'done';
  const hot = b.tone === 'hot';
  let money;
  if (sale === 'B' && !sold) {
    const a = exampleAuction(lot);
    money = `<div class="card-bid">
      <div><span class="label">Current bid</span><b class="price">${usd(a.bid)}</b></div>
      <div class="r"><span class="label">Ends in</span><b class="num${hot ? ' warn' : ''}" ${liveAttr(b)}>${esc(b.right)}</b></div></div>`;
  } else {
    money = `<p class="card-buy">${lot.usd
      ? `<b class="price">${usd(lot.usd)}</b><span class="yen">≈ ${jpy(lot.jpy)}</span>`
      : '<b class="price ask">Price on request</b>'}</p>`;
  }
  const when = sold ? `Sold ${esc(b.date)}`
    : sale === 'B' ? `Ends ${esc(b.date)}${b.time ? ' · ' + esc(b.time) : ''}`
    : b.time ? `Until ${esc(b.date)} · ${esc(b.time)} · <span class="num${hot ? ' warn' : ''}" ${liveAttr(b)}>${esc(b.right)}</span>` : esc(b.date);
  return `
  <article class="card${sold ? ' is-sold' : ''}" data-reveal data-lot="${esc(lot.lot)}" ${note ? `data-note="${esc(note)}"` : ''}>
    <div class="card-media">
      <img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy" decoding="async">
      ${pill(b, sale)}
      ${rank ? `<span class="card-rank">Rank ${esc(rank)}</span>` : ''}
      <button class="card-save" type="button" data-save aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save'}: ${esc(lot.title)}">${saved ? icon.heartOn : icon.heart}</button>
    </div>
    <div class="card-body">
      <p class="brand-label">${esc(lot.brand)}</p>
      <h3 class="card-title"><a href="${lotUrl(lot)}" data-open>${esc(lot.title)}</a></h3>
      <p class="card-meta">${rank ? '' : 'Not graded · '}Ships from ${esc(lot.ship || 'JP')} · Lot ${esc(lot.lot)}</p>
      ${money}
      <p class="card-when">${when}</p>
    </div>
  </article>`;
}

// 저장 하트 · 카드 열기 — 카드 묶음 바깥 한 곳에서 받는다
export function bindCards(root, lots, { onOpen } = {}) {
  if (!root) return;
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

// 남은 시간 — 화면에 있는 카운트다운을 1초마다 한 번에 갱신, 1시간 안으로 들어오면 빨강으로
let ticker;
export function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    document.querySelectorAll('[data-ends]').forEach(el => {
      const ends = new Date(Number(el.dataset.ends));
      el.textContent = remain(ends);
      const hot = ends - Date.now() < HOUR;
      el.classList.toggle('warn', hot);
      const card = el.closest('.card');
      if (card) {
        const p = card.querySelector('.card-pill');
        if (p) p.classList.toggle('is-hot', hot);
      }
      const band = el.closest('.info-band');
      if (band) band.classList.toggle('is-hot', hot);
    });
  }, 1000);
}
