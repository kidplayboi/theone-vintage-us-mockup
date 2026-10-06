// 홈 v2 — 운영 사이트 분류 그대로(판매 방식 · 카테고리 9 · 브랜드 · 정렬 · 페이지당 · 검색 · 시간대 · 쪽 번호)
// + 까사식 첫 소개 띠 · 카테고리 타일 · 마감/판매 표 · 최근 본 상품
import { loadData, usd, lotUrl, esc, shortDate, daysUntil, exampleAuction, countdown, cardImg, fullName, TIMEZONES, tzName } from './data.js?v=20c3d06a4d';
import { mountChrome, bindNewsletter } from './chrome.js?v=20c3d06a4d';
import { mountReview, paintNotes } from './review.js?v=20c3d06a4d';
import { cardHTML, bindCards, startTicker } from './card.js?v=20c3d06a4d';
import { openLot } from './lotmodal.js?v=20c3d06a4d';
import { mountHero } from './hero.js?v=20c3d06a4d';
import { initMotion, revealOnScroll } from './motion.js?v=20c3d06a4d';
import * as store from './store.js?v=20c3d06a4d';

// 운영 사이트 순서 그대로(10/6 실측)
const KINDS = [['', 'All lots'], ['RT', 'Live bid'], ['LOW', 'Time limit'], ['MALL', 'Mall']];
const CATS = ['Watch', 'Bag', 'Jewelry', 'Clothing', 'Accessories', 'Tableware', 'Variety', 'Coin'];
const SALE_KICKER = { premium: 'Premium Auction', express: 'Express', classic: 'Classic' };
// 판매 기록이 아직 없다 — 행은 기획안 21쪽 예시, 금액은 자리표시
const SOLD_EXAMPLES = [['Hermès Garden Party', 'Sep 30'], ['Hermès Bolide 1923 Mini', 'Sep 30'], ['Hermès Evelyne TPM', 'Sep 29'], ['Hermès Bastia Coin Case', 'Sep 29']];

const params = new URLSearchParams(location.search);
const ui = {
  sale: SALE_KICKER[params.get('sale')] ? params.get('sale') : 'premium',
  kind: '', cat: params.get('cat') || 'All', brand: '', sort: 'featured', per: 20, page: 1, q: '',
};
let data;

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const brandMatch = (lot, option) => { const a = norm(lot.brand), b = norm(option); return a === b || a.startsWith(b) || b.startsWith(a); };

async function main() {
  try {
    data = await loadData();
    document.body.dataset.rate = data.meta.rate;
    document.body.dataset.snapshot = data.meta.snapshotAt;
  } catch (err) {
    console.error('[mockup] could not load lots', err);
  }
  mountReview({ page: 'home' });
  mountChrome({ page: ui.sale, overlay: true });
  bindNewsletter();
  mountHero();
  if (!data) {
    document.querySelector('[data-grid]').innerHTML = '<p class="empty">We couldn\'t load the lots. Please refresh the page.</p>';
    return;
  }
  document.querySelectorAll('[data-total]').forEach(el => { el.textContent = data.meta.total.toLocaleString('en-US'); });
  fillSelects();
  bindControls();
  bindCards(document.querySelector('[data-grid]'), data.lots, { onOpen: openLot });
  bindCards(document.querySelector('[data-recent-grid]'), data.lots, { onOpen: openLot });
  renderCatTiles();
  render();
  startTicker();
  initMotion();
  window.addEventListener('store:change', e => {
    if (e.detail.key === 'recent') { renderRecent(); revealOnScroll(); return; } // 상세 창을 열 때마다 그리드 전체를 다시 그리지 않게
    if (['settings', 'signedIn', '*'].includes(e.detail.key)) render();
  });
}

function render() {
  renderKinds();
  renderCats();
  renderGrid();
  renderTables();
  renderRecent();
  paintNotes();
  revealOnScroll();
}

