// 선 아이콘 — 1.5px 선, 글자색을 따른다
const svg = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;

export const icon = {
  heart: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  heartOn: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/>'),
  share: svg('<path d="M12 4v11M8 8l4-4 4 4M5 13v6h14v-6"/>'),
  note: svg('<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M8 9h8M8 13h5"/>'),
  compare: svg('<path d="M4 18h16M7 15V9M12 15V6M17 15v-3"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  left: svg('<path d="M15 5l-7 7 7 7"/>'),
  right: svg('<path d="M9 5l7 7-7 7"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  search: svg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
  expand: svg('<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>'),
  external: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'),
};
