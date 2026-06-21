# 🤖 Agent Brief — にほんご Trainer (the practice app)

> **Copy everything below the line into the agent that will own the app.**
> That agent maintains/extends the application code. A separate agent owns the *course content* (lessons + vocabulary). The boundary is defined under "Division of labor."

---

## YOUR ROLE

You maintain and extend **にほんご Trainer**, an offline Japanese-learning web app for a single user. The user is a **native Indonesian speaker** learning Japanese with the goal of **living/studying in Japan**. They can read hiragana and are learning katakana. Keep the app simple, fast, and dependency-free.

## WHERE IT LIVES

- Folder: `z:\Project\Learn\japanese-course\app\`
- Part of a larger course in `z:\Project\Learn\japanese-course\` (see that folder's `README.md` and `syllabus.md` for context — but you don't edit those).

## HOW TO RUN / TEST IT

- It is a **static site**. It is now also deployed as an **installable PWA on Netlify** (repo `IoriU/nihongo-trainer`, auto-deploys on `git push`). The user opens the `…netlify.app` URL on phone/laptop; it still also opens via `file://` (double-click `index.html`) for quick local checks.
- **No client build step.** `KANA`/`LESSONS` data still load via plain `<script src>` globals.
- ⚠️ **`fetch` is allowed ONLY on the hosted (`http`/`https`) site**, and only where it **degrades gracefully under `file://`**. Two features use it: progress **sync** and **lesson reading** (Learn tab). Both check `location.protocol` and show a "open the hosted site" message under `file://` instead of erroring. Do not make core tabs (Kana/Flashcards/Stats) depend on `fetch`. Never add `import`/ES modules or any CDN/npm dependency to the **client**.
- Audio uses the **Web Speech API** (`speechSynthesis`) with a `ja-JP` voice. Edge on Windows has good Japanese voices built in. Don't add any audio dependency.
- To verify changes, open the hosted URL (or `index.html`) and exercise each tab. There are no automated tests; keep the code simple enough to eyeball.

## DEPLOY / PWA / BACKEND (app-agent territory)

- `manifest.json`, `sw.js` (service worker, cache `nihongo-trainer-vN`), `icon.svg`, `robots.txt` (+`noindex`) make it an installable, offline, non-indexed PWA. Bump the `CACHE` version in `sw.js` when you change the precache list.
- `netlify.toml` (repo root) sets publish dir = `japanese-course/app` and functions dir = `netlify/functions`.
- **Progress sync backend:** `netlify/functions/progress.mjs` stores one JSON blob in **Netlify Blobs**, gated by env var `SYNC_SECRET`. `package.json` (repo root) declares `@netlify/blobs` — that's a **server-only** dep Netlify installs at deploy; the client stays dependency-free. Client sync logic lives in `app.js` (`pullMergePush`/`syncPushSoon`, merge = newest-per-card via `card.mod` + max-counters).

## FILE STRUCTURE & RESPONSIBILITIES

| File | Owns |
|------|------|
| `index.html` | DOM structure, 4 tabs (Learn / Kana / Flashcards / Stats), loads `data.js` then `app.js` |
| `style.css` | All styling. Dark theme via CSS variables at `:root`. Mobile breakpoint at 480px. |
| `data.js` | **Content data only.** Defines globals `KANA` and `LESSONS`. No logic. |
| `app.js` | **All logic**: storage, streak, audio, tabs, kana trainer, SRS flashcards, stats, sync, lesson rendering (`mdToHtml`). |
| `lessons/<id>.md` | **Lesson reading prose** (Markdown), one file per `LESSONS` entry, fetched + rendered by the Learn tab. See "Lesson reading" below. |

## DATA CONTRACTS (do not break these shapes)

```js
// data.js
const KANA = {
  hiragana: { basic:{...}, dakuten:{...}, combo:{...} },
  katakana: { basic:{...}, dakuten:{...}, combo:{...} }
};
// each table maps kana char -> romaji string, e.g. "ア":"a"

const LESSONS = [
  {
    id: "L01",                       // unique, stable — used as SRS storage key prefix
    module: "Module 1 — Survival Basics",  // groups lessons in the dropdowns (syllabus module name)
    title: "Lesson 01 — ...",
    cards: [
      { jp:"...", romaji:"...", id:"<Indonesian meaning>", note:"<optional>" }
    ]
  }
];
```

