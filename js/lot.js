// 로트 상세 페이지 — 사진 · 정보 칸(상세 창과 공용) · 스코어카드 · 총액·시세 · 상세 표 · 비슷한 상품 · 따라오는 바
import { loadData, usd, esc, gradeName, GRADES, similar, cardImg, exampleAuction, formatEnds, fullName } from './data.js?v=cd632a7b68';
import { aboutHTML, checksHTML, askHTML, brandHTML } from './lotsections.js?v=cd632a7b68';
import { mountChrome, bindNewsletter } from './chrome.js?v=cd632a7b68';
import { mountReview, paintNotes } from './review.js?v=cd632a7b68';
import { cardHTML, bindCards, startTicker } from './card.js?v=cd632a7b68';
import { openLot } from './lotmodal.js?v=cd632a7b68';
import { galleryHTML, mountGallery } from './gallery.js?v=cd632a7b68';
import { buyHTML, lotState, estimate, EXAMPLE_RATES, RATES_LABEL } from './buybox.js?v=cd632a7b68';
import { bindBuy } from './lotactions.js?v=cd632a7b68';
import { initMotion, revealOnScroll } from './motion.js?v=cd632a7b68';
import * as store from './store.js?v=cd632a7b68';

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
  mountChrome({ page: 'premium', cat: 'none', data });
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
  $('[data-crumbs]').innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="shop.html">Premium Auction</a><span aria-hidden="true">/</span>
    <a href="shop.html?cat=${encodeURIComponent(lot.genre)}">${esc(lot.genre)}</a><span aria-hidden="true">/</span><span>Lot ${esc(lot.lot)}</span>`;

  const gallery = $('[data-gallery]');
  gallery.innerHTML = galleryHTML(lot);
  mountGallery(gallery, lot);

  const buy = $('[data-buy]');
  bindBuy(buy, lot, renderBuy);
  renderBuy();
  $('[data-about]').innerHTML = aboutHTML(lot);
  renderCondition();
  renderPrice();
  $('[data-ask]').innerHTML = askHTML(lot);
  renderSimilar();
  $('[data-brand]').innerHTML = brandHTML(lot, data.meta);
  mountSticky();
  startTicker();
  initMotion();
  $('[data-condition]').addEventListener('click', e => {
    if (e.target.closest('[data-ask-photos]')) askInBox('Could you send detailed photos of the corners, handles and interior?');
  });
  $('[data-ask]').addEventListener('click', e => {
    if (e.target.closest('[data-ask-lot]')) askInBox('');
  });
  window.addEventListener('store:change', e => {
    if (e.detail.key === 'settings' || e.detail.key === 'offers') { renderBuy(); renderPrice(); renderSticky(); mountReview({ page: 'lot' }); }
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
  // 미등급(116/125): 빈 스코어카드('—' 칸 · Status 칸) 대신 한 문장 + 버튼(결정 127 · 형 10/7 "밀집"). 등급 있는 로트만 큰 숫자 카드
  const card = g ? `
      <p class="label">TheOne scorecard</p>
      <div class="score-cells">
        <div><p class="label">Overall</p><p class="score-big">${big(g.overall)}</p><p class="t13 muted">${gradeName(g.overall)}</p></div>
        <div><p class="label">Exterior</p><p class="score-big">${big(g.exterior)}</p><p class="t13 muted">${g.exterior ? 'Scale 1 → 3, lower is cleaner' : '—'}</p></div>
        <div><p class="label">Interior</p><p class="score-big">${big(g.interior)}</p><p class="t13 muted">${g.interior ? 'Scale 1 → 3, lower is cleaner' : '—'}</p></div>
        <div><p class="label">Status</p><p class="score-status">Authenticated<br>in Tokyo</p></div>
      </div>
      <ol class="scale" aria-label="Overall rank on our five-step scale">${scale}</ol>`
    : `
      <div class="ungraded"><p>Not graded by the source. Authenticated in Tokyo before it ships — ask us and we'll send detailed photos before you commit.</p>
        <button class="btn ghost small" type="button" data-ask-photos>Ask for photos</button></div>`;
  $('[data-condition]').innerHTML = `
    <div class="sec-head"><h2 class="display d30">Condition</h2><a class="more-link" href="how-we-grade.html">How we grade</a></div>
    <div class="score${g ? '' : ' is-na'}" data-reveal data-note="Loupe 스코어카드 + Fashionphile 다섯 칸 척도. 현재 사이트에서 배경과 대비 1.11:1로 안 보이던 등급을 가장 크게. 등급 뜻은 현재 How it works 정의(결정 30). 미등급은 빈 칸 없이 한 문장(결정 127)." data-ref="26쪽 · 결정 127">
      ${card}
      ${marks}
    </div>
    ${checksHTML()}`;
}

// 총액을 항목별로(더윈 1·6·10 · 기획안 27쪽) — 숫자는 EXAMPLE_RATES 한 곳(형 실값 오면 그 파일만 교체 · 결정 89)
function renderPrice() {
  const e = lot.usd ? estimate(lot) : null; // 상자·감정서는 선택 — 총액에서 빼고 줄에 '선택 시'로(청구서와 같은 값)
  const signedIn = store.get('signedIn');
  const gate = !signedIn; // 항목별 총액은 회원만(형 10/6 · 결정 97) — 상품가는 공개, 나머지 줄은 흐리고 가입 CTA
  const blur = '<td class="num"><span class="blur">$0,000</span></td>';
  const cell = v => (gate ? blur : (e ? `<td class="num">${usd(v)}</td>` : '<td class="num muted">In your quote</td>'));
  const opt = v => (gate ? blur : `<td class="num muted">+${usd(v)} if selected</td>`);
  const q = encodeURIComponent(`${lot.brand} ${lot.title}`); // 외부 검색은 브랜드를 붙여야 정확하다
  const next = encodeURIComponent(`${location.pathname.split('/').pop()}${location.search}#price`);
  $('[data-price]').innerHTML = `
    <div class="sec-head"><h2 class="display d30">What you'll pay, line by line</h2></div>
    <div class="price-grid" data-reveal data-note="더윈 1: 관세는 재질별로 다르고, DHL 외곽·대형 추가금까지 전부 체크해 총액. 더윈 10: 낙찰가·관세·수수료·배송비·감정서. 숫자는 EXAMPLE_RATES 한 곳에서(결정 89). 로그아웃이면 상품가만 보이고 나머지 줄은 흐림 + 가입 CTA(형 10/6 · 결정 97) — 판매가 회원 전용(결정 62)과 같은 결." data-ref="더윈 1·6·10 · 결정 88·89·97">
      <div class="price-card${gate ? ' is-locked' : ''}">
        <p class="label">Your US-delivered total${gate ? '' : RATES_LABEL}</p>
        <table class="total">
          <tr><td>Item price</td><td class="num">${lot.usd ? usd(lot.usd) : 'On request'}</td></tr>
          <tr><td>Import duties<span>Rate depends on material — leather, canvas, precious metal</span></td>${cell(e ? e.duty : 0)}</tr>
          <tr><td>Buyer's fee<span>${gate ? 'Shown with an account' : `${Math.round(EXAMPLE_RATES.fee * 100)}% of the item price`}</span></td>${cell(e ? e.fee : 0)}</tr>
          <tr><td>Express shipping to the US<span>DHL Express · remote-area and oversize surcharges included</span></td>${cell(e ? e.ship : 0)}</tr>
          <tr><td>Rigid box to keep the shape<span>Optional · recommended for structured bags</span></td>${opt(EXAMPLE_RATES.box)}</tr>
          <tr><td>Inspection in Tokyo</td><td class="num">Included</td></tr>
          <tr><td>Certificate of authenticity<span>Optional</span></td>${opt(EXAMPLE_RATES.cert)}</tr>
          <tr class="sum"><td>Total, delivered</td>${gate ? blur : `<td class="num">${e ? usd(e.total) : '$ —'}</td>`}</tr>
        </table>
        ${gate ? `<div class="price-gate">
          <p><b>See your delivered total, line by line.</b> Duties, our fee and shipping to your door — free with an account, no card needed.</p>
          <div class="btn-pair"><a class="btn" href="sign-in.html?mode=create&amp;next=${next}">Create a free account</a><a class="text-link t13" href="sign-in.html?next=${next}">Already have one? Log in</a></div>
        </div>` : '<p class="t13 muted">We confirm this total before you pay. Nothing is charged when you inquire, and nothing on arrival.</p>'}
      </div>
      <div class="price-card">
        <p class="label">Recent results</p>
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

// 사진 요청 · 따라오는 바 → 정보 칸의 문의 칸을 열고 메시지를 채운다
function askInBox(message) {
  const box = $('[data-buy]');
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const btn = box.querySelector('[data-inquire="inquiry"]');
  if (!btn) return;
  btn.click();
  const form = box.querySelector('[data-inquiry][data-mode="inquiry"]');
  if (form && message) form.message.value = message;
}

// 사양표는 "About this piece" 로 옮겼다(lotsections.js · 결정 115) — 카탈로그 한 줄 + 2열 표
function renderSimilar() {
  const list = similar(data.lots, lot, 4);
  const host = $('[data-similar]');
  host.innerHTML = `<div class="sec-head"><h2 class="display d30">Similar pieces</h2><a class="more-link" href="shop.html?cat=${encodeURIComponent(lot.genre)}">All ${esc(lot.genre.toLowerCase())} lots</a></div>
    <div class="grid">${list.map(x => cardHTML(x, { sale: store.setting('sale') })).join('')}</div>`;
  bindCards(host, data.lots, { onOpen: openLot });
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
    <div class="sticky-cell hide-sm"><p class="label">${sale === 'B' ? 'Ends' : 'Condition'}</p><p>${sale === 'B' ? formatEnds(a.ends, store.setting('tz')) : (g ? `Rank ${esc(g.overall)}` : 'Not graded')}</p></div>
    <button class="btn" type="button" data-sticky-cta>${sale === 'B' ? (store.get('signedIn') ? 'Place bid' : 'Register to bid') : (lot.usd ? 'Inquire' : 'Ask for price')}</button>
  </div>`;
  bar.querySelector('[data-sticky-cta]').addEventListener('click', () => {
    if (sale === 'B') { $('[data-buy]').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    askInBox('');
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
  bindCards($('[data-lot-root]'), data.lots, { onOpen: openLot });
}

main();
