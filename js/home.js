// 홈 — 판매 방식 탭 · 카테고리 칩 · 그리드 · 마감 임박/최근 판매 표(20~22쪽)
import { loadData, usd, lotUrl, esc, shortDate, daysUntil, exampleAuction, countdown, cardImg, fullName } from './data.js?v=ffe41d4f8e';
import { mountChrome, bindNewsletter } from './chrome.js?v=ffe41d4f8e';
import { mountReview, paintNotes } from './review.js?v=ffe41d4f8e';
import { cardHTML, bindCards, startTicker } from './card.js?v=ffe41d4f8e';
import { openQuick } from './quickview.js?v=ffe41d4f8e';
import { mountHero } from './hero.js?v=ffe41d4f8e';
import { initMotion, revealOnScroll } from './motion.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';

const PAGE = 24;
const CAT_ORDER = ['Bag', 'Watch', 'Clothing', 'Jewelry', 'Accessories', 'Tableware'];
const MORE_CATS = ['Variety', 'Coin'];
const SALES = {
  premium: { name: 'Premium', desc: total => `Japan's Brand Auction, inspected in Tokyo. ${total.toLocaleString('en-US')} lots.` },
  express: { name: 'Express', desc: () => 'No lots listed yet.' },
  classic: { name: 'Classic', desc: () => 'No lots listed yet.' },
};
// 판매 기록 데이터가 아직 없다 — 행은 기획안 21쪽 예시 그대로, 금액은 자리표시
const SOLD_EXAMPLES = [
  ['Hermès Garden Party', 'Sep 30'], ['Hermès Bolide 1923 Mini', 'Sep 30'],
  ['Hermès Evelyne TPM', 'Sep 29'], ['Hermès Bastia Coin Case', 'Sep 29'],
];

const params = new URLSearchParams(location.search);
const ui = {
  sale: SALES[params.get('sale')] ? params.get('sale') : 'premium',
  cat: params.get('cat') || 'All',
  brand: '', sort: 'featured', q: '', ending: false, shown: PAGE, moreCats: false,
};
let data;

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
    document.querySelector('[data-grid]').innerHTML =
      '<p class="empty">We couldn\'t load the lots. Please refresh the page.</p>';
    return;
  }
  document.querySelector('[data-total]').textContent = data.meta.total.toLocaleString('en-US');
  fillBrands();
  bindControls();
  bindCards(document.querySelector('[data-grid]'), data.lots, { onQuick: openQuick });
  bindCards(document.querySelector('[data-recent-grid]'), data.lots, { onQuick: openQuick });
  renderCatTiles();
  render();
  startTicker();
  initMotion();
  window.addEventListener('store:change', e => {
    if (e.detail.key === 'settings' || e.detail.key === 'signedIn') render();
  });
}

function render() {
  renderTabs();
  renderCats();
  renderGrid();
  renderTables();
  renderRecent();
  paintNotes();
  revealOnScroll();
}