function renderKinds() {
  const k = data.meta.kinds || {};
  document.querySelector('[data-kinds]').innerHTML = KINDS.map(([code, name]) => `
    <button type="button" role="tab" class="kind-tab" data-kind="${code}" aria-selected="${ui.kind === code}">
      ${name}<span class="num">${(k[code] ?? 0).toLocaleString('en-US')}</span></button>`).join('');
  document.querySelector('[data-sale-kicker]').textContent = SALE_KICKER[ui.sale];
}

function renderCats() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  const chip = (name, n) => `<button class="chip" type="button" data-cat="${name}" aria-pressed="${ui.cat === name}">${name}${n !== undefined ? ` <span class="n">${n.toLocaleString('en-US')}</span>` : ''}</button>`;
  document.querySelector('[data-cats]').innerHTML = chip('All') + CATS.map(c => chip(c, counts[c] || 0)).join('');
}

function filtered() {
  if (ui.sale !== 'premium') return [];
  const q = ui.q.trim().toLowerCase();
  let list = data.lots.filter(x =>
    (!ui.kind || x.kind === ui.kind) &&
    (ui.cat === 'All' || x.genre === ui.cat) &&
    (!ui.brand || brandMatch(x, ui.brand)) &&
    (!q || `${x.brand} ${x.title} ${x.sub} ${x.lot}`.toLowerCase().includes(q)));
  if (ui.sort === 'high') list = [...list].sort((a, b) => b.usd - a.usd);
  if (ui.sort === 'low') list = [...list].sort((a, b) => (a.usd || Infinity) - (b.usd || Infinity));
  if (ui.sort === 'new') list = [...list].sort((a, b) => b.listed.localeCompare(a.listed));
  return list;
}

function liveCount() {
  if (ui.sale !== 'premium') return 0;
  if (ui.kind) return (data.meta.kinds || {})[ui.kind] || 0;
  if (ui.cat !== 'All') return (data.meta.categories.find(c => c.name === ui.cat) || { n: 0 }).n;
  if (ui.brand) return (data.meta.brands.find(b => b.name === ui.brand) || { n: 0 }).n;
  return data.meta.total;
}

function renderGrid() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / ui.per));
  ui.page = Math.min(ui.page, pages);
  const grid = document.querySelector('[data-grid]');
  const sale = store.setting('sale');
  document.querySelector('[data-count]').innerHTML = `<span class="num">${liveCount().toLocaleString('en-US')}</span> lots available`;
  document.querySelector('[data-tz-name]').textContent = tzName(store.setting('tz'));
  if (!list.length) {
    const kindName = (KINDS.find(k => k[0] === ui.kind) || [])[1];
    grid.innerHTML = `<div class="empty">
      <span class="kicker">${ui.sale !== 'premium' ? SALE_KICKER[ui.sale] : (ui.kind ? kindName : 'Nothing here yet')}</span>
      <p class="display d2">${ui.sale !== 'premium' || ui.kind ? 'No lots listed right now' : 'Nothing matches these filters'}</p>
      <p class="muted">${ui.sale !== 'premium' || ui.kind ? 'New lots are listed every week. Premium lots are available today.' : 'Try another category or brand, or clear the search.'}</p>
      <button class="btn ghost" type="button" data-reset>${ui.sale !== 'premium' ? 'Browse Premium lots' : 'Clear filters'}</button></div>`;
    document.querySelector('[data-pages]').innerHTML = '';
    return;
  }
  const start = (ui.page - 1) * ui.per;
  grid.innerHTML = list.slice(start, start + ui.per).map((lot, i) => cardHTML(lot, {
    sale,
    note: i === 0 && ui.page === 1 ? '카드 v2 — 맨 위 초록 띠(운영 사이트 #3F6B4E · 까사 마감 띠): 판매 방식 · 기한(선택한 시간대) · 남은 일수, 1시간 안이면 빨강(더윈 12). 사진 위 등급·출발지 배지(운영 사이트). 달러는 Cormorant 큰 숫자(더윈 5). 누르면 상세 창(더윈 4).' : '',
  })).join('');
  renderPages(pages, list.length);
}