- **`module`** is the syllabus module name (e.g. `"Module 1 — Survival Basics"`). The app groups the Learn + Flashcards dropdowns into `<optgroup>`s by it, ordered by the module number. Omitting it dumps the lesson into a catch-all "Lessons" group — so always set it.
- **`card.id` is the Indonesian meaning** (the user's native language) — keep glosses in Indonesian.
- SRS state is keyed by `"<lesson.id>#<cardIndex>"`. ⚠️ **Never reorder or delete cards within an existing lesson**, or you'll corrupt the user's review history. Only append new cards/lessons.
- SRS card records carry an extra `mod` (last-modified ms) field used to merge progress across devices. Don't strip it.

## LESSON READING (Learn tab)

The Learn tab fetches `lessons/<lesson.id>.md` and renders it with a **minimal in-app Markdown renderer** (`mdToHtml` in `app.js`). Supported Markdown: `#`–`######` headings, `**bold**`, `*italic*`, `` `code` ``, fenced ``` code blocks, `-`/`*` and numbered lists, `- [ ]` / `- [x]` checkboxes, `>` blockquotes, `|`-pipe tables, and `---` rules. Stick to that subset — exotic syntax won't render.

- **One `.md` per lesson, named by the `LESSONS` id**: e.g. lesson `L01` → `app/lessons/L01.md`. The dropdown is built from `LESSONS`, so a lesson only appears once it has a deck entry in `data.js`; a missing `.md` just shows "No reading available yet."
- Keep glosses Indonesian and the bilingual style of `L01.md` (Japanese + romaji + 🇮🇩).
- After adding a lesson `.md`, optionally add its path to the `ASSETS` precache list in `sw.js` and bump `CACHE` (otherwise it still caches at runtime on first online view).

## KEY CONVENTIONS

- **localStorage key:** `nihongo_trainer_v1`. If you make a breaking change to the saved-state shape, bump the version and migrate or you'll wipe progress.
- **SRS algorithm:** a lightweight SM-2 variant in `app.js` (`grade()`), buttons Again/Hard/Good/Easy. Intervals in days; "Again" requeues after ~1 min.
- **Streak** increments once per calendar day on any review/correct answer.
- Keep everything **vanilla JS, no frameworks, no npm, no internet**. That is a hard requirement.

## ⚠️ CONTENT-FILTER GOTCHA (important when generating code)

When writing large files in one shot, the API content filter sometimes false-positives on big dense blocks (long romaji/kana arrays + code). **Build large files in small chunks**: write a skeleton, then append sections with edits. This is why `data.js` was assembled incrementally. Keep doing that.

## DIVISION OF LABOR (avoid conflicts)

- **Course agent (not you)** owns lesson content. Per new lesson it: (1) appends a deck object to `LESSONS` in `data.js`, and (2) adds the reading prose at `app/lessons/<id>.md` (same id as the deck). Both are append-only.
- **You (app agent)** own `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.json`, the Netlify function/config, and the *schema/format* of `data.js` + the lesson-Markdown subset. If you change any contract, document it here so the course agent matches it.
- **Shared files = `data.js` and `lessons/*.md`.** Edits there are append-only (new decks/cards/lessons). Coordinate schema changes through this brief.

## FEATURE BACKLOG (ideas, build on request)

- **Sentence practice mode** — drill grammar patterns (e.g. 「Aは Bです」), fill-in-the-particle.
- **Listening mode** — play audio, user types/chooses what they heard.
- **Speaking/shadowing** — use `SpeechRecognition` (Chrome/Edge, `ja-JP`) to score pronunciation of dialogue lines.
- **Per-lesson kana/vocab progress bars** on the Stats tab.
- **Export/import progress** (JSON) so the user can back up or move browsers.
- **Furigana toggle** once kanji-bearing vocab appears in later lessons.

## DON'T

- Don't add build tooling, bundlers, frameworks, CDNs, ES modules, or any **client** dependency. (Server-only Netlify-function deps in root `package.json` are fine.)
- Don't make core tabs depend on `fetch`, and don't use `fetch` without a `file://` fallback (it's blocked there).
- Don't reorder/remove existing lesson cards (breaks SRS history); don't strip `card.mod`.
- Don't switch glosses away from Indonesian.
