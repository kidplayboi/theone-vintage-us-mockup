// 요청서 — 현재 사이트 요청서 문장 그대로. 보내지 않고 이 브라우저에만 기록한다(서버 연결 없음)
import { esc, shortDate } from './data.js?v=ffe41d4f8e';
import { icon } from './icons.js?v=ffe41d4f8e';
import * as store from './store.js?v=ffe41d4f8e';

let dialog;

export function openRequest(lot, { message = '', onSent } = {}) {
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'sheet';
    dialog.setAttribute('aria-labelledby', 'req-title');
    document.body.appendChild(dialog);
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  }
  dialog.innerHTML = `
    <div class="sheet-head">
      <div>
        <p class="label">Request · no payment now</p>
        <h2 class="display d30" id="req-title">Request Lot ${esc(lot.lot)}</h2>
      </div>
      <button class="icon-btn" type="button" aria-label="Close" data-close>${icon.close}</button>
    </div>
    <form class="sheet-body req-form" novalidate data-req>
      <p class="muted">Tell us where it's going. We'll confirm availability and your final US-delivered price (item + shipping + duties) within one business day. No payment now.</p>
      <label class="field"><span>Name *</span><input class="input" name="name" autocomplete="name" required></label>
      <label class="field"><span>Email *</span><input class="input" name="email" type="email" autocomplete="email" required></label>
      <label class="field"><span>Country / State</span><input class="input" name="where" autocomplete="address-level1" placeholder="e.g. New York, US"></label>
      <label class="field"><span>Message</span><textarea class="input" name="message" rows="3">${esc(message)}</textarea></label>
      <p class="form-error" data-req-error role="alert" hidden></p>
      <button class="btn block" type="submit">Send request</button>
      <p class="t13 muted">Requests are open to anyone — no account needed.</p>
    </form>`;
  const form = dialog.querySelector('[data-req]');
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate(form)) return;
    const btn = form.querySelector('[type="submit"]');
    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');
    setTimeout(() => {
      btn.classList.remove('is-loading');
      btn.removeAttribute('aria-busy');
      const err = form.querySelector('[data-req-error]');
      if (store.setting('sendFails')) {
        err.textContent = "We couldn't send your request. Please try again in a moment.";
        err.hidden = false;
        return;
      }
      err.hidden = true;
      store.update('offers', list => [...list.filter(o => !(o.lot === lot.lot && o.status === 'waiting')),
        { lot: lot.lot, type: 'request', amount: lot.usd, status: 'waiting', at: Date.now() }]);
      done(lot);
      if (onSent) onSent();
    }, 700);
  });
  dialog.showModal();
  form.querySelector('input').focus();
}

function validate(form) {
  let ok = true;
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  const check = (input, valid, text) => {
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid) {
      ok = false;
      const p = document.createElement('p');
      p.className = 'field-error';
      p.textContent = text;
      input.insertAdjacentElement('afterend', p);
    }
  };
  check(form.name, form.name.value.trim().length > 1, 'Please enter your name.');
  check(form.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()), 'Please enter a valid email address.');
  if (!ok) form.querySelector('[aria-invalid="true"]').focus();
  return ok;
}

function done(lot) {
  const tomorrow = shortDate(new Date(Date.now() + 86400000));
  dialog.querySelector('[data-req]').outerHTML = `
    <div class="sheet-body req-done" role="status">
      <p class="req-check" aria-hidden="true">${icon.check}</p>
      <p class="display d30">Request sent.</p>
      <p>We'll email you by ${tomorrow} with availability and your final delivered price. Reference: Lot ${esc(lot.lot)}.</p>
      <div class="btn-pair">
        <button class="btn" type="button" data-close-done>Keep browsing</button>
        <a class="btn ghost" href="offers.html">View my offers</a>
      </div>
    </div>`;
  dialog.querySelector('[data-close-done]').addEventListener('click', () => dialog.close());
}
