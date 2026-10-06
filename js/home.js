// 홈 v4 — 구획 5개(결정 70): 히어로(흰) → Live now(초록 띠) → Browse(카테고리 + 브랜드) → How it works → Ending soon 표
// 목록·분류는 shop.html(형 "원페이지 ㄴㄴ"). 근거 = docs/design/refs/2026-10-06-v4-lock.md §5
import { loadData, usd, esc, exampleAuction, cardImg, brandName, countdown, localParts, lotUrl, TIMEZONES } from './data.js?v=8fb20ff5e5';
import { mountChrome, bindNewsletter } from './chrome.js?v=8fb20ff5e5';
import { mountReview, paintNotes } from './review.js?v=8fb20ff5e5';
import { cardHTML, bindCards, startTicker, remain } from './card.js?v=8fb20ff5e5';
import { openLot } from './lotmodal.js?v=8fb20ff5e5';
import { mountHero } from './hero.js?v=8fb20ff5e5';
import { initMotion, revealOnScroll } from './motion.js?v=8fb20ff5e5';
import { icon } from './icons.js?v=8fb20ff5e5';
import * as store from './store.js?v=8fb20ff5e5';

const HOUR = 3600000;
// 히어로 = 배경을 지운 실재고 4점(assets/hero)
const HERO = ['863-38440', '865-39616', '861-30068', '866-39839'];
// 카테고리 타일 5 + 목록 타일 1 — 사진은 그 카테고리 대표 실재고. 스냅숏에 사진이 없는 셋(Variety · Tableware · Coin)은 여섯째 타일에 글로
const CAT_TILES = [['Bag', 'Bags', '851-31184'], ['Watch', 'Watches', '865-39616'], ['Jewelry', 'Jewelry', '865-39358'], ['Clothing', 'Clothing', ''], ['Accessories', 'Accessories', '863-38637']];
const CAT_REST = [['Variety', 'Variety'], ['Tableware', 'Tableware'], ['Coin', 'Coin']];
// 브랜드 행 — 40개 중 명품 하우스 8(큐레이션 · 형이 바꿀 수 있음). 이름·개수는 운영 API 그대로
// 로고 = 위키미디어 공용의 워드마크 SVG(각 상표권자 소유 · 시안 참고용). 파일 없는 브랜드는 글자로(형 10/6 "브랜드별 로고")
const BRAND_ROW = ['HERMES', 'LOUIS VUITTON', 'CHANEL', 'ROLEX', 'Cartier', 'Christian Dior', 'Van Cleef&Arpels', 'Gucci'];
const BRAND_LOGOS = { HERMES: 'hermes', 'LOUIS VUITTON': 'louis-vuitton', CHANEL: 'chanel', ROLEX: 'rolex', Cartier: 'cartier', 'Christian Dior': 'dior', 'Van Cleef&Arpels': 'van-cleef-arpels', Gucci: 'gucci' };

let data;
const $ = sel => document.querySelector(sel);
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const brandMatch = (lot, option) => { const a = norm(lot.brand), b = norm(option); return a === b || a.startsWith(b) || b.startsWith(a); };
const bidding = () => store.setting('sale') === 'B';

async function main() {
  try {
    data = await loadData();
    document.body.dataset.rate = data.meta.rate;
    document.body.dataset.snapshot = data.meta.snapshotAt;
  } catch (err) {
    console.error('[mockup] could not load lots', err);
  }
  mountReview({ page: 'home' });
  mountChrome({ page: 'home', data });
  bindNewsletter();
  if (!data) {
    $('[data-live-rail]').innerHTML = '<p class="empty">We couldn\'t load the lots. Please refresh the page.</p>';
    return;
  }
  document.querySelectorAll('[data-total]').forEach(el => { el.textContent = data.meta.total.toLocaleString('en-US'); });
  const slides = HERO.map(id => data.lots.find(x => x.lot === id)).filter(Boolean).map(lot => ({ lot, img: `assets/hero/${lot.lot}.webp` }));
  mountHero($('[data-hero-stage]'), slides, { onOpen: openLot });
  renderBrowse();
  render();
  bindCards($('[data-live-rail]'), data.lots, { onOpen: openLot });
  bindEnding();
  // 시간대 — 운영 사이트 'Your local time' 그대로(기본 = 기기). 고르면 띠 · 표 · 상세가 그 시간대로(결정 87)
  $('[data-tz]').addEventListener('change', e => store.setSetting('tz', e.target.value));
  startTicker();
  initMotion();
  window.addEventListener('store:change', e => {
    if (['settings', 'signedIn', 'saved', 'folders', '*'].includes(e.detail.key)) render();
  });
}