// 쪽 번호 — 운영 사이트처럼 ‹ 1 2 3 … N ›
function renderPages(pages, count) {
  const nav = document.querySelector('[data-pages]');
  if (pages <= 1) {
    nav.innerHTML = `<p class="t13 muted">Showing ${count} in this preview</p>`;
    return;
  }
  const nums = [...new Set([1, ui.page - 1, ui.page, ui.page + 1, pages])].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
  let html = `<button type="button" class="page-btn" data-page="${ui.page - 1}" ${ui.page === 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>`;
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) html += '<span class="page-gap">…</span>';
    html += `<button type="button" class="page-btn" data-page="${n}" ${n === ui.page ? 'aria-current="page"' : ''}>${n}</button>`;
  });
  html += `<button type="button" class="page-btn" data-page="${ui.page + 1}" ${ui.page === pages ? 'disabled' : ''} aria-label="Next page">›</button>`;
  nav.innerHTML = `${html}<p class="t13 muted">Page ${ui.page} of ${pages} · ${count} lots in this preview</p>`;
}

function renderTables() {
  const sale = store.setting('sale');
  document.querySelector('[data-ending-title]').textContent = sale === 'B' ? 'Ending soon' : 'Leaving soon';
  document.querySelector('[data-ending-col]').textContent = sale === 'B' ? 'Ends in' : 'Until';
  const rows = sale === 'B'
    ? [...data.lots].filter(x => x.usd).sort((a, b) => exampleAuction(a).ends - exampleAuction(b).ends).slice(0, 5)
    : data.lots.filter(x => x.usd && x.until).sort((a, b) => a.until.localeCompare(b.until)).slice(0, 5);
  document.querySelector('[data-ending-rows]').innerHTML = rows.map(x => {
    const a = exampleAuction(x);
    const when = sale === 'B'
      ? `<span class="num${a.ends - Date.now() < 3600000 ? ' warn' : ''}" data-ends="${a.ends.getTime()}">${countdown(a.ends)}</span>`
      : `<span class="${daysUntil(x.until) <= 7 ? 'warn' : ''}">${shortDate(x.until)}</span>`;
    return `<tr><td><a class="tbl-lot" href="${lotUrl(x)}" data-lot-link="${esc(x.lot)}">${esc(fullName(x))}</a></td>
      <td class="r tbl-price">${usd(sale === 'B' ? a.bid : x.usd)}</td><td class="r num">${when}</td></tr>`;
  }).join('');
  document.querySelector('[data-sold-rows]').innerHTML = SOLD_EXAMPLES.map(([name, date]) =>
    `<tr><td>${name}</td><td class="r tbl-price">$X,XXX</td><td class="r num">${date}</td></tr>`).join('');
  document.querySelector('[data-lock]').hidden = store.get('signedIn');
}

