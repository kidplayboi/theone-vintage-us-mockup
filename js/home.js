// 홈 v3 — 허브(Bezel 홈 순서): 사실 히어로 → 카테고리 → 경매 띠 → 이번 주 로트(탭) → 신뢰 → 브랜드 → 판매 기록(회원) → Why
// 목록·분류는 shop.html 로 분리(형 "원페이지 ㄴㄴ"). 근거 = docs/design/refs/2026-10-06-v3-lock.md
import { loadData, usd, lotUrl, esc, exampleAuction, cardImg, brandName } from './data.js?v=9d7fdc12f6';
import { mountChrome, bindNewsletter } from './chrome.js?v=9d7fdc12f6';
import { mountReview, paintNotes } from './review.js?v=9d7fdc12f6';
import { cardHTML, bindCards, startTicker } from './card.js?v=9d7fdc12f6';
import { openLot } from './lotmodal.js?v=9d7fdc12f6';
import { mountHero } from './hero.js?v=9d7fdc12f6';
import { initMotion, revealOnScroll } from './motion.js?v=9d7fdc12f6';
import * as store from './store.js?v=9d7fdc12f6';

// 히어로 = 배경을 지운 실재고 4점(assets/hero)
const HERO = ['863-38440', '865-39616', '861-30068', '866-39839'];
// 카테고리 타일 — 사진은 그 카테고리 대표 실재고
const CAT_TILES = [['Bag', 'Bags', '851-31184'], ['Watch', 'Watches', '865-39616'], ['Jewelry', 'Jewelry', '865-39358'], ['Accessories', 'Accessories', '863-38637'], ['Clothing', 'Clothing', '']];
// 판매 기록이 아직 없다 — 행은 기획안 21쪽 예시, 금액은 자리표시
const SOLD_EXAMPLES = [['Hermès Garden Party 36', 'Sep 30'], ['Hermès Bolide 1923 Mini', 'Sep 30'], ['Rolex Datejust 36', 'Sep 29'], ['Chanel Classic Flap Medium', 'Sep 29'], ['Hermès Evelyne TPM', 'Sep 28']];
const BRAND_TILES = ['HERMES', 'LOUIS VUITTON', 'CHANEL', 'ROLEX', 'Cartier', 'Christian Dior', 'Van Cleef&Arpels', 'Gucci'];
const PICKS = [['featured', 'Featured'], ['new', 'New arrivals'], ['ending', 'Ending soon'], ['under', 'Under $1,000']];

let data;
let pick = 'featured';
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
  mountReview({ page: 'home' });
  mountChrome({ page: 'home', data, ticker: data ? tickerItems() : null });
  bindNewsletter();
  if (!data) {
    $('[data-pick-grid]').innerHTML = '<p class="empty">We couldn\'t load the lots. Please refresh the page.</p>';
    return;
  }
  document.querySelectorAll('[data-total]').forEach(el => { el.textContent = data.meta.total.toLocaleString('en-US'); });
  const slides = HERO.map(id => data.lots.find(x => x.lot === id)).filter(Boolean).map(lot => ({ lot, img: `assets/hero/${lot.lot}.webp` }));
  mountHero($('[data-hero-stage]'), slides, { onOpen: openLot });
  renderCats();
  renderBrands();
  render();
  bindCards($('[data-auction-rail]'), data.lots, { onOpen: openLot });
  bindCards($('[data-pick-grid]'), data.lots, { onOpen: openLot });
  bindCards($('[data-recent-grid]'), data.lots, { onOpen: openLot });
  bindControls();
  startTicker();
  initMotion();
  window.addEventListener('store:change', e => {
    if (e.detail.key === 'recent') { renderRecent(); revealOnScroll(); return; } // 상세 창을 열 때마다 전체를 다시 그리지 않게
    if (['settings', 'signedIn', 'saved', '*'].includes(e.detail.key)) render();
  });
}

function render() {
  renderAuctions();
  renderPicks();
  renderSold();
  renderRecent();
  paintNotes();
  revealOnScroll();
}

// 새 상품 띠 — $1,000 이상 중 등록일 최신 10개(Bezel New Listing 티커 · 결정 61)
function tickerItems() {
  return [...data.lots].filter(x => x.usd >= 1000).sort((a, b) => b.listed.localeCompare(a.listed)).slice(0, 10)
    .map(x => ({ href: lotUrl(x), text: `${esc(brandName(x.brand))} ${esc(x.title)} · ${usd(x.usd)}` }));
}

