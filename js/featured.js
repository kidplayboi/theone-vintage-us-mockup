// 목록 Featured 띠(결정 123 · v4-lock §13 L1) — Bezel Auctions 머리 "Featured auctions": 큰 사진 + 제목 + Current bid + Ends in 카드 3장 + 화살표.
// 선정 기준은 지어내지 않는다: 현재가 높은 순 6점(입찰 B 는 예시 경매의 현재가 = 상품가). 필터·검색이 켜지면 띠는 숨고 결과가 바로 보인다.
import { usd, esc, exampleAuction, cardImg, lotUrl, brandName, countdown, localParts } from './data.js?v=29961b91f8';
import { icon } from './icons.js?v=29961b91f8';
import * as store from './store.js?v=29961b91f8';

const HOUR = 3600000;
const priceOf = (lot, sale) => (sale === 'B' ? exampleAuction(lot).bid : lot.usd);
const endsOf = (lot, sale) => (sale === 'B' ? exampleAuction(lot).ends : new Date(lot.ends));

// 입찰(B) = 가격 있는 전 재고에서 · 정가(A) = 운영 데이터의 Live bid(기한 있는 것)만 — 없으면 빈 배열(띠 숨김)
export function featuredLots(lots, sale, n = 6) {
  const pool = sale === 'B' ? lots.filter(x => x.usd) : lots.filter(x => x.kind === 'RT' && x.ends && x.usd);
  return [...pool].sort((a, b) => priceOf(b, sale) - priceOf(a, sale)).slice(0, n);
}

export function featuredHTML(lots, sale) {
  const tz = store.setting('tz');
  return `<div class="wrap">
    <div class="featured-head">
      <span class="label">Featured · highest current bids</span>
      <div class="rail-nav"><button type="button" aria-label="Previous" data-feat-prev>${icon.left}</button><button type="button" aria-label="Next" data-feat-next>${icon.right}</button></div>
    </div>
    <div class="featured-rail" data-feat-rail data-note="Bezel Auctions 머리의 Featured 캐러셀(사진 325px + 제목 · CURRENT BID · ENDS IN)을 흰 카드로. 바탕은 홈 Live now 와 같은 연한 회녹(결정 98). 선정 = 현재가 높은 순 6점 — 지어낸 '추천' 아님. 필터를 켜면 띠가 숨는다." data-ref="Bezel 경매 목록 · 결정 123">${lots.map(lot => {
      const ends = endsOf(lot, sale);
      const hot = ends - Date.now() < HOUR;
      const p = localParts(ends, tz);
      return `<a class="feat" href="${lotUrl(lot)}" data-feat-lot="${esc(lot.lot)}">
        <span class="feat-media"><img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy" decoding="async"></span>
        <span class="feat-body">
          <span class="feat-name"><span class="feat-brand">${esc(brandName(lot.brand))}</span><span class="feat-title">${esc(lot.title)}</span></span>
          <span class="feat-cells">
            <span class="feat-cell"><span class="label">Current bid</span>${store.get('signedIn') ? `<b>${usd(priceOf(lot, sale))}</b>` : '<b class="blur" aria-hidden="true">$0,000</b><span class="visually-hidden">Shown to members</span>'}</span>
            <span class="feat-cell"><span class="label">Ends in</span><b class="feat-ends${hot ? ' warn' : ''}" data-ends="${ends.getTime()}" data-clock title="${esc(p.date)} · ${esc(p.time)}">${countdown(ends)}</b></span>
          </span>
        </span>
      </a>`;
    }).join('')}</div>
  </div>`;
}

// 화살표 · 카드 클릭(상세 창). 새 탭 클릭은 전체 페이지로 그대로
export function bindFeatured(root, lots, { onOpen } = {}) {
  const rail = root.querySelector('[data-feat-rail]');
  if (!rail) return;
  const prev = root.querySelector('[data-feat-prev]');
  const next = root.querySelector('[data-feat-next]');
  const step = () => Math.max(300, rail.clientWidth * 0.66);
  prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  const sync = () => {
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
  };
  rail.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
  rail.addEventListener('click', e => {
    const a = e.target.closest('[data-feat-lot]');
    if (!a || !onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    const lot = lots.find(x => x.lot === a.dataset.featLot);
    if (!lot) return;
    e.preventDefault();
    onOpen(lot);
  });
}
