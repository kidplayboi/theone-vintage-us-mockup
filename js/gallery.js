// 상세 사진 — 기본은 가로 스크롤 스냅(스크립트 없이도 스와이프),
// 불러와지면 Embla(MIT)로 끌어 넘기기, PhotoSwipe(MIT)로 확대(결정 48). 불러오기에 실패해도 갤러리는 동작한다
import { photo, esc, fullName } from './data.js?v=0f9cad3939';
import { icon } from './icons.js?v=0f9cad3939';

const EMBLA = 'https://cdn.jsdelivr.net/npm/embla-carousel@8.6.0/esm/embla-carousel.esm.js';
const PSWP_LIGHTBOX = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.min.js';
const PSWP_CORE = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js';

export function galleryHTML(lot) {
  const name = fullName(lot);
  const slides = Array.from({ length: lot.photos }, (_, i) => {
    const [w, h] = (lot.dims && lot.dims[i]) || [1000, 1000];
    return `<div class="g-slide"><a href="${photo(lot, i)}" data-pswp-width="${w}" data-pswp-height="${h}" target="_blank" rel="noopener" aria-label="Zoom photo ${i + 1} of ${lot.photos}">
      <img src="${photo(lot, i)}" alt="${esc(name)}, photo ${i + 1}" width="${w}" height="${h}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></a></div>`;
  }).join('');
  const thumbs = Array.from({ length: lot.photos }, (_, i) =>
    `<button type="button" class="g-thumb" data-thumb="${i}" aria-label="Show photo ${i + 1}" aria-current="${i === 0}"><img src="${photo(lot, i)}" alt="" loading="lazy" width="120" height="120"></button>`).join('');
  return `
    <div class="g-main">
      <div class="g-viewport" data-viewport><div class="g-track" data-track>${slides}</div></div>
      <button class="icon-btn g-zoom" type="button" data-zoom aria-label="Zoom in">${icon.expand}</button>
      <div class="pager">
        <button class="icon-btn" type="button" aria-label="Previous photo" data-prev>${icon.left}</button>
        <span class="label num" data-count>1 / ${lot.photos}</span>
        <button class="icon-btn" type="button" aria-label="Next photo" data-next>${icon.right}</button>
      </div>
    </div>
    <p class="g-caption" data-note="사진 밑에 장수(더윈 7). 실재고는 사진 ${lot.photoTotal}장 — 시안에는 ${lot.photos}장만 담았다." data-ref="더윈 7"><span class="num" data-caption>Photo 1 of ${lot.photos}</span><span>${lot.photoTotal} photos on file · tap to zoom</span></p>
    <div class="g-thumbs" data-note="실재고는 사진 ${lot.photoTotal}장 — 시안에는 ${lot.photos}장만 담았다. 사진을 누르면 PhotoSwipe로 확대·핀치 줌(명품은 소재·마감을 확대해 봐야 신뢰한다 — Baymard 명품 감사)." data-ref="11쪽 4번 · 결정 48">${thumbs}</div>`;
}

export async function mountGallery(root, lot) {
  const viewport = root.querySelector('[data-viewport]');
  const slides = [...root.querySelectorAll('.g-slide')];
  const count = root.querySelector('[data-count]');
  const thumbs = [...root.querySelectorAll('[data-thumb]')];
  let index = 0;
  let embla = null;

  const paint = i => {
    index = i;
    count.textContent = `${i + 1} / ${lot.photos}`;
    const cap = root.querySelector('[data-caption]');
    if (cap) cap.textContent = `Photo ${i + 1} of ${lot.photos}`;
    thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === i)));
  };
  const go = i => {
    const next = (i + slides.length) % slides.length;
    if (embla) embla.scrollTo(next);
    else viewport.scrollTo({ left: slides[next].offsetLeft, behavior: 'smooth' });
    paint(next);
  };
  root.querySelector('[data-prev]').addEventListener('click', () => go(index - 1));
  root.querySelector('[data-next]').addEventListener('click', () => go(index + 1));
  thumbs.forEach(t => t.addEventListener('click', () => go(Number(t.dataset.thumb))));
  viewport.addEventListener('scroll', () => {
    if (embla) return;
    paint(Math.round(viewport.scrollLeft / viewport.clientWidth));
  }, { passive: true });
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });

  try {
    const { default: EmblaCarousel } = await import(EMBLA);
    root.classList.add('is-embla');
    embla = EmblaCarousel(viewport, { loop: true, duration: 24 });
    embla.on('select', () => paint(embla.selectedScrollSnap()));
  } catch (err) {
    console.warn('[mockup] Embla unavailable — native scroll-snap gallery', err);
  }

  let lightbox = null;
  try {
    const { default: PhotoSwipeLightbox } = await import(PSWP_LIGHTBOX);
    lightbox = new PhotoSwipeLightbox({
      gallery: root.querySelector('[data-track]'),
      children: 'a',
      pswpModule: () => import(PSWP_CORE),
      bgOpacity: 0.96,
      wheelToZoom: true,
      showHideAnimationType: 'zoom',
    });
    lightbox.on('change', () => { if (lightbox.pswp) go(lightbox.pswp.currIndex); });
    lightbox.init();
  } catch (err) {
    console.warn('[mockup] PhotoSwipe unavailable — photos open in a new tab', err);
  }
  root.querySelector('[data-zoom]').addEventListener('click', () => {
    if (lightbox) lightbox.loadAndOpen(index, { gallery: root.querySelector('[data-track]') });
    else window.open(photo(lot, index), '_blank', 'noopener');
  });
}
