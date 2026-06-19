// にほんご Trainer — logic
"use strict";

// ---------- storage ----------
const STORE = "nihongo_trainer_v1";
function load() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
  catch (e) { return {}; }
}
function save() { localStorage.setItem(STORE, JSON.stringify(state)); syncPushSoon(); }

const state = Object.assign({
  cards: {},        // id -> { due, interval, ease, reps }
  kanaSeen: 0,
  kanaRight: 0,
  reviews: 0,
  lastDay: null,
  streak: 0
}, load());

// ---------- day / streak ----------
function today() {
  const d = new Date();
  return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
}
function touchStreak() {
  const t = today();
  if (state.lastDay === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const ystr = y.getFullYear() + "-" + (y.getMonth()+1) + "-" + y.getDate();
  state.streak = (state.lastDay === ystr) ? state.streak + 1 : 1;
  state.lastDay = t;
  save();
}

// ---------- audio (Web Speech API) ----------
let jaVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  jaVoice = vs.find(v => v.lang === "ja-JP") || vs.find(v => v.lang.startsWith("ja")) || null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  if (jaVoice) u.voice = jaVoice;
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

// ---------- tabs ----------
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "stats") renderStats();
    if (btn.dataset.tab === "cards") startDeck();
    if (btn.dataset.tab === "learn") showLesson();
  });
});

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ================= KANA TRAINER =================
const kEl = {
  start: document.getElementById("kanaStart"),
  game: document.getElementById("kanaGame"),
  prompt: document.getElementById("kanaPrompt"),
  input: document.getElementById("kanaInput"),
  typeWrap: document.getElementById("kanaTypeWrap"),
  choices: document.getElementById("kanaChoices"),
  score: document.getElementById("kanaScore"),
  streak: document.getElementById("kanaStreak"),
  feedback: document.getElementById("kanaFeedback"),
  audio: document.getElementById("kanaAudio")
};
let kPool = [], kCur = null, kRight = 0, kTotal = 0, kStreak = 0, kMode = "type";

function buildPool() {
  const script = document.getElementById("kanaScript").value;
  const set = document.getElementById("kanaSet").value;
  const scripts = script === "both" ? ["hiragana","katakana"] : [script];
  const sets = set === "all" ? ["basic","dakuten","combo"] : [set];
  const pool = [];
  scripts.forEach(s => sets.forEach(st => {
    const tbl = KANA[s][st]; if (!tbl) return;
    Object.keys(tbl).forEach(k => pool.push({ kana:k, romaji:tbl[k] }));
  }));
  return pool;
}

kEl.start.addEventListener("click", () => {
  kPool = buildPool();
  if (!kPool.length) return;
  kMode = document.getElementById("kanaMode").value;
  kRight = 0; kTotal = 0; kStreak = 0;
  kEl.game.classList.remove("hidden");
  kEl.typeWrap.classList.toggle("hidden", kMode !== "type");
  kEl.choices.classList.toggle("hidden", kMode !== "choice");
  nextKana();
});

function nextKana() {
  kCur = kPool[Math.floor(Math.random() * kPool.length)];
  kEl.prompt.textContent = kCur.kana;
  kEl.feedback.textContent = "";
  kEl.feedback.className = "feedback";
  if (kMode === "type") {
    kEl.input.value = "";
    kEl.input.focus();
  } else {
    renderChoices();
  }
}

function renderChoices() {
  const opts = [kCur.romaji];
  while (opts.length < 4) {
    const r = kPool[Math.floor(Math.random()*kPool.length)].romaji;
    if (!opts.includes(r)) opts.push(r);
  }
  shuffle(opts);
  kEl.choices.innerHTML = "";
  opts.forEach(o => {
    const b = document.createElement("button");
    b.textContent = o;
    b.onclick = () => checkKana(o);
    kEl.choices.appendChild(b);
  });
}

function checkKana(answer) {
  const ok = answer.trim().toLowerCase() === kCur.romaji;
  kTotal++; state.kanaSeen++;
  if (ok) { kRight++; kStreak++; state.kanaRight++; touchStreak(); }
  else { kStreak = 0; }
  save();
  kEl.score.textContent = `Score: ${kRight}/${kTotal}`;
  kEl.streak.textContent = `Streak: ${kStreak} 🔥`;
  kEl.feedback.textContent = ok ? "✓ correct!" : `✗ it's "${kCur.romaji}"`;
  kEl.feedback.className = "feedback " + (ok ? "ok" : "no");
  speak(kCur.kana);
  setTimeout(nextKana, ok ? 600 : 1200);
}

kEl.input.addEventListener("keydown", e => {
  if (e.key === "Enter" && kEl.input.value.trim()) checkKana(kEl.input.value);
});
kEl.audio.addEventListener("click", () => kCur && speak(kCur.kana));

