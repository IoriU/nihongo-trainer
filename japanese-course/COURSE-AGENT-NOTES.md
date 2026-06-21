# 📓 Notes for the Course Agent — how to publish a lesson into the app

> Paste this whole file to the agent that writes lessons. It explains exactly
> what to add (and where) so each lesson shows up in the にほんご Trainer app.
> You write **content only** — a separate agent owns the app code.

---

## Per lesson, add TWO things (both append-only)

For every new lesson you author, add both of these. They share the same `id`
(e.g. `L02`), and that id is what links the flashcards to the reading.

### 1. Flashcard deck → append to `LESSONS` in `app/data.js`

Same shape as the existing Lesson 01 entry:

```js
{
  id: "L02",                                  // unique, stable, matches the .md filename
  module: "Module 1 — Survival Basics",       // syllabus module — groups the dropdowns
  title: "Lesson 02 — これ・それ・あれ",
  cards: [
    { jp:"これ", romaji:"kore", id:"ini" },   // id = Indonesian gloss 🇮🇩
    { jp:"それ", romaji:"sore", id:"itu", note:"dekat lawan bicara" }  // note optional
  ]
}
```

- `jp` = Japanese (kana/kanji), `romaji` = reading, **`id` = Indonesian meaning**, `note` = optional hint.
- **`module`** must be set so the lesson lands in the right group in the app's Learn + Flashcards
  dropdowns (the app sorts groups by module number). Use the exact syllabus module name:
  - `"Module 0 — Writing System"`
  - `"Module 1 — Survival Basics"`
  - `"Module 2 — Verbs & Daily Actions"`
  - `"Module 3 — Real-Life Japan Situations"`
  - `"Module 4 — Connecting Ideas"`
  - `"Module 5 — Politeness & Social Japanese"`
  - `"Module 6 — Intermediate Fluency"`
  - (Kanji / Skills tracks: only add a deck if the lesson actually has flashcards + reading.)
  Lessons map to syllabus topics (e.g. topic 2.1 → next `Lxx`); keep ids sequential `L07`, `L08`, …
  regardless of module — the id is just a stable key, the `module` field does the grouping.
- **APPEND ONLY.** Never reorder or delete cards in an existing lesson — SRS review
  history is keyed by `"<lessonId>#<cardIndex>"`, so changing order corrupts it.
- Don't touch the `mod` field the app adds to saved cards.

### 2. Reading prose → new file `app/lessons/<id>.md`

E.g. lesson `L02` → `z:\Project\Learn\japanese-course\app\lessons\L02.md`.
The **Learn tab** fetches and renders this file. Use `app/lessons/L01.md` as the template.

- The lesson only appears in the app's dropdown once it has a deck entry in `data.js`.
- A missing `.md` just shows "No reading available yet" (so the deck can exist first).

---

## ⚠️ Markdown that the in-app renderer supports

The app has a small built-in Markdown converter. **Stick to this subset** — anything
outside it won't render correctly:

- Headings `#` … `######`
- `**bold**`, `*italic*`, `` `inline code` ``
- Fenced code blocks (triple backticks) — great for example sentences with romaji
- Unordered lists (`-` or `*`) and numbered lists (`1.`)
- Task checkboxes: `- [ ]` and `- [x]`
- Tables with `|` pipes (header row + `|---|` separator)
- Blockquotes `>`
- Horizontal rule `---`
- Single line breaks inside a paragraph are preserved (good for dialogue lines)

**Not supported:** nested/indented lists, raw HTML, images, footnotes, links with titles.
Keep it flat and simple.

---

## Style / content conventions (keep consistent with Lesson 01)

- Learner is a **native Indonesian speaker** → all glosses in Indonesian 🇮🇩.
- Reads hiragana, learning katakana. Romaji **only for new vocabulary**; sentences
  already readable in kana stay kana-only.
- Goal: living/studying in Japan — include real-life 🏯 culture/etiquette notes.
- Keep the lesson structure: 🎯 Goals · 🗣️ Vocabulary · 🧩 Grammar · 💬 Dialogue ·
  🏯 Culture · ✍️ Exercises · ✅ Answers · 📦 Vocab list.
- Also update the course's `README.md` TOC and mark the `syllabus.md` row ✅.

---

## After adding a lesson — publish it

The app is a PWA hosted on Netlify (repo `IoriU/nihongo-trainer`) that **auto-deploys on push**:

```bash
cd "z:/Project/Learn"
git add -A
git commit -m "Add Lesson 02 — これ・それ・あれ"
git push
```

Netlify rebuilds in seconds; the new lesson caches for offline on the next online open.
(Optional, not required: add the new `lessons/<id>.md` path to `ASSETS` in `app/sw.js`
and bump `CACHE` — but runtime caching already covers it.)

---

## ⚠️ Content-filter gotcha

Generating a large dense file (long kana/romaji tables) in one shot can false-trip the
API content filter. Build big files in **small chunks**: write a skeleton first, then
append sections with edits.

---

## Don't

- Don't edit app code (`index.html`, `style.css`, `app.js`, `sw.js`, Netlify config) —
  that's the app agent's job. If you need a content-shape change, ask via `app/AGENT-BRIEF.md`.
- Don't reorder/delete existing cards; don't switch glosses away from Indonesian.
- Don't use unsupported Markdown in the `.md` files.
