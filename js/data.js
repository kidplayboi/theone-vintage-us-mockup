// 실재고 스냅숏(data/lots.json) 읽기와 화면용 표기 도우미
let cache;

export function loadData() {
  if (!cache) {
    cache = fetch('data/lots.json?v=cd632a7b68').then(r => {
      if (!r.ok) throw new Error(`lots.json ${r.status}`);
      return r.json();
    }).then(d => {
      // 제목 정리(결정 131) — 원천 카탈로그 표기를 사람이 읽는 꼴로. 원문은 rawTitle 에 남긴다(About 인용은 lot.name 원문 그대로)
      d.lots.forEach(l => { l.rawTitle = l.title; l.title = cleanTitle(l.title); });
      return d;
    });
  }
  return cache;
}

// 제목 정리 규칙(결정 131 · 10/7 스냅숏 125개 중 29개가 원문 그대로 — "Shoulder Shoulder Bag Camera Bag PVC/Leather 19152" · "AIR MAX 90 CW6208-111 Men's" · "Tote Bag Grey W")
// 지어내지 않는다, 지우기만 한다: ① 같은 낱말 연속 ② 앞머리 상태 문구 ③ 꼬리의 SKU 코드(글자+숫자 5자 이상) ④ 꼬리의 외자·Size·성별 표기 ⑤ "Grey- Brown" 식 끊긴 하이픈 ⑥ 전각 공백
export function cleanTitle(raw) {
  let t = String(raw || '').replace(/　/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/^(?:excellent|very good|good|unused|new)\s+condition\s+/i, '');
  t = t.replace(/^with\s+/i, '');                                                // "With G-SHOCK …" — 원천이 잘라 붙인 접속사
  t = t.replace(/\s*\((?:approx\.?|approximately)\)\s*/gi, ' ');                 // "(Approx.)"
  t = t.replace(/\s+\/\s*/g, '/');                                               // "Necklace /Pendant" → "Necklace/Pendant"
  t = t.replace(/\b(\w+)\s+\1\b/gi, '$1');                                      // Shoulder Shoulder → Shoulder
  t = t.replace(/(\w)-\s+(\w)/g, '$1-$2');                                       // Grey- Brown → Grey-Brown
  for (let i = 0; i < 3; i++) {                                                  // 꼬리에서 최대 3토큰
    const before = t;
    // 성별 문구는 통째로: "Men's Watch" · "- Men's & Women's" · "Unisex"(앞에 이미 Watch/Case 가 있다)
    t = t.replace(/\s*-?\s*(?:men's|women's|ladies'|mens|womens|unisex)(?:\s*&\s*(?:men's|women's|ladies'))?(?:\s+watch)?$/i, '');
    t = t.replace(/\s+(?:[A-Z]|Size)$/i, '');                                     // 외자 · Size(사이즈 약어 GM/PM/MM 은 이름의 일부라 남긴다 — "City Steamer PM")
    // SKU 꼬리만: 글자 1~3 + 숫자 3자리 이상(+ -숫자)(CW6208-111 · M53456 · WS27472) · 숫자+글자+숫자(10I193DM). 모델명 GW-B5600 · DW-8800 · BGD-565US 는 남긴다(시계는 모델 코드가 이름)
    t = t.replace(/\s+(?:[A-Za-z]{1,3}\d{3,}(?:-\d{2,})?|\d+[A-Za-z]\d+[A-Za-z]*)$/, '');
    t = t.replace(/\s+(\d{4,})$/, (m, n) => (n.length === 4 && +n >= 1900 && +n <= 2030 ? m : '')); // 숫자만: 5자리 이상(19152 · 1142 는 4자리라 남는다…) 또는 연도가 아닌 4자리
    t = t.replace(/\s*[-–&/]\s*$/, '');                                            // 끊긴 꼬리 "Men's &" · "Handbag -"
    if (t === before) break;
  }
  t = t.replace(/\s+/g, ' ').trim();
  return t.split(' ').length >= 2 ? t : String(raw || '').trim();               // 너무 깎여 한 낱말만 남으면 원문
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

// 입찰 기록(예시) — 현재가에서 호가 단위로 내려가며 최근 입찰부터. 입찰자는 익명 꼬리표, 시각은 '분/시간 전'(Loupe Bid History · Bezel View bids · 결정 118)
export function exampleBids(lot) {
  const a = exampleAuction(lot);
  const s = seed(lot);
  const rows = [];
  let amount = a.bid;
  let ago = 2 + (s % 9);
  for (let i = 0; i < Math.min(a.bids, 8); i++) {
    rows.push({ who: `b···${(s * 7 + i * 13) % 90 + 10}`, amount, ago: ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago` });
    amount -= bidStep(amount);
    ago += 7 + ((s + i * 11) % 50);
  }
  return { rows, earlier: Math.max(0, a.bids - rows.length), total: a.bids };
}

// 브랜드 워드마크 파일(assets/brands/*.svg · 위키미디어 공용 PD 글자 로고 · 상표권은 각 회사) — 홈 브랜드 행과 상세 브랜드 띠가 같이 쓴다
export const BRAND_LOGOS = { HERMES: 'hermes', 'LOUIS VUITTON': 'louis-vuitton', CHANEL: 'chanel', ROLEX: 'rolex', Cartier: 'cartier', 'Christian Dior': 'dior', 'Van Cleef&Arpels': 'van-cleef-arpels', Gucci: 'gucci' };

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
