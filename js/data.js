// 실재고 스냅숏(data/lots.json) 읽기와 화면용 표기 도우미
let cache;

export function loadData() {
  if (!cache) {
    cache = fetch('data/lots.json?v=1db980d128').then(r => {
      if (!r.ok) throw new Error(`lots.json ${r.status}`);
      return r.json();
    });
  }
  return cache;
}

export const usd = n => '$' + Math.round(n).toLocaleString('en-US');
export const jpy = n => '¥' + Math.round(n).toLocaleString('en-US');

// 현재 /us/how-it-works §05 의 정의 그대로(결정 30)
export const GRADES = [
  { rank: 'S', name: 'Unused', means: 'As new, unworn.' },
  { rank: 'A', name: 'Excellent', means: 'Barely used, no obvious wear.' },
  { rank: 'B', name: 'Very good', means: 'Light signs of use.' },
  { rank: 'C', name: 'Good', means: 'Visible use, nothing structural.' },
  { rank: 'D', name: 'Fair', means: 'Clear wear, described in full on the lot page.' },
];
export const SCORES = ['1', '1+', '2', '2+', '3'];

export function gradeName(rank) {
  const g = GRADES.find(x => x.rank === rank);
  return g ? g.name : '';
}

// 'Chanel 22 Mini' · 'Grand Seiko First Model' 처럼 제목에 브랜드 낱말이 있으면 브랜드를 또 붙이지 않는다
export function fullName(lot) {
  const word = lot.brand.split(' ')[0].toLowerCase();
  return lot.title.toLowerCase().split(/[\s-]+/).includes(word) ? lot.title : `${lot.brand} ${lot.title}`;
}

// 운영 API 브랜드 이름(LOUIS VUITTON · HERMES · adidas)을 화면용으로 — 필터 값은 원래 이름 그대로 쓴다
const BRAND_FIX = { HERMES: 'Hermès', 'Van Cleef&Arpels': 'Van Cleef & Arpels' };
export function brandName(raw) {
  if (BRAND_FIX[raw]) return BRAND_FIX[raw];
  if (raw === raw.toUpperCase() || raw === raw.toLowerCase()) {
    return raw.toLowerCase().replace(/(^|[\s&.-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  }
  return raw;
}

export const lotUrl = lot => `lot.html?id=${encodeURIComponent(lot.lot)}`;
export const cardImg = lot => `assets/lots/${lot.lot}/card.jpg`;
export const photo = (lot, i) => `assets/lots/${lot.lot}/${i}.jpg`;

const MONTH = { month: 'short', day: 'numeric' };
export function shortDate(input, withYear = false) {
  const d = input instanceof Date ? input : new Date(`${input}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', withYear ? { ...MONTH, year: 'numeric' } : MONTH);
}

export function daysUntil(isoDate) {
  const d = new Date(`${isoDate}T23:59:59`);
  return Math.ceil((d - Date.now()) / 86400000);
}

// 입찰(B) 방식은 아직 실재고가 없다 — 마감 시각·입찰 수는 로트 번호로 정한 예시값
function seed(lot) {
  return lot.lot.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 7);
}

// 마감 시각은 페이지를 연 시각 기준으로 고정 — 다시 그려도 카운트다운이 되감기지 않게. 분 단위로 흩어 같은 시각이 겹치지 않게
const OPENED = Date.now();
export function exampleAuction(lot) {
  const s = seed(lot);
  const hours = [0.7, 1.2, 3.1, 5.5, 19, 28, 52, 76][s % 8];
  const ends = new Date(OPENED + hours * 3600000 + (s % 53) * 60000);
  ends.setSeconds(0, 0);
  return {
    ends,
    bids: 3 + (s % 17),
    reserve: ['nearly', 'met', 'not', 'none'][s % 4],
    bid: lot.usd || 1000 + (s % 40) * 50,
  };
}

export function bidStep(amount) {
  if (amount < 1000) return 25;
  if (amount < 5000) return 50;
  if (amount < 20000) return 100;
  return 250;
}

// 마감 시각 — 손님이 고른 시간대(운영 사이트 "Your local time")로. 카드·상세·따라오는 바가 같은 표기
export function formatEnds(date, tz) {
  return localTime(date, tz);
}

export function countdown(date) {
  const ms = Math.max(0, date - Date.now());
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${String(h % 24).padStart(2, '0')}h`;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

export function similar(lots, lot, n = 4) {
  const others = lots.filter(x => x.lot !== lot.lot && x.usd);
  const same = others.filter(x => x.genre === lot.genre && x.brand === lot.brand);
  const genre = others.filter(x => x.genre === lot.genre && x.brand !== lot.brand);
  return [...same, ...genre, ...others].filter((x, i, a) => a.indexOf(x) === i).slice(0, n);
}

// 시간대 — 운영 사이트의 "Your local time" 선택 그대로(Auto · 미국 6개 · 도쿄 · UTC)
export const TIMEZONES = [
  ['auto', 'Auto (my device)'], ['America/New_York', 'Eastern — New York'], ['America/Chicago', 'Central — Chicago'],
  ['America/Denver', 'Mountain — Denver'], ['America/Phoenix', 'Arizona — Phoenix'], ['America/Los_Angeles', 'Pacific — Los Angeles'],
  ['America/Anchorage', 'Alaska — Anchorage'], ['Pacific/Honolulu', 'Hawaii — Honolulu'], ['Asia/Tokyo', 'Japan — Tokyo'], ['UTC', 'UTC'],
];
export function tzName(tz) {
  return !tz || tz === 'auto' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
}
export function localTime(date, tz) {
  const zone = tzName(tz);
  const d = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: zone });
  const t = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: zone, timeZoneName: 'short' });
  return `${d} · ${t}`;
}
export function localParts(date, tz) {
  const zone = tzName(tz);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: zone }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: zone, timeZoneName: 'short' }),
  };
}
export const KIND = { MALL: 'Mall', RT: 'Live bid', LOW: 'Time limit' };

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