// 카테고리 사진 타일 — 사진은 그 카테고리 첫 상품, 숫자는 실재고 전체(결정 44)
const TILE = [['Bag', 'Bags'], ['Watch', 'Watches'], ['Jewelry', 'Jewelry'], ['Clothing', 'Clothing'], ['Accessories', 'Accessories']];
function renderCatTiles() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  document.querySelector('[data-cat-tiles]').innerHTML = TILE.map(([genre, label]) => {
    const lot = data.lots.find(x => x.genre === genre && x.usd >= 300) || data.lots.find(x => x.genre === genre);
    return `<a class="cat-tile" href="index.html?cat=${genre}#lots" data-tile="${genre}" data-reveal>
      <span class="cat-photo">${lot ? `<img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy">` : ''}</span>
      <span class="cat-meta"><b>${label}</b><span class="label num">${(counts[genre] || 0).toLocaleString('en-US')}</span></span></a>`;
  }).join('');
  document.querySelector('[data-cat-tiles]').addEventListener('click', e => {
    const tile = e.target.closest('[data-tile]');
    if (!tile) return;
    e.preventDefault();
    Object.assign(ui, { sale: 'premium', cat: tile.dataset.tile, shown: PAGE });
    syncUrl();
    render();
    document.getElementById('lots').scrollIntoView({ behavior: 'smooth' });
  });
}

// 최근 본 상품 — 이 브라우저에서 연 상세 페이지(결정 50)
function renderRecent() {
  const ids = store.get('recent');
  const lots = ids.map(id => data.lots.find(x => x.lot === id)).filter(Boolean).slice(0, 4);
  const box = document.querySelector('[data-recent]');
  box.hidden = !lots.length;
  document.querySelector('[data-recent-grid]').innerHTML = lots.map(lot => cardHTML(lot, { sale: store.setting('sale') })).join('');
}

function renderTabs() {
  const host = document.querySelector('[data-sale-tabs]');
  host.innerHTML = Object.entries(SALES).map(([key, s]) => `
    <button class="sale-tab" role="tab" type="button" data-sale="${key}" aria-selected="${key === ui.sale}"
      ${key !== 'premium' ? 'data-note="Express·Classic이 무엇인지 정해야 한 줄 설명을 쓸 수 있다(40쪽 질문 2). 지금은 현재 사이트처럼 상품 0개 상태를 그대로 보여 준다(결정 35)." data-ref="22쪽"' : ''}>
      <span class="sale-name">${s.name}</span>
      <span class="sale-desc${key !== 'premium' ? ' is-empty' : ''}">${s.desc(data.meta.total)}</span>
    </button>`).join('');
}

function renderCats() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  const chip = name => `<button class="chip" type="button" data-cat="${name}" aria-pressed="${ui.cat === name}">
    ${name}${counts[name] ? ` <span class="n">${counts[name].toLocaleString('en-US')}</span>` : ''}</button>`;
  const cats = ['All', ...CAT_ORDER, ...(ui.moreCats ? MORE_CATS : [])];
  document.querySelector('[data-cats]').innerHTML = cats.map(chip).join('') +
    (ui.moreCats ? '' : '<button class="chip" type="button" data-more-cats>More</button>');
}

function filtered() {
  if (ui.sale !== 'premium') return [];
  const q = ui.q.trim().toLowerCase();
  let list = data.lots.filter(x =>
    (ui.cat === 'All' || x.genre === ui.cat) &&
    (!ui.brand || x.brand === ui.brand) &&
    (!q || `${x.brand} ${x.title} ${x.sub} ${x.lot}`.toLowerCase().includes(q)));
  const sale = store.setting('sale');
  if (ui.ending) {
    list = sale === 'B'
      ? [...list].sort((a, b) => exampleAuction(a).ends - exampleAuction(b).ends)
      : list.filter(x => x.usd && x.until && daysUntil(x.until) <= 60).sort((a, b) => a.until.localeCompare(b.until));
  }
  if (ui.sort === 'high') list = [...list].sort((a, b) => b.usd - a.usd);
  if (ui.sort === 'low') list = [...list].sort((a, b) => (a.usd || Infinity) - (b.usd || Infinity));
  if (ui.sort === 'new') list = [...list].sort((a, b) => b.listed.localeCompare(a.listed));
  return list;
}

function renderGrid() {
  const list = filtered();
  const grid = document.querySelector('[data-grid]');
  const sale = store.setting('sale');
  const live = ui.sale === 'premium'
    ? (ui.cat === 'All' ? data.meta.total : (data.meta.categories.find(c => c.name === ui.cat) || { n: 0 }).n)
    : 0;
  document.querySelector('[data-count]').textContent = `${live.toLocaleString('en-US')} lots available`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty">
      <p class="display d30">${ui.sale === 'premium' ? 'Nothing matches yet' : `No ${SALES[ui.sale].name} lots listed right now`}</p>
      <p class="muted">${ui.sale === 'premium' ? 'Try another category, or clear the search.' : 'New lots are listed every week. Premium lots are available today.'}</p>
      <button class="btn ghost" type="button" data-reset>${ui.sale === 'premium' ? 'Clear filters' : 'Browse Premium lots'}</button>
    </div>`;
  } else {
    grid.innerHTML = list.slice(0, ui.shown).map((lot, i) => cardHTML(lot, {
      sale,
      note: i === 0 ? '카드 규칙: 달러 먼저·엔화는 맨 아래 작게 / 판매 조건은 라벨 한 줄 / 등급 배지는 사진 왼쪽 위 / 제목은 모델과 사이즈, 아랫줄은 소재·색·각인. 첫 화면 제목은 규칙대로 손으로 정리한 예시(결정 38). 카드에는 "관세·배송 포함" 줄을 넣지 않았다 — 카드 가격은 상품가라서(결정 31).' : '',
    })).join('');
  }
  const more = document.querySelector('[data-more]');
  more.hidden = list.length <= ui.shown;
  document.querySelector('[data-shown]').textContent = list.length
    ? `Showing ${Math.min(ui.shown, list.length)} of ${list.length} in this preview` : '';
}