// ================= FLASHCARDS (SRS) =================
const cEl = {
  deck: document.getElementById("deckSelect"),
  due: document.getElementById("dueInfo"),
  front: document.getElementById("cardFront"),
  back: document.getElementById("cardBack"),
  show: document.getElementById("showAnswer"),
  grades: document.getElementById("grades"),
  done: document.getElementById("cardDone"),
  audio: document.getElementById("cardAudio")
};
let queue = [], curCard = null;

// populate deck dropdown
LESSONS.forEach(l => {
  const o = document.createElement("option");
  o.value = l.id; o.textContent = l.title;
  cEl.deck.appendChild(o);
});
cEl.deck.addEventListener("change", startDeck);

function cardKey(lid, i) { return lid + "#" + i; }
function nowMs() { return new Date().getTime(); }

function startDeck() {
  const lesson = LESSONS.find(l => l.id === cEl.deck.value) || LESSONS[0];
  if (!lesson) return;
  queue = [];
  lesson.cards.forEach((card, i) => {
    const key = cardKey(lesson.id, i);
    const meta = state.cards[key] || { due: 0, interval: 0, ease: 2.5, reps: 0 };
    if (meta.due <= nowMs()) queue.push({ key, card });
  });
  shuffle(queue);
  cEl.due.textContent = `${queue.length} due`;
  nextCard();
}

function nextCard() {
  cEl.back.classList.add("hidden");
  cEl.grades.classList.add("hidden");
  cEl.show.classList.remove("hidden");
  if (!queue.length) {
    curCard = null;
    cEl.front.textContent = "—";
    cEl.done.classList.remove("hidden");
    return;
  }
  cEl.done.classList.add("hidden");
  curCard = queue[0];
  cEl.front.textContent = curCard.card.jp;
}

cEl.show.addEventListener("click", () => {
  if (!curCard) return;
  const c = curCard.card;
  cEl.back.innerHTML =
    `<div class="romaji">${c.romaji}</div>` +
    `<div class="meaning">🇮🇩 ${c.id}</div>` +
    (c.note ? `<div class="note">${c.note}</div>` : "");
  cEl.back.classList.remove("hidden");
  cEl.show.classList.add("hidden");
  cEl.grades.classList.remove("hidden");
  speak(c.jp);
});

cEl.audio.addEventListener("click", () => curCard && speak(curCard.card.jp));

// SM-2 lite scheduling
const DAY = 86400000;
document.querySelectorAll(".grade").forEach(b => {
  b.addEventListener("click", () => grade(parseInt(b.dataset.g, 10)));
});
function grade(g) {
  if (!curCard) return;
  const key = curCard.key;
  const m = state.cards[key] || { due: 0, interval: 0, ease: 2.5, reps: 0 };
  if (g === 0) {            // Again
    m.interval = 0; m.reps = 0; m.ease = Math.max(1.3, m.ease - 0.2);
  } else {
    m.reps += 1;
    if (m.reps === 1) m.interval = g === 1 ? 1 : (g === 3 ? 4 : 1);
    else if (m.reps === 2) m.interval = g === 1 ? 3 : 6;
    else m.interval = Math.round(m.interval * (g === 1 ? 1.2 : m.ease));
    m.ease = Math.min(3.0, m.ease + (g === 3 ? 0.15 : g === 1 ? -0.15 : 0));
  }
  m.due = g === 0 ? nowMs() + 60000 : nowMs() + m.interval * DAY;
  m.mod = nowMs();   // last-modified stamp, used to merge across devices
  state.cards[key] = m;
  state.reviews++;
  touchStreak();
  save();
  // requeue "Again" cards to the back
  queue.shift();
  if (g === 0) queue.push(curCard);
  cEl.due.textContent = `${queue.length} due`;
  nextCard();
}

// ================= STATS =================
function renderStats() {
  document.getElementById("stStreak").textContent = state.streak || 0;
  document.getElementById("stReviews").textContent = state.reviews || 0;
  const acc = state.kanaSeen ? Math.round(100 * state.kanaRight / state.kanaSeen) + "%" : "–";
  document.getElementById("stAccuracy").textContent = acc;
  let due = 0;
  LESSONS.forEach(l => l.cards.forEach((c, i) => {
    const m = state.cards[cardKey(l.id, i)];
    if (!m || m.due <= nowMs()) due++;
  }));
  document.getElementById("stDue").textContent = due;
  const keys = Object.keys(state.cards);
  document.getElementById("stLearned").textContent = keys.length;
  document.getElementById("stMature").textContent =
    keys.filter(k => state.cards[k].interval >= 7).length;
}

