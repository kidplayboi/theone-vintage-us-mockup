// 브라우저 저장소 — 시안 안의 관심 목록 · 제안 · 메모 · 검토 설정.
// 사생활 모드처럼 저장이 막히면 이번 방문 동안만 메모리에 둔다.
const KEY = 'tov-mockup-v1';
let memory = {};
let warned = false;

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { ...memory };
  } catch (err) {
    warnOnce(err);
    return { ...memory };
  }
}

function writeAll(all) {
  memory = all;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (err) {
    warnOnce(err);
  }
}

function warnOnce(err) {
  if (warned) return;
  warned = true;
  console.warn('[mockup] browser storage unavailable — keeping state in memory only', err);
}

export const DEFAULTS = {
  settings: { sale: 'A', notes: false, examples: true, state: 'auto', sendFails: false },
  saved: {},
  folders: ['Shortlist', 'Gifts', 'Later'],
  notes: {},
  offers: [],
  signedIn: false,
  introSeen: false,
  recent: [],
};

export function get(key) {
  const all = readAll();
  const def = DEFAULTS[key];
  if (all[key] === undefined) return structuredClone(def);
  if (def && typeof def === 'object' && !Array.isArray(def)) return { ...def, ...all[key] };
  return all[key];
}

export function set(key, value) {
  const all = readAll();
  all[key] = value;
  writeAll(all);
  window.dispatchEvent(new CustomEvent('store:change', { detail: { key } }));
}

export function update(key, fn) {
  set(key, fn(get(key)));
}

export function setting(name) {
  return get('settings')[name];
}

export function setSetting(name, value) {
  update('settings', s => ({ ...s, [name]: value }));
}

export function reset() {
  writeAll({});
  window.dispatchEvent(new CustomEvent('store:change', { detail: { key: '*' } }));
}