function renderCats() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  const tile = ([genre, label, id]) => {
    const lot = (id && data.lots.find(x => x.lot === id)) || data.lots.find(x => x.genre === genre && x.usd >= 300) || data.lots.find(x => x.genre === genre);
    return `<a class="cat-tile" href="shop.html?cat=${genre}" data-reveal>
      <span class="cat-photo">${lot ? `<img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy">` : ''}</span>
      <span class="cat-name">${label}</span><span class="cat-n num">${(counts[genre] || 0).toLocaleString('en-US')} lots</span></a>`;
  };
  const rest = ['Variety', 'Tableware', 'Coin'];
  $('[data-cat-tiles]').innerHTML = CAT_TILES.map(tile).join('') + `
    <div class="cat-tile is-list" data-reveal>
      <span class="cat-name">More categories</span>
      <ul>${rest.map(g => `<li><a href="shop.html?cat=${g}"><span>${g}</span><span class="num">${(counts[g] || 0).toLocaleString('en-US')}</span></a></li>`).join('')}
        <li><a href="shop.html"><span>All lots</span><span class="num">${data.meta.total.toLocaleString('en-US')}</span></a></li></ul>
    </div>`;
}

function renderBrands() {
  // 40개 중 대표 8 — 운영 API 이름 그대로, 개수도 그대로(형이 바꿀 수 있는 큐레이션)
  const top = BRAND_TILES.map(n => data.meta.brands.find(b => b.name === n)).filter(Boolean);
  $('[data-brand-tiles]').innerHTML = top.map(b => {
    const lot = data.lots.find(x => brandMatch(x, b.name) && x.usd >= 300) || data.lots.find(x => brandMatch(x, b.name));
    return `<a class="brand-tile" href="shop.html?brand=${encodeURIComponent(b.name)}" data-reveal>
      <span class="brand-photo">${lot ? `<img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy">` : ''}</span>
      <span class="brand-name">${esc(brandName(b.name))}</span><span class="cat-n num">${b.n.toLocaleString('en-US')} available</span></a>`;
  }).join('');
}

// 경매 띠 — 입찰(B)일 때만. 실재고 입찰이 아직 0이라 시각·입찰가는 예시(예시 데이터 끄면 빈 상태)
function renderAuctions() {
  const bidding = store.setting('sale') === 'B';
  const section = $('#auctions');
  section.hidden = !bidding;
  const primary = $('.hero-actions .btn.light');
  primary.textContent = bidding ? 'See live auctions' : 'Shop all lots';
  primary.setAttribute('href', bidding ? '#auctions' : 'shop.html');
  if (!bidding) return;
  const rail = $('[data-auction-rail]');
  if (!store.setting('examples')) {
    rail.innerHTML = `<div class="empty"><p class="display">No live auctions right now</p>
      <p class="muted">New auctions open every week. Lots you can buy today are in the shop.</p><a class="btn light" href="shop.html">Browse all lots</a></div>`;
    return;
  }
  // 마감 빠른 순 — 띠는 진열창이라 $1,000 이상만(Bezel Auctions 띠도 고가 위주)
  const lots = [...data.lots].filter(x => x.usd >= 1000).sort((a, b) => exampleAuction(a).ends - exampleAuction(b).ends).slice(0, 4);
  rail.innerHTML = lots.map(lot => cardHTML(lot, { sale: 'B' })).join('');
  $('[data-auctions-more]').innerHTML = `${lots.length ? 'View all live auctions' : 'View all'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
}

function pickList() {
  const lots = data.lots.filter(x => x.usd);
  const bidding = store.setting('sale') === 'B';
  if (pick === 'new') return [...lots].sort((a, b) => b.listed.localeCompare(a.listed));
  if (pick === 'ending') {
    return bidding
      ? [...lots].sort((a, b) => exampleAuction(a).ends - exampleAuction(b).ends)
      : [...lots].filter(x => x.ends).sort((a, b) => a.ends.localeCompare(b.ends));
  }
  if (pick === 'under') return lots.filter(x => x.usd < 1000);
  return data.lots;
}

function renderPicks() {
  $('[data-pick-tabs]').innerHTML = PICKS.map(([key, label]) =>
    `<button type="button" role="tab" class="pick-tab" data-pick="${key}" aria-selected="${pick === key}">${label}</button>`).join('');
  const sale = store.setting('sale');
  $('[data-pick-grid]').innerHTML = pickList().slice(0, 8).map(lot => cardHTML(lot, { sale })).join('');
}

function renderSold() {
  const signedIn = store.get('signedIn');
  $('[data-sold-rows]').innerHTML = SOLD_EXAMPLES.map(([name, date]) =>
    `<tr><td>${esc(name)}</td><td class="r num">${signedIn ? '$X,XXX' : '<span class="blur">$0,000</span>'}</td><td class="r num">${date}</td></tr>`).join('');
  const cta = $('[data-sold-cta]');
  cta.hidden = signedIn;
}

function renderRecent() {
  const lots = store.get('recent').map(id => data.lots.find(x => x.lot === id)).filter(Boolean).slice(0, 4);
  $('[data-recent]').hidden = !lots.length;
  $('[data-recent-grid]').innerHTML = lots.map(lot => cardHTML(lot, { sale: store.setting('sale') })).join('');
}

function bindControls() {
  $('[data-pick-tabs]').addEventListener('click', e => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    pick = b.dataset.pick;
    renderPicks();
    paintNotes();
    revealOnScroll();
  });
  $('[data-recent-clear]').addEventListener('click', () => store.set('recent', []));
}

main();
