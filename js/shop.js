// 목록 페이지 v3 — 운영 사이트 분류 전부(형 10/6 "없애면 안 댐"): 판매 방식 탭 4 · 카테고리 9(개수) · 브랜드 40(개수) ·
// 정렬 · 페이지당 20/50/100 · 검색 · 시간대 · 쪽 번호 · Premium/Express/Classic. 탭 모양은 Bezel 경매 목록(Live 327 / Ending soon 108)
import { loadData, esc, exampleAuction, tzName, TIMEZONES, brandName } from './data.js?v=aa557cef18';
import { mountChrome, bindNewsletter, CATEGORIES, brandList } from './chrome.js?v=aa557cef18';
import { mountReview, paintNotes } from './review.js?v=aa557cef18';
import { cardHTML, bindCards, startTicker } from './card.js?v=aa557cef18';
import { icon } from './icons.js?v=aa557cef18';
import { openLot } from './lotmodal.js?v=aa557cef18';
import { initMotion, revealOnScroll } from './motion.js?v=aa557cef18';
import { featuredLots, featuredHTML, bindFeatured } from './featured.js?v=aa557cef18';
import * as store from './store.js?v=aa557cef18';

const KINDS = [['', 'All lots'], ['RT', 'Live bid'], ['LOW', 'Time limit'], ['MALL', 'Mall']];
// 탭 툴팁 한 줄(마우스 올리면). 탭 아래 색 설명문은 뺐다(10/7 · 설명이 필요한 색 = 못 읽히는 색). Time limit = 블라인드 입찰(형 10/6) — 의뢰처 확인 항목
const KIND_TIP = {
  '': 'Everything listed this week',
  RT: 'Open auction — bid until the timer ends; a late bid adds time',
  LOW: 'Sealed bidding — place your best bid before the deadline',
  MALL: 'Fixed price — buy any time, no bidding',
};
const SALES = { premium: 'Premium Auction', express: 'Express', classic: 'Classic' };
// 운영 정렬 4종 + 마감 임박(경매 목록 Bezel 'Ending soon' — 운영에 없는 추가, 형 확정 10/6 유지 · 결정 91)
const SORTS = [['featured', 'Featured'], ['new', 'Newest'], ['ending', 'Ending soon'], ['low', 'Price: low to high'], ['high', 'Price: high to low']];
const CAT_LABEL = Object.fromEntries(CATEGORIES);
// 가격대 · 상태 필터(결정 102) — 운영 사이트에 없는 추가(형 10/6 "부족한 것 채워"). 입찰(B)에선 현재가 기준
const PRICES = [['', 'Any price'], ['u1', 'Under $1,000'], ['1-5', '$1,000 – $5,000'], ['5-20', '$5,000 – $20,000'], ['20+', '$20,000 and up']];
const GRADES_F = [['', 'Any condition'], ['S', 'Rank S · Unused'], ['A', 'Rank A · Excellent'], ['B', 'Rank B · Very good'], ['C', 'Rank C · Good'], ['D', 'Rank D · Fair'], ['none', 'Not graded']];
const inPrice = (v, key) => !key || (key === 'u1' ? v < 1000 : key === '1-5' ? v >= 1000 && v < 5000 : key === '5-20' ? v >= 5000 && v < 20000 : v >= 20000);

