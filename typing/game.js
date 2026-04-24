// ============================================================
// SOUND ENGINE (Web Audio API)
// ============================================================
const SFX = {
  ctx: null,
  enabled: true,

  _init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.enabled = false;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  play(type) {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (type === 'correct') {
      [880, 1100].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + i * 0.05);
        g.gain.setValueAtTime(0, now + i * 0.05);
        g.gain.linearRampToValueAtTime(0.18, now + i * 0.05 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.18);
        o.start(now + i * 0.05);
        o.stop(now + i * 0.05 + 0.2);
      });

    } else if (type === 'miss') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(220, now);
      o.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      o.start(now);
      o.stop(now + 0.15);

    } else if (type === 'end') {
      [523, 415, 330, 262].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.connect(g); g.connect(ctx.destination);
        const t = now + i * 0.16;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.22, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t);
        o.stop(t + 0.25);
      });

    } else if (type === 'combo') {
      [660, 880, 1100].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.connect(g); g.connect(ctx.destination);
        const t = now + i * 0.07;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.start(t);
        o.stop(t + 0.18);
      });
    }
  }
};

function toggleSound() {
  SFX.enabled = !SFX.enabled;
  document.getElementById('sound-toggle').textContent = SFX.enabled ? '🔊' : '🔇';
}

