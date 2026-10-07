// 상세 창 — 가방을 누르면 목록을 떠나지 않고 이 창에서 보고 문의한다(더윈 4 · 까사 상세 모달 · 기획안 11쪽)
import { lotUrl } from './data.js?v=aa557cef18';
import { icon } from './icons.js?v=aa557cef18';
import { galleryHTML, mountGallery } from './gallery.js?v=aa557cef18';
import { buyHTML, lotState } from './buybox.js?v=aa557cef18';
import { bindBuy } from './lotactions.js?v=aa557cef18';
import { paintNotes } from './review.js?v=aa557cef18';
import * as store from './store.js?v=aa557cef18';

let dialog;
let current = null;
let controller = null;

function renderInfo() {
  const info = dialog.querySelector('[data-lw-info]');
  info.innerHTML = buyHTML(current);
  info.dataset.state = lotState(current);
  paintNotes();
}

export function openLot(lot) {
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'sheet wide lot-window';
    dialog.setAttribute('aria-label', 'Lot details');
    document.body.appendChild(dialog);
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (controller) controller.abort(); current = null; });
    window.addEventListener('store:change', e => {
      if (current && dialog.open && ['settings', 'offers', 'saved', 'folders'].includes(e.detail.key)) renderInfo();
    });
  }
  if (controller) controller.abort();
  controller = new AbortController();
  current = lot;
  store.update('recent', r => [lot.lot, ...r.filter(x => x !== lot.lot)].slice(0, 12));
  dialog.innerHTML = `
    <div class="lw">
      <button class="icon-btn lw-close" type="button" aria-label="Close" data-lw-close>${icon.close}</button>
      <section class="lw-gallery" aria-label="Photos" data-lw-gallery>${galleryHTML(lot)}</section>
      <aside class="lw-info info" aria-label="About this lot" data-lw-info></aside>
    </div>
    <p class="lw-foot"><span class="label">Lot ${lot.lot}</span><a class="text-link" href="${lotUrl(lot)}">Open the full lot page — scorecard, total and details →</a></p>`;
  dialog.querySelector('[data-lw-close]').addEventListener('click', () => dialog.close());
  renderInfo();
  bindBuy(dialog.querySelector('[data-lw-info]'), lot, renderInfo, { signal: controller.signal });
  dialog.showModal();
  mountGallery(dialog.querySelector('[data-lw-gallery]'), lot);
}
