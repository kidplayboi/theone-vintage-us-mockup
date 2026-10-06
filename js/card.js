// 로트 카드 v4 — 까사 정보 구조의 정돈판(결정 72 · v4-lock §6)
// 띠(마감 · 카운트다운 · 남은 시간 막대) → 사진 타일(등급 원 · 북마크 → 폴더 1·2·3 · hover 시세 비교) → 브랜드 1줄 · 이름 1줄 · 가격 1 · 배지 1
// 1시간 안이면 띠 글이 "Ending soon" 으로 바뀌고 숫자가 빨강(더윈 12). 카드 어디를 눌러도 상세 창(더윈 4). 모바일은 띠 대신 가격 줄의 알약(BaT · 결정 79)
import { usd, jpy, cardImg, lotUrl, esc, exampleAuction, countdown, localParts, KIND, shortDate, brandName, gradeName } from './data.js?v=3f060f88fb';
import { icon } from './icons.js?v=3f060f88fb';
import * as store from './store.js?v=3f060f88fb';
import { toast } from './chrome.js?v=3f060f88fb';

const HOUR = 3600000;
const DAY = 86400000;
const WINDOW = 72 * HOUR; // 예시 경매 한 회차 길이 — 띠의 진행막대 비율에만 쓴다
// 판매 방식 → 색 클래스(결정 95 · 두 색). 경매 둘(RT 실시간 입찰 · LOW 블라인드 입찰)은 'live' 초록, 고정가 MALL 은 'mall' 슬레이트. 띠·배지·점·목록 탭이 같은 이름
export const KIND_CLASS = { RT: 'live', LOW: 'live', MALL: 'mall' };

// 남은 시간 문구 — 하루 넘으면 "3 days left", 하루 안이면 시:분:초
export function remain(ends) {
  const ms = ends - Date.now();
  if (ms <= 0) return 'Ended';
  if (ms >= DAY) {
    const d = Math.floor(ms / DAY);
    return `${d} day${d > 1 ? 's' : ''} left`;
  }
  return countdown(ends);
}

// 경과 비율(%) — 띠 아래 2px 막대. 시작 시각을 알면 그걸로, 모르면 72시간 회차로 본다
export function progress(ends, start) {
  const total = start ? ends - start : WINDOW;
  const left = ends - Date.now();
  return Math.round(Math.min(100, Math.max(3, (1 - left / total) * 100)));
}

// 판매 방식 · 기한 — 상세 창·상세 페이지·카드가 같이 쓴다. kindOverride 는 상태 모음(시안 도구)에서 세 종류를 나란히 보일 때만
export function bandInfo(lot, sale, state, kindOverride = '') {
  const tz = store.setting('tz');
  if (state === 'sold') return { tone: 'done', kind: 'Sold', code: 'SOLD', date: shortDate(new Date(Date.now() - 6 * DAY)), time: '', right: '' };
  if (sale === 'B') {
    const a = exampleAuction(lot);
    return { tone: a.ends - Date.now() < HOUR ? 'hot' : '', kind: 'Live bid', code: 'RT', ...localParts(a.ends, tz), right: remain(a.ends), ends: a.ends };
  }
  const code = KIND[kindOverride] ? kindOverride : (KIND[lot.kind] ? lot.kind : 'MALL');
  const kind = KIND[code];
  if (!lot.ends) return { tone: '', kind, code, date: 'Buy it now', time: '', right: 'In stock' };
  const ends = new Date(lot.ends);
  return { tone: ends - Date.now() < HOUR ? 'hot' : '', kind, code, ...localParts(ends, tz), right: remain(ends), ends, start: lot.listed ? new Date(`${lot.listed}T12:00:00`) : null };
}

// 판매 방식 · 날짜 · 시각(좁은 화면은 시각을 뺀다) — 상세 정보 띠용
export function bandLeft(b) {
  return `<span class="bk">${esc(b.kind)}</span>${b.date ? `<span class="bd"> · ${esc(b.date)}</span>` : ''}${b.time ? `<span class="bt"> · ${esc(b.time)}</span>` : ''}`;
}