// ============================================================
// CSV PARSER
// ============================================================
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = [];
    let cur = '', inQ = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { fields.push(cur); cur = ''; }
      else { cur += c; }
    }
    fields.push(cur);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (fields[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

function buildElementsFromCSV(rows) {
  return rows.map(r => ({
    no:     parseInt(r.no),
    sym:    r.sym,
    ja:     r.ja,
    en:     r.en,
    hira:   r.hira,
    romaji: r.romaji,
    alts:   r.alts ? r.alts.split('|').map(s => s.trim()).filter(Boolean) : [],
    trivia: r.trivia,
    diff:   parseInt(r.diff),
    score:  parseInt(r.score),
  }));
}

// ============================================================
// DATA
// ============================================================
let ELEMENTS = [];

const PT_GRID = [
  [1,1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[2,18],
  [3,1],[4,2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[5,13],[6,14],[7,15],[8,16],[9,17],[10,18],
  [11,1],[12,2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[13,13],[14,14],[15,15],[16,16],[17,17],[18,18],
  [19,1],[20,2],[21,3],[22,4],[23,5],[24,6],[25,7],[26,8],[27,9],[28,10],[29,11],[30,12],[31,13],[32,14],[33,15],[34,16],[35,17],[36,18],
  [37,1],[38,2],[39,3],[40,4],[41,5],[42,6],[43,7],[44,8],[45,9],[46,10],[47,11],[48,12],[49,13],[50,14],[51,15],[52,16],[53,17],[54,18],
  [55,1],[56,2],[-1,3],[72,4],[73,5],[74,6],[75,7],[76,8],[77,9],[78,10],[79,11],[80,12],[81,13],[82,14],[83,15],[84,16],[85,17],[86,18],
  [87,1],[88,2],[-2,3],[104,4],[105,5],[106,6],[107,7],[108,8],[109,9],[110,10],[111,11],[112,12],[113,13],[114,14],[115,15],[116,16],[117,17],[118,18],
  [0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],
  [0,0],[0,0],[57,3],[58,4],[59,5],[60,6],[61,7],[62,8],[63,9],[64,10],[65,11],[66,12],[67,13],[68,14],[69,15],[70,16],[71,17],[0,0],
  [0,0],[0,0],[89,3],[90,4],[91,5],[92,6],[93,7],[94,8],[95,9],[96,10],[97,11],[98,12],[99,13],[100,14],[101,15],[102,16],[103,17],[0,0],
];

// ============================================================
// CSV LOADING
// ============================================================
async function loadElements() {
  const bar = document.getElementById('loading-bar');
  const msg = document.getElementById('loading-msg');
  try {
    bar.style.width = '20%';
    msg.textContent = 'FETCHING elements.csv...';
    const res = await fetch('./elements.csv');
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + res.statusText);
    bar.style.width = '60%';
    msg.textContent = 'PARSING DATA...';
    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length === 0) throw new Error('CSVのパースに失敗しました(0行)');
    ELEMENTS = buildElementsFromCSV(rows);
    bar.style.width = '100%';
    msg.textContent = 'OK -- ' + ELEMENTS.length + '元素読み込み完了';
    document.getElementById('el-count-badge').textContent = '全' + ELEMENTS.length + '元素収録';
    await new Promise(r => setTimeout(r, 500));
    document.getElementById('scr-loading').style.display = 'none';
    showScreen('title');
  } catch (err) {
    bar.style.background = 'var(--error)';
    bar.style.width = '100%';
    msg.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'loading-err';
    div.innerHTML =
      '<strong>&#x26A0; ロードエラー</strong><br><br>' +
      err.message + '<br><br>' +
      '<code>elements.csv</code> が同じフォルダに存在するか確認してください。<br><br>' +
      'ローカルで開く場合は簡易サーバーが必要です：<br>' +
      '<code>python3 -m http.server 8080</code><br>' +
      'または VSCode の Live Server 拡張を使用してください。';
    document.getElementById('scr-loading').appendChild(div);
    console.error('[元素タイピング] load error:', err);
  }
}

// ============================================================
// GAME CONFIG
// ============================================================
const DIFF_INFO = {
  1: { label: '初級',     desc: '有名な元素から出題。まずはここから！' },
  2: { label: '中級',     desc: '初級＋中程度の難度の元素から出題。' },
  3: { label: '上級',     desc: '全元素から出題。豆知識問題も多め。' },
  0: { label: 'ランダム', desc: '全元素からランダムで出題。難易度混在。' },
};
const MODE_INFO = {
  timeattack: { label: 'タイムアタック', time: 60 },
  endless:    { label: 'エンドレス',     lives: 5 },
  practice:   { label: '学習モード' },
};
const QTYPE_LABELS = { name: '名前', symbol: '記号', trivia: '豆知識' };
const QTYPE_MULT   = { name: 1,     symbol: 1.5,    trivia: 2 };

// ============================================================
// GAME STATE
// ============================================================
let G = {
  mode: 'timeattack',
  diff: 1,
  score: 0,
  combo: 0,
  maxCombo: 0,
  lives: 5,
  count: 0,
  totalMisses: 0,
  timeLeft: 60,
  timerID: null,
  running: false,
  pool: [],
  poolIdx: 0,
  curEl: null,
  curQType: 'name',
  // confirmed input so far for the current question
  typed: '',
  // remaining valid completions (each starts with G.typed)
  validTargets: [],
  missesOnEl: 0,
  elResults: {},
  practicing: false,
  // lock flag: prevent input between correctAnswer() and nextQuestion()
  locked: false,
};

// ============================================================
// INPUT NORMALIZER
// ============================================================
/**
 * Normalize a raw character from keyboard / IME.
 * - NFKC: converts full-width alphanumerics (ａ→a, Ａ→A, １→1 …)
 * - toLowerCase
 * - Returns a single ASCII letter or '' if not usable.
 */
function normalizeChar(raw) {
  if (!raw || raw.length === 0) return '';
  // NFKC normalization handles full-width characters
  const normalized = raw.normalize('NFKC').toLowerCase();
  // Accept only a-z (romaji only)
  if (/^[a-z]$/.test(normalized)) return normalized;
  return '';
}

// ============================================================
// "N" STATE MACHINE
// ============================================================
/**
 * The "n" pending state sits between G.typed and validTargets.
 *
 * Rules:
 *   1. When the user types 'n' and G.typed+'n' is a valid prefix for
 *      at least one target, we do NOT commit it yet — we store it as
 *      pendingN = true and wait for the next character.
 *
 *   2. Next character is 'n' (i.e. "nn"):
 *        Commit 'n' first, then process the second 'n' normally.
 *        This handles both "nn" as a single ん-sound and cases like
 *        "manngan" where nn = ん+n.
 *
 *   3. Next character is a consonant that is NOT a vowel or 'y':
 *        'n' is valid as ん — commit it and process the consonant.
 *
 *   4. Next character is a vowel (a/i/u/e/o) or 'y':
 *        'n' alone cannot represent ん here.
 *        Only targets that began with 'nn' at this position survive.
 *        If none survive → wrongInput().
 *
 *   5. End of word while pendingN is true:
 *        The 'n' at end of word is always valid — commit it and check
 *        for completion.
 *
 * pendingNState object:
 *   active  : boolean
 *   snapshot: the validTargets list AT THE MOMENT 'n' was typed.
 *             Used to distinguish "nn" vs "n+consonant" paths.
 */
let pendingNState = {
  active: false,
  snapshot: [],   // validTargets just before 'n' was stored
};

function resetPendingN() {
  pendingNState.active = false;
  pendingNState.snapshot = [];
}

/**
 * Commit the pending 'n' — advance G.typed and narrow G.validTargets.
 * Returns false if no targets survive (should not happen if called correctly).
 */
function commitPendingN() {
  const newTyped = G.typed + 'n';
  const filtered = G.validTargets.filter(t => t.startsWith(newTyped));
  if (filtered.length === 0) return false;
  G.typed = newTyped;
  G.validTargets = filtered;
  resetPendingN();
  return true;
}

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);

/**
 * Main input processor.
 * Called once per character (already normalized to lowercase ASCII a-z).
 */
function processChar(c) {
  if (!G.running || G.practicing || G.locked) return;

  if (pendingNState.active) {
    // ---- resolve pending 'n' ----

    if (c === 'n') {
      // User typed a second 'n'.
      // Commit the first 'n', then process the second 'n' from scratch.
      if (!commitPendingN()) { wrongInput(); return; }
      // Now process this second 'n' — recurse (not pending yet)
      processChar('n');
      return;
    }

    if (VOWELS.has(c) || c === 'y') {
      // Vowel/y after 'n' → only "nn"-path targets survive.
      // A target had 'nn' at this position if its prefix at (G.typed.length)
      // starts with 'nn' — i.e. targets where [typed+'nn'] is a prefix.
      const nnTyped = G.typed + 'nn';
      const nnTargets = G.validTargets.filter(t => t.startsWith(nnTyped));
      if (nnTargets.length === 0) {
        // No valid path — wrong input, do NOT commit the 'n'
        wrongInput();
        return;
      }
      // Commit both 'n' chars, then process c
      G.typed = nnTyped;
      G.validTargets = nnTargets;
      resetPendingN();
      processChar(c);
      return;
    }

    // Consonant (not n, not vowel, not y) → 'n' is a valid ん
    if (!commitPendingN()) { wrongInput(); return; }
    // Fall through to process c normally below
  }

  // ---- normal character processing ----
  const newTyped = G.typed + c;
  const filtered = G.validTargets.filter(t => t.startsWith(newTyped));

  if (filtered.length === 0) {
    // Special case: the character is 'n' and G.typed+'n' is a valid prefix
    // for at least one target → don't reject yet; store as pending.
    if (c === 'n') {
      const nFiltered = G.validTargets.filter(t => t.startsWith(newTyped));
      // nFiltered will be 0 here since filtered is already 0,
      // but check anyway to be safe (logic is identical — this branch is dead).
      wrongInput();
      return;
    }
    wrongInput();
    return;
  }

  // At least one target matches newTyped as a prefix.
  if (c === 'n') {
    // Check if any target is EXACTLY newTyped (end-of-word 'n').
    const exact = filtered.some(t => t === newTyped);
    if (exact) {
      // The word ends here with 'n' — commit directly.
      G.typed = newTyped;
      G.validTargets = filtered;
      correctAnswer();
      return;
    }
    // Not end-of-word: defer commitment.
    pendingNState.active = true;
    pendingNState.snapshot = [...G.validTargets];
    // Do NOT update G.typed or G.validTargets yet.
    // We keep G.validTargets as-is so the guide still shows the full remainder.
    updateRomajiGuide();
    return;
  }

  // Normal non-n character accepted.
  G.typed = newTyped;
  G.validTargets = filtered;
  updateRomajiGuide();

  // Check completion
  if (filtered.some(t => t === newTyped)) {
    correctAnswer();
  }
}

// ============================================================
// UTILITIES
// ============================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool(diff) {
  if (diff === 0) return shuffle(ELEMENTS);
  if (diff === 1) return shuffle(ELEMENTS.filter(e => e.diff === 1));
  if (diff === 2) return shuffle(ELEMENTS.filter(e => e.diff <= 2));
  return shuffle(ELEMENTS);
}

function comboClass(c) {
  if (c >= 20) return 'c4';
  if (c >= 10) return 'c3';
  if (c >= 5)  return 'c2';
  if (c >= 3)  return 'c1';
  return 'c0';
}

function comboMult(c) {
  if (c >= 20) return 4;
  if (c >= 10) return 3;
  if (c >= 5)  return 2;
  if (c >= 3)  return 1.5;
  return 1;
}

function pickQType(diff, elDiff) {
  const weights = ({
    1: [.80, .15, .05],
    2: [.50, .35, .15],
    3: [.25, .40, .35],
    0: [.40, .35, .25],
  })[diff] || [.80, .15, .05];

  const adjName = Math.max(0, weights[0] + (elDiff === 3 ? .15 : 0) - (elDiff === 1 ? .1 : 0));
  const tot = adjName + weights[1] + weights[2];
  const r = Math.random() * tot;
  if (r < adjName) return 'name';
  if (r < adjName + weights[1]) return 'symbol';
  return 'trivia';
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('scr-' + id).classList.add('active');
  const homeBtn = document.getElementById('btn-home');
  homeBtn.style.display = (id === 'title' || id === 'loading') ? 'none' : 'flex';
}

function trigger(el, cls, dur) {
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), dur || 400);
}

