// 로트 카드 v5 — 사진이 카드의 전부(결정 122 · v4-lock §13 L2 · Bezel · Fashionphile · 1stDibs 카드 실측)
// 사진 타일(등급 원 · 북마크 → 폴더 1·2·3 · hover 빠른 입찰 · hover 시세 비교) → 브랜드 1줄 · 이름 1줄 · 가격 1 · 메타 1줄(판매 방식 점 + 마감 ← → 남은 시간)
// 머리 띠(결정 72·93~95)는 뺐다 — 한 화면에 진초록 띠 20개가 격자를 표처럼 보이게 했다(10/7 대조 보드). 띠가 주던 정보는 메타 줄에 그대로:
// 판매 방식은 점 + 종류 글의 색(경매 초록 · Mall 파랑 · 결정 133), 마감 현지 시각은 글, 남은 시간은 오른쪽 숫자. 비회원은 가격 흐림(결정 134). 1시간 안이면 숫자가 빨간 알약(결정 94 유지 · 더윈 12). 카드 어디를 눌러도 상세 창(더윈 4)
import { usd, jpy, yenFor, gradeOf, cardImg, photo, lotUrl, esc, exampleAuction, countdown, localParts, KIND, shortDate, brandName, gradeName, bidStep } from './data.js?v=37cc061e97';
import { icon } from './icons.js?v=37cc061e97';
import * as store from './store.js?v=37cc061e97';
import { toast } from './chrome.js?v=37cc061e97';

const HOUR = 3600000;
const DAY = 86400000;
// 비회원 자리표시(결정 134) — 흐림은 CSS(.is-locked). 실값 대신 모양만 같은 글이라 DOM·복사로 새지 않는다
const LOCKED_PRICE = '<b class="price" aria-hidden="true">$0,000</b><span class="visually-hidden">Price shown to members</span>'; // 덩어리 1개(¥ 줄 없음 · 검사관 3차: 카드마다 2개 = 스켈레톤처럼) · 낭독기는 "$0,000" 대신 안내
// 판매 방식 → 색 클래스(결정 95 · 두 색). 경매 둘(RT 실시간 입찰 · LOW 블라인드 입찰)은 'live' 초록, 고정가 MALL 은 'mall' 파랑. 점·배지·목록 탭·상세 띠가 같은 이름
export const KIND_CLASS = { RT: 'live', LOW: 'live', MALL: 'mall' };

// 남은 시간 문구 — 하루 넘으면 "3 days left", 하루 안이면 시:분:초
export function remain(ends) {
  const ms = ends - Date.now();
  if (ms <= 0) return 'Ended';
  if (ms >= DAY) {
    const d = Math.floor(ms / DAY);
    return `${d} day${d > 1 ? 's' : ''} left`;
  }
  return countdown(ends);
}

// 판매 방식 · 기한 — 상세 창·상세 페이지·카드가 같이 쓴다. kindOverride 는 상태 모음(시안 도구)에서 세 종류를 나란히 보일 때만
export function bandInfo(lot, sale, state, kindOverride = '') {
  const tz = store.setting('tz');
  if (state === 'sold') return { tone: 'done', kind: 'Sold', code: 'SOLD', date: shortDate(new Date(Date.now() - 6 * DAY)), time: '', right: '' };
  if (sale === 'B') {
    const a = exampleAuction(lot);
    return { tone: a.ends - Date.now() < HOUR ? 'hot' : '', kind: 'Live bid', code: 'RT', ...localParts(a.ends, tz), right: remain(a.ends), ends: a.ends };
  }
  const code = KIND[kindOverride] ? kindOverride : (KIND[lot.kind] ? lot.kind : 'MALL');
  const kind = KIND[code];
  if (!lot.ends) return { tone: '', kind, code, date: 'Buy it now', time: '', right: 'In stock' };
  const ends = new Date(lot.ends);
  return { tone: ends - Date.now() < HOUR ? 'hot' : '', kind, code, ...localParts(ends, tz), right: remain(ends), ends, start: lot.listed ? new Date(`${lot.listed}T12:00:00`) : null };
}