document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm("Erase all progress in this browser?")) return;
  const secret = getSecret();
  if (syncAvailable() && secret) {
    if (confirm("Also erase your synced backup on the server? (Otherwise it would restore on next load.)")) {
      try {
        await fetch(SYNC_ENDPOINT, {
          method: "PUT",
          headers: { "content-type": "application/json", "x-sync-secret": secret },
          body: JSON.stringify({ cards: {}, kanaSeen: 0, kanaRight: 0, reviews: 0, lastDay: null, streak: 0 })
        });
      } catch (e) { /* best effort */ }
    } else {
      localStorage.removeItem(SECRET_KEY); // keep server data, but stop auto-restore here
    }
  }
  localStorage.removeItem(STORE);
  location.reload();
});

// ================= SYNC (Netlify Blobs backend) =================
const SYNC_ENDPOINT = "/.netlify/functions/progress";
const SECRET_KEY = "nihongo_sync_secret";
const syncEl = {
  secret: document.getElementById("syncSecret"),
  btn: document.getElementById("syncNow"),
  status: document.getElementById("syncStatus")
};

// Sync only works over http(s) — under file:// the relative endpoint can't resolve.
function syncAvailable() {
  return location.protocol === "http:" || location.protocol === "https:";
}
function getSecret() {
  return (syncEl.secret && syncEl.secret.value.trim()) || localStorage.getItem(SECRET_KEY) || "";
}
function setSyncStatus(msg) { if (syncEl.status) syncEl.status.textContent = msg; }
function dateNum(s) {
  const p = String(s).split("-").map(Number);
  return p.length === 3 ? p[0] * 10000 + p[1] * 100 + p[2] : 0;
}

// Merge a remote state object into local `state` (in place). Heuristics:
//  - cards: per key, keep the most-recently-modified record (m.mod)
//  - counters/streak: take the max (monotonic — never lose progress)
//  - lastDay: keep the later calendar date
function mergeRemote(remote) {
  if (!remote || typeof remote !== "object") return;
  const rc = remote.cards || {};
  Object.keys(rc).forEach(k => {
    const a = state.cards[k], b = rc[k];
    if (!a) { state.cards[k] = b; return; }
    if ((b.mod || 0) > (a.mod || 0)) state.cards[k] = b;
  });
  state.kanaSeen  = Math.max(state.kanaSeen  || 0, remote.kanaSeen  || 0);
  state.kanaRight = Math.max(state.kanaRight || 0, remote.kanaRight || 0);
  state.reviews   = Math.max(state.reviews   || 0, remote.reviews   || 0);
  state.streak    = Math.max(state.streak    || 0, remote.streak    || 0);
  if (remote.lastDay && (!state.lastDay || dateNum(remote.lastDay) > dateNum(state.lastDay))) {
    state.lastDay = remote.lastDay;
  }
}

// Manual full sync: pull remote, merge, push merged back.
async function pullMergePush() {
  if (!syncAvailable()) { setSyncStatus("Open the hosted (netlify.app) URL to sync — not a local file."); return; }
  const secret = getSecret();
  if (!secret) { setSyncStatus("Enter a passcode first."); return; }
  setSyncStatus("Syncing…");
  try {
    const res = await fetch(SYNC_ENDPOINT, { headers: { "x-sync-secret": secret } });
    if (res.status === 401) { setSyncStatus("Wrong passcode, or sync isn't set up on the server yet."); return; }
    if (!res.ok) throw new Error("HTTP " + res.status);
    const payload = await res.json();
    mergeRemote(payload.data);
    save(); // persist merged locally (also schedules a push, but we push now anyway)
    const put = await fetch(SYNC_ENDPOINT, {
      method: "PUT",
      headers: { "content-type": "application/json", "x-sync-secret": secret },
      body: JSON.stringify(state)
    });
    if (!put.ok) throw new Error("HTTP " + put.status);
    localStorage.setItem(SECRET_KEY, secret);
    setSyncStatus("✓ Synced " + new Date().toLocaleTimeString());
    renderStats();
    startDeck();
  } catch (e) {
    setSyncStatus("Sync failed: " + (e && e.message || e));
  }
}

// Debounced background push after local changes (called from save()).
let pushTimer = null;
function syncPushSoon() {
  if (!syncAvailable() || !getSecret()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    const secret = getSecret();
    fetch(SYNC_ENDPOINT, {
      method: "PUT",
      headers: { "content-type": "application/json", "x-sync-secret": secret },
      body: JSON.stringify(state)
    }).then(r => { if (r.ok) setSyncStatus("✓ Auto-synced " + new Date().toLocaleTimeString()); })
      .catch(() => { /* offline — localStorage keeps the data; next sync will push */ });
  }, 4000);
}