const params = new URLSearchParams(location.search);
const ui = {
  sale: SALES[params.get('sale')] ? params.get('sale') : 'premium',
  kind: KINDS.some(k => k[0] === params.get('kind')) ? params.get('kind') : '',
  cat: CAT_LABEL[params.get('cat')] ? params.get('cat') : '',
  brand: params.get('brand') || '',
  sort: SORTS.some(s => s[0] === params.get('sort')) ? params.get('sort') : 'featured',
  price: PRICES.some(p => p[0] === params.get('price')) ? params.get('price') : '',
  grade: GRADES_F.some(g => g[0] === params.get('grade')) ? params.get('grade') : '',
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

// 'Filters' 버튼(모든 폭 · 결정 113 → 123) — 켜진 필터 수 + 요약. 브랜드 · 카테고리 · 검색 · 가격 · 상태 · 페이지당은 접힌 패널 안
let filtersOpen = false;
function renderFiltersBar() {
  const active = [];
  if (ui.brand) active.push(brandName(ui.brand));
  if (ui.cat) active.push(CAT_LABEL[ui.cat]);
  if (ui.price) active.push((PRICES.find(p => p[0] === ui.price) || [])[1]);
  if (ui.grade) active.push((GRADES_F.find(g => g[0] === ui.grade) || [])[1]);
  if (ui.q) active.push(`“${ui.q}”`);
  $('[data-filters-count]').textContent = active.length ? String(active.length) : '';
  $('[data-filters-summary]').textContent = active.length ? active.join(' · ') : 'Brand, category, price, condition';
  const btn = $('[data-filters-toggle]');
  btn.setAttribute('aria-expanded', String(filtersOpen));
  $('[data-filters-more]').classList.toggle('is-open', filtersOpen);
}

// Featured 띠(결정 123) — 기본 보기(필터 · 검색 없음 · 1쪽)에서만. 입찰(B)은 예시 데이터가 켜져 있어야 현재가가 있다
function renderFeatured() {
  const sec = $('[data-featured]');
  const plain = ui.sale === 'premium' && !ui.kind && !ui.cat && !ui.brand && !ui.q && !ui.price && !ui.grade && ui.page === 1;
  const sale = store.setting('sale');
  const lots = plain && (sale !== 'B' || store.setting('examples')) ? featuredLots(data.lots, sale) : [];
  sec.hidden = !lots.length;
  if (!lots.length) { sec.innerHTML = ''; return; }
  sec.innerHTML = featuredHTML(lots, sale);
  bindFeatured(sec, data.lots, { onOpen: openLot });
}

function render() {
  renderHead();
  $('[data-filters]').hidden = ui.sale !== 'premium'; // Express · Classic 은 재고 0 — 필터 대신 설명 빈 상태
  renderFeatured();
  renderFiltersBar();
  renderKinds();
  renderCats();
  renderBrands();
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
// 고른 카테고리·브랜드 안의 숫자로(형 10/6 "Jewelry 골랐는데 Live bid 24,132" 지적). Express·Classic 은 운영 재고 0
function kindCounts() {
  if (ui.sale !== 'premium') return { '': 0, RT: 0, LOW: 0, MALL: 0 };
  const k = data.meta.kinds || {};
  const total = data.meta.total || 1;
  const base = ui.cat ? (data.meta.categories.find(c => c.name === ui.cat) || { n: 0 }).n
    : ui.brand ? (data.meta.brands.find(b => b.name === ui.brand) || { n: 0 }).n : total;
  if (store.setting('sale') === 'B') return { '': base, RT: base, LOW: 0, MALL: 0 };
  const part = v => (v ? Math.round(v / total * base) : 0); // 운영 API 는 종류별 개수를 전체로만 준다 → 비율로 나눈다
  const rt = part(k.RT), low = part(k.LOW);
  return { '': base, RT: rt, LOW: low, MALL: Math.max(0, base - rt - low) };
}

function renderKinds() {
  const k = kindCounts();
  // 세그먼트 + 아이콘(결정 99): 망치 = 실시간 입찰 · 시계 = 블라인드 입찰 · 가격표 = 고정가. 색은 두 묶음(초록 경매 · 파랑 고정가)
  const ICON = { RT: icon.gavel, LOW: icon.clock, MALL: icon.tag };
  $('[data-kinds]').innerHTML = KINDS.map(([code, name]) => `
    <button type="button" role="tab" class="kind-tab" data-kind="${code}" aria-selected="${ui.kind === code}" title="${KIND_TIP[code]}">
      ${ICON[code] || ''}${name}<span class="num">${(k[code] ?? 0).toLocaleString('en-US')}</span></button>`).join('');
}

// 카테고리 — 아이콘 칩. 경매에서 가장 많이 사는 셋(Bags · Watches · Jewelry)을 앞에 모으고 선으로 구분(형 10/6 · 결정 100). 운영 9개는 전부 남는다
const CAT_ICON = { Bag: 'bag', Watch: 'watch', Jewelry: 'gem', Clothing: 'shirt', Accessories: 'glasses', Variety: 'sparkles', Tableware: 'cup', Coin: 'coin' };
const CAT_MAIN = ['Bag', 'Watch', 'Jewelry'];
function renderCats() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  const chip = (key, label, n) => `<button class="chip" type="button" data-cat="${key}" aria-pressed="${ui.cat === key}">${CAT_ICON[key] ? icon[CAT_ICON[key]] : ''}${label} <span class="n">${n.toLocaleString('en-US')}</span></button>`;
  const main = CATEGORIES.filter(([k]) => CAT_MAIN.includes(k));
  const rest = CATEGORIES.filter(([k]) => !CAT_MAIN.includes(k));
  $('[data-cats]').innerHTML = chip('', 'All', data.meta.total)
    + main.map(([key, label]) => chip(key, label, counts[key] || 0)).join('')
    + '<span class="chip-sep" aria-hidden="true"></span>'
    + rest.map(([key, label]) => chip(key, label, counts[key] || 0)).join('');
}

// 브랜드 — 드롭다운 대신 칩(형 10/6 · 결정 100). 주요 8(홈 큐레이션과 같음) + 'More brands' 로 40개 전부
const BRAND_TOP = ['HERMES', 'LOUIS VUITTON', 'CHANEL', 'ROLEX', 'Cartier', 'Christian Dior', 'Van Cleef&Arpels', 'Gucci'];
let brandsOpen = false;
function renderBrands() {
  const all = brandList(data);
  const top = BRAND_TOP.map(n => all.find(b => b.name === n)).filter(Boolean);
  const rest = all.filter(b => !BRAND_TOP.includes(b.name));
  const chip = b => `<button class="chip" type="button" data-brand-chip="${esc(b.name)}" aria-pressed="${ui.brand === b.name}">${esc(brandName(b.name))} <span class="n">${b.n.toLocaleString('en-US')}</span></button>`;
  const pickedInRest = rest.find(b => b.name === ui.brand);
  $('[data-brands]').innerHTML = `<button class="chip" type="button" data-brand-chip="" aria-pressed="${!ui.brand}">All brands <span class="n">${all.length}</span></button>`
    + top.map(chip).join('')
    + (pickedInRest && !brandsOpen ? chip(pickedInRest) : '');
  // 'More brands' 는 스크롤 줄 밖에 고정(결정 101) — 줄이 넘쳐도 늘 보인다
  const toggle = $('[data-brands-toggle]');
  toggle.setAttribute('aria-expanded', String(brandsOpen));
  toggle.firstChild.textContent = brandsOpen ? 'Fewer brands' : `More brands`;
  const panel = $('[data-brands-all]');
  panel.hidden = !brandsOpen;
  panel.innerHTML = rest.map(chip).join('');
}

function kindOf(lot) {
  return store.setting('sale') === 'B' ? 'RT' : lot.kind;
}

function filtered() {
  if (ui.sale !== 'premium') return [];
  const q = ui.q.trim().toLowerCase();
  const bidding = store.setting('sale') === 'B';
  const priceOf = x => (bidding ? exampleAuction(x).bid : x.usd);
  const gradeOf = x => (x.grade && x.grade.overall) || 'none';
  let list = data.lots.filter(x =>
    (!ui.kind || kindOf(x) === ui.kind) &&
    (!ui.cat || x.genre === ui.cat) &&
    (!ui.brand || brandMatch(x, ui.brand)) &&
    (!ui.price || (priceOf(x) && inPrice(priceOf(x), ui.price))) &&
    (!ui.grade || gradeOf(x) === ui.grade) &&
    (!q || `${x.brand} ${x.title} ${x.sub} ${x.lot}`.toLowerCase().includes(q)));
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
  if (ui.q || ui.price || ui.grade) return null; // 운영 API 에 없는 축이면 이 미리보기의 수만
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
    const other = ui.sale !== 'premium';
    grid.innerHTML = `<div class="empty">
      <p class="label">${other ? SALES[ui.sale] : (ui.kind ? kindName : 'No results')}</p>
      <p class="display">${none ? `No ${other ? SALES[ui.sale] : ''} lots listed right now` : 'Nothing matches these filters'}</p>
      <p class="muted">${other
        ? `${SALES[ui.sale]} is a separate sale program on TheOne, alongside Premium Auction. Nothing is listed there this week — all ${data.meta.total.toLocaleString('en-US')} lots are in Premium Auction today.`
        : (none ? 'New lots are listed every week. Premium Auction lots are available today.' : 'Try another category or brand, or clear the search.')}</p>
      <button class="btn${other ? '' : ' ghost'}" type="button" data-reset>${other ? 'Browse Premium Auction' : 'Clear filters'}</button></div>`;
    $('[data-pages]').innerHTML = '';
    return;
  }
  const start = (ui.page - 1) * ui.per;
  grid.innerHTML = list.slice(start, start + ui.per).map((lot, i) => cardHTML(lot, {
    sale,
    note: i === 0 && ui.page === 1 ? '카드 v5(결정 122) — 사진이 카드의 전부(Bezel · Fashionphile · 1stDibs 카드엔 띠가 없다). 머리 띠를 빼고 그 정보는 메타 줄에: 점 색 = 판매 방식(경매 초록 · Mall 파랑), 글 = 마감 현지 시각, 오른쪽 숫자 = 남은 시간(1시간 안 = 빨간 알약 · 더윈 12). 리저브는 No reserve · Reserve nearly met 둘만 한 줄. 누르면 상세 창(더윈 4).' : '',
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
  $('[data-price]').innerHTML = PRICES.map(([v, label]) => `<option value="${v}" ${v === ui.price ? 'selected' : ''}>${label}</option>`).join('');
  $('[data-grade]').innerHTML = GRADES_F.map(([v, label]) => `<option value="${v}" ${v === ui.grade ? 'selected' : ''}>${label}</option>`).join('');
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
  if (ui.price) p.set('price', ui.price);
  if (ui.grade) p.set('grade', ui.grade);
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
    const brand = e.target.closest('[data-brand-chip]');
    const page = e.target.closest('[data-page]');
    if (kind) Object.assign(ui, { kind: kind.dataset.kind, page: 1 });
    else if (cat) Object.assign(ui, { cat: cat.dataset.cat, page: 1 });
    else if (brand) Object.assign(ui, { brand: brand.dataset.brandChip, page: 1 });
    else if (e.target.closest('[data-brands-toggle]')) { brandsOpen = !brandsOpen; renderBrands(); paintNotes(); return; }
    else if (e.target.closest('[data-filters-toggle]')) { filtersOpen = !filtersOpen; renderFiltersBar(); return; }
    else if (page && !page.disabled) { ui.page = Number(page.dataset.page); renderGrid(); paintNotes(); revealOnScroll(); top(); return; }
    else if (e.target.closest('[data-reset]')) {
      Object.assign(ui, { sale: 'premium', kind: '', cat: '', brand: '', q: '', price: '', grade: '', page: 1 });
      $('[data-q]').value = '';
      $('[data-price]').value = '';
      $('[data-grade]').value = '';
      const siteQ = document.getElementById('site-q');
      if (siteQ) siteQ.value = '';
    } else return;
    syncUrl();
    render();
  });
  $('[data-sort]').addEventListener('change', e => { ui.sort = e.target.value; ui.page = 1; syncUrl(); render(); });
  $('[data-price]').addEventListener('change', e => { ui.price = e.target.value; ui.page = 1; syncUrl(); render(); });
  $('[data-grade]').addEventListener('change', e => { ui.grade = e.target.value; ui.page = 1; syncUrl(); render(); });
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
