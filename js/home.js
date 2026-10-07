// 홈 v4 — 구획 5개(결정 70): 히어로(흰) → Live now(초록 띠) → Browse(카테고리 + 브랜드) → How it works → Ending soon 표
// 목록·분류는 shop.html(형 "원페이지 ㄴㄴ"). 근거 = docs/design/refs/2026-10-06-v4-lock.md §5
import { loadData, usd, esc, exampleAuction, cardImg, brandName, countdown, localParts, lotUrl, TIMEZONES, BRAND_LOGOS } from './data.js?v=8d2ae80617';
import { mountChrome, bindNewsletter } from './chrome.js?v=8d2ae80617';
import { mountReview, paintNotes } from './review.js?v=8d2ae80617';
import { cardHTML, bindCards, startTicker, remain } from './card.js?v=8d2ae80617';
import { openLot } from './lotmodal.js?v=8d2ae80617';
import { initMotion, revealOnScroll } from './motion.js?v=8d2ae80617';
import { icon } from './icons.js?v=8d2ae80617';
import * as store from './store.js?v=8d2ae80617';

const HOUR = 3600000;
// 히어로는 풀블리드 사진 한 장(index.html · 결정 124) — 누끼 무대(hero.js · assets/hero)는 10/7 삭제
// 카테고리 타일 5 + 목록 타일 1 — 사진은 그 카테고리 대표 실재고. 스냅숏에 사진이 없는 셋(Variety · Tableware · Coin)은 여섯째 타일에 글로
const CAT_TILES = [['Bag', 'Bags', '851-31184'], ['Watch', 'Watches', '865-39616'], ['Jewelry', 'Jewelry', '865-39358'], ['Clothing', 'Clothing', ''], ['Accessories', 'Accessories', '863-38637']];
const CAT_REST = [['Variety', 'Variety'], ['Tableware', 'Tableware'], ['Coin', 'Coin']];
// 브랜드 행 — 40개 중 명품 하우스 8(큐레이션 · 형이 바꿀 수 있음). 이름·개수는 운영 API 그대로
// 로고 = 위키미디어 공용의 워드마크 SVG(각 상표권자 소유 · 시안 참고용 · 파일 맵 = data.js BRAND_LOGOS). 파일 없는 브랜드는 글자로(형 10/6 "브랜드별 로고")
const BRAND_ROW = ['HERMES', 'LOUIS VUITTON', 'CHANEL', 'ROLEX', 'Cartier', 'Christian Dior', 'Van Cleef&Arpels', 'Gucci'];
// 워드마크마다 보이는 글자 높이가 달라(contain 98×33: VCA 9px · DIOR 28px · 검사관 10/7 P2-6) 배율로 맞춘다 — Bezel 'Shop by Brand' 도 로고별 크기
const LOGO_SCALE = { HERMES: 1.05, 'LOUIS VUITTON': 1.2, CHANEL: 0.95, ROLEX: 0.9, Cartier: 1.05, 'Christian Dior': 0.8, 'Van Cleef&Arpels': 1.35, Gucci: 0.9 }; // VCA 1.5 는 칸 폭 100% 라 좌우 여백 0(검사관 3차)

let data;
const shown = new Set(); // 이번 렌더에서 이미 보인 로트(결정 135 · 검사관 10/7: Live 4점이 Ending 8행에 그대로, Amazona 3회, GMT-Master 사진 3회)
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
  render();
  bindCards($('[data-live-rail]'), data.lots, { onOpen: openLot });
  bindCards($('[data-new-rail]'), data.lots, { onOpen: openLot });
  bindRail();
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
  shown.clear();
  $('[data-members-note]').hidden = !!store.get('signedIn'); // 결정 136
  renderHeroCta();
  renderLive();   // 먼저 보이는 구획부터 — 뒤 구획은 앞에서 보인 로트를 건너뛴다
  renderNew();
  renderBrowse();
  renderEnding();
  paintNotes();
  revealOnScroll();
}

// New this week — 등록일 최신 8점(결정 104). 판매 방식은 검토 막대 설정대로
function renderNew() {
  // 최신 8점이되 브랜드당 2점까지(결정 131 · 10/7 실측: 최신 8점 중 6점이 Casio 디지털 시계 — 한 줄이 같은 얼굴). 순서는 등록일 그대로
  // $300 이상만(10/7: 최신순 그대로면 $24~77 카시오와 'Wholesale' 자리표시 사진의 $74 목걸이가 홈 진열대에 올라왔다 — 진열은 Live now 와 같은 기준)
  const lots = diversify([...data.lots].filter(x => x.usd >= 300 && !shown.has(x.lot)).sort((a, b) => b.listed.localeCompare(a.listed)), 8, 2);
  lots.forEach(l => shown.add(l.lot));
  // 더 보기는 레일 마지막 타일로(결정 129 · Loupe 마지막 타일 안 링크) — 섹션 머리의 → 링크는 뺐다
  $('[data-new-rail]').innerHTML = lots.map(lot => cardHTML(lot, { sale: store.setting('sale') })).join('')
    + `<a class="rail-more" href="shop.html?sort=new"><span>All new lots</span>${icon.arrow}</a>`;
}

function bindRail() {
  const rail = $('[data-new-rail]');
  const step = () => Math.max(280, rail.clientWidth * 0.8);
  $('[data-rail-prev]').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('[data-rail-next]').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  const sync = () => {
    $('[data-rail-prev]').disabled = rail.scrollLeft <= 2;
    $('[data-rail-next]').disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
  };
  rail.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  new MutationObserver(sync).observe(rail, { childList: true });
  sync();
}

