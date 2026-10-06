// 히어로 — 영상은 남기고 관문만 없앤다(19쪽 · 결정 1 · 34)
// 첫 방문: 7초 재생 → 마지막 장면에 멈춤 → 판매 카드가 올라온다. 스크롤·키 입력이 있으면 바로 올린다.
// 다시 온 손님 · 움직임 줄이기 설정: 영상 없이 마지막 장면 사진과 카드.
import * as store from './store.js?v=20c3d06a4d';

export function mountHero() {
  const hero = document.querySelector('[data-hero]');
  const film = hero.querySelector('[data-film]');
  const toggle = hero.querySelector('[data-film-toggle]');
  const mobile = window.matchMedia('(max-width: 720px)').matches;
  film.poster = mobile ? 'assets/intro-end-mobile.jpg' : 'assets/intro-end.jpg';

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    hero.classList.add('is-done');
    toggle.hidden = true;
    store.set('introSeen', true);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('keydown', reveal);
  };
  const onScroll = () => { if (window.scrollY > 40) reveal(); };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (store.get('introSeen') || reduce) {
    hero.classList.add('is-still');
    reveal();
    return;
  }

  film.src = mobile ? 'assets/intro-mobile.mp4' : 'assets/intro.mp4';
  film.addEventListener('ended', reveal);
  film.addEventListener('error', () => {
    console.warn('[mockup] intro film failed to load — showing the still frame');
    hero.classList.add('is-still');
    reveal();
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', reveal);

  // 5초 넘게 움직이는 영상에는 멈춤 버튼이 있어야 한다(WCAG 2.2.2)
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    if (film.paused) { film.play(); toggle.textContent = 'Pause'; } else { film.pause(); toggle.textContent = 'Play'; }
  });

  const playing = film.play();
  if (playing && typeof playing.catch === 'function') {
    playing.catch(err => {
      console.warn('[mockup] autoplay blocked — showing the still frame', err);
      hero.classList.add('is-still');
      reveal();
    });
  }
}