// 카테고리 사진 타일 — 사진은 그 카테고리 첫 상품, 숫자는 실재고 전체
const TILE = [['Bag', 'Bags'], ['Watch', 'Watches'], ['Jewelry', 'Jewelry'], ['Clothing', 'Clothing'], ['Accessories', 'Accessories']];
function renderCatTiles() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  const host = document.querySelector('[data-cat-tiles]');
  host.innerHTML = TILE.map(([genre, label], i) => {
    const lot = data.lots.find(x => x.genre === genre && x.usd >= 300) || data.lots.find(x => x.genre === genre);
    return `<a class="cat-tile" href="index.html?cat=${genre}#lots" data-tile="${genre}" data-reveal>
      <span class="cat-photo">${lot ? `<img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy">` : ''}</span>
      <span class="cat-meta"><span class="roman">${['I', 'II', 'III', 'IV', 'V'][i]}</span><b>${label}</b><span class="num">${(counts[genre] || 0).toLocaleString('en-US')}</span></span></a>`;
  }).join('');
  host.addEventListener('click', e => {
    const tile = e.target.closest('[data-tile]');
    if (!tile) return;
    e.preventDefault();
    Object.assign(ui, { sale: 'premium', cat: tile.dataset.tile, page: 1 });
    syncUrl();
    render();
    document.getElementById('lots').scrollIntoView({ behavior: 'smooth' });
  });
}

function renderRecent() {
  const lots = store.get('recent').map(id => data.lots.find(x => x.lot === id)).filter(Boolean).slice(0, 4);
  document.querySelector('[data-recent]').hidden = !lots.length;
  document.querySelector('[data-recent-grid]').innerHTML = lots.map(lot => cardHTML(lot, { sale: store.setting('sale') })).join('');
}

function fillSelects() {
  const brandSel = document.querySelector('[data-brand]');
  brandSel.innerHTML = '<option value="">All brands</option>' +
    data.meta.brands.map(b => `<option value="${esc(b.name)}">${esc(b.name)} (${b.n.toLocaleString('en-US')})</option>`).join('');
  const tzSel = document.querySelector('[data-tz]');
  const tz = store.setting('tz');
  tzSel.innerHTML = TIMEZONES.map(([v, label]) => `<option value="${v}" ${v === tz ? 'selected' : ''}>${label}</option>`).join('');
}

function syncUrl() {
  const p = new URLSearchParams();
  if (ui.sale !== 'premium') p.set('sale', ui.sale);
  if (ui.cat !== 'All') p.set('cat', ui.cat);
  history.replaceState(null, '', `${location.pathname}${p.toString() ? '?' + p : ''}${location.hash}`);
}

function bindControls() {
  const lots = document.getElementById('lots');
  const top = () => lots.scrollIntoView({ behavior: 'smooth', block: 'start' });
  lots.addEventListener('click', e => {
    const kind = e.target.closest('[data-kind]');
    const cat = e.target.closest('[data-cat]');
    const page = e.target.closest('[data-page]');
    if (kind) Object.assign(ui, { kind: kind.dataset.kind, page: 1 });
    else if (cat) Object.assign(ui, { cat: cat.dataset.cat, page: 1 });
    else if (page && !page.disabled) { ui.page = Number(page.dataset.page); renderGrid(); paintNotes(); revealOnScroll(); top(); return; }
    else if (e.target.closest('[data-reset]')) {
      Object.assign(ui, { sale: 'premium', kind: '', cat: 'All', brand: '', q: '', page: 1 });
      lots.querySelector('[data-brand]').value = '';
      lots.querySelector('[data-q]').value = '';
    } else return;
    syncUrl();
    render();
  });
  lots.querySelector('[data-brand]').addEventListener('change', e => { ui.brand = e.target.value; ui.page = 1; render(); });
  lots.querySelector('[data-sort]').addEventListener('change', e => { ui.sort = e.target.value; ui.page = 1; render(); });
  lots.querySelector('[data-per]').addEventListener('change', e => { ui.per = Number(e.target.value); ui.page = 1; render(); });
  lots.querySelector('[data-tz]').addEventListener('change', e => store.setSetting('tz', e.target.value));
  let t;
  lots.querySelector('[data-q]').addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => { ui.q = e.target.value; ui.page = 1; renderGrid(); paintNotes(); revealOnScroll(); }, 150);
  });
  document.querySelector('[data-recent-clear]').addEventListener('click', () => store.set('recent', []));
  // 표의 상품 이름도 상세 창으로(새 탭은 그대로)
  document.getElementById('ending').addEventListener('click', e => {
    const a = e.target.closest('[data-lot-link]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const lot = data.lots.find(x => x.lot === a.dataset.lotLink);
    if (lot) { e.preventDefault(); openLot(lot); }
  });
}

main();