function render() {
  renderHeroCta();
  renderLive();
  renderEnding();
  paintNotes();
  revealOnScroll();
}

// 히어로 버튼 — 입찰(B)이면 경매 띠로, 정가(A)면 목록으로
function renderHeroCta() {
  const primary = $('[data-hero-primary]');
  primary.textContent = bidding() ? 'Browse live auctions' : 'Shop all lots';
  primary.setAttribute('href', bidding() ? '#live' : 'shop.html');
}

// 진행 중 로트 — 입찰(B)은 전 재고가 Live bid(마감 빠른 순, 진열이라 $1,000 이상). 정가(A)는 운영 데이터의 Live bid 종류만
function liveLots() {
  if (bidding()) return [...data.lots].filter(x => x.usd >= 1000).sort((a, b) => exampleAuction(a).ends - exampleAuction(b).ends);
  return data.lots.filter(x => x.kind === 'RT' && x.ends).sort((a, b) => a.ends.localeCompare(b.ends));
}
const endsOf = lot => (bidding() ? exampleAuction(lot).ends : new Date(lot.ends));

// Live now 띠 — 흰 머리 카드(Phillips) + 카드 3장. 입찰은 실재고 입찰이 아직 0이라 시각·입찰가는 예시(예시 데이터 끄면 빈 상태)
function renderLive() {
  const lots = store.setting('examples') || !bidding() ? liveLots() : [];
  const kinds = data.meta.kinds || {};
  const count = bidding() ? data.meta.total : (kinds.RT || lots.length);
  $('[data-live-count]').textContent = count.toLocaleString('en-US');
  const next = $('[data-live-next]');
  const rail = $('[data-live-rail]');
  const signedIn = store.get('signedIn');
  const tzSel = $('[data-tz]');
  const tzNow = store.setting('tz');
  tzSel.innerHTML = TIMEZONES.map(([v, label]) => `<option value="${v}" ${v === tzNow ? 'selected' : ''}>${label}</option>`).join('');
  const cta = $('[data-live-cta]');
  cta.textContent = signedIn ? 'Place a bid' : 'Register to bid';
  cta.setAttribute('href', signedIn ? 'shop.html?sort=ending' : 'sign-in.html?mode=create&next=index.html%23live');
  if (!lots.length) {
    next.textContent = '—';
    next.removeAttribute('data-ends');
    next.classList.remove('warn');
    rail.innerHTML = `<div class="empty"><p class="display d2">No live auctions right now</p>
      <p class="muted">New auctions open every week. Lots you can buy today are in the shop.</p><a class="btn" href="shop.html">Browse all lots</a></div>`;
    return;
  }
  const first = endsOf(lots[0]);
  next.textContent = countdown(first);
  next.dataset.ends = first.getTime();
  next.classList.toggle('warn', first - Date.now() < HOUR);
  const tz = store.setting('tz');
  const p = localParts(first, tz);
  $('[data-live-when]').textContent = `${p.date} · ${p.time}`;
  rail.innerHTML = lots.slice(0, 3).map(lot => cardHTML(lot, { sale: store.setting('sale') })).join('');
}

