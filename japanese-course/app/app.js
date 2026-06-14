// にほんご Trainer — logic
"use strict";

// ---------- storage ----------
const STORE = "nihongo_trainer_v1";
function load() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
  catch (e) { return {}; }
}
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }

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

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Erase all progress in this browser?")) {
    localStorage.removeItem(STORE);
    location.reload();
  }
});

// init
startDeck();
