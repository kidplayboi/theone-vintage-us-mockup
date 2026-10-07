// 시안 도구(제품 밖) — 검토 막대 · 메모 핀. 한국어, 형 검토용(결정 39)
import * as store from './store.js?v=0f9cad3939';

export const LOT_STATES = {
  A: [
    ['auto', '자동(데이터대로)'],
    ['inquiry-sent', '문의 보냄'],
    ['offer-sent', '제안 보냄'],
    ['counter', '역제안 받음'],
    ['accepted', '수락됨'],
    ['sold', '판매 완료'],
    ['expired', '기한 지남'],
  ],
  B: [
    ['auto', '입찰 중'],
    ['leading', '최고가 입찰 중'],
    ['outbid', '상회 입찰됨'],
    ['extended', '연장 중'],
    ['reserve-not-met', '최소가 미달 종료'],
    ['won', '낙찰 — 결제 대기'],
    ['sold', '판매 완료'],
  ],
};

// 결제 화면(pay.html)의 7상태 — v4-lock §7
export const PAY_STATE_LABELS = [
  ['auto', '자동(기록대로)'], ['won', '낙찰'], ['invoice', '청구서 · 결제 기한'], ['paid', '결제됨 · 에스크로'],
  ['packed', '검수 · 포장(도쿄)'], ['shipped', '배송 중'], ['delivered', '수령 · 신고 창'], ['complete', '완료'],
];

export function mountReview({ page = '' } = {}) {
  const host = document.getElementById('review');
  if (!host) return;
  const s = store.get('settings');
  const stateOptions = (LOT_STATES[s.sale] || LOT_STATES.A)
    .map(([v, label]) => `<option value="${v}" ${s.state === v ? 'selected' : ''}>${label}</option>`).join('');
  host.className = 'review on-dark';
  host.innerHTML = `
    <div class="review-in">
      <p class="rv-title"><b>시안</b><span>TheOne Vintage US 리뉴얼 · 실재고 스냅숏 ${document.body.dataset.snapshot || ''}</span></p>
      <div class="rv-group" role="group" aria-label="판매 방식">
        <span>판매 방식</span>
        <button type="button" data-sale="A" aria-pressed="${s.sale === 'A'}">A 정가·제안</button>
        <button type="button" data-sale="B" aria-pressed="${s.sale === 'B'}">B 입찰</button>
      </div>
      <button type="button" class="rv-btn" data-notes aria-pressed="${s.notes}">메모 ${s.notes ? '켜짐' : '꺼짐'}</button>
      ${page === 'lot' ? `<label class="rv-group">상태 <select data-state>${stateOptions}</select></label>
        <button type="button" class="rv-btn" data-fail aria-pressed="${s.sendFails}">보내기 실패 ${s.sendFails ? '켜짐' : '꺼짐'}</button>` : ''}
      ${page === 'offers' || page === 'saved' || page === 'home' ? `<button type="button" class="rv-btn" data-examples aria-pressed="${s.examples}">예시 데이터 ${s.examples ? '켜짐' : '꺼짐'}</button>` : ''}
      ${page === 'pay' ? `<label class="rv-group">결제 상태 <select data-pay-state>${PAY_STATE_LABELS.map(([v, label]) => `<option value="${v}" ${s.payState === v ? 'selected' : ''}>${label}</option>`).join('')}</select></label>` : ''}
      <a class="rv-btn" href="states.html">상태 모음</a>
    </div>`;

  host.querySelectorAll('[data-sale]').forEach(b => b.addEventListener('click', () => {
    store.update('settings', x => ({ ...x, sale: b.dataset.sale, state: 'auto' }));
    mountReview({ page });
  }));
  host.querySelector('[data-notes]').addEventListener('click', () => {
    store.setSetting('notes', !store.setting('notes'));
    mountReview({ page });
    paintNotes();
  });
  const state = host.querySelector('[data-state]');
  if (state) state.addEventListener('change', () => store.setSetting('state', state.value));
  const fail = host.querySelector('[data-fail]');
  if (fail) fail.addEventListener('click', () => { store.setSetting('sendFails', !store.setting('sendFails')); mountReview({ page }); });
  const examples = host.querySelector('[data-examples]');
  if (examples) examples.addEventListener('click', () => { store.setSetting('examples', !store.setting('examples')); mountReview({ page }); });
  const payState = host.querySelector('[data-pay-state]');
  if (payState) payState.addEventListener('change', () => store.setSetting('payState', payState.value));
}

// 메모 핀 — [data-note] 를 가진 요소 왼쪽 위에 번호를 단다
let pop;
export function paintNotes() {
  const on = store.setting('notes');
  document.body.classList.toggle('notes-on', on);
  document.querySelectorAll('.note-pin').forEach(p => p.remove());
  if (pop) pop.hidden = true;
  if (!on) return;
  let n = 0;
  document.querySelectorAll('[data-note]').forEach(el => {
    if (!el.getClientRects().length) return;
    n += 1;
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'note-pin';
    pin.textContent = n;
    pin.setAttribute('aria-label', `시안 메모 ${n}`);
    pin.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openNote(pin, el); });
    if (getComputedStyle(el).position === 'static') el.classList.add('note-host');
    el.prepend(pin);
  });
}

function openNote(pin, el) {
  if (!pop) {
    pop = document.createElement('div');
    pop.className = 'note-pop';
    pop.setAttribute('role', 'dialog');
    document.body.appendChild(pop);
    document.addEventListener('click', e => { if (!pop.contains(e.target)) pop.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') pop.hidden = true; });
  }
  const ref = el.dataset.ref ? `<span class="note-ref">기획안 ${el.dataset.ref}</span>` : '';
  pop.innerHTML = `<p>${el.dataset.note}</p>${ref}`;
  pop.hidden = false;
  const r = pin.getBoundingClientRect();
  const w = Math.min(320, window.innerWidth - 24);
  pop.style.width = `${w}px`;
  pop.style.left = `${Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 12))}px`;
  pop.style.top = `${r.bottom + window.scrollY + 8}px`;
}
