// Saved — 관심 목록 폴더 세 개, 손님이 이름을 붙인다(11쪽 1번). 내 메모는 카드 아래에(11쪽 3번)
import { esc } from './data.js?v=9d7fdc12f6';
import { startPage } from './page.js?v=9d7fdc12f6';
import { paintNotes } from './review.js?v=9d7fdc12f6';
import { cardHTML, bindCards } from './card.js?v=9d7fdc12f6';
import { openLot } from './lotmodal.js?v=9d7fdc12f6';
import { revealOnScroll } from './motion.js?v=9d7fdc12f6';
import * as store from './store.js?v=9d7fdc12f6';

let data;
let folder = 'all';

function savedLots() {
  const saved = store.get('saved');
  const ids = Object.keys(saved).filter(id => folder === 'all' || saved[id] === Number(folder));
  return ids.map(id => data.lots.find(x => x.lot === id)).filter(Boolean);
}

function render() {
  const saved = store.get('saved');
  const folders = store.get('folders');
  const all = Object.keys(saved).length;
  document.querySelector('[data-folders]').innerHTML =
    `<button class="chip" type="button" data-folder="all" aria-pressed="${folder === 'all'}">All <span class="n">${all}</span></button>` +
    folders.map((f, i) => `<button class="chip" type="button" data-folder="${i}" aria-pressed="${folder === String(i)}">${esc(f)} <span class="n">${Object.values(saved).filter(v => v === i).length}</span></button>`).join('') +
    (folder !== 'all' ? `<button class="text-link t13" type="button" data-rename>Rename “${esc(folders[Number(folder)])}”</button>` : '');

  const lots = savedLots();
  const grid = document.querySelector('[data-saved-grid]');
  const notes = store.get('notes');
  const examples = !all && store.setting('examples');
  const show = lots.length ? lots : (examples ? [data.lots[0], data.lots[3], data.lots[6]] : []);
  document.querySelector('[data-example-line]').hidden = !(examples && !lots.length);
  if (!show.length) {
    grid.innerHTML = `<div class="empty"><p class="display d30">Nothing saved yet</p>
      <p class="muted">Tap ♡ on any lot to keep it here.</p><a class="btn ghost" href="shop.html">Browse lots</a></div>`;
  } else {
    grid.innerHTML = show.map(lot => `<div class="saved-item">${cardHTML(lot, { sale: store.setting('sale') })}
      ${notes[lot.lot] ? `<p class="saved-note"><span class="label">Your note</span>${esc(notes[lot.lot])}</p>` : ''}</div>`).join('');
  }
  paintNotes();
  revealOnScroll();
}

function rename() {
  const i = Number(folder);
  const box = document.querySelector('[data-folders]');
  const btn = box.querySelector('[data-rename]');
  const form = document.createElement('form');
  form.className = 'rename';
  form.innerHTML = `<label class="visually-hidden" for="folder-name">Folder name</label>
    <input class="input" id="folder-name" maxlength="24" value="${esc(store.get('folders')[i])}">
    <button class="btn small" type="submit">Save</button>`;
  btn.replaceWith(form);
  const input = form.querySelector('input');
  input.select();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = input.value.trim();
    if (name) store.update('folders', f => f.map((x, k) => (k === i ? name : x)));
    render();
  });
}

async function main() {
  data = await startPage({ page: 'saved' });
  if (!data) return;
  document.querySelector('[data-folders]').addEventListener('click', e => {
    const f = e.target.closest('[data-folder]');
    if (f) { folder = f.dataset.folder; render(); }
    if (e.target.closest('[data-rename]')) rename();
  });
  bindCards(document.querySelector('[data-saved-grid]'), data.lots, { onOpen: openLot });
  window.addEventListener('store:change', e => { if (['saved', 'settings', 'folders', '*'].includes(e.detail.key)) render(); });
  render();
}

main();
