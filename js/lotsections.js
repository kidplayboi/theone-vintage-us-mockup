// 상세 페이지 아래 구획 — "About this piece"(카탈로그 문구 + 2열 사양표) · 검수 체크리스트 · 도쿄 팀에 묻기 · 브랜드 띠
// 레퍼런스 대조(10/6 · v4-lock §12): Loupe 로트 = Introduction 글 + THE DETAILS 2열 11행, Bezel 상세 = Details 띠 + Accessories + 컨시어지 카드 + 브랜드 카드.
// 우리 상세는 글이 0 이고 표가 9행(로트 번호·카테고리…)뿐이었다. 지어내지 않고 — 원천의 카탈로그 한 줄과 `sub`·`size` 에 들어 있던 사실을 풀어 적는다.
import { esc, gradeName, brandName, fullName, shortDate, BRAND_LOGOS } from './data.js?v=c8a4122705';
import { icon } from './icons.js?v=c8a4122705';

// 원천 카탈로그 한 줄 — 전각 공백·겹 공백·끝에 붙은 브랜드 반복만 정리하고 내용은 그대로(경매장 표기 그대로 보여 주는 게 Loupe 'as catalogued' 의 결)
const rx = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 정규식용 이스케이프(esc 는 HTML 용)
export function catalogueLine(lot) {
  let s = String(lot.name || '').replace(/　/g, ' ').replace(/\s+/g, ' ').replace(/\s,/g, ',').trim();
  const brand = brandName(lot.brand);
  const tail = new RegExp(`[\\s,]+(${rx(lot.brand)}|${rx(brand)}|${rx(lot.brand.split(' ')[0])}|HER)$`, 'i');
  s = s.replace(tail, '').replace(/^'+/, '').trim(); // 앞의 따옴표만("Bracelet' Ancre…") — 끝의 것은 소유격("Boys'")
  if (!s || s.toLowerCase() === lot.title.toLowerCase()) return '';
  return s;
}

const MATERIAL = /\b(\d{1,2}K|SV925|sterling silver|silver 925|gold|platinum|titanium|steel|SS\b|leather|calfskin|lambskin|caviar|canvas|cashmere|silk|satin|wool|alligator|crocodile|python|lizard|ostrich|rubber|resin|diamonds?|pearl|enamel|epi|monogram|taurillon|togo|epsom|clemence|swift|box calf|denim|nylon)\b/i;
const COLOR = /^(black|white|navy|green|red|blue|brown|beige|grey|gray|pink|rose|orange|yellow|purple|gold|silver|cream|ivory|burgundy|bordeaux|taupe|camel|sanguine|anise|etoupe|etain|noir|blanc|bleu|vert|rouge|multicolou?r)\b/i;
const INCLUDED = /\b(card|box|bag|instruction|pieces|papers|warranty|guarantee|receipt|strap|dust|pouch|booklet|tag)\b/i;

// `sub`(원천 부제) 조각 → 라벨. 분류 못 하면 'Details' 로 모은다 — 버리지 않는다
function classify(frag, lot) {
  const f = frag.trim();
  if (!f) return null;
  if (/^Ref\.?\s*/i.test(f)) return ['Reference', f.replace(/^Ref\.?\s*/i, '')];
  if (/^Cal\.?\s*/i.test(f)) return ['Calibre', f.replace(/^Cal\.?\s*/i, '')];
  if (/^(mechanical|automatic|quartz|manual|hand-wound)/i.test(f)) return ['Movement', f];
  if (/hardware$/i.test(f)) return ['Hardware', f.replace(/\s*hardware$/i, '')];
  if (/stamp$/i.test(f)) return ['Date stamp', f.replace(/\s*stamp$/i, '')];
  if (/serial/i.test(f)) return ['Serial', f];
  if (/\bsize\b/i.test(f) || /^\d+(\.\d+)?\s*(cm|mm)$/i.test(f)) return ['Size', f.replace(/\bsize\s*/i, '').trim()];
  if (MATERIAL.test(f) && !(f.toLowerCase() === 'silver' && /^(Bag|Clothing)$/.test(lot.genre))) return ['Material', f];
  if (COLOR.test(f)) return ['Colour', f];
  return ['Details', f];
}

// `size` 칸은 원천의 자유 입력 — 치수 · 날짜 각인 · 시리얼 · 부속품이 섞여 온다. 모양으로 가른다
function classifySize(v) {
  const s = String(v || '').trim();
  if (!s) return null;
  if (INCLUDED.test(s)) return ['Included', s.replace(/,\s*/g, ' · ')];
  if (/^\d{2}[A-Z]\d{4,}$/i.test(s) || (/\d{5,}/.test(s) && /[A-Z]/i.test(s) && !/\s/.test(s))) return ['Serial', s];
  if (/□|stamp/i.test(s)) return ['Size · stamp', s];
  if (/^\d+(\.\d+)?\s*(cm|mm)?$/i.test(s)) return ['Size', s];
  return ['Listing note', s]; // 뜻을 모르는 코드("U ST 101 GN" · "AB")는 라벨을 지어 붙이지 않는다
}

// 부속품 기본 문장 — 종류에 맞는 말로(시계에 '더스트백'이라 하지 않게)
const INCLUDED_ASK = { Watch: 'box, papers and spare links', Jewelry: 'box and papers', Clothing: 'tags and original packaging' };
const includedLine = lot => `As photographed — ask us to confirm ${INCLUDED_ASK[lot.genre] || 'box, dust bag and papers'} before you bid`;

// 로트의 브랜드('Hermès')와 운영 API 브랜드('HERMES')는 표기가 다르다 — 홈·목록과 같은 정규화로 맞춘다
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function metaBrand(lot, meta) {
  const a = norm(lot.brand);
  return (meta.brands || []).find(b => { const x = norm(b.name); return x === a || x.startsWith(a) || a.startsWith(x); }) || null;
}

// Loupe THE DETAILS 순서로: 물건의 사실(브랜드 → 모델 → 종류 → 레퍼런스 → 소재 → 색 → 금속 → 각인 → 치수 → 무브먼트) 다음에 거래 사실(상태 → 부속품 → 로트 → 등록 · 기한 → 출고지 → 사진)
export function specRows(lot) {
  const facts = new Map();
  const add = (k, v) => { if (!v) return; facts.set(k, facts.has(k) ? `${facts.get(k)} · ${v}` : v); };
  (lot.sub || '').split(' · ').forEach(f => { const r = classify(f, lot); if (r) add(r[0], r[1]); });
  const sz = classifySize(lot.size);
  if (sz) add(sz[0], sz[1]);
  const g = lot.grade;
  const condition = g ? `Rank ${g.overall} · ${gradeName(g.overall)}${g.exterior ? ` · exterior ${g.exterior}` : ''}${g.interior ? ` · interior ${g.interior}` : ''}`
    : 'Not graded by the source · marks and photos below';
  const ORDER = ['Reference', 'Material', 'Colour', 'Hardware', 'Date stamp', 'Size', 'Size · stamp', 'Serial', 'Calibre', 'Movement', 'Details', 'Listing note'];
  const item = [['Brand', brandName(lot.brand)], ['Model', lot.title], ['Item type', lot.itemType], ['Line', lot.line && lot.line !== lot.itemType ? lot.line.replace(/\(.*?\)/, '').trim() : '']];
  ORDER.forEach(k => { if (facts.has(k)) item.push([k, facts.get(k)]); });
  const sale = [
    ['Condition', condition],
    ['Included', facts.get('Included') || includedLine(lot)],
    ['Lot number', lot.lot], ['Listed', shortDate(lot.listed)], ['Available until', lot.until ? shortDate(lot.until, true) : ''],
    ['Ships from', 'Tokyo, Japan'], ['Photos', `${lot.photoTotal} on file`],
  ];
  return { item: item.filter(([, v]) => v), sale: sale.filter(([, v]) => v) };
}

const table = rows => `<table class="specs">${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;

// "About this piece" = 카탈로그 한 줄(원천 표기 그대로 · 출처 표기) + 2열 사양표(Loupe THE DETAILS · Bezel Details)
export function aboutHTML(lot) {
  const line = catalogueLine(lot);
  const { item, sale } = specRows(lot);
  return `
    <div class="sec-head"><h2 class="display d30">About this piece</h2><span class="muted">${esc(fullName(lot))}</span></div>
    ${line ? `<blockquote class="catalogue" data-reveal data-note="원천 카탈로그 한 줄을 그대로(전각 공백·끝의 브랜드 반복만 정리). Loupe 'Introduction' 자리 — 글을 지어내지 않고 경매장 표기를 인용한다(결정 115)." data-ref="Loupe 로트 · 결정 115">
      <p>“${esc(line)}”</p><footer class="t13 muted">Catalogue entry, as listed at the dealer auction in Tokyo</footer></blockquote>` : ''}
    <div class="specs-2col" data-reveal data-note="Loupe THE DETAILS = 2열 11행(브랜드·모델·레퍼런스·연식·소재·색·치수·무브먼트·상태·부속). 우리 표는 로트 번호·카테고리 같은 운영 칸 9행뿐이었다 — 원천 부제(sub)·size 칸에 들어 있던 레퍼런스·소재·색·금속·각인·부속품을 라벨로 풀어 왼쪽 열(물건) · 오른쪽 열(거래)로(결정 115·116)." data-ref="Loupe 로트 · Bezel 상세 Details·Accessories · 결정 115·116">
      ${table(item)}${table(sale)}
    </div>`;
}

// 출고 전 검수 — How it works 에 이미 적힌 사실만(결정 117). Bezel 은 부위별 상태 문장, Loupe 는 상태 에세이. 우리 모델은 낙찰 뒤 도쿄에서 검수하므로 '무엇을 확인하나' 로
export function checksHTML() {
  const items = [
    ['Checked by hand in Tokyo', 'Against the auction house’s own notes, before anything ships.'],
    ['Authenticated in our office', 'Hardware, stamps, stitching and materials, piece by piece.'],
    ['Photos on request', 'Corners, handles, interior or movement — ask before you bid.'],
    ['Packed to keep its shape', 'Rigid box on request for structured bags. Export paperwork handled.'],
  ];
  return `<div class="checks" data-note="낙찰 뒤 도쿄 검수에서 확인하는 것 4가지 — How it works 'Everything between the auction floor and your door' 의 문장 그대로. 미등급 로트에도 '우리가 뭘 보는지'가 보이게(결정 117)." data-ref="How it works · 결정 117">
    <p class="label">Before it ships</p>
    <ul>${items.map(([h, p]) => `<li>${icon.check}<span><b>${esc(h)}</b><span>${esc(p)}</span></span></li>`).join('')}</ul>
  </div>`;
}

// 도쿄 팀에 묻기 — Bezel "Any questions about the X? Your designated concierge… Chat with us now" (사람 영상 카드). 얼굴 정면 금지 규칙이라 사진은 검수 책상 자리표시(결정 119)
export function askHTML(lot) {
  return `
    <div class="ask-block" data-reveal data-note="Bezel 상세의 컨시어지 카드(제목에 모델명 · 한 문장 · 'Chat with us now' · 사람 영상). 우리는 1영업일 회신 약속 + 계정 없이 질문(FAQ 사실). 사진은 v5-images 의 grading-desk 컷 자리(얼굴 정면 금지 · 결정 119)." data-ref="Bezel 상세 · 결정 119">
      <figure class="ph ask-photo has-photo" data-photo="grading-desk" style="--ar: 4 / 5"><img src="assets/editorial/gen/grading-desk.jpg" alt="Gloved hands writing condition notes beside a steel wristwatch on our Tokyo inspection desk" width="1289" height="1600" loading="lazy"></figure>
      <div class="ask-copy">
        <p class="label">Questions about this lot</p>
        <h2 class="display d30">Ask our Tokyo team about the ${esc(lot.title)}</h2>
        <p class="lede">More photos of the corners and interior, exact measurements, or your delivered total to your state. We reply within one business day, and you don’t need an account to ask.</p>
        <div class="btn-pair"><button class="btn" type="button" data-ask-lot>Ask about this lot</button><a class="btn ghost" href="how-it-works.html#faq">Read the FAQ</a></div>
      </div>
    </div>`;
}

// 브랜드 띠 — Bezel 상세 끝의 브랜드 카드("Jaquet Droz … Shop all Jaquet Droz"). 소개 글은 지어내지 않고 로고 · 이 경매의 로트 수 · 링크만(결정 120)
export function brandHTML(lot, meta) {
  const b = metaBrand(lot, meta);
  const logo = b ? BRAND_LOGOS[b.name] : '';
  const name = brandName(b ? b.name : lot.brand);
  const mark = logo
    ? `<span class="brand-mark" role="img" aria-label="${esc(name)}"><i style="-webkit-mask-image:url(assets/brands/${logo}.svg);mask-image:url(assets/brands/${logo}.svg)"></i></span>`
    : `<span class="brand-mark brand-text">${esc(name)}</span>`;
  return `
    <a class="brand-strip" href="shop.html?brand=${encodeURIComponent(b ? b.name : lot.brand)}" data-reveal data-note="Bezel 상세 마지막의 브랜드 카드. 소개 문단은 출처 없는 글이라 빼고 로고(홈과 같은 워드마크) · 운영 API 의 브랜드 로트 수 · 목록 링크만(결정 120)." data-ref="Bezel 상세 · 결정 120">
      ${mark}
      <span class="brand-strip-text"><b>${esc(name)}</b><span class="muted">${b ? `${b.n.toLocaleString('en-US')} lots in this auction` : 'More from this brand'}</span></span>
      <span class="more-link">All ${esc(name)} lots ${icon.arrow}</span>
    </a>`;
}
