// 목록 페이지 v3 — 운영 사이트 분류 전부(형 10/6 "없애면 안 댐"): 판매 방식 탭 4 · 카테고리 9(개수) · 브랜드 40(개수) ·
// 정렬 · 페이지당 20/50/100 · 검색 · 시간대 · 쪽 번호 · Premium/Express/Classic. 탭 모양은 Bezel 경매 목록(Live 327 / Ending soon 108)
import { loadData, esc, exampleAuction, tzName, TIMEZONES, brandName } from './data.js?v=1db980d128';
import { mountChrome, bindNewsletter, CATEGORIES } from './chrome.js?v=1db980d128';
import { mountReview, paintNotes } from './review.js?v=1db980d128';
import { cardHTML, bindCards, startTicker } from './card.js?v=1db980d128';
import { openLot } from './lotmodal.js?v=1db980d128';
import { initMotion, revealOnScroll } from './motion.js?v=1db980d128';
import * as store from './store.js?v=1db980d128';

const KINDS = [['', 'All lots'], ['RT', 'Live bid'], ['LOW', 'Time limit'], ['MALL', 'Mall']];
const SALES = { premium: 'Premium Auction', express: 'Express', classic: 'Classic' };
// 운영 정렬 4종 + 마감 임박(경매 목록 Bezel 'Ending soon' — 운영에 없는 추가, 형 확정 10/6 유지 · 결정 91)
const SORTS = [['featured', 'Featured'], ['new', 'Newest'], ['ending', 'Ending soon'], ['low', 'Price: low to high'], ['high', 'Price: high to low']];
const CAT_LABEL = Object.fromEntries(CATEGORIES);

const params = new URLSearchParams(location.search);
const ui = {
  sale: SALES[params.get('sale')] ? params.get('sale') : 'premium',
  kind: KINDS.some(k => k[0] === params.get('kind')) ? params.get('kind') : '',
  cat: CAT_LABEL[params.get('cat')] ? params.get('cat') : '',
  brand: params.get('brand') || '',
  sort: SORTS.some(s => s[0] === params.get('sort')) ? params.get('sort') : 'featured',
  per: 20, page: 1, q: params.get('q') || '',
};
let data;
const $ = sel => document.querySelector(sel);
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
  mountReview({ page: 'shop' });
  mountChrome({ page: ui.sale, cat: ui.cat, data });
  bindNewsletter();
  if (!data) {
    $('[data-grid]').innerHTML = '<p class="empty">We couldn\'t load the lots. Please refresh the page.</p>';
    return;
  }
  if (ui.brand && !data.meta.brands.some(b => b.name === ui.brand)) ui.brand = '';
  fillSelects();
  bindControls();
  bindCards($('[data-grid]'), data.lots, { onOpen: openLot });
  render();
  startTicker();
  initMotion();
  window.addEventListener('store:change', e => {
    if (['settings', 'signedIn', '*'].includes(e.detail.key)) render();
  });
}

function render() {
  renderHead();
  renderKinds();
  renderCats();
  renderGrid();
  paintNotes();
  revealOnScroll();
}

function title() {
  if (ui.q) return `Results for “${esc(ui.q)}”`;
  if (ui.brand) return esc(brandName(ui.brand));
  if (ui.cat) return CAT_LABEL[ui.cat];
  return ui.sale === 'premium' ? 'All lots' : SALES[ui.sale];
}

function renderHead() {
  $('[data-shop-title]').innerHTML = title();
  const plain = title().replace(/<[^>]+>/g, '');
  document.title = plain === SALES[ui.sale] ? `${plain} | TheOne Vintage` : `${plain} — ${SALES[ui.sale]} | TheOne Vintage`;
  const trail = [`<a href="index.html">Home</a>`, `<a href="shop.html${ui.sale !== 'premium' ? `?sale=${ui.sale}` : ''}">${SALES[ui.sale]}</a>`];
  if (ui.cat) trail.push(`<span>${CAT_LABEL[ui.cat]}</span>`);
  if (ui.brand) trail.push(`<span>${esc(brandName(ui.brand))}</span>`);
  $('[data-crumbs]').innerHTML = trail.join('<span aria-hidden="true">/</span>');
  $('[data-tz-name]').textContent = tzName(store.setting('tz'));
}