// ============================================================
// NAVIGATION
// ============================================================
function goHome() {
  if (G.running) {
    if (!confirm('ゲームを終了してタイトルに戻りますか？')) return;
    G.running = false;
    clearInterval(G.timerID);
  }
  showScreen('title');
}

function openMode(mode) {
  G.mode = mode;
  document.getElementById('mode-title-txt').textContent = MODE_INFO[mode].label + ' -- 難易度選択';
  const descs = {
    timeattack: '60秒でできるだけ多くの元素を入力！',
    endless:    'ライフが尽きるまで続けるサバイバル！',
    practice:   '解説カード付き。じっくり覚えよう。',
  };
  document.getElementById('mode-subtitle-txt').textContent = descs[mode];
  document.querySelectorAll('.dbtn').forEach(b => b.classList.remove('sel'));
  G.diff = -1;
  document.getElementById('diff-info').textContent = '難易度を選択してください';
  showScreen('mode');
}

function selDiff(d) {
  G.diff = d;
  document.querySelectorAll('.dbtn').forEach(b => b.classList.remove('sel'));
  document.querySelector('.dbtn[data-d="' + d + '"]').classList.add('sel');
  const pool = buildPool(d);
  document.getElementById('diff-info').textContent =
    DIFF_INFO[d].label + ' -- ' + DIFF_INFO[d].desc + '（出題候補: ' + pool.length + '元素）';
}