// 카드 머리 띠 — 색 = 판매 방식(결정 93). Live bid/Time limit = 마감(현지 시각) · 카운트다운 · 진행막대, Mall = "Buy it now · In stock"
// 1시간 안이면 카운트다운이 빨간 알약(warn)로 바뀌고 왼쪽 글이 "Ending soon"(결정 94 · 더윈 12)
function bandHTML(b, sale) {
  if (b.tone === 'done') return `<div class="card-band is-done"><span class="card-band-l">Ended · ${esc(b.date)}</span><b>Sold</b></div>`;
  const cls = `card-band kind-${KIND_CLASS[b.code] || 'live'}`;
  if (!b.ends) return `<div class="${cls}"><span class="card-band-l">${esc(b.kind)} · buy it now</span><b>${esc(b.right)}</b></div>`;
  const hot = b.tone === 'hot';
  // 왼쪽 글은 종류의 말투로: 실시간 입찰 = "Ends …"(마감) · Time limit(블라인드 입찰) = "bids close …" · Mall = "buy it now · until …"(상시, 올라와 있는 동안)
  const left = b.code === 'RT' ? `Ends ${esc(b.date)} · ${esc(b.time)}`
    : b.code === 'LOW' ? `${esc(b.kind)} · bids close ${esc(b.date)} · ${esc(b.time)}`
    : `${esc(b.kind)} · buy it now · until ${esc(b.date)}`;
  // Mall 은 시계(00:00:00)가 아니라 "144 days left" 꼴 — 경매처럼 보이지 않게(data-clock 없음)
  const clock = b.code === 'MALL' && !hot ? '' : 'data-clock';
  return `<div class="${cls}${hot ? ' is-hot' : ''}">
      <span class="card-band-l" data-band-left="${left}">${hot ? 'Ending soon' : left}</span>
      <b class="${hot ? 'warn' : ''}" data-ends="${b.ends.getTime()}" ${clock} data-start="${b.start ? b.start.getTime() : ''}">${clock ? countdown(b.ends) : remain(b.ends)}</b>
      <span class="card-bar" aria-hidden="true"><i style="--p:${progress(b.ends, b.start)}%"></i></span>
    </div>`;
}

// 상태 배지 1개 — 목록의 상태는 배지(규칙 D2). 입찰(B): 리저브 상태(긴급은 띠 숫자가 맡음). 정가(A): 판매 방식 배지(색 = 종류, 결정 93)
function statusBadge(lot, b, sale) {
  if (b.tone === 'done') return '<span class="badge">Sold</span>';
  if (sale === 'B') {
    const a = exampleAuction(lot);
    return { nearly: '<span class="badge action">Reserve nearly met</span>', met: '<span class="badge live">Reserve met</span>',
      not: '<span class="badge">Reserve not met</span>', none: '<span class="badge live">No reserve</span>' }[a.reserve];
  }
  return `<span class="badge ${KIND_CLASS[b.code] || ''}">${esc(b.kind)}</span>`;
}

export function cardHTML(lot, { sale = 'A', state = 'auto', note = '', kind = '' } = {}) {
  const savedAt = store.get('saved')[lot.lot];
  const saved = savedAt !== undefined;
  const folders = store.get('folders');
  const rank = lot.grade && lot.grade.overall;
  const b = bandInfo(lot, sale, state, kind);
  const sold = b.tone === 'done';
  const hot = b.tone === 'hot';
  const band = bandHTML(b, sale);
  let price;
  let sub;
  if (sale === 'B' && !sold) {
    const a = exampleAuction(lot);
    price = `<b class="price">${usd(a.bid)}</b>`;
    sub = `current bid · ${a.bids} bids`;
  } else if (lot.usd) {
    price = `<b class="price">${usd(lot.usd)}</b>`;
    sub = sold ? `Sold ${esc(b.date)}` : `≈ ${jpy(lot.jpy)}`;
  } else {
    price = '<b class="price ask">Price on request</b>';
    sub = '';
  }
  // 모바일 알약 — BaT "Bid $137,500 | ⏱ 15:10:43". 띠가 숨는 폭에서만 보인다(card.css)
  const pillClock = b.code !== 'MALL' || hot; // Mall 은 띠와 같이 "144 days left" 꼴
  const left = b.ends && !sold ? `<span class="card-left kind-${KIND_CLASS[b.code] || 'live'}${hot ? ' warn' : ''}" data-ends="${b.ends.getTime()}" ${pillClock ? 'data-clock' : ''}>${pillClock ? countdown(b.ends) : remain(b.ends)}</span>` : '';
  return `
  <article class="card${band ? ' has-band' : ''}${sold ? ' is-sold' : ''}" data-reveal data-lot="${esc(lot.lot)}" ${note ? `data-note="${esc(note)}"` : ''}>
    ${band}
    <div class="card-media">
      <img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy" decoding="async">
      ${rank ? `<span class="card-grade" title="Rank ${esc(rank)} · ${esc(gradeName(rank))}" aria-label="Rank ${esc(rank)}, ${esc(gradeName(rank))}">${esc(rank)}</span>` : ''}
      <div class="card-save-wrap">
        <button class="card-save" type="button" data-save aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save'}: ${esc(lot.title)}">${saved ? icon.heartOn : icon.heart}</button>
        <div class="card-folders" role="group" aria-label="Save to a folder">
          ${folders.map((f, i) => `<button type="button" data-folder="${i}" aria-pressed="${savedAt === i}" aria-label="Save to ${esc(f)}" title="${esc(f)}">${i + 1}</button>`).join('')}
        </div>
      </div>
      <a class="card-compare" href="${lotUrl(lot)}#price" data-compare>${icon.compare}Compare prices</a>
    </div>
    <div class="card-body">
      <p class="card-brand">${esc(brandName(lot.brand))}</p>
      <h3 class="card-title"><a href="${lotUrl(lot)}" data-open>${esc(lot.title)}</a></h3>
      <p class="card-price">${price}${sub ? `<span class="card-sub">${sub}</span>` : ''}${left}</p>
      <p class="card-status">${statusBadge(lot, b, sale)}</p>
    </div>
  </article>`;
}

