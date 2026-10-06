// 제품 공통 틀 — 상단 띠 · 헤더 · 메뉴 서랍 · 푸터 · 모바일 아래 탭 · 알림 한 줄
import { icon } from './icons.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';

const NAV = [
  ['premium', 'Premium', 'index.html?sale=premium#lots'],
  ['express', 'Express', 'index.html?sale=express#lots'],
  ['classic', 'Classic', 'index.html?sale=classic#lots'],
  ['how', 'How it works', 'how-it-works.html'],
];

const TABS = [
  ['shop', 'Shop', 'index.html#lots'],
  ['ending', 'Ending', 'index.html#ending'],
  ['offers', 'Offers', 'offers.html'],
  ['saved', 'Saved', 'saved.html'],
];

export function mountChrome({ page = '', overlay = false } = {}) {
  const top = document.getElementById('top');
  top.className = 'site-top' + (overlay ? ' is-overlay on-dark' : '');
  top.innerHTML = headerHTML(page);
  document.getElementById('foot').innerHTML = footerHTML();
  const tabs = document.getElementById('tabs');
  if (tabs) tabs.innerHTML = tabsHTML(page);
  bindHeader(top);
  paintAccount();
  window.addEventListener('store:change', e => {
    if (['saved', 'signedIn', '*'].includes(e.detail.key)) paintAccount();
  });
}

function headerHTML(page) {
  const links = NAV.map(([key, label, href]) =>
    `<a href="${href}" ${key === page ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  return `
  <div class="strip">
    <div class="wrap strip-in">
      <p>Ships to the United States · Prices in USD · Duties prepaid</p>
      <p class="strip-account" data-account></p>
    </div>
  </div>
  <div class="nav">
    <div class="wrap nav-in">
      <button class="icon-btn nav-menu" type="button" aria-label="Open menu" aria-expanded="false" data-menu>${icon.menu}</button>
      <a class="wordmark" href="index.html" aria-label="TheOne Vintage home">THEONE<i>·</i>VINTAGE</a>
      <nav class="nav-links" aria-label="Main">${links}</nav>
      <div class="nav-aside">
        <a href="saved.html" ${page === 'saved' ? 'aria-current="page"' : ''}>Saved<span class="nav-count num" data-saved-count></span></a>
        <a href="offers.html" ${page === 'offers' ? 'aria-current="page"' : ''}>My offers</a>
      </div>
    </div>
  </div>
  <div class="drawer" data-drawer hidden>
    <div class="drawer-head">
      <span class="wordmark">THEONE<i>·</i>VINTAGE</span>
      <button class="icon-btn" type="button" aria-label="Close menu" data-menu-close>${icon.close}</button>
    </div>
    <nav class="drawer-links" aria-label="Menu">
      ${NAV.map(([, label, href]) => `<a href="${href}">${label}</a>`).join('')}
      <a href="how-we-grade.html">How we grade</a>
      <a href="saved.html">Saved</a>
      <a href="offers.html">My offers</a>
    </nav>
    <p class="drawer-foot t13 muted">Ships to the United States · Prices in USD · Duties prepaid</p>
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
}

function paintAccount() {
  const n = Object.keys(store.get('saved')).length;
  document.querySelectorAll('[data-saved-count]').forEach(el => { el.textContent = n ? ` · ${n}` : ''; });
  const signedIn = store.get('signedIn');
  document.querySelectorAll('[data-account]').forEach(el => {
    el.innerHTML = signedIn
      ? `<a href="offers.html">Account</a><span aria-hidden="true">/</span><button type="button" data-signout>Sign out</button>`
      : `<a href="sign-in.html">Sign in</a>`;
  });
  document.querySelectorAll('[data-signout]').forEach(b => b.addEventListener('click', () => {
    store.set('signedIn', false);
    toast('Signed out');
  }));
}

function footerHTML() {
  const rate = document.body.dataset.rate;
  return `
  <div class="foot on-dark">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <p class="label">Buy</p>
          <ul>
            <li><a href="how-it-works.html">How it works</a></li>
            <li><a href="how-we-grade.html">How we grade</a></li>
            <li><a href="how-it-works.html#pay">Shipping &amp; duties</a></li>
            <li class="pending" data-note="결제 수단 정책이 정해지면 연다(40쪽 질문 3). 지금은 자리만." data-ref="33쪽">Payment</li>
          </ul>
        </div>
        <div>
          <p class="label">Help</p>
          <ul>
            <li><a href="how-it-works.html#faq">FAQ</a></li>
            <li class="pending" data-note="연락처 페이지 미작성. 현재 사이트도 연락 수단은 요청서뿐." data-ref="33쪽">Contact us</li>
            <li class="pending" data-note="반품 정책이 정해진 뒤에만 연다. 없는 약속은 먼저 쓰지 않는다." data-ref="33·37쪽">Returns</li>
            <li><a href="offers.html">Track an order</a></li>
          </ul>
        </div>
        <div>
          <p class="label">Company</p>
          <ul>
            <li><a href="how-it-works.html#why">About TheOne</a></li>
            <li class="pending" data-note="도쿄 사무실 소개 — 사진·주소 자료가 있을 때." data-ref="33쪽">Our Tokyo office</li>
            <li class="pending" data-note="언론 자료가 있을 때만(Bezel 언론 로고 줄)." data-ref="33쪽">Press</li>
          </ul>
        </div>
        <form class="foot-news" data-news novalidate>
          <label class="label" for="news-email">New lots, every week</label>
          <div class="foot-news-row">
            <input class="input" id="news-email" type="email" name="email" placeholder="Email address" autocomplete="email" required>
            <button class="btn" type="submit">Sign up</button>
          </div>
          <p class="t13 foot-news-msg" data-news-msg role="status"></p>
        </form>
      </div>
      <div class="foot-base">
        <p>© 2026 TheOne Biz Co., Ltd. · Authenticated in Tokyo · Escrow protected</p>
        <p class="label">TheOne exchange rate · $1 = ¥${rate || '—'}</p>
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
