/* ---------- NPC 두뇌: 직접 학습한 작은 신경망 (npc-brain.js 의 가중치를 브라우저에서 실행) ---------- */
const BRAIN = { m: null, failed: false };
const BR_CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', BR_JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
function brainLoad() {
  if (BRAIN.m || BRAIN.failed) return BRAIN.m;
  const B = window.NPC_BRAIN;
  if (!B) return null;
  try {
    const dec = (b64, T) => { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new T(u.buffer); };
    const m = { D: B.D, E: B.E, H: B.H, labels: B.labels, sent: B.sent };
    ['emb', 'w1', 'w2', 'wi', 'ws'].forEach(k => { m[k] = dec(B[k], Int8Array); });
    ['embS', 'w1s', 'w2s', 'wis', 'wss', 'b1', 'b2', 'bi', 'bs'].forEach(k => { m[k] = dec(B[k], Float32Array); });
    BRAIN.m = m;
  } catch (e) { BRAIN.failed = true; }
  return BRAIN.m;
}
function brJamo(s) {
  let o = '';
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c >= 0xAC00 && c <= 0xD7A3) { const i = c - 0xAC00; o += BR_CHO[Math.floor(i / 588)] + BR_JUNG[Math.floor((i % 588) / 28)]; const jg = i % 28; if (jg) o += String.fromCharCode(0x11A7 + jg); }
    else o += ch;
  }
  return o;
}
function brFnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function brFeats(t, D) {
  const s = String(t).toLowerCase().replace(/(.)\1{3,}/g, '$1$1$1').replace(/\s+/g, ' ').trim();
  const f = new Set();
  const s0 = '^' + s.split(' ').join('') + '$';
  for (let n = 1; n <= 3; n++) for (let i = 0; i + n <= s0.length; i++) f.add('c' + s0.slice(i, i + n));
  s.split(' ').forEach(w => { w = w.replace(/[?!.~,]+$/, ''); if (w) f.add('w' + w); });
  const j = '^' + brJamo(s.split(' ').join('')) + '$';
  for (let n = 2; n <= 4; n++) for (let i = 0; i + n <= j.length; i++) f.add('j' + j.slice(i, i + n));
  const idx = new Set();
  f.forEach(x => idx.add(brFnv(x) % D));
  return Array.from(idx);
}
function brDense(W, S, b, x, rows, cols, relu) {
  const out = new Float32Array(rows);
  for (let r = 0; r < rows; r++) {
    let acc = 0; const o = r * cols;
    for (let c = 0; c < cols; c++) acc += W[o + c] * x[c];
    let v = acc * S[r] + b[r];
    out[r] = relu && v < 0 ? 0 : v;
  }
  return out;
}
function brSoftmax(z) { let mx = -Infinity; for (const v of z) mx = Math.max(mx, v); let s = 0; const e = Array.from(z, v => { const q = Math.exp(v - mx); s += q; return q; }); return e.map(v => v / s); }
function brainPredict(text) {
  const m = brainLoad();
  if (!m || !String(text || '').trim()) return null;
  const idx = brFeats(text, m.D);
  if (!idx.length) return null;
  const x = new Float32Array(m.E);
  idx.forEach(i => { const sc = m.embS[i], o = i * m.E; for (let k = 0; k < m.E; k++) x[k] += m.emb[o + k] * sc; });
  for (let k = 0; k < m.E; k++) x[k] /= idx.length;
  const h1 = brDense(m.w1, m.w1s, m.b1, x, m.H, m.E, true);
  const h2 = brDense(m.w2, m.w2s, m.b2, h1, m.H, m.H, true);
  const pi = brSoftmax(brDense(m.wi, m.wis, m.bi, h2, m.labels.length, m.H, false));
  const ps = brSoftmax(brDense(m.ws, m.wss, m.bs, h2, 3, m.H, false));
  let bi = 0; pi.forEach((v, i) => { if (v > pi[bi]) bi = i; });
  let bs = 0; ps.forEach((v, i) => { if (v > ps[bs]) bs = i; });
  return { intent: m.labels[bi], p: pi[bi], sent: m.sent[bs], sp: ps[bs] };
}
