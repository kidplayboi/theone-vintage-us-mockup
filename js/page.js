// 정적 페이지 공통 시작 — 틀 · 검토 막대 · 메모 · 움직임
import { loadData } from './data.js?v=29961b91f8';
import { mountChrome, bindNewsletter } from './chrome.js?v=29961b91f8';
import { mountReview, paintNotes } from './review.js?v=29961b91f8';
import { initMotion } from './motion.js?v=29961b91f8';

export async function startPage({ page = '', nav = '' } = {}) {
  let data = null;
  try {
    data = await loadData();
    document.body.dataset.rate = data.meta.rate;
    document.body.dataset.snapshot = data.meta.snapshotAt;
    document.querySelectorAll('[data-total]').forEach(el => { el.textContent = data.meta.total.toLocaleString('en-US'); });
  } catch (err) {
    console.error('[mockup] could not load lots', err);
  }
  mountReview({ page });
  mountChrome({ page: nav || page, cat: 'none', data });
  bindNewsletter();
  paintNotes();
  initMotion();
  return data;
}