function startGame() {
  if (G.diff === -1) { alert('難易度を選択してください'); return; }
  SFX._init();
  initGame();
  showScreen('game');
}

function restartGame() {
  openMode(G.mode);
  showScreen('mode');
}

// ============================================================
// GAME INIT
// ============================================================
function initGame() {
  clearInterval(G.timerID);
  G.score = 0; G.combo = 0; G.maxCombo = 0;
  G.lives = G.mode === 'endless' ? 5 : 0;
  G.count = 0; G.totalMisses = 0;
  G.timeLeft = G.mode === 'timeattack' ? 60 : 0;
  G.pool = buildPool(G.diff);
  G.poolIdx = 0;
  G.elResults = {};
  G.running = true;
  G.practicing = false;
  G.locked = false;
  updateHUD();
  document.getElementById('timer-wrap').style.display = G.mode === 'timeattack' ? '' : 'none';
  renderLives();
  if (G.mode === 'timeattack') G.timerID = setInterval(tickTimer, 1000);
  nextQuestion();
  setTimeout(() => document.getElementById('typing-inp').focus(), 100);
}

function tickTimer() {
  if (!G.running) return;
  G.timeLeft--;
  const tv = document.getElementById('h-timer');
  tv.textContent = G.timeLeft;
  tv.className = 'hud-val timer' +
    (G.timeLeft <= 10 ? ' danger' : G.timeLeft <= 20 ? ' warn' : '');
  if (G.timeLeft <= 0) endGame();
}

function nextQuestion() {
  G.locked = false;
  resetPendingN();

  if (G.poolIdx >= G.pool.length) { G.pool = shuffle(G.pool); G.poolIdx = 0; }
  const el = G.pool[G.poolIdx++];
  G.curEl = el;
  G.curQType = pickQType(G.diff, el.diff);
  G.validTargets = [el.romaji].concat(el.alts);
  G.typed = '';
  G.missesOnEl = 0;
  if (!G.elResults[el.no]) G.elResults[el.no] = { correct: false, misses: 0 };
  renderQuestion();
  updateRomajiGuide();
  document.getElementById('typing-inp').value = '';
  document.getElementById('typing-inp').focus();
}

