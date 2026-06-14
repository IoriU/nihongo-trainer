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

- It is a **static site opened via `file://`** — the user double-clicks `index.html` in Edge or Chrome. There is **no build step and no server.**
- ⚠️ Because it runs from `file://`, **do NOT use `fetch()` / XHR / ES modules / `import`** — those are blocked under `file://`. Load everything via plain `<script src>` tags and global variables.
- Audio uses the **Web Speech API** (`speechSynthesis`) with a `ja-JP` voice. Edge on Windows has good Japanese voices built in. Don't add any audio dependency.
- To verify changes, open `index.html` in a browser and exercise each tab. There are no automated tests; keep the code simple enough to eyeball.

## FILE STRUCTURE & RESPONSIBILITIES

| File | Owns |
|------|------|
| `index.html` | DOM structure, 3 tabs (Kana / Flashcards / Stats), loads `data.js` then `app.js` |
| `style.css` | All styling. Dark theme via CSS variables at `:root`. Mobile breakpoint at 480px. |
| `data.js` | **Content data only.** Defines globals `KANA` and `LESSONS`. No logic. |
| `app.js` | **All logic**: storage, streak, audio, tabs, kana trainer, SRS flashcards, stats. |

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
    title: "Lesson 01 — ...",
    cards: [
      { jp:"...", romaji:"...", id:"<Indonesian meaning>", note:"<optional>" }
    ]
  }
];
```

- **`card.id` is the Indonesian meaning** (the user's native language) — keep glosses in Indonesian.
- SRS state is keyed by `"<lesson.id>#<cardIndex>"`. ⚠️ **Never reorder or delete cards within an existing lesson**, or you'll corrupt the user's review history. Only append new cards/lessons.

## KEY CONVENTIONS

- **localStorage key:** `nihongo_trainer_v1`. If you make a breaking change to the saved-state shape, bump the version and migrate or you'll wipe progress.
- **SRS algorithm:** a lightweight SM-2 variant in `app.js` (`grade()`), buttons Again/Hard/Good/Easy. Intervals in days; "Again" requeues after ~1 min.
- **Streak** increments once per calendar day on any review/correct answer.
- Keep everything **vanilla JS, no frameworks, no npm, no internet**. That is a hard requirement.

## ⚠️ CONTENT-FILTER GOTCHA (important when generating code)

When writing large files in one shot, the API content filter sometimes false-positives on big dense blocks (long romaji/kana arrays + code). **Build large files in small chunks**: write a skeleton, then append sections with edits. This is why `data.js` was assembled incrementally. Keep doing that.

## DIVISION OF LABOR (avoid conflicts)

- **Course agent (not you)** owns lesson content. When a new lesson is taught, the course agent appends a new deck object to the `LESSONS` array in `data.js`, following the contract above.
- **You (app agent)** own `index.html`, `style.css`, `app.js`, and the *schema/format* of `data.js`. If you change the `LESSONS`/`KANA` shape, document it here so the course agent matches it.
- **Shared file = `data.js`.** Edits there are append-only (new decks/cards). Coordinate schema changes through this brief.

## FEATURE BACKLOG (ideas, build on request)

- **Sentence practice mode** — drill grammar patterns (e.g. 「Aは Bです」), fill-in-the-particle.
- **Listening mode** — play audio, user types/chooses what they heard.
- **Speaking/shadowing** — use `SpeechRecognition` (Chrome/Edge, `ja-JP`) to score pronunciation of dialogue lines.
- **Per-lesson kana/vocab progress bars** on the Stats tab.
- **Export/import progress** (JSON) so the user can back up or move browsers.
- **Furigana toggle** once kanji-bearing vocab appears in later lessons.

## DON'T

- Don't add build tooling, bundlers, frameworks, CDNs, or anything requiring internet.
- Don't use `fetch`/modules (breaks under `file://`).
- Don't reorder/remove existing lesson cards (breaks SRS history).
- Don't switch glosses away from Indonesian.