// 판매 방식 · 날짜 · 시각(좁은 화면은 시각을 뺀다) — 상세 정보 띠용
export function bandLeft(b) {
  return `<span class="bk">${esc(b.kind)}</span>${b.date ? `<span class="bd"> · ${esc(b.date)}</span>` : ''}${b.time ? `<span class="bt"> · ${esc(b.time)}</span>` : ''}`;
}

// 메타 줄(결정 122) — 왼쪽: 점(종류 색) + "Live bid · Ends Oct 10 · 1:45 PM" / 오른쪽: 남은 시간. 1시간 안이면 왼쪽 글이 "Ending soon", 숫자는 빨간 알약
// 왼쪽 글은 종류의 말투로: 실시간 입찰 = "Ends …" · Time limit(블라인드 입찰) = "Bids close …" · Mall = "Buy it now · until …"
function metaHTML(b) {
  if (b.tone === 'done') return `<p class="card-meta"><span class="card-kind is-done"><i class="dot"></i><span class="card-when">Sold · ${esc(b.date)}</span></span></p>`;
  const cls = KIND_CLASS[b.code] || 'live';
  if (!b.ends) return `<p class="card-meta"><span class="card-kind kind-${cls}"><i class="dot${cls === 'mall' ? ' mall' : ''}"></i><span class="card-when">${esc(b.kind)}</span><span class="card-date">· buy it now</span></span><b class="card-ends">${esc(b.right)}</b></p>`;
  const hot = b.tone === 'hot';
  const when = b.code === 'RT' ? `Ends ${esc(b.date)}` : b.code === 'LOW' ? `Bids close ${esc(b.date)}` : `Buy it now · until ${esc(b.date)}`;
  const left = esc(b.kind); // 종류만 — 날짜는 .card-date 로 분리(390 에선 숨김 · 검사관 10/7: 메타 잘림 19/20)
  // Mall 은 시계(00:00:00)가 아니라 "144 days left" 꼴 — 경매처럼 보이지 않게(data-clock 없음)
  const clock = b.code === 'MALL' && !hot ? '' : 'data-clock';
  return `<p class="card-meta">
      <span class="card-kind kind-${cls}"><i class="dot${cls === 'mall' ? ' mall' : ''}"></i><span class="card-when" data-when="${left}">${hot ? 'Ending soon' : left}</span><span class="card-date"${hot ? ' hidden' : ''}>· ${when}</span></span>
      <b class="card-ends${hot ? ' warn' : ''}" data-ends="${b.ends.getTime()}" ${clock}>${clock ? countdown(b.ends) : remain(b.ends)}</b>
    </p>`;
}

// 리저브 꼬리표 — 사진 왼쪽 아래 흰 알약(Bezel 카드 "No reserve" 꼬리표 · 결정 129). 입찰(B)에서 손님이 알아야 할 둘만(No reserve · Reserve nearly met).
// 글줄에서 빼서 카드 글은 4줄(브랜드 · 이름 · 가격 · 메타)로(10/7 검사: 5줄 + 메타 잘림 15건). 마우스를 올리면 빠른 입찰 버튼이 그 자리라 꼬리표는 숨는다
function reserveTag(lot, b, sale) {
  if (sale !== 'B' || b.tone === 'done') return '';
  const r = exampleAuction(lot).reserve;
  if (r === 'none') return '<span class="card-tag">No reserve</span>';
  if (r === 'nearly') return '<span class="card-tag">Reserve nearly met</span>';
  return '';
}