function endGame() {
  G.running = false;
  clearInterval(G.timerID);
  SFX.play('end');
  showResult();
}

// ============================================================
// QUESTION RENDERING
// ============================================================
function renderQuestion() {
  const el = G.curEl, qt = G.curQType;
  const card = document.getElementById('el-card');
  card.className = 'el-card diff' + el.diff;
  document.getElementById('c-no').textContent = 'No.' + el.no + ' / ' + el.sym;
  const badge = document.getElementById('c-type-badge');
  badge.textContent = QTYPE_LABELS[qt];
  badge.className = 'card-type t-' + qt;
  const qc = document.getElementById('q-content');
  if (qt === 'name') {
    qc.innerHTML =
      '<div class="q-name">' + el.ja + '</div>' +
      '<div class="q-atno">' + el.en + '</div>';
  } else if (qt === 'symbol') {
    qc.innerHTML =
      '<div class="q-symbol">' + el.sym + '</div>' +
      '<div class="q-atno">&#x7B2C;' + el.no + '&#x756A;&#x5143;&#x7D20;</div>';
  } else {
    qc.innerHTML = '<div class="q-trivia">' + el.trivia + '</div>';
  }
  renderHints(0);
}

function renderHints(misses) {
  const el = G.curEl, qt = G.curQType;
  const diffs = ['', '初級', '中級', '上級'];
  const sm = Math.round(el.score * QTYPE_MULT[qt] * comboMult(G.combo));
  let html = '<span class="hint-pill shown">' + diffs[el.diff] + '</span>';
  html += '<span class="score-possible">+' + sm + 'pt</span>';

  if (qt === 'symbol') {
    if (misses >= 2) {
      html += '<span class="hint-pill shown">' + el.ja + '</span>';
    } else {
      html += '<span class="hint-pill' + (misses >= 1 ? ' shown' : '') + '">' +
        (misses >= 1 ? 'あと1ミスで日本語名' : '2ミスで日本語名') + '</span>';
    }
  } else if (qt === 'trivia') {
    if (misses >= 2) {
      html += '<span class="hint-pill shown">' + el.sym + ' / ' + el.ja + '</span>';
    } else if (misses >= 1) {
      html += '<span class="hint-pill shown">' + el.sym + '</span>';
    } else {
      html += '<span class="hint-pill">1ミスで元素記号</span>';
    }
  } else {
    if (misses >= 3) {
      html += '<span class="hint-pill shown">' + el.sym + '</span>';
    } else if (misses > 0) {
      html += '<span class="hint-pill shown">' + el.hira + '</span>';
    }
  }

  document.getElementById('hints').innerHTML = html;
}

// ============================================================
// ROMAJI GUIDE
// ============================================================
/**
 * Render the romaji progress bar.
 * When pendingN is active, show the 'n' as typed (dimmed) so the player
 * gets visual feedback, but we haven't committed it yet.
 */
function updateRomajiGuide() {
  const guide = G.validTargets[0] || '';

  // typed portion (committed)
  let displayTyped = G.typed;
  let remainder = guide.slice(G.typed.length);

  // If 'n' is pending, show it in the typed colour but the guide
  // advances one char to reflect the tentative 'n'.
  if (pendingNState.active) {
    displayTyped += 'n';
    remainder = guide.slice(G.typed.length + 1);
  }

  const cursor = remainder[0] || '';
  const rest   = remainder.slice(1);

  document.getElementById('romaji-guide').innerHTML =
    '<span class="rt">' + displayTyped + '</span>' +
    '<span class="rc">' + cursor + '</span>' +
    '<span class="rr">' + rest + '</span>';
  document.getElementById('romaji-guide').classList.remove('err');
  document.getElementById('inp-overlay').textContent =
    displayTyped + (cursor ? '_' : '');
}

