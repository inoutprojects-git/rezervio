// ── ICONS (SVG as React components) ────────────────────────────────────────────
// NOTA: IPhone, IWa, ISms sunt definite in app.js (versiunile originale complete)
// pentru a evita duplicarea — aici raman doar iconitele care NU se repeta acolo.

function IEdit() {
  return h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
  );
}

function ICopy() {
  return h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    h('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
    h('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' })
  );
}

function IMove() {
  return h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    h('polyline', { points: '5 9 2 12 5 15' }),
    h('polyline', { points: '9 5 12 2 15 5' }),
    h('polyline', { points: '15 19 12 22 9 19' }),
    h('polyline', { points: '19 9 22 12 19 15' }),
    h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
    h('line', { x1: '12', y1: '2', x2: '12', y2: '22' })
  );
}

function ITrash() {
  return h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    h('polyline', { points: '3 6 5 6 21 6' }),
    h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
    h('line', { x1: '10', y1: '11', x2: '10', y2: '17' }),
    h('line', { x1: '14', y1: '11', x2: '14', y2: '17' })
  );
}