export function cardHTML(lot, { sale = 'A', state = 'auto', note = '', kind = '' } = {}) {
  const savedAt = store.get('saved')[lot.lot];
  const saved = savedAt !== undefined;
  const folders = store.get('folders');
  const g = gradeOf(lot);
  const rank = g && g.overall; // 모든 카드에 등급 — 글 영역 오른쪽에 세리프 큰 글자 + 작은 이름(형 10/7 시안 A — 점 척도는 "짜친다"로 뺌 · 결정 138) — 실등급 또는 예시 데이터
  const b = bandInfo(lot, sale, state, kind);
  const sold = b.tone === 'done';
  const guest = !store.get('signedIn'); // 비회원 = 가격 마스킹(결정 134 · 까사와 같은 흐림). 사진·제목·마감은 보인다
  let price;
  let sub;
  if (sale === 'B' && !sold) {
    const a = exampleAuction(lot);
    const yen = yenFor(a.bid, lot);
    price = guest ? LOCKED_PRICE : `<b class="price">${usd(a.bid)}</b>`;
    sub = guest ? '' : yen ? `≈ ${jpy(yen)}` : ''; // 엔화를 가격 아래에(의뢰처 10/6 · 더윈 5). 입찰 수는 카드에서 빼고 상세·표에만(결정 108 · Bezel 카드 = 가격 한 줄)
  } else if (lot.usd) {
    const yen = lot.jpy || yenFor(lot.usd, lot);
    price = guest ? LOCKED_PRICE : `<b class="price">${usd(lot.usd)}</b>`;
    sub = sold ? `Sold ${esc(b.date)}` : guest ? '' : yen ? `≈ ${jpy(yen)}` : '';
  } else {
    price = '<b class="price ask">Price on request</b>';
    sub = '';
  }
  return `
  <article class="card${sold ? ' is-sold' : ''}" data-reveal data-lot="${esc(lot.lot)}" ${note ? `data-note="${esc(note)}"` : ''}>
    <div class="card-media">
      <img src="${cardImg(lot)}" alt="" width="600" height="600" loading="lazy" decoding="async">
      ${lot.photoTotal > 1 ? `<img class="card-alt" src="${photo(lot, 1)}" alt="" width="600" height="600" loading="lazy" decoding="async">` : ''}
      ${sale === 'B' && !sold ? `<button class="card-bid" type="button" data-quick-bid="${exampleAuction(lot).bid + bidStep(exampleAuction(lot).bid)}">${icon.gavel}${guest ? 'Sign in to bid' : `Bid ${usd(exampleAuction(lot).bid + bidStep(exampleAuction(lot).bid))}`}</button>` : ''}
      <div class="card-save-wrap">
        <button class="card-save" type="button" data-save aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save'}: ${esc(lot.title)}">${saved ? icon.heartOn : icon.heart}</button>
        <div class="card-folders" role="group" aria-label="Save to a folder">
          ${folders.map((f, i) => `<button type="button" data-folder="${i}" aria-pressed="${savedAt === i}" aria-label="Save to ${esc(f)}" title="${esc(f)}">${i + 1}</button>`).join('')}
        </div>
      </div>
      <a class="card-compare" href="${lotUrl(lot)}#price" data-compare>${icon.compare}Compare prices</a>
      ${reserveTag(lot, b, sale)}
    </div>
    <div class="card-body">
      <div class="card-head">
        <div class="card-id"><p class="card-brand">${esc(brandName(lot.brand))}</p><h3 class="card-title"><a href="${lotUrl(lot)}" data-open>${esc(lot.title)}</a></h3></div>
        ${rank ? `<p class="card-grade" title="Rank ${esc(rank)} · ${esc(gradeName(rank))} — graded S to D in Tokyo"><b>${esc(rank)}</b><span>${esc(gradeName(rank))}</span></p>` : ''}
      </div>
      <p class="card-price${guest && lot.usd ? ' is-locked' : ''}"${guest && lot.usd ? ' title="Prices are shown to members — log in or create a free account"' : ''}>${price}${sub ? `<span class="card-sub">${sub}</span>` : ''}</p>
      ${metaHTML(b)}
    </div>
  </article>`;
}