// ============================================================
// CORRECT / WRONG
// ============================================================
function wrongInput() {
  G.totalMisses++;
  G.missesOnEl++;
  G.elResults[G.curEl.no].misses++;

  // Reset pendingN on wrong input — the 'n' is discarded
  resetPendingN();

  const card  = document.getElementById('el-card');
  const inp   = document.getElementById('typing-inp');
  const guideEl = document.getElementById('romaji-guide');
  trigger(card, 'shake', 300);
  inp.classList.add('err');
  guideEl.classList.add('err');
  setTimeout(() => { inp.classList.remove('err'); guideEl.classList.remove('err'); }, 250);

  renderHints(G.missesOnEl);

  if (G.mode === 'endless' && G.missesOnEl >= 7) {
    loseLife();
    skipElement(false);
  }
  SFX.play('miss');
}

function correctAnswer() {
  if (G.locked) return;
  G.locked = true;
  resetPendingN();

  const el = G.curEl;
  G.combo++;
  if (G.combo > G.maxCombo) G.maxCombo = G.combo;
  G.elResults[el.no].correct = true;
  const pts = Math.round(el.score * QTYPE_MULT[G.curQType] * comboMult(G.combo));
  G.score += pts;
  G.count++;
  if (G.missesOnEl > 3) G.combo = 0;

  updateHUD();
  spawnScorePopup(pts);

  if (G.combo > 0 && G.combo % 5 === 0) {
    spawnComboBurst();
    SFX.play('combo');
  } else {
    SFX.play('correct');
  }

  trigger(document.getElementById('el-card'), 'flash', 400);

  if (G.mode === 'practice') {
    showPracticeCard(true);
  } else {
    setTimeout(nextQuestion, 120);
  }
}

function skipElement(userInitiated) {
  if (userInitiated === undefined) userInitiated = true;
  if (G.mode === 'endless' && userInitiated) loseLife();
  G.combo = 0;
  resetPendingN();
  updateHUD();
  if (G.mode === 'practice') {
    showPracticeCard(false);
  } else {
    nextQuestion();
  }
}

function loseLife() {
  G.lives = Math.max(0, G.lives - 1);
  renderLives();
  if (G.lives <= 0) endGame();
}

// ============================================================
// HUD
// ============================================================
function updateHUD() {
  document.getElementById('h-score').textContent = G.score.toLocaleString();
  const cv = document.getElementById('h-combo');
  cv.textContent = 'x' + (G.combo === 0 ? 1 : G.combo);
  cv.className = 'combo-val ' + comboClass(G.combo);
  trigger(cv, 'combo-bump', 150);
  document.getElementById('h-count').textContent = G.count;
  document.getElementById('prog').style.width = (G.poolIdx / G.pool.length * 100) + '%';
}

function renderLives() {
  const lv = document.getElementById('h-lives');
  if (G.mode !== 'endless') { lv.innerHTML = ''; return; }
  lv.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const sp = document.createElement('span');
    sp.className = 'life' + (i >= G.lives ? ' lost' : '');
    sp.textContent = '❤';
    lv.appendChild(sp);
  }
}

