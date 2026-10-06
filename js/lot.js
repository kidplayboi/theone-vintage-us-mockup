// 로트 상세 — 사진 · 오른쪽 칸 · 상태 스코어카드 · 총액과 시세 · 상세 표 · 비슷한 상품 · 따라오는 바(25~29쪽)
import { loadData, usd, esc, gradeName, GRADES, similar, cardImg, exampleAuction, formatEnds, shortDate, fullName } from './data.js?v=ffe41d4f8e';
import { mountChrome, bindNewsletter } from './chrome.js?v=ffe41d4f8e';
import { mountReview, paintNotes } from './review.js?v=ffe41d4f8e';
import { cardHTML, bindCards, startTicker } from './card.js?v=ffe41d4f8e';
import { openQuick } from './quickview.js?v=ffe41d4f8e';
import { galleryHTML, mountGallery } from './gallery.js?v=ffe41d4f8e';
import { buyHTML, lotState } from './buybox.js?v=ffe41d4f8e';
import { bindBuy } from './lotactions.js?v=ffe41d4f8e';
import { openRequest } from './request.js?v=ffe41d4f8e';
import { initMotion, revealOnScroll } from './motion.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';

const $ = sel => document.querySelector(sel);
let data;
let lot;

async function main() {
  try {
    data = await loadData();
    document.body.dataset.rate = data.meta.rate;
    document.body.dataset.snapshot = data.meta.snapshotAt;
  } catch (err) {
    console.error('[mockup] could not load lots', err);
  }
  mountChrome({ page: 'premium' });
  bindNewsletter();
  if (!data) {
    mountReview({ page: 'lot' });
    $('[data-lot-root]').innerHTML = '<div class="wrap empty"><p class="display d30">We couldn\'t load this lot.</p><p class="muted">Please refresh the page.</p></div>';
    return;
  }
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  // 상태 모음 · My offers 에서 특정 상태로 바로 연다(?sale=B&state=outbid) — 상태는 이 화면에서만, 저장하지 않는다
  if (params.get('sale') === 'A' || params.get('sale') === 'B') store.setSetting('sale', params.get('sale'));
  mountReview({ page: 'lot' });
  lot = data.lots.find(x => x.lot === id);
  if (!lot) return notFound(id);

  store.update('recent', r => [lot.lot, ...r.filter(x => x !== lot.lot)].slice(0, 12));
  document.title = `${fullName(lot)} — Lot ${lot.lot} | TheOne Vintage`;
  $('[data-crumbs]').innerHTML = `<a href="index.html#lots">Premium</a><span aria-hidden="true">·</span>
    <a href="index.html?cat=${encodeURIComponent(lot.genre)}#lots">${esc(lot.genre)}</a><span aria-hidden="true">·</span><span>Lot ${esc(lot.lot)}</span>`;

  const gallery = $('[data-gallery]');
  gallery.innerHTML = galleryHTML(lot);
  mountGallery(gallery, lot);

  const buy = $('[data-buy]');
  bindBuy(buy, lot, renderBuy);
  renderBuy();
  renderCondition();
  renderPrice();
  renderDetails();
  renderSimilar();
  mountSticky();
  startTicker();
  initMotion();
  $('[data-condition]').addEventListener('click', e => {
    if (e.target.closest('[data-ask-photos]')) openRequest(lot, { message: 'Could you send detailed photos of the corners, handles and interior?' });
  });
  window.addEventListener('store:change', e => {
    if (e.detail.key === 'settings' || e.detail.key === 'offers') { renderBuy(); renderSticky(); mountReview({ page: 'lot' }); }
  });
}

function renderBuy() {
  const box = $('[data-buy]');
  box.innerHTML = buyHTML(lot);
  box.dataset.state = lotState(lot);
  paintNotes();
}