// Browse — 카테고리 타일 6 + 같은 구획 아래 브랜드 행(결정 71)
function renderBrowse() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  $('[data-cat-tiles]').innerHTML = CAT_TILES.map(([genre, label, id]) => {
    const lot = (id && data.lots.find(x => x.lot === id)) || data.lots.find(x => x.genre === genre && x.usd >= 300) || data.lots.find(x => x.genre === genre);
    return `<a class="cat-tile" href="shop.html?cat=${genre}" data-reveal>
      <span class="cat-photo">${lot ? `<img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy">` : ''}</span>
      <span class="cat-name">${label}</span><span class="cat-n">${(counts[genre] || 0).toLocaleString('en-US')} lots</span></a>`;
  }).join('') + `
    <div class="cat-tile is-list" data-reveal>
      <nav class="cat-list" aria-label="More categories">${CAT_REST.map(([g, label]) => `<a href="shop.html?cat=${g}"><span>${label}</span><span class="num">${(counts[g] || 0).toLocaleString('en-US')}</span></a>`).join('')}</nav>
      <span class="cat-name">More categories</span><span class="cat-n">${CAT_REST.reduce((s, [g]) => s + (counts[g] || 0), 0).toLocaleString('en-US')} lots</span>
    </div>`;
  const top = BRAND_ROW.map(n => data.meta.brands.find(b => b.name === n)).filter(Boolean);
  $('[data-brand-row]').innerHTML = `<div class="brand-row-head"><span class="label">Brands</span><a class="more-link" href="shop.html">All ${data.meta.brands.length} brands ${icon.arrow}</a></div>
    <div class="brand-logos">${top.map(b => {
      const logo = BRAND_LOGOS[b.name];
      // mask-image 는 인라인으로 — CSS 변수 안의 url() 은 CSS 파일 기준(/css/…)으로 풀려 404 가 났다(10/6 실측)
      const mark = logo
        ? `<span class="brand-mark" role="img" aria-label="${esc(brandName(b.name))}"><i style="-webkit-mask-image:url(assets/brands/${logo}.svg);mask-image:url(assets/brands/${logo}.svg)"></i></span>`
        : `<span class="brand-mark brand-text">${esc(brandName(b.name))}</span>`;
      return `<a class="brand-logo" href="shop.html?brand=${encodeURIComponent(b.name)}" data-reveal>${mark}<span class="cat-n">${b.n.toLocaleString('en-US')} lots</span></a>`;
    }).join('')}</div>`;
}

// Ending soon — BaT "Latest bids" 식 표 8행(결정 84). 카드 반복 없이 마감 순서만
function renderEnding() {
  const section = $('#ending');
  const lots = (store.setting('examples') || !bidding() ? liveLots() : []).filter(x => x.usd).slice(0, 8);
  section.hidden = !lots.length;
  if (!lots.length) return;
  const tz = store.setting('tz');
  $('[data-ending-rows]').innerHTML = lots.map(lot => {
    const ends = endsOf(lot);
    const hot = ends - Date.now() < HOUR;
    const a = exampleAuction(lot);
    const p = localParts(ends, tz);
    return `<tr data-lot="${esc(lot.lot)}">
      <td><a class="et-lot" href="${lotUrl(lot)}" data-open><img src="${cardImg(lot)}" alt="" width="48" height="48" loading="lazy">
        <span><b>${esc(brandName(lot.brand))}</b><i>${esc(lot.title)}</i></span></a></td>
      <td class="et-bid">${usd(bidding() ? a.bid : lot.usd)}<span>${bidding() ? `${a.bids} bids` : 'price'}</span></td>
      <td class="et-ends"><b class="${hot ? 'warn' : ''}" data-ends="${ends.getTime()}">${remain(ends)}</b><span>${esc(p.date)} · ${esc(p.time)}</span></td>
      <td class="et-go">${icon.arrow}</td>
    </tr>`;
  }).join('');
}

function bindEnding() {
  $('[data-ending-rows]').addEventListener('click', e => {
    const tr = e.target.closest('tr[data-lot]');
    if (!tr) return;
    const lot = data.lots.find(x => x.lot === tr.dataset.lot);
    if (!lot || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    openLot(lot);
  });
}

main();
