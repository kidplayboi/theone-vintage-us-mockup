// 실재고 스냅숏(data/lots.json) 읽기와 화면용 표기 도우미
let cache;

export function loadData() {
  if (!cache) {
    cache = fetch('data/lots.json?v=ffe41d4f8e').then(r => {
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

export function exampleAuction(lot) {
  const s = seed(lot);
  const hours = [0.7, 1.2, 3.1, 5.5, 19, 28, 52, 76][s % 8];
  const ends = new Date(Date.now() + hours * 3600000);
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

export function formatEnds(date) {
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
  return `${day} · ${time} ET`;
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

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