// 판매 방식 숫자 = 운영 API. 입찰(B) 시안에서는 전 재고를 Live bid 로 본다(검토 막대에서 A 로 바꾸면 운영 숫자 그대로)
function kindCounts() {
  const k = data.meta.kinds || {};
  if (store.setting('sale') !== 'B') return k;
  return { '': data.meta.total, RT: data.meta.total, LOW: 0, MALL: 0 };
}

function renderKinds() {
  const k = kindCounts();
  $('[data-kinds]').innerHTML = KINDS.map(([code, name]) => `
    <button type="button" role="tab" class="kind-tab" data-kind="${code}" aria-selected="${ui.kind === code}">
      ${code === 'RT' ? '<span class="dot"></span>' : ''}${name}<span class="num">${(k[code] ?? 0).toLocaleString('en-US')}</span></button>`).join('');
}

function renderCats() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  const chip = (key, label, n) => `<button class="chip" type="button" data-cat="${key}" aria-pressed="${ui.cat === key}">${label} <span class="n">${n.toLocaleString('en-US')}</span></button>`;
  $('[data-cats]').innerHTML = chip('', 'All', data.meta.total) + CATEGORIES.map(([key, label]) => chip(key, label, counts[key] || 0)).join('');
}

function kindOf(lot) {
  return store.setting('sale') === 'B' ? 'RT' : lot.kind;
}

function filtered() {
  if (ui.sale !== 'premium') return [];
  const q = ui.q.trim().toLowerCase();
  let list = data.lots.filter(x =>
    (!ui.kind || kindOf(x) === ui.kind) &&
    (!ui.cat || x.genre === ui.cat) &&
    (!ui.brand || brandMatch(x, ui.brand)) &&
    (!q || `${x.brand} ${x.title} ${x.sub} ${x.lot}`.toLowerCase().includes(q)));
  const bidding = store.setting('sale') === 'B';
  if (ui.sort === 'high') list = [...list].sort((a, b) => b.usd - a.usd);
  if (ui.sort === 'low') list = [...list].sort((a, b) => (a.usd || Infinity) - (b.usd || Infinity));
  if (ui.sort === 'new') list = [...list].sort((a, b) => b.listed.localeCompare(a.listed));
  if (ui.sort === 'ending') {
    list = bidding
      ? [...list].sort((a, b) => exampleAuction(a).ends - exampleAuction(b).ends)
      : [...list].sort((a, b) => (a.ends || '9').localeCompare(b.ends || '9'));
  }
  return list;
}

// 운영 사이트 전체 숫자(이 시안 데이터는 그중 일부)
function liveCount() {
  if (ui.sale !== 'premium') return 0;
  if (ui.q) return null;
  const k = kindCounts();
  if (ui.kind && !k[ui.kind]) return 0;
  if (ui.cat) return (data.meta.categories.find(c => c.name === ui.cat) || { n: 0 }).n;
  if (ui.brand) return (data.meta.brands.find(b => b.name === ui.brand) || { n: 0 }).n;
  return ui.kind ? k[ui.kind] : data.meta.total;
}

function renderGrid() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / ui.per));
  ui.page = Math.min(ui.page, pages);
  const grid = $('[data-grid]');
  const sale = store.setting('sale');
  const live = liveCount();
  $('[data-count]').innerHTML = live === null
    ? `<span class="num">${list.length}</span> matching lots in this preview`
    : `<span class="num">${live.toLocaleString('en-US')}</span> lots available`;
  if (!list.length) {
    const kindName = (KINDS.find(k => k[0] === ui.kind) || [])[1];
    const none = ui.sale !== 'premium' || (ui.kind && !liveCount());
    grid.innerHTML = `<div class="empty">
      <p class="label">${ui.sale !== 'premium' ? SALES[ui.sale] : (ui.kind ? kindName : 'No results')}</p>
      <p class="display">${none ? 'No lots listed right now' : 'Nothing matches these filters'}</p>
      <p class="muted">${none ? 'New lots are listed every week. Premium Auction lots are available today.' : 'Try another category or brand, or clear the search.'}</p>
      <button class="btn ghost" type="button" data-reset>${ui.sale !== 'premium' ? 'Browse Premium Auction' : 'Clear filters'}</button></div>`;
    $('[data-pages]').innerHTML = '';
    return;
  }
  const start = (ui.page - 1) * ui.per;
  grid.innerHTML = list.slice(start, start + ui.per).map((lot, i) => cardHTML(lot, {
    sale,
    note: i === 0 && ui.page === 1 ? '카드 v3 — Bezel 상품 칸(타일·브랜드 대문자·이름·가격). 운영 사이트 카드 띠의 정보는 그대로: 판매 방식 = 사진 위 알약, 기한 현지 시각·남은 일수 = 아랫줄, 등급·출발지 = 회색 줄. 1시간 안이면 빨강(더윈 12). 누르면 상세 창(더윈 4).' : '',
  })).join('');
  renderPages(pages, list.length);
}