// THEONE SCORECARD — 안 보이던 등급을 가장 크게(26쪽 · 결정 5)
function renderCondition() {
  const g = lot.grade;
  const active = g ? GRADES.findIndex(x => x.rank === g.overall) : -1;
  const big = v => (v ? esc(v).replace('+', '<sup>+</sup>') : '—');
  const scale = GRADES.map((x, i) => `<li class="${i === active ? 'is-on' : ''}"><span>${x.name}</span></li>`).join('');
  const marks = lot.notes && lot.notes.length
    ? `<div class="marks"><p class="label">Marks noted at auction</p><ul>${lot.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
       <p class="t13 muted">In the auction house's own words. Ask us for detailed photos of any area.</p></div>` : '';
  $('[data-condition]').innerHTML = `
    <div class="sec-head"><h2 class="display d30">Condition</h2><a class="text-link t13" href="how-we-grade.html">How we grade →</a></div>
    <div class="score" data-reveal data-note="Loupe 스코어카드 + Fashionphile 다섯 칸 척도. 현재 사이트에서 배경과 대비 1.11:1로 안 보이던 등급을 가장 크게. 등급 뜻은 현재 How it works 정의(결정 30)." data-ref="26쪽">
      <p class="label">TheOne scorecard</p>
      <div class="score-cells">
        <div><p class="label">Overall</p><p class="score-big">${g ? big(g.overall) : '—'}</p><p class="t13 muted">${g ? gradeName(g.overall) : 'Not graded'}</p></div>
        <div><p class="label">Exterior</p><p class="score-big">${big(g && g.exterior)}</p><p class="t13 muted">${g && g.exterior ? 'Scale 1 → 3, lower is cleaner' : '—'}</p></div>
        <div><p class="label">Interior</p><p class="score-big">${big(g && g.interior)}</p><p class="t13 muted">${g && g.interior ? 'Scale 1 → 3, lower is cleaner' : '—'}</p></div>
        <div><p class="label">Status</p><p class="score-status">Authenticated<br>in Tokyo</p></div>
      </div>
      ${g ? `<ol class="scale" aria-label="Overall rank on our five-step scale">${scale}</ol>` : `
        <div class="ungraded"><p>The source did not publish a condition grade for this lot. Ask us and we'll send detailed photos before you commit.</p>
        <button class="btn ghost small" type="button" data-ask-photos>Ask for photos</button></div>`}
      ${marks}
    </div>`;
}

// 총액을 쪼개 보여 주고, 시세와 견줄 수 있게(27쪽) — 금액 칸은 운영 데이터로 채운다
function renderPrice() {
  const rows = ['Our fee', 'Express shipping to the US', 'Import duties, prepaid', 'Inspection in Tokyo'];
  const q = encodeURIComponent(`${lot.brand} ${lot.title}`); // 외부 검색은 브랜드를 붙여야 정확하다
  const signedIn = store.get('signedIn');
  $('[data-price]').innerHTML = `
    <div class="price-grid band-sand" data-reveal data-note="샌드 띠 = 정보 구역(결정 41). 왼쪽은 현재 How it works '비용' 표의 항목 그대로, 금액은 회신 때 확정이라 비워 둔다. 오른쪽은 우리 판매 기록 먼저, 외부 비교는 링크 하나(까사 국내 시세 검색 → 미국판)." data-ref="27쪽">
      <div>
        <p class="label">Your US-delivered total</p>
        <table class="total">
          <tr><td>Lot price</td><td class="num">${lot.usd ? usd(lot.usd) : 'On request'}</td></tr>
          ${rows.map(r => `<tr><td>${r}</td><td class="num muted">In your quote</td></tr>`).join('')}
          <tr class="sum"><td>Total, delivered</td><td class="num">$ —</td></tr>
        </table>
        <p class="t13 muted">We confirm this total before you pay. Nothing is charged when you request, and nothing on arrival.</p>
      </div>
      <div>
        <p class="label">Compare prices</p>
        <p class="t13 muted">${esc(fullName(lot))} · sold through TheOne</p>
        <table class="total compare">
          ${['A', 'B', 'C'].map(r => `<tr><td>${esc(lot.title)} · Rank ${r}</td><td class="num">${signedIn ? '$X,XXX' : '<span class="blur">$0,000</span>'}</td></tr>`).join('')}
        </table>
        ${signedIn ? '<p class="t13 muted">Sold prices fill in from our sales records.</p>'
          : `<div class="lock-band"><span class="label">Sign in to see sold prices</span><a class="label" href="sign-in.html?next=${encodeURIComponent(location.pathname.split('/').pop() + location.search)}">Sign in</a></div>`}
        <a class="text-link t13 ext" href="https://www.google.com/search?tbm=shop&q=${q}" target="_blank" rel="noopener noreferrer">Compare on other marketplaces ↗</a>
      </div>
    </div>`;
}