// ============================================================
// VISUAL EFFECTS
// ============================================================
function spawnScorePopup(pts) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.textContent = '+' + pts;
  const r = document.getElementById('el-card').getBoundingClientRect();
  el.style.left = (r.left + r.width / 2 - 20) + 'px';
  el.style.top  = r.top + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function spawnComboBurst() {
  const el = document.createElement('div');
  el.className = 'combo-burst';
  const cls = comboClass(G.combo);
  const colors = { c4: 'var(--error)', c3: '#f97316', c2: 'var(--amber)', c1: 'var(--success)' };
  el.style.color = colors[cls] || 'var(--success)';
  el.textContent = G.combo + 'COMBO!';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

// ============================================================
// PRACTICE CARD
// ============================================================
function showPracticeCard(wasCorrect) {
  G.practicing = true;
  const el = G.curEl;
  const ov = document.createElement('div');
  ov.id = 'practice-ov';
  ov.className = 'practice-overlay';
  ov.innerHTML =
    '<div class="practice-card">' +
      '<div class="pc-status ' + (wasCorrect ? 'ok' : 'skip') + '">' +
        (wasCorrect ? '&#x2713; 正解！' : '→ スキップ') +
      '</div>' +
      '<div class="pc-atno">No.' + el.no + ' — ' + el.en + '</div>' +
      '<div class="pc-sym">' + el.sym + '</div>' +
      '<div class="pc-ja">' + el.ja + '</div>' +
      '<div class="pc-hira">' + el.hira + '</div>' +
      '<div class="pc-romaji">' + el.romaji +
        (el.alts.length ? ' / ' + el.alts.join(' / ') : '') +
      '</div>' +
      '<div class="pc-trivia">' + el.trivia + '</div>' +
      '<button class="pc-next" onclick="closePracticeCard()">次の問題へ →</button>' +
    '</div>';
  document.body.appendChild(ov);
}

function closePracticeCard() {
  const ov = document.getElementById('practice-ov');
  if (ov) ov.remove();
  G.practicing = false;
  nextQuestion();
  document.getElementById('typing-inp').focus();
}

// ============================================================
// RESULT
// ============================================================
function showResult() {
  showScreen('result');
  document.getElementById('r-title').textContent =
    G.mode === 'timeattack' ? 'TIME UP' :
    G.mode === 'endless'    ? 'GAME OVER' : 'RESULT';
  document.getElementById('r-mode').textContent =
    MODE_INFO[G.mode].label + ' / ' + DIFF_INFO[G.diff].label;
  animateCount('r-score', 0, G.score, 1200);
  document.getElementById('r-correct').textContent = G.count;
  document.getElementById('r-miss').textContent    = G.totalMisses;
  document.getElementById('r-combo').textContent   = G.maxCombo;
  buildPTGrid();

  const isNew = saveHighScore();
  const best  = getHighScore();
  const badge    = document.getElementById('r-hs-badge');
  const badgeVal = document.getElementById('r-hs-val');
  if (best > 0) {
    badge.style.display = '';
    if (isNew) {
      badgeVal.classList.add('new');
      badgeVal.textContent = '🎉 NEW RECORD！ ' + best.toLocaleString() + ' pt';
    } else {
      badgeVal.classList.remove('new');
      badgeVal.textContent = best.toLocaleString() + ' pt';
    }
  } else {
    badge.style.display = 'none';
  }
}

function animateCount(id, from, to, dur) {
  const el = document.getElementById(id);
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    el.textContent = Math.round(from + (to - from) * e).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function buildPTGrid() {
  const grid = document.getElementById('pt-grid');
  grid.innerHTML = '';
  const noMap = {};
  ELEMENTS.forEach(e => { noMap[e.no] = e; });
  PT_GRID.forEach(function(entry) {
    const no = entry[0];
    const cell = document.createElement('div');
    if (no === 0 || no === -1 || no === -2) {
      cell.className = 'pt-cell gap';
      if (no === -1) { cell.textContent = 'La'; cell.style.color = 'var(--text-dim)'; cell.style.fontSize = '7px'; }
      if (no === -2) { cell.textContent = 'Ac'; cell.style.color = 'var(--text-dim)'; cell.style.fontSize = '7px'; }
    } else {
      const r = G.elResults[no];
      const e = noMap[no];
      cell.textContent = e ? e.sym : '?';
      cell.className = !r ? 'pt-cell unseen' :
        (r.correct && r.misses === 0 ? 'pt-cell perfect' :
         r.correct                   ? 'pt-cell good' : 'pt-cell struggle');
      if (e) cell.title = e.ja + ' (' + e.sym + ')';
    }
    grid.appendChild(cell);
  });
}

// ============================================================
// HIGH SCORE
// ============================================================
function hsKey() { return 'hs_' + G.mode + '_' + G.diff; }

function getHighScore() {
  const saved = JSON.parse(localStorage.getItem(hsKey()) || '[]');
  return saved.length > 0 ? saved[0].score : 0;
}

function saveHighScore() {
  const key   = hsKey();
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  const prevBest = saved.length > 0 ? saved[0].score : 0;
  const isNew = G.score > prevBest;
  saved.push({
    score: G.score,
    correct: G.count,
    maxCombo: G.maxCombo,
    date: new Date().toLocaleDateString('ja-JP'),
  });
  saved.sort((a, b) => b.score - a.score);
  localStorage.setItem(key, JSON.stringify(saved.slice(0, 5)));
  return isNew;
}

function showHighScore() {
  const modeInfo = [
    { key: 'timeattack', label: 'タイムアタック' },
    { key: 'endless',    label: 'エンドレス' },
    { key: 'practice',   label: '学習モード' },
  ];
  const diffInfo = [
    { key: 1, label: '初級' },
    { key: 2, label: '中級' },
    { key: 3, label: '上級' },
    { key: 0, label: 'ランダム' },
  ];

  let rows = '';
  let hasAny = false;

  modeInfo.forEach(function(m) {
    let modeHasData = false;
    let modeRows = '';
    diffInfo.forEach(function(d) {
      const saved = JSON.parse(localStorage.getItem('hs_' + m.key + '_' + d.key) || '[]');
      if (saved.length > 0) {
        modeHasData = true;
        hasAny = true;
        modeRows +=
          '<tr><td>' + d.label + '</td>' +
          '<td>' + saved[0].date + '</td>' +
          '<td>正解 ' + saved[0].correct + '</td>' +
          '<td>' + saved[0].score.toLocaleString() + ' pt</td></tr>';
      }
    });
    if (modeHasData) {
      rows += '<tr class="hs-section"><td colspan="4">' + m.label + '</td></tr>';
      rows += modeRows;
    }
  });

  if (!rows) rows = '<tr><td colspan="4" style="color:var(--text-dim);text-align:center;padding:16px">データなし</td></tr>';

  const modal = document.createElement('div');
  modal.className = 'hs-modal';
  modal.innerHTML =
    '<div class="hs-inner">' +
      '<div class="hs-title">&#x1F3C6; HALL OF FAME</div>' +
      '<table class="hs-table">' +
        '<thead><tr><th>難易度</th><th>日付</th><th>正解数</th><th>スコア</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
      (hasAny
        ? '<button class="hs-reset-btn" onclick="clearHighScores(this.closest(\'.hs-modal\'))">記録をすべてリセット</button>'
        : '') +
      '<button class="hs-close" onclick="this.closest(\'.hs-modal\').remove()">閉じる</button>' +
    '</div>';
  document.body.appendChild(modal);
}

function clearHighScores(modal) {
  if (!confirm('すべての記録を削除しますか？')) return;
  ['timeattack', 'endless', 'practice'].forEach(function(m) {
    [1, 2, 3, 0].forEach(function(d) {
      localStorage.removeItem('hs_' + m + '_' + d);
    });
  });
  if (modal) modal.remove();
}

// ============================================================
// TWEET / X SHARE
// ============================================================
function tweetResult() {
  const lines = [
    '【元素タイピング】',
    MODE_INFO[G.mode].label + ' / ' + DIFF_INFO[G.diff].label,
    'スコア: ' + G.score.toLocaleString() + ' pt',
    '正解: ' + G.count + '問　ベストコンボ: ' + G.maxCombo + 'x',
    '#元素タイピング #化学 #PeriodicTyping',
  ];
  window.open(
    'https://twitter.com/intent/tweet?text=' + encodeURIComponent(lines.join('\n')),
    '_blank',
    'noopener'
  );
}

// ============================================================
// INPUT EVENTS
// ============================================================
document.addEventListener('keydown', function(e) {
  if (!G.running || G.practicing) return;

  if (e.key === 'Tab') {
    e.preventDefault();
    skipElement(true);
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    endGame();
    return;
  }

  // Only handle single printable keys not modified by Ctrl/Meta/Alt
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const c = normalizeChar(e.key);
    if (c) {
      e.preventDefault();
      processChar(c);
      // Keep the visible input field in sync
      document.getElementById('typing-inp').value = G.typed;
    }
  }
});

/**
 * Fallback for IME / virtual keyboards that fire 'input' events
 * without corresponding 'keydown' events with printable e.key.
 * We derive the new chars by diffing the input value against G.typed.
 */
document.getElementById('typing-inp').addEventListener('input', function(e) {
  if (!G.running || G.practicing) return;

  // Normalize the entire current value
  const raw = e.target.value.normalize('NFKC').toLowerCase().replace(/[^a-z]/g, '');
  // Only process chars beyond what's already confirmed
  const base = G.typed + (pendingNState.active ? 'n' : '');
  if (raw.length > base.length) {
    const newChars = raw.slice(base.length);
    for (let i = 0; i < newChars.length; i++) {
      const c = normalizeChar(newChars[i]);
      if (c) processChar(c);
    }
  }
  // Sync display
  e.target.value = G.typed;
});

document.getElementById('typing-inp').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') e.preventDefault();
});

document.getElementById('scr-game').addEventListener('click', function() {
  if (G.running) document.getElementById('typing-inp').focus();
});

// ============================================================
// BOOT
// ============================================================
loadElements();