// 쪽 번호 — 운영 사이트처럼 ‹ 1 2 3 … N ›
function renderPages(pages, count) {
  const nav = $('[data-pages]');
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
  nav.innerHTML = `<div class="page-row">${html}</div><p class="t13 muted">Page ${ui.page} of ${pages} · ${count} lots in this preview</p>`;
}

function fillSelects() {
  const brands = [...data.meta.brands.filter(b => b.name !== 'Others'), ...data.meta.brands.filter(b => b.name === 'Others')];
  $('[data-brand]').innerHTML = '<option value="">All brands</option>' +
    brands.map(b => `<option value="${esc(b.name)}" ${b.name === ui.brand ? 'selected' : ''}>${esc(brandName(b.name))} (${b.n.toLocaleString('en-US')})</option>`).join('');
  $('[data-sort]').innerHTML = SORTS.map(([v, label]) => `<option value="${v}" ${v === ui.sort ? 'selected' : ''}>${label}</option>`).join('');
  const tz = store.setting('tz');
  $('[data-tz]').innerHTML = TIMEZONES.map(([v, label]) => `<option value="${v}" ${v === tz ? 'selected' : ''}>${label}</option>`).join('');
  $('[data-q]').value = ui.q;
}

function syncUrl() {
  const p = new URLSearchParams();
  if (ui.sale !== 'premium') p.set('sale', ui.sale);
  if (ui.kind) p.set('kind', ui.kind);
  if (ui.cat) p.set('cat', ui.cat);
  if (ui.brand) p.set('brand', ui.brand);
  if (ui.q) p.set('q', ui.q);
  if (ui.sort !== 'featured') p.set('sort', ui.sort);
  history.replaceState(null, '', `${location.pathname}${p.toString() ? '?' + p : ''}`);
  // 카테고리 줄의 현재 위치 표시도 같이
  document.querySelectorAll('.cat-row a').forEach(a => {
    const key = new URL(a.href).searchParams.get('cat') || '';
    if (key === ui.cat && ui.sale === 'premium') a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

function bindControls() {
  const main = $('main');
  const top = () => $('[data-shop-top]').scrollIntoView({ behavior: 'smooth', block: 'start' });
  main.addEventListener('click', e => {
    const kind = e.target.closest('[data-kind]');
    const cat = e.target.closest('[data-cat]');
    const page = e.target.closest('[data-page]');
    if (kind) Object.assign(ui, { kind: kind.dataset.kind, page: 1 });
    else if (cat) Object.assign(ui, { cat: cat.dataset.cat, page: 1 });
    else if (page && !page.disabled) { ui.page = Number(page.dataset.page); renderGrid(); paintNotes(); revealOnScroll(); top(); return; }
    else if (e.target.closest('[data-reset]')) {
      Object.assign(ui, { sale: 'premium', kind: '', cat: '', brand: '', q: '', page: 1 });
      $('[data-brand]').value = '';
      $('[data-q]').value = '';
      const siteQ = document.getElementById('site-q');
      if (siteQ) siteQ.value = '';
    } else return;
    syncUrl();
    render();
  });
  $('[data-brand]').addEventListener('change', e => { ui.brand = e.target.value; ui.page = 1; syncUrl(); render(); });
  $('[data-sort]').addEventListener('change', e => { ui.sort = e.target.value; ui.page = 1; syncUrl(); render(); });
  $('[data-per]').addEventListener('change', e => { ui.per = Number(e.target.value); ui.page = 1; render(); });
  $('[data-tz]').addEventListener('change', e => store.setSetting('tz', e.target.value));
  let t;
  $('[data-q]').addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => { ui.q = e.target.value; ui.page = 1; syncUrl(); renderHead(); renderGrid(); paintNotes(); revealOnScroll(); }, 150);
  });
  // 헤더 검색칸도 이 페이지에서는 바로 거른다
  const siteForm = document.querySelector('[data-search]');
  if (siteForm) siteForm.addEventListener('submit', e => {
    e.preventDefault();
    ui.q = siteForm.q.value.trim();
    $('[data-q]').value = ui.q;
    ui.page = 1;
    syncUrl();
    render();
  });
}

main();