function renderDetails() {
  const rows = [
    ['Lot number', lot.lot], ['Category', lot.genre], ['Item type', lot.itemType], ['Line', lot.line],
    ['Size / details', lot.size], ['Listed', lot.listed], ['Available until', lot.until ? shortDate(lot.until, true) : ''],
    ['Ships from', 'Tokyo, Japan'], ['Photos', `${lot.photoTotal} on file`],
  ].filter(([, v]) => v);
  $('[data-details]').innerHTML = `
    <div class="sec-head"><h2 class="display d30">Details</h2></div>
    <table class="specs" data-reveal>${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;
}

function renderSimilar() {
  const list = similar(data.lots, lot, 4);
  const host = $('[data-similar]');
  host.innerHTML = `<div class="sec-head"><h2 class="display d30">Similar pieces</h2><a class="text-link t13" href="index.html?cat=${encodeURIComponent(lot.genre)}#lots">All ${esc(lot.genre.toLowerCase())}</a></div>
    <div class="grid">${list.map(x => cardHTML(x, { sale: store.setting('sale') })).join('')}</div>`;
  bindCards(host, data.lots, { onQuick: openQuick });
  revealOnScroll();
}

// 따라오는 구매 바 — 데스크톱은 오른쪽 칸이 화면 밖으로 나가면 위에, 모바일은 늘 아래(28쪽)
function renderSticky() {
  const bar = $('[data-sticky]');
  const sale = store.setting('sale');
  const a = exampleAuction(lot);
  const g = lot.grade;
  bar.innerHTML = `<div class="wrap sticky-in">
    <img src="${cardImg(lot)}" alt="" width="48" height="48">
    <div class="sticky-name"><p class="label">Lot ${esc(lot.lot)}</p><p>${esc(fullName(lot))}</p></div>
    <div class="sticky-cell"><p class="label">${sale === 'B' ? 'Current bid' : 'Price'}</p><p class="num">${sale === 'B' ? usd(a.bid) : (lot.usd ? usd(lot.usd) : 'On request')}</p></div>
    <div class="sticky-cell hide-sm"><p class="label">${sale === 'B' ? 'Ends' : 'Condition'}</p><p>${sale === 'B' ? formatEnds(a.ends) : (g ? `Rank ${esc(g.overall)}` : 'Not graded')}</p></div>
    <button class="btn" type="button" data-sticky-cta>${sale === 'B' ? 'Place bid' : (lot.usd ? 'Request this lot' : 'Ask for price')}</button>
  </div>`;
  bar.querySelector('[data-sticky-cta]').addEventListener('click', () => {
    if (sale === 'B') { $('[data-buy]').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    openRequest(lot, { onSent: renderBuy });
  });
}

function mountSticky() {
  renderSticky();
  const bar = $('[data-sticky]');
  const target = $('[data-buy]');
  const io = new IntersectionObserver(([e]) => {
    const past = !e.isIntersecting && e.boundingClientRect.top < 0;
    bar.classList.toggle('is-on', past);
  });
  io.observe(target);
}

function notFound(id) {
  $('[data-lot-root]').innerHTML = `<div class="wrap">
    <div class="empty"><p class="label">Lot ${esc(id || '')}</p><p class="display d30">This lot is no longer available.</p>
    <p class="muted">Here are similar pieces.</p></div>
    <div class="grid">${data.lots.slice(0, 4).map(x => cardHTML(x)).join('')}</div></div>`;
  bindCards($('[data-lot-root]'), data.lots, { onQuick: openQuick });
}

main();
