// 빠른 보기 — 목록을 잃지 않고 훑어보고, 전체 페이지로 넘어간다(11쪽 6번)
import { usd, jpy, photo, lotUrl, esc, gradeName, fullName } from './data.js?v=ffe41d4f8e';
import { icon } from './icons.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';
import { toggleSave } from './card.js?v=ffe41d4f8e';

let dialog;
let step = null; // 지금 열린 로트의 사진 넘기기 — 키 이벤트는 한 번만 단다

export function openQuick(lot) {
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'sheet wide';
    dialog.setAttribute('aria-label', 'Quick view');
    document.body.appendChild(dialog);
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' && step) step(-1);
      if (e.key === 'ArrowRight' && step) step(1);
    });
  }
  let index = 0;
  const saved = Boolean(store.get('saved')[lot.lot]);
  const g = lot.grade;
  dialog.innerHTML = `
    <div class="quick">
      <div class="quick-media">
        <img src="${photo(lot, 0)}" alt="${esc(fullName(lot))}, photo 1" width="1000" height="1000" data-q-img>
        <div class="pager">
          <button class="icon-btn" type="button" aria-label="Previous photo" data-q-prev>${icon.left}</button>
          <span class="label num" data-q-count>1 / ${lot.photos}</span>
          <button class="icon-btn" type="button" aria-label="Next photo" data-q-next>${icon.right}</button>
        </div>
      </div>
      <div class="quick-info">
        <button class="icon-btn quick-close" type="button" aria-label="Close" data-q-close>${icon.close}</button>
        <p class="brand-label">${esc(lot.brand)}</p>
        <h2 class="display d30">${esc(lot.title)}</h2>
        ${lot.sub ? `<p class="t13 muted">${esc(lot.sub)}</p>` : ''}
        <p class="quick-price">${lot.usd
          ? `<span class="num">${usd(lot.usd)}</span> <span class="label">≈ ${jpy(lot.jpy)}</span>`
          : '<span>Price on request</span>'}</p>
        <p class="t13 muted">${g ? `Rank ${esc(g.overall)} — ${gradeName(g.overall)}` : 'Not graded — ask us for detailed photos.'}</p>
        <div class="btn-row">
          <a class="btn" href="${lotUrl(lot)}">View full lot</a>
          <button class="btn ghost" type="button" data-q-save aria-pressed="${saved}">${saved ? 'Saved' : 'Save'}</button>
        </div>
        <p class="label">Lot ${esc(lot.lot)} · ${lot.photoTotal} photos on the full page</p>
      </div>
    </div>`;
  const img = dialog.querySelector('[data-q-img]');
  const count = dialog.querySelector('[data-q-count]');
  const go = by => {
    index = (index + by + lot.photos) % lot.photos;
    img.src = photo(lot, index);
    img.alt = `${fullName(lot)}, photo ${index + 1}`;
    count.textContent = `${index + 1} / ${lot.photos}`;
  };
  dialog.querySelector('[data-q-prev]').addEventListener('click', () => go(-1));
  dialog.querySelector('[data-q-next]').addEventListener('click', () => go(1));
  dialog.querySelector('[data-q-close]').addEventListener('click', () => dialog.close());
  step = go;
  const saveBtn = dialog.querySelector('[data-q-save]');
  saveBtn.addEventListener('click', () => {
    const on = toggleSave(lot, saveBtn);
    saveBtn.textContent = on ? 'Saved' : 'Save';
  });
  dialog.showModal();
}