// 히어로 버튼 — 입찰(B)이면 경매 띠로, 정가(A)면 목록으로
function renderHeroCta() {
  const primary = $('[data-hero-primary]');
  primary.firstChild.textContent = `${bidding() ? 'Browse live auctions' : 'Shop all lots'} `; // 글 노드만 — 뒤의 화살표 svg 는 그대로(결정 128)
  primary.setAttribute('href', bidding() ? '#live' : 'shop.html');
}

// 정렬된 목록에서 브랜드당 perBrand 점까지 n 점 — 모자라면 나머지로 채운다(순서 유지 · 지어내는 것 없음)
function diversify(sorted, n, perBrand) {
  const count = {}; const picked = [];
  for (const lot of sorted) { if ((count[lot.brand] || 0) < perBrand) { picked.push(lot); count[lot.brand] = (count[lot.brand] || 0) + 1; if (picked.length === n) return picked; } }
  for (const lot of sorted) { if (!picked.includes(lot)) { picked.push(lot); if (picked.length === n) break; } }
  return picked;
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
  const tzSel = $('[data-tz]');
  const tzNow = store.setting('tz');
  tzSel.innerHTML = TIMEZONES.map(([v, label]) => `<option value="${v}" ${v === tzNow ? 'selected' : ''}>${label}</option>`).join('');
  if (!lots.length) {
    next.textContent = '—';
    next.removeAttribute('data-ends');
    next.classList.remove('warn');
    $('[data-live-when]').textContent = '';
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
  $('[data-live-when]').textContent = ` (${p.date} · ${p.time})`;
  // 네 장(결정 129) · 브랜드당 1점(결정 131 · 10/7 실측: 넷 중 셋이 Rolex) — 마감 순서는 그대로, 겹치는 브랜드만 건너뛴다
  const picks = diversify(lots, 4, 1);
  picks.forEach(l => shown.add(l.lot));
  rail.innerHTML = picks.map(lot => cardHTML(lot, { sale: store.setting('sale') })).join('');
}

// Browse — 카테고리 타일 6 + 같은 구획 아래 브랜드 행(결정 71)
function renderBrowse() {
  const counts = Object.fromEntries(data.meta.categories.map(c => [c.name, c.n]));
  $('[data-cat-tiles]').innerHTML = CAT_TILES.map(([genre, label, id]) => {
    const lot = (id && !shown.has(id) && data.lots.find(x => x.lot === id)) || data.lots.find(x => x.genre === genre && x.usd >= 300 && !shown.has(x.lot)) || data.lots.find(x => x.genre === genre);
    if (lot) shown.add(lot.lot);
    return `<a class="cat-tile" href="shop.html?cat=${genre}" data-reveal>
      <span class="cat-photo">${lot ? `<img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy">` : ''}</span>
      <span class="cat-name">${label}</span><span class="cat-n">${(counts[genre] || 0).toLocaleString('en-US')} lots</span></a>`;
  }).join('') + `
    <div class="cat-tile is-list" data-reveal>
      <nav class="cat-list" aria-label="More categories">${CAT_REST.map(([g, label]) => `<a href="shop.html?cat=${g}"><span>${label}</span><span class="num">${(counts[g] || 0).toLocaleString('en-US')}</span></a>`).join('')}</nav>
      <span class="cat-name">More categories</span><span class="cat-n">${CAT_REST.reduce((s, [g]) => s + (counts[g] || 0), 0).toLocaleString('en-US')} lots</span>
    </div>`;
  const top = BRAND_ROW.map(n => data.meta.brands.find(b => b.name === n)).filter(Boolean);
  // 브랜드 줄 = 흰 바탕 워드마크(결정 129 · §13 H3 · Bezel 'Shop by Brand' 흰 바탕) — 회색 타일 8개가 카테고리 타일 6개 바로 밑에 붙어 상자 14개 두 줄이었다
  $('[data-brand-row]').innerHTML = `<p class="label brand-row-label">Brands</p>
    <div class="brand-logos">${top.map(b => {
      const logo = BRAND_LOGOS[b.name];
      // mask-image 는 인라인으로 — CSS 변수 안의 url() 은 CSS 파일 기준(/css/…)으로 풀려 404 가 났다(10/6 실측)
      const mark = logo
        ? `<span class="brand-mark" role="img" aria-label="${esc(brandName(b.name))}"><i style="-webkit-mask-image:url(assets/brands/${logo}.svg);mask-image:url(assets/brands/${logo}.svg);--logo-scale:${LOGO_SCALE[b.name] || 1}"></i></span>`
        : `<span class="brand-mark brand-text">${esc(brandName(b.name))}</span>`;
      return `<a class="brand-logo" href="shop.html?brand=${encodeURIComponent(b.name)}" data-reveal>${mark}<span class="cat-n">${b.n.toLocaleString('en-US')} lots</span></a>`;
    }).join('')}</div>
    <p class="sec-foot"><a class="more-link" href="shop.html">All ${data.meta.brands.length} brands ${icon.arrow}</a></p>`;
}

// Ending soon — BaT "Latest bids" 식 표 8행(결정 84). 카드 반복 없이 마감 순서만
function renderEnding() {
  const section = $('#ending');
  const lots = (store.setting('examples') || !bidding() ? liveLots() : []).filter(x => x.usd && !shown.has(x.lot)).slice(0, 8); // Live 레일에 보인 4점은 뺀다
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
      <td class="et-bid">${store.get('signedIn') ? usd(bidding() ? a.bid : lot.usd) : '<span class="blur" aria-hidden="true">$0,000</span><span class="visually-hidden">Shown to members</span>'}<span>${bidding() ? `${a.bids} bids` : 'price'}</span></td>
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
