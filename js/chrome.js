// 제품 공통 틀 v3 — 알림 띠 · 초록 막대(워드마크·검색·판매 방식·계정) · 흰 카테고리 줄 · 브랜드 펼침 · 서랍 · 밝은 푸터 · 모바일 아래 탭
// 근거: Bezel 초록 막대+검색(ref-bezel-s00) · 1stDibs/Rebag/WGACA 카테고리 줄 · Bezel 밝은 4열 푸터(ref-bezel-s07)
import { icon } from './icons.js?v=9d7fdc12f6';
import * as store from './store.js?v=9d7fdc12f6';
import { brandName } from './data.js?v=9d7fdc12f6';

// 운영 사이트 상단 메뉴 그대로(Premium Auction · Express · Classic · How It Works)
const SALES = [
  ['premium', 'Premium Auction', 'shop.html'],
  ['express', 'Express', 'shop.html?sale=express'],
  ['classic', 'Classic', 'shop.html?sale=classic'],
];
// 운영 사이트 카테고리 칩 그대로(10/6 실측 8개 + All)
export const CATEGORIES = [
  ['Bag', 'Bags'], ['Watch', 'Watches'], ['Jewelry', 'Jewelry'], ['Clothing', 'Clothing'],
  ['Accessories', 'Accessories'], ['Variety', 'Variety'], ['Tableware', 'Tableware'], ['Coin', 'Coin'],
];

const TABS = [
  ['shop', 'Shop', 'shop.html'],
  ['auctions', 'Auctions', 'index.html#auctions'],
  ['offers', 'My page', 'offers.html'],
  ['saved', 'Saved', 'saved.html'],
];

const FACTS = 'Ships from Tokyo to the US in 6–10 days · Prices in USD · Duties prepaid';
const FACTS_HTML = 'Ships from Tokyo to the US in 6–10 days<span class="hide-xs"> · Prices in USD</span> · Duties prepaid';

export function mountChrome({ page = '', cat = '', data = null, ticker = null } = {}) {
  const top = document.getElementById('top');
  top.className = 'site-top';
  top.innerHTML = headerHTML(page, cat, data, ticker);
  document.getElementById('foot').innerHTML = footerHTML();
  const tabs = document.getElementById('tabs');
  if (tabs) tabs.innerHTML = tabsHTML(page);
  bindHeader(top);
  paintAccount();
  window.addEventListener('store:change', e => {
    if (['saved', 'signedIn', '*'].includes(e.detail.key)) paintAccount();
  });
}

function strip(ticker) {
  if (!ticker || !ticker.length) return `<div class="strip"><p class="wrap strip-in">${FACTS_HTML}</p></div>`;
  // 새 상품 띠(Bezel New Listing 티커) — 실재고 등록일 순. 두 벌 이어 붙여 끊김 없이 흐르게
  const items = ticker.map(t => `<a href="${t.href}"><b>New listing</b><span>${t.text}</span></a>`).join('');
  return `<div class="strip is-ticker" aria-label="New listings">
    <div class="ticker"><div class="ticker-track">${items}${items.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ')}</div></div></div>`;
}

function megaHTML(data) {
  if (!data) return '';
  // 'Others' 는 브랜드가 아니라 묶음 — 맨 뒤로
  const brands = [...data.meta.brands.filter(b => b.name !== 'Others'), ...data.meta.brands.filter(b => b.name === 'Others')];
  return `<div class="mega" data-mega-panel hidden>
    <div class="wrap mega-in">
      <div class="mega-head"><p class="label">Brands</p><a class="more-link" href="shop.html">All ${data.meta.total.toLocaleString('en-US')} lots ${icon.arrow}</a></div>
      <ul class="mega-list">${brands.map(b => `<li><a href="shop.html?brand=${encodeURIComponent(b.name)}"><span>${brandName(b.name)}</span><span class="num">${b.n.toLocaleString('en-US')}</span></a></li>`).join('')}</ul>
    </div></div>`;
}