function renderTables() {
  const sale = store.setting('sale');
  document.querySelector('[data-ending-title]').textContent = sale === 'B' ? 'Ending soon' : 'Leaving soon';
  document.querySelector('[data-ending-col]').textContent = sale === 'B' ? 'Ends in' : 'Until';
  document.querySelector('[data-ending-all]').textContent = sale === 'B' ? 'View all ending soon' : 'View all leaving soon';
  const rows = sale === 'B'
    ? [...data.lots].filter(x => x.usd).sort((a, b) => exampleAuction(a).ends - exampleAuction(b).ends).slice(0, 5)
    : data.lots.filter(x => x.usd && x.until).sort((a, b) => a.until.localeCompare(b.until)).slice(0, 5);
  document.querySelector('[data-ending-rows]').innerHTML = rows.map(x => {
    const a = exampleAuction(x);
    const when = sale === 'B'
      ? `<span class="mono-time${a.ends - Date.now() < 3600000 ? ' warn' : ''}" data-ends="${a.ends.getTime()}">${countdown(a.ends)}</span>`
      : `<span class="${daysUntil(x.until) <= 7 ? 'warn' : ''}">${shortDate(x.until)}</span>`;
    return `<tr><td><a class="tbl-lot" href="${lotUrl(x)}">${esc(fullName(x))}</a></td>
      <td class="r num">${usd(sale === 'B' ? a.bid : x.usd)}</td><td class="r num">${when}</td></tr>`;
  }).join('');
  document.querySelector('[data-sold-rows]').innerHTML = SOLD_EXAMPLES.map(([name, date]) =>
    `<tr><td>${name}</td><td class="r mono-time">$X,XXX</td><td class="r num">${date}</td></tr>`).join('');
  document.querySelector('[data-lock]').hidden = store.get('signedIn');
}

function fillBrands() {
  const brands = [...new Set(data.lots.map(x => x.brand))].sort();
  document.querySelector('[data-brand]').innerHTML =
    '<option value="">All brands</option>' + brands.map(b => `<option>${esc(b)}</option>`).join('');
}

function paintNav() {
  document.querySelectorAll('.nav-links a').forEach(a => {
    const on = a.getAttribute('href').includes(`sale=${ui.sale}`);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

function syncUrl() {
  const p = new URLSearchParams();
  if (ui.sale !== 'premium') p.set('sale', ui.sale);
  if (ui.cat !== 'All') p.set('cat', ui.cat);
  history.replaceState(null, '', `${location.pathname}${p.toString() ? '?' + p : ''}${location.hash}`);
}

function bindControls() {
  const lots = document.getElementById('lots');
  lots.addEventListener('click', e => {
    const tab = e.target.closest('[data-sale]');
    const cat = e.target.closest('[data-cat]');
    if (tab) { ui.sale = tab.dataset.sale; ui.shown = PAGE; paintNav(); }
    else if (cat) { ui.cat = cat.dataset.cat; ui.shown = PAGE; }
    else if (e.target.closest('[data-more-cats]')) ui.moreCats = true;
    else if (e.target.closest('[data-ending-toggle]')) {
      ui.ending = !ui.ending;
      e.target.closest('[data-ending-toggle]').setAttribute('aria-pressed', String(ui.ending));
    } else if (e.target.closest('[data-reset]')) {
      Object.assign(ui, { sale: 'premium', cat: 'All', brand: '', q: '', ending: false, shown: PAGE });
      lots.querySelector('[data-brand]').value = '';
      lots.querySelector('[data-q]').value = '';
      lots.querySelector('[data-ending-toggle]').setAttribute('aria-pressed', 'false');
    } else if (e.target.closest('[data-more]')) { ui.shown += PAGE; renderGrid(); paintNotes(); revealOnScroll(); return; }
    else return;
    syncUrl();
    render();
  });
  lots.querySelector('[data-brand]').addEventListener('change', e => { ui.brand = e.target.value; ui.shown = PAGE; render(); });
  lots.querySelector('[data-sort]').addEventListener('change', e => { ui.sort = e.target.value; render(); });
  let t;
  lots.querySelector('[data-q]').addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => { ui.q = e.target.value; ui.shown = PAGE; renderGrid(); paintNotes(); revealOnScroll(); }, 150);
  });
  document.querySelector('[data-recent-clear]').addEventListener('click', () => { store.set('recent', []); renderRecent(); });
  document.querySelector('[data-ending-all]').addEventListener('click', () => {
    ui.ending = true;
    document.querySelector('[data-ending-toggle]').setAttribute('aria-pressed', 'true');
    render();
  });
}

main();