// 저장 하트 · 폴더 · 카드 열기 — 카드 묶음 바깥 한 곳에서 받는다
export function bindCards(root, lots, { onOpen } = {}) {
  if (!root) return;
  root.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const lot = lots.find(x => x.lot === card.dataset.lot);
    if (!lot) return;
    const folder = e.target.closest('.card-folders [data-folder]');
    if (folder) {
      e.preventDefault();
      toggleSave(lot, folder, Number(folder.dataset.folder));
      return;
    }
    if (e.target.closest('[data-save]')) {
      e.preventDefault();
      toggleSave(lot, e.target.closest('[data-save]'));
      return;
    }
    if (e.target.closest('[data-compare]')) return; // 시세 비교는 상세 페이지의 그 자리로 그대로 간다
    // 빠른 입찰(결정 103 · Bezel 경매 카드) — 로그인이면 다음 호가로 바로, 아니면 상세 창(Register to bid)
    const quick = e.target.closest('[data-quick-bid]');
    if (quick) {
      e.preventDefault();
      if (!store.get('signedIn')) { if (onOpen) onOpen(lot); return; }
      store.setSetting('state', 'leading');
      toast(`Max bid of ${usd(Number(quick.dataset.quickBid))} placed on ${lot.title} — you're the highest bidder`);
      return;
    }
    // 보통 클릭 = 상세 창. 새 탭(⌘/Ctrl/Shift/가운데 버튼)은 전체 페이지로 그대로 간다
    const link = e.target.closest('[data-open]');
    if (link && onOpen && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) {
      e.preventDefault();
      onOpen(lot);
    }
  });
}

// folder 없이 부르면 하트 토글(첫 폴더에 저장 / 해제). 숫자를 주면 그 폴더로 — 같은 폴더를 다시 누르면 해제
export function toggleSave(lot, btn, folder = null) {
  const saved = store.get('saved');
  const was = saved[lot.lot];
  let on;
  if (folder === null) {
    on = was === undefined;
    if (on) saved[lot.lot] = 0; else delete saved[lot.lot];
  } else {
    on = was !== folder;
    if (on) saved[lot.lot] = folder; else delete saved[lot.lot];
  }
  store.set('saved', saved);
  const name = store.get('folders')[on ? saved[lot.lot] : 0];
  toast(on ? `Saved to ${name}` : 'Removed from saved');
  document.querySelectorAll(`.card[data-lot="${CSS.escape(lot.lot)}"]`).forEach(card => paintCard(card, on ? saved[lot.lot] : undefined, lot));
  if (btn && !btn.closest('.card')) btn.setAttribute('aria-pressed', String(on));
  return on;
}

function paintCard(card, at, lot) {
  const on = at !== undefined;
  const heart = card.querySelector('[data-save]');
  if (heart) {
    heart.setAttribute('aria-pressed', String(on));
    heart.innerHTML = on ? icon.heartOn : icon.heart;
    heart.setAttribute('aria-label', `${on ? 'Remove from saved' : 'Save'}: ${lot.title}`);
  }
  card.querySelectorAll('.card-folders [data-folder]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.folder) === at)));
}

// 남은 시간 — 화면의 카운트다운을 1초마다 한 번에 갱신. data-clock 은 시:분:초, 나머지는 "3 days left" 꼴
// 1시간 안으로 들어오면 숫자에 warn(빨간 알약) · 카드 메타 줄의 왼쪽 글은 "Ending soon" · 상세 정보 띠는 is-hot
let ticker;
export function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    document.querySelectorAll('[data-ends]').forEach(el => {
      const ends = new Date(Number(el.dataset.ends));
      const over = ends - Date.now() <= 0;
      el.textContent = over ? 'Ended' : (el.hasAttribute('data-clock') ? countdown(ends) : remain(ends));
      const hot = !over && ends - Date.now() < HOUR;
      el.classList.toggle('warn', hot);
      const meta = el.closest('.card-meta');
      if (meta) {
        const when = meta.querySelector('[data-when]');
        if (when) when.textContent = hot ? 'Ending soon' : when.dataset.when;
        const date = meta.querySelector('.card-date');
        if (date) date.hidden = hot;
      }
      const info = el.closest('.info-band');
      if (info) info.classList.toggle('is-hot', hot);
    });
  }, 1000);
}