if (syncEl.secret) syncEl.secret.value = localStorage.getItem(SECRET_KEY) || "";
if (syncEl.btn) syncEl.btn.addEventListener("click", pullMergePush);
// On load: if a passcode is already saved and we're on the hosted site, pull+merge.
if (syncAvailable() && localStorage.getItem(SECRET_KEY)) pullMergePush();

// ================= LEARN (lesson reading) =================
const lessonSel = document.getElementById("lessonSelect");
const lessonBox = document.getElementById("lessonContent");

// Populate the lesson dropdown from the shared LESSONS list (single source
// of truth for which lessons exist). Each lesson's prose lives at
// lessons/<id>.md and is fetched + rendered on demand.
LESSONS.forEach(l => {
  const o = document.createElement("option");
  o.value = l.id; o.textContent = l.title;
  lessonSel.appendChild(o);
});
lessonSel.addEventListener("change", showLesson);

// Minimal, safe Markdown -> HTML (headings, bold/italic/code, lists,
// checkboxes, tables, blockquotes, code fences, hr). All text is HTML-escaped.
function mdToHtml(md) {
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, (m, c) => "<code>" + c + "</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const N = lines.length;
  let html = "", i = 0;
  const isBreak = l => /^(#{1,6}\s|>|\s*[-*]\s|\s*\d+\.\s|```|-{3,}\s*$)/.test(l);
  while (i < N) {
    const line = lines[i];
    if (/^```/.test(line)) {                                  // fenced code
      const buf = []; i++;
      while (i < N && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html += "<pre><code>" + esc(buf.join("\n")) + "</code></pre>"; continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { html += "<hr>"; i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const n = h[1].length; html += "<h" + n + ">" + inline(h[2]) + "</h" + n + ">"; i++; continue; }
    if (/\|/.test(line) && i + 1 < N && /-/.test(lines[i + 1]) &&
        /^\s*\|?[\s:|-]*\|[\s:|-]*$/.test(lines[i + 1])) {     // table
      const row = r => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim());
      const head = row(line); i += 2;
      let t = "<table><thead><tr>" + head.map(c => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>";
      while (i < N && /\|/.test(lines[i]) && lines[i].trim() !== "") {
        t += "<tr>" + row(lines[i]).map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>"; i++;
      }
      html += t + "</tbody></table>"; continue;
    }
    if (/^>\s?/.test(line)) {                                  // blockquote
      const buf = [];
      while (i < N && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      html += "<blockquote>" + buf.map(inline).join("<br>") + "</blockquote>"; continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {                            // unordered / checkbox
      const items = [];
      while (i < N && /^\s*[-*]\s+/.test(lines[i])) {
        const raw = lines[i++].replace(/^\s*[-*]\s+/, "");
        const cb = raw.match(/^\[([ xX])\]\s+(.*)$/);
        items.push(cb
          ? '<input type="checkbox" disabled' + (cb[1].toLowerCase() === "x" ? " checked" : "") + "> " + inline(cb[2])
          : inline(raw));
      }
      html += "<ul>" + items.map(x => "<li>" + x + "</li>").join("") + "</ul>"; continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {                           // ordered
      const items = [];
      while (i < N && /^\s*\d+\.\s+/.test(lines[i])) items.push(inline(lines[i++].replace(/^\s*\d+\.\s+/, "")));
      html += "<ol>" + items.map(x => "<li>" + x + "</li>").join("") + "</ol>"; continue;
    }
    if (line.trim() === "") { i++; continue; }                 // blank
    const buf = [];                                            // paragraph
    while (i < N && lines[i].trim() !== "" && !isBreak(lines[i])) buf.push(lines[i++]);
    html += "<p>" + buf.map(inline).join("<br>") + "</p>";
  }
  return html;
}

function showLesson() {
  const id = lessonSel.value || (LESSONS[0] && LESSONS[0].id);
  if (!id) return;
  if (!syncAvailable()) {
    lessonBox.innerHTML = '<p class="note">📖 Lesson reading opens on the hosted site. Open your <strong>netlify.app</strong> URL (the installed app) to read here — local-file mode can\'t load lesson files.</p>';
    return;
  }
  lessonBox.innerHTML = '<p class="note">Loading…</p>';
  fetch("lessons/" + id + ".md")
    .then(r => { if (!r.ok) throw new Error("missing"); return r.text(); })
    .then(md => { lessonBox.innerHTML = mdToHtml(md); lessonBox.scrollTop = 0; })
    .catch(() => { lessonBox.innerHTML = '<p class="note">No reading is available for this lesson yet.</p>'; });
}

// init
startDeck();
showLesson();   // Learn is the default tab
