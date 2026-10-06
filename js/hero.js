// 히어로 무대 v3 — Bezel 히어로의 '초록 위 상품'(ref-bezel-s00). 실재고 누끼 4점이 6초마다 바뀌고,
// 꼬리표는 그 로트로 간다(보통 클릭 = 상세 창). 움직임 줄이기 설정이면 돌지 않는다
import { usd, esc, exampleAuction, countdown, lotUrl, brandName } from './data.js?v=9d7fdc12f6';
import { icon } from './icons.js?v=9d7fdc12f6';
import * as store from './store.js?v=9d7fdc12f6';

const HOUR = 3600000;
let timer;

export function mountHero(stage, slides, { onOpen } = {}) {
  if (!stage || !slides.length) return;
  let at = 0;
  stage.innerHTML = `
    <div class="hero-pics">${slides.map((s, i) => `<img class="hero-pic${i ? '' : ' is-on'}" src="${s.img}" alt="${esc(s.lot.brand)} ${esc(s.lot.title)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`).join('')}</div>
    <a class="hero-tag" href="${lotUrl(slides[0].lot)}" data-hero-tag></a>
    <div class="hero-dots" role="group" aria-label="Featured lots">${slides.map((s, i) =>
      `<button type="button" aria-label="Show ${esc(s.lot.title)}" aria-pressed="${i === 0}" data-dot="${i}"></button>`).join('')}</div>`;
  const pics = stage.querySelectorAll('.hero-pic');
  const tag = stage.querySelector('[data-hero-tag]');
  const dots = stage.querySelectorAll('[data-dot]');

  const paintTag = () => {
    const lot = slides[at].lot;
    const bidding = store.setting('sale') === 'B';
    const a = exampleAuction(lot);
    const hot = a.ends - Date.now() < HOUR;
    tag.href = lotUrl(lot);
    tag.innerHTML = `
      <span class="hero-tag-name"><span class="brand-label">${esc(brandName(lot.brand))}</span><b>${esc(lot.title)}</b></span>
      <span class="hero-tag-cells">
        <span><span class="label">${bidding ? 'Current bid' : 'Price'}</span><b class="num">${usd(bidding ? a.bid : lot.usd)}</b></span>
        ${bidding ? `<span><span class="label">Ends in</span><b class="num${hot ? ' warn' : ''}" data-ends="${a.ends.getTime()}">${countdown(a.ends)}</b></span>` : ''}
      </span>
      <span class="hero-tag-go">${icon.arrow}</span>`;
  };
  const show = i => {
    at = (i + slides.length) % slides.length;
    pics.forEach((p, k) => p.classList.toggle('is-on', k === at));
    dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === at)));
    paintTag();
  };
  paintTag();

  dots.forEach(d => d.addEventListener('click', () => { show(Number(d.dataset.dot)); restart(); }));
  tag.addEventListener('click', e => {
    if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    onOpen(slides[at].lot);
  });
  window.addEventListener('store:change', e => { if (e.detail.key === 'settings') paintTag(); });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const restart = () => {
    clearInterval(timer);
    if (!reduce) timer = setInterval(() => show(at + 1), 6000);
  };
  stage.addEventListener('mouseenter', () => clearInterval(timer));
  stage.addEventListener('mouseleave', restart);
  stage.addEventListener('focusin', () => clearInterval(timer));
  restart();
}