// 저장 하트 · 폴더 · 카드 열기 — 카드 묶음 바깥 한 곳에서 받는다
export function bindCards(root, lots, { onOpen } = {}) {
  if (!root) return;
  root.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const lot = lots.find(x => x.lot === card.dataset.lot);
    if (!lot) return;
    const folder = e.target.closest('.card-folders [data-folder]');
    if (folder) {
      e.preventDefault();
      toggleSave(lot, folder, Number(folder.dataset.folder));
      return;
    }
    if (e.target.closest('[data-save]')) {
      e.preventDefault();
      toggleSave(lot, e.target.closest('[data-save]'));
      return;
    }
    if (e.target.closest('[data-compare]')) return; // 시세 비교는 상세 페이지의 그 자리로 그대로 간다
    // 보통 클릭 = 상세 창. 새 탭(⌘/Ctrl/Shift/가운데 버튼)은 전체 페이지로 그대로 간다
    const link = e.target.closest('[data-open]');
    if (link && onOpen && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) {
      e.preventDefault();
      onOpen(lot);
    }
  });
}

// folder 없이 부르면 하트 토글(첫 폴더에 저장 / 해제). 숫자를 주면 그 폴더로 — 같은 폴더를 다시 누르면 해제
export function toggleSave(lot, btn, folder = null) {
  const saved = store.get('saved');
  const was = saved[lot.lot];
  let on;
  if (folder === null) {
    on = was === undefined;
    if (on) saved[lot.lot] = 0; else delete saved[lot.lot];
  } else {
    on = was !== folder;
    if (on) saved[lot.lot] = folder; else delete saved[lot.lot];
  }
  store.set('saved', saved);
  const name = store.get('folders')[on ? saved[lot.lot] : 0];
  toast(on ? `Saved to ${name}` : 'Removed from saved');
  document.querySelectorAll(`.card[data-lot="${CSS.escape(lot.lot)}"]`).forEach(card => paintCard(card, on ? saved[lot.lot] : undefined, lot));
  if (btn && !btn.closest('.card')) btn.setAttribute('aria-pressed', String(on));
  return on;
}

function paintCard(card, at, lot) {
  const on = at !== undefined;
  const heart = card.querySelector('[data-save]');
  if (heart) {
    heart.setAttribute('aria-pressed', String(on));
    heart.innerHTML = on ? icon.heartOn : icon.heart;
    heart.setAttribute('aria-label', `${on ? 'Remove from saved' : 'Save'}: ${lot.title}`);
  }
  card.querySelectorAll('.card-folders [data-folder]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.folder) === at)));
}

// 남은 시간 — 화면의 카운트다운을 1초마다 한 번에 갱신. data-clock 은 시:분:초, 나머지는 "3 days left" 꼴
let ticker;
export function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    document.querySelectorAll('[data-ends]').forEach(el => {
      const ends = new Date(Number(el.dataset.ends));
      const over = ends - Date.now() <= 0;
      el.textContent = over ? 'Ended' : (el.hasAttribute('data-clock') ? countdown(ends) : remain(ends));
      const hot = !over && ends - Date.now() < HOUR;
      el.classList.toggle('warn', hot);
      const band = el.closest('.card-band');
      if (band) {
        band.classList.toggle('is-hot', hot);
        const l = band.querySelector('[data-band-left]');
        if (l) l.textContent = hot ? 'Ending soon' : l.dataset.bandLeft;
        const bar = band.querySelector('.card-bar i');
        if (bar) bar.style.setProperty('--p', `${progress(ends, el.dataset.start ? new Date(Number(el.dataset.start)) : null)}%`);
      }
      const info = el.closest('.info-band');
      if (info) info.classList.toggle('is-hot', hot);
    });
  }, 1000);
}
