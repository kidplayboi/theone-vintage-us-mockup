// 상세 오른쪽 칸의 동작 — 제안 · 요청 · 관심 폴더 · 공유 · 내 메모 · 입찰(B)
// 서버가 없으니 결과는 이 브라우저 저장소에만 남는다
import { usd, bidStep, exampleAuction, fullName } from './data.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';
import { toast } from './chrome.js?v=ffe41d4f8e';
import { openRequest } from './request.js?v=ffe41d4f8e';

export function bindBuy(box, lot, rerender) {
  box.addEventListener('click', e => {
    const t = e.target;
    const req = t.closest('[data-request]');
    if (req) {
      openRequest(lot, {
        message: req.hasAttribute('data-ask-price') ? 'Please send me the price and availability for this lot.' : '',
        onSent: rerender,
      });
      return;
    }
    if (t.closest('[data-offer-open]')) return openOffer(box, t.closest('[data-offer-open]'));
    if (t.closest('[data-withdraw]')) {
      store.update('offers', list => list.filter(o => !(o.lot === lot.lot && o.status === 'waiting')));
      toast('Offer withdrawn');
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
      return toast('Switched to offers — make your offer below');
    }
  });

  box.addEventListener('submit', e => {
    if (e.target.matches('[data-offer-form]')) { e.preventDefault(); sendOffer(e.target, lot, rerender); }
    if (e.target.matches('[data-bid-form]')) { e.preventDefault(); placeBid(e.target, lot); }
  });

  // 내 메모 — 손님 혼자 보는 메모, 입력을 멈추면 저장(11쪽 3번)
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
  });
  box.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(box); });
}

function openOffer(box, btn) {
  const form = box.querySelector('[data-offer-form]');
  const open = form.hidden;
  form.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  const note = box.querySelector('[data-offer-note]');
  if (note) note.hidden = open;
  if (open) form.querySelector('input').select();
}

function sendOffer(form, lot, rerender) {
  const input = form.querySelector('[data-offer-input]');
  const help = form.querySelector('[data-offer-help]');
  const amount = Number(String(input.value).replace(/[^0-9.]/g, ''));
  if (!amount || amount <= 0) {
    input.setAttribute('aria-invalid', 'true');
    help.textContent = 'Please enter your offer in US dollars.';
    help.classList.add('field-error');
    input.focus();
    return;
  }
  input.setAttribute('aria-invalid', 'false');
  help.classList.remove('field-error');
  const btn = form.querySelector('[type="submit"]');
  btn.classList.add('is-loading');
  setTimeout(() => {
    btn.classList.remove('is-loading');
    if (store.setting('sendFails')) {
      help.textContent = "We couldn't send your offer. Please try again in a moment.";
      help.classList.add('field-error');
      return;
    }
    store.update('offers', list => [...list.filter(o => !(o.lot === lot.lot && o.status === 'waiting')),
      { lot: lot.lot, type: 'offer', amount: Math.round(amount), status: 'waiting', at: Date.now() }]);
    toast(`Offer of ${usd(amount)} sent`);
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
  const url = location.href;
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