function headerHTML(page, cat, data, ticker) {
  const sales = SALES.map(([key, label, href]) =>
    `<a href="${href}" ${key === page ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  const cats = [['', 'All lots'], ...CATEGORIES].map(([key, label]) => {
    const on = page === 'premium' && cat === key;
    return `<li><a href="shop.html${key ? `?cat=${key}` : ''}" ${on ? 'aria-current="page"' : ''}>${label}</a></li>`;
  }).join('');
  return `
  ${strip(ticker)}
  <div class="mast on-dark">
    <div class="wrap mast-in">
      <button class="icon-btn mast-menu" type="button" aria-label="Open menu" aria-expanded="false" data-menu>${icon.menu}</button>
      <a class="wordmark" href="index.html" aria-label="TheOne Vintage home">THEONE VINTAGE</a>
      <form class="mast-search" role="search" action="shop.html" data-search>
        ${icon.search}
        <label class="visually-hidden" for="site-q">Search</label>
        <input id="site-q" type="search" name="q" placeholder="Search brands, models, lot numbers" autocomplete="off">
      </form>
      <nav class="mast-nav" aria-label="Sale type">${sales}</nav>
      <div class="mast-aside">
        <button class="icon-btn mast-search-btn" type="button" aria-label="Search" aria-expanded="false" data-search-toggle>${icon.search}</button>
        <a class="mast-icon" href="saved.html" aria-label="Saved" ${page === 'saved' ? 'aria-current="page"' : ''}>${icon.heart}<span class="mast-count num" data-saved-count></span></a>
        <a class="mast-icon hide-sm" href="offers.html" aria-label="My page" ${page === 'offers' ? 'aria-current="page"' : ''}>${icon.user}</a>
        <span class="mast-account" data-account></span>
      </div>
    </div>
  </div>
  <nav class="catbar" aria-label="Categories">
    <div class="wrap catbar-in">
      <ul class="cat-row">${cats}
        ${data ? `<li><button type="button" class="cat-mega" aria-expanded="false" data-mega>Brands ${icon.down}</button></li>` : ''}</ul>
      <ul class="cat-aside">
        <li><a href="how-it-works.html" ${page === 'how' ? 'aria-current="page"' : ''}>How it works</a></li>
        <li><a href="how-we-grade.html" ${page === 'grade' ? 'aria-current="page"' : ''}>How we grade</a></li>
      </ul>
    </div>
    ${megaHTML(data)}
  </nav>
  <div class="drawer" data-drawer hidden>
    <div class="drawer-head">
      <span class="wordmark">THEONE VINTAGE</span>
      <button class="icon-btn" type="button" aria-label="Close menu" data-menu-close>${icon.close}</button>
    </div>
    <nav class="drawer-links" aria-label="Menu">
      <p class="label">Shop</p>
      ${SALES.map(([, label, href]) => `<a href="${href}">${label}</a>`).join('')}
      <p class="label">Categories</p>
      <a href="shop.html">All lots</a>
      ${CATEGORIES.map(([key, label]) => `<a href="shop.html?cat=${key}">${label}</a>`).join('')}
      <p class="label">Help</p>
      <a href="how-it-works.html">How it works</a>
      <a href="how-we-grade.html">How we grade</a>
      <a href="saved.html">Saved</a>
      <a href="offers.html">My page</a>
      <a href="sign-in.html">Log in</a>
      <a href="sign-in.html?mode=create">Create account</a>
    </nav>
    <p class="drawer-foot t13">${FACTS}</p>
  </div>`;
}

function bindHeader(top) {
  const drawer = top.querySelector('[data-drawer]');
  const openBtn = top.querySelector('[data-menu]');
  const close = () => {
    drawer.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    openBtn.focus();
  };
  openBtn.addEventListener('click', () => {
    drawer.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    drawer.querySelector('a').focus();
  });
  top.querySelector('[data-menu-close]').addEventListener('click', close);
  drawer.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // 검색 — 목록 페이지로 보낸다(목록에서는 같은 칸이 결과를 바로 거른다)
  const form = top.querySelector('[data-search]');
  const q = new URLSearchParams(location.search).get('q');
  if (q) form.q.value = q;
  form.addEventListener('submit', e => {
    if (!form.q.value.trim()) e.preventDefault();
  });
  const searchBtn = top.querySelector('[data-search-toggle]');
  searchBtn.addEventListener('click', () => {
    const open = !top.classList.contains('search-open');
    top.classList.toggle('search-open', open);
    searchBtn.setAttribute('aria-expanded', String(open));
    if (open) form.q.focus();
  });

  // 브랜드 펼침 — 눌러서 열고, 바깥 클릭·Esc 로 닫는다
  const megaBtn = top.querySelector('[data-mega]');
  const mega = top.querySelector('[data-mega-panel]');
  if (megaBtn && mega) {
    const set = open => { mega.hidden = !open; megaBtn.setAttribute('aria-expanded', String(open)); };
    megaBtn.addEventListener('click', e => { e.stopPropagation(); set(mega.hidden); });
    document.addEventListener('click', e => { if (!mega.hidden && !mega.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mega.hidden) { set(false); megaBtn.focus(); } });
  }
}

function paintAccount() {
  const n = Object.keys(store.get('saved')).length;
  document.querySelectorAll('[data-saved-count]').forEach(el => { el.textContent = n ? String(n) : ''; });
  const signedIn = store.get('signedIn');
  document.querySelectorAll('[data-account]').forEach(el => {
    el.innerHTML = signedIn
      ? '<button type="button" class="mast-link" data-signout>Sign out</button>'
      : '<a class="mast-link hide-sm" href="sign-in.html">Log in</a><a class="btn light small" href="sign-in.html?mode=create">Sign up</a>';
  });
  document.querySelectorAll('[data-signout]').forEach(b => b.addEventListener('click', () => {
    store.set('signedIn', false);
    toast('Signed out');
  }));
}

function footerHTML() {
  const rate = document.body.dataset.rate;
  return `
  <div class="foot">
    <div class="wrap">
      <div class="foot-top">
        <div class="foot-brand">
          <span class="wordmark">THEONE VINTAGE</span>
          <p>Pre-owned luxury from Japan's dealer-only auctions — inspected in Tokyo, priced in dollars, delivered to the US with duties prepaid.</p>
        </div>
        <form class="foot-news" data-news novalidate>
          <label class="foot-news-title" for="news-email">New lots, every week</label>
          <div class="foot-news-row">
            <input class="input" id="news-email" type="email" name="email" placeholder="Email address" autocomplete="email" required>
            <button class="btn" type="submit">Sign up</button>
          </div>
          <p class="foot-news-msg" data-news-msg role="status"></p>
        </form>
      </div>
      <div class="foot-grid">
        <div>
          <p class="label">Shop</p>
          <ul>
            <li><a href="shop.html">All lots</a></li>
            <li><a href="index.html#auctions">Live auctions</a></li>
            <li><a href="shop.html?cat=Bag">Bags</a></li>
            <li><a href="shop.html?cat=Watch">Watches</a></li>
            <li><a href="shop.html?cat=Jewelry">Jewelry</a></li>
          </ul>
        </div>
        <div>
          <p class="label">Buying</p>
          <ul>
            <li><a href="how-it-works.html">How it works</a></li>
            <li><a href="how-we-grade.html">How we grade</a></li>
            <li><a href="how-it-works.html#pay">Shipping &amp; duties</a></li>
            <li class="pending" data-note="결제 수단 정책이 정해지면 연다(40쪽 질문 3 · 더윈: 경매 특성상 현금 진행 검토 중). 지금은 자리만." data-ref="33쪽">Payment</li>
          </ul>
        </div>
        <div>
          <p class="label">Help</p>
          <ul>
            <li><a href="how-it-works.html#faq">FAQ</a></li>
            <li><a href="offers.html">Track an order</a></li>
            <li class="pending" data-note="연락처 페이지 미작성. 문의는 상품 창의 Inquire로(더윈 4)." data-ref="33쪽">Contact us</li>
            <li class="pending" data-note="반품 정책이 정해진 뒤에만 연다. 없는 약속은 먼저 쓰지 않는다." data-ref="33·37쪽">Returns</li>
          </ul>
        </div>
        <div>
          <p class="label">Company</p>
          <ul>
            <li><a href="how-it-works.html#why">About TheOne</a></li>
            <li class="pending" data-note="도쿄 사무실 소개 — 사진·주소 자료가 있을 때." data-ref="33쪽">Our Tokyo office</li>
            <li class="pending" data-note="언론 자료가 있을 때만(Bezel 언론 로고 줄). 없는 로고는 넣지 않는다." data-ref="33쪽">Press</li>
          </ul>
        </div>
      </div>
      <div class="foot-base">
        <p>© 2026 TheOne Biz Co., Ltd. · Inspected in Tokyo</p>
        <p class="num">Exchange rate used · $1 = ¥${rate || '—'}</p>
      </div>
    </div>
  </div>`;
}

export function bindNewsletter(root = document) {
  const form = root.querySelector('[data-news]');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const msg = form.querySelector('[data-news-msg]');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    input.setAttribute('aria-invalid', String(!ok));
    msg.textContent = ok ? 'Thanks. New lots arrive in your inbox every week.' : 'Please enter a valid email address.';
    msg.classList.toggle('is-error', !ok);
    if (ok) form.reset();
  });
}

function tabsHTML(page) {
  return `<nav class="tabs" aria-label="Shortcuts">${TABS.map(([key, label, href]) =>
    `<a href="${href}" ${key === page ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}

let toastTimer;
export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}
