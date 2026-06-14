// Data for にほんご Trainer. Kana tables + lesson vocab.
// New lessons: add an entry to LESSONS below (same shape as lesson 1).

const KANA = { hiragana: {}, katakana: {} };

KANA.katakana.basic = {
  "ア":"a","イ":"i","ウ":"u","エ":"e","オ":"o",
  "カ":"ka","キ":"ki","ク":"ku","ケ":"ke","コ":"ko",
  "サ":"sa","シ":"shi","ス":"su","セ":"se","ソ":"so",
  "タ":"ta","チ":"chi","ツ":"tsu","テ":"te","ト":"to",
  "ナ":"na","ニ":"ni","ヌ":"nu","ネ":"ne","ノ":"no",
  "ハ":"ha","ヒ":"hi","フ":"fu","ヘ":"he","ホ":"ho",
  "マ":"ma","ミ":"mi","ム":"mu","メ":"me","モ":"mo",
  "ヤ":"ya","ユ":"yu","ヨ":"yo",
  "ラ":"ra","リ":"ri","ル":"ru","レ":"re","ロ":"ro",
  "ワ":"wa","ヲ":"wo","ン":"n"
};

KANA.hiragana.basic = {
  "あ":"a","い":"i","う":"u","え":"e","お":"o",
  "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
  "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
  "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
  "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
  "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
  "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
  "や":"ya","ゆ":"yu","よ":"yo",
  "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
  "わ":"wa","を":"wo","ん":"n"
};

KANA.katakana.dakuten = {
  "ガ":"ga","ギ":"gi","グ":"gu","ゲ":"ge","ゴ":"go",
  "ザ":"za","ジ":"ji","ズ":"zu","ゼ":"ze","ゾ":"zo",
  "ダ":"da","ヂ":"ji","ヅ":"zu","デ":"de","ド":"do",
  "バ":"ba","ビ":"bi","ブ":"bu","ベ":"be","ボ":"bo",
  "パ":"pa","ピ":"pi","プ":"pu","ペ":"pe","ポ":"po"
};
KANA.hiragana.dakuten = {
  "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
  "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
  "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
  "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
  "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po"
};

KANA.katakana.combo = {
  "キャ":"kya","キュ":"kyu","キョ":"kyo",
  "シャ":"sha","シュ":"shu","ショ":"sho",
  "チャ":"cha","チュ":"chu","チョ":"cho",
  "ニャ":"nya","ニュ":"nyu","ニョ":"nyo",
  "ヒャ":"hya","ヒュ":"hyu","ヒョ":"hyo",
  "ミャ":"mya","ミュ":"myu","ミョ":"myo",
  "リャ":"rya","リュ":"ryu","リョ":"ryo",
  "ギャ":"gya","ギュ":"gyu","ギョ":"gyo",
  "ジャ":"ja","ジュ":"ju","ジョ":"jo",
  "ビャ":"bya","ビュ":"byu","ビョ":"byo",
  "ピャ":"pya","ピュ":"pyu","ピョ":"pyo"
};
KANA.hiragana.combo = {
  "きゃ":"kya","きゅ":"kyu","きょ":"kyo",
  "しゃ":"sha","しゅ":"shu","しょ":"sho",
  "ちゃ":"cha","ちゅ":"chu","ちょ":"cho",
  "にゃ":"nya","にゅ":"nyu","にょ":"nyo",
  "ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo",
  "みゃ":"mya","みゅ":"myu","みょ":"myo",
  "りゃ":"rya","りゅ":"ryu","りょ":"ryo",
  "ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo",
  "じゃ":"ja","じゅ":"ju","じょ":"jo",
  "びゃ":"bya","びゅ":"byu","びょ":"byo",
  "ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo"
};

// Lessons: each card = { jp, romaji, id (Indonesian), note }
const LESSONS = [
  {
    id: "L01",
    title: "Lesson 01 — Greetings & Self-Introduction",
    cards: [
      { jp:"おはようございます", romaji:"ohayō gozaimasu", id:"selamat pagi (sopan)" },
      { jp:"こんにちは", romaji:"konnichiwa", id:"selamat siang / halo" },
      { jp:"こんばんは", romaji:"konbanwa", id:"selamat malam" },
      { jp:"ありがとうございます", romaji:"arigatō gozaimasu", id:"terima kasih (sopan)" },
      { jp:"すみません", romaji:"sumimasen", id:"maaf / permisi" },
      { jp:"はい", romaji:"hai", id:"ya" },
      { jp:"いいえ", romaji:"iie", id:"tidak" },
      { jp:"はじめまして", romaji:"hajimemashite", id:"salam kenal (pertemuan pertama)" },
      { jp:"よろしくおねがいします", romaji:"yoroshiku onegaishimasu", id:"mohon kerja samanya" },
      { jp:"わたし", romaji:"watashi", id:"saya" },
      { jp:"あなた", romaji:"anata", id:"kamu" },
      { jp:"がくせい", romaji:"gakusei", id:"pelajar / mahasiswa" },
      { jp:"しゅっしん", romaji:"shusshin", id:"asal / dari" },
      { jp:"なまえ", romaji:"namae", id:"nama" },
      { jp:"です", romaji:"desu", id:"adalah (sopan)" },
      { jp:"さん", romaji:"san", id:"Pak / Bu / Mas / Mbak" }
    ]
  }
];

