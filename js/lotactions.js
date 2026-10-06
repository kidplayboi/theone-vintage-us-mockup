// 상세 정보 칸의 동작 — 창 안 문의·제안(더윈 4) · 관심 폴더 · 공유 · 내 메모 · 입찰(B)
// 서버가 없으니 결과는 이 브라우저 저장소에만 남는다
import { usd, bidStep, exampleAuction, fullName, lotUrl } from './data.js?v=20c3d06a4d';
import * as store from './store.js?v=20c3d06a4d';
import { toast } from './chrome.js?v=20c3d06a4d';

// signal — 상세 창처럼 여닫는 곳은 닫을 때 감시를 끊는다(문서 클릭 감시가 쌓이지 않게)
export function bindBuy(box, lot, rerender, { signal } = {}) {
  box.addEventListener('click', e => {
    const t = e.target;
    const open = t.closest('[data-inquire]');
    if (open) return openInquiry(box, open.dataset.inquire);
    if (t.closest('[data-inquiry-cancel]')) return closeInquiry(box);
    if (t.closest('[data-withdraw]')) {
      store.update('offers', list => list.filter(o => !(o.lot === lot.lot && o.status === 'waiting')));
      toast('Cancelled');
      return rerender();
    }
    if (t.closest('[data-fake]')) return toast(t.closest('[data-fake]').dataset.fake);
    if (t.closest('[data-watch]')) return togglePop(box);
    const folder = t.closest('[data-folder]');
    if (folder) {
      const i = Number(folder.dataset.folder);
      const saved = store.get('saved');
      if (i < 0) delete saved[lot.lot]; else saved[lot.lot] = i;
      store.set('saved', saved);
      toast(i < 0 ? 'Removed from saved' : `Saved to ${store.get('folders')[i]}`);
      return rerender();
    }
    if (t.closest('[data-share]')) return share(lot);
    if (t.closest('[data-note-toggle]')) {
      const btn = t.closest('[data-note-toggle]');
      const note = box.querySelector('[data-note-box]');
      note.hidden = !note.hidden;
      btn.setAttribute('aria-expanded', String(!note.hidden));
      if (!note.hidden) note.querySelector('textarea').focus();
      return;
    }
    const step = t.closest('[data-step]');
    if (step) {
      const input = box.querySelector('[data-bid-input]');
      input.value = step.dataset.step;
      input.focus();
      return;
    }
    if (t.closest('[data-offer-open-b]')) {
      store.setSetting('sale', 'A');
      toast('Switched to offers — make your offer below');
    }
  });

  box.addEventListener('submit', e => {
    if (e.target.matches('[data-inquiry]')) { e.preventDefault(); sendInquiry(e.target, lot, rerender); }
    if (e.target.matches('[data-bid-form]')) { e.preventDefault(); placeBid(e.target, lot); }
  });

  // 내 메모 — 손님 혼자 보는 메모, 입력을 멈추면 저장(더윈 2 · 11쪽 3번)
  let timer;
  box.addEventListener('input', e => {
    if (!e.target.matches('[data-note-text]')) return;
    const status = box.querySelector('[data-note-status]');
    status.textContent = 'Saving…';
    clearTimeout(timer);
    timer = setTimeout(() => {
      store.update('notes', n => ({ ...n, [lot.lot]: e.target.value }));
      status.textContent = 'Saved on this device';
    }, 500);
  });

  document.addEventListener('click', e => {
    const pop = box.querySelector('[data-watch-pop]');
    if (pop && !pop.hidden && !e.target.closest('[data-watch-pop], [data-watch]')) closePop(box);
  }, { signal });
  box.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(box); });
}

function openInquiry(box, mode) {
  box.querySelectorAll('[data-inquiry]').forEach(f => { f.hidden = f.dataset.mode !== mode; });
  const actions = box.querySelector('[data-actions]');
  if (actions) actions.hidden = true;
  const form = box.querySelector(`[data-inquiry][data-mode="${mode}"]`);
  if (form) (form.querySelector('[name="amount"]') || form.querySelector('[name="email"]')).focus();
}

function closeInquiry(box) {
  box.querySelectorAll('[data-inquiry]').forEach(f => { f.hidden = true; });
  const actions = box.querySelector('[data-actions]');
  if (actions) actions.hidden = false;
}

function sendInquiry(form, lot, rerender) {
  const err = form.querySelector('[data-inquiry-error]');
  const email = form.email.value.trim();
  const amountInput = form.querySelector('[name="amount"]');
  const amount = amountInput ? Number(String(amountInput.value).replace(/[^0-9.]/g, '')) : null;
  form.querySelectorAll('[aria-invalid]').forEach(el => el.setAttribute('aria-invalid', 'false'));
  if (amountInput && (!amount || amount <= 0)) {
    amountInput.setAttribute('aria-invalid', 'true');
    err.textContent = 'Please enter your offer in US dollars.';
    amountInput.focus();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.email.setAttribute('aria-invalid', 'true');
    err.textContent = 'Please enter a valid email address so we can reply.';
    form.email.focus();
    return;
  }
  err.textContent = '';
  const btn = form.querySelector('[type="submit"]');
  btn.classList.add('is-loading');
  setTimeout(() => {
    btn.classList.remove('is-loading');
    if (store.setting('sendFails')) {
      err.textContent = "We couldn't send your message. Please try again in a moment.";
      return;
    }
    const type = form.dataset.mode === 'offer' ? 'offer' : 'inquiry';
    store.update('offers', list => [...list.filter(o => !(o.lot === lot.lot && o.status === 'waiting')),
      { lot: lot.lot, type, amount: type === 'offer' ? Math.round(amount) : lot.usd, box: form.box.checked, status: 'waiting', at: Date.now() }]);
    toast(type === 'offer' ? `Offer of ${usd(amount)} sent` : 'Inquiry sent — we reply within one business day');
    rerender();
  }, 700);
}

function placeBid(form, lot) {
  const a = exampleAuction(lot);
  const min = a.bid + bidStep(a.bid);
  const input = form.querySelector('[data-bid-input]');
  const err = form.querySelector('[data-bid-error]');
  const amount = Number(String(input.value).replace(/[^0-9.]/g, ''));
  if (!amount || amount < min) {
    input.setAttribute('aria-invalid', 'true');
    err.textContent = `Your max bid must be ${usd(min)} or more.`;
    input.focus();
    return;
  }
  input.setAttribute('aria-invalid', 'false');
  err.textContent = '';
  store.setSetting('state', 'leading');
  toast(`Max bid of ${usd(amount)} placed — you're the highest bidder`);
}

async function share(lot) {
  const url = new URL(lotUrl(lot), location.href).href; // 상세 창에서 공유해도 상품 주소로
  const title = `${fullName(lot)} — TheOne Vintage`;
  try {
    if (navigator.share) { await navigator.share({ title, url }); return; }
    await navigator.clipboard.writeText(url);
    toast('Link copied');
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    console.warn('[mockup] share failed', err);
    toast('Copy the link from the address bar');
  }
}

function togglePop(box) {
  const pop = box.querySelector('[data-watch-pop]');
  const btn = box.querySelector('[data-watch]');
  pop.hidden = !pop.hidden;
  btn.setAttribute('aria-expanded', String(!pop.hidden));
  if (!pop.hidden) pop.querySelector('[data-folder]').focus();
}

function closePop(box) {
  const pop = box.querySelector('[data-watch-pop]');
  if (!pop || pop.hidden) return;
  pop.hidden = true;
  box.querySelector('[data-watch]').setAttribute('aria-expanded', 'false');
}
