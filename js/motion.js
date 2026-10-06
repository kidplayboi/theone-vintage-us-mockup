// 움직임 — 부드러운 스크롤(Lenis, MIT · 결정 49)과 스크롤 등장
// 데스크톱 + 움직임 줄이기 꺼짐일 때만 켠다. 대화상자가 열리면 멈춘다.
let lenis = null;

export async function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  revealOnScroll(reduce);
  if (reduce || !fine) return;
  try {
    const { default: Lenis } = await import('https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.mjs');
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -16 }, prevent: node => Boolean(node.closest && node.closest('dialog, .drawer, .note-pop')) });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    watchDialogs();
  } catch (err) {
    console.warn('[mockup] smooth scroll unavailable — using native scroll', err);
  }
}

// 대화상자 · 서랍이 열려 있는 동안 뒤 페이지가 굴러가지 않게
function watchDialogs() {
  const sync = () => {
    const open = document.querySelector('dialog[open]') || document.querySelector('.drawer:not([hidden])');
    if (open) lenis.stop(); else lenis.start();
  };
  new MutationObserver(sync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open', 'hidden'] });
}

// [data-reveal] 은 화면에 들어올 때 아래에서 살짝 올라온다. 카드는 한 줄 안에서 60ms 씩 늦게
let io;
export function revealOnScroll(reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const items = document.querySelectorAll('[data-reveal]:not(.is-in)');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  if (!io) {
    document.documentElement.classList.add('reveal-on');
    io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; revealOnScroll(reduce); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  items.forEach((el, i) => {
    if (el.dataset.revealWatched) return;
    el.dataset.revealWatched = '1';
    if (el.classList.contains('card')) el.style.transitionDelay = `${(i % 4) * 60}ms`;
    io.observe(el);
  });
}
