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

// Lessons: { id, module, title, cards:[{ jp, romaji, id (Indonesian), note }] }
// `module` groups lessons in the app's dropdowns (use the syllabus module name,
// e.g. "Module 1 — Survival Basics"). Lessons without it fall under "Lessons".
const LESSONS = [
  {
    id: "L01",
    module: "Module 1 — Survival Basics",
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
  },
  {
    id: "L02",
    module: "Module 1 — Survival Basics",
    title: "Lesson 02 — これ・それ・あれ (this/that)",
    cards: [
      { jp:"これ", romaji:"kore", id:"ini (dekat saya)" },
      { jp:"それ", romaji:"sore", id:"itu (dekat lawan bicara)" },
      { jp:"あれ", romaji:"are", id:"itu (jauh dari keduanya)" },
      { jp:"どれ", romaji:"dore", id:"yang mana" },
      { jp:"この", romaji:"kono", id:"... ini (+ kata benda)" },
      { jp:"その", romaji:"sono", id:"... itu (+ kata benda)" },
      { jp:"あの", romaji:"ano", id:"... itu (jauh) (+ kata benda)" },
      { jp:"なん", romaji:"nan / nani", id:"apa" },
      { jp:"ほん", romaji:"hon", id:"buku" },
      { jp:"ペン", romaji:"pen", id:"pulpen" },
      { jp:"かばん", romaji:"kaban", id:"tas" },
      { jp:"けいたい", romaji:"keitai", id:"HP / ponsel" },
      { jp:"くるま", romaji:"kuruma", id:"mobil" },
      { jp:"なまえ", romaji:"namae", id:"nama", note:"ulang dari L01" }
    ]
  },
  {
    id: "L03",
    module: "Module 1 — Survival Basics",
    title: "Lesson 03 — Numbers & Prices (すうじ・ねだん)",
    cards: [
      { jp:"いち", romaji:"ichi", id:"1" },
      { jp:"に", romaji:"ni", id:"2" },
      { jp:"さん", romaji:"san", id:"3" },
      { jp:"よん", romaji:"yon / shi", id:"4" },
      { jp:"ご", romaji:"go", id:"5" },
      { jp:"ろく", romaji:"roku", id:"6" },
      { jp:"なな", romaji:"nana / shichi", id:"7" },
      { jp:"はち", romaji:"hachi", id:"8" },
      { jp:"きゅう", romaji:"kyū / ku", id:"9" },
      { jp:"じゅう", romaji:"jū", id:"10" },
      { jp:"ひゃく", romaji:"hyaku", id:"100 (ratus)" },
      { jp:"せん", romaji:"sen", id:"1000 (ribu)" },
      { jp:"まん", romaji:"man", id:"10.000 (puluh ribu)" },
      { jp:"えん", romaji:"en", id:"yen (mata uang)" },
      { jp:"いくら", romaji:"ikura", id:"berapa harganya" },
      { jp:"ください", romaji:"kudasai", id:"tolong (minta sesuatu)" }
    ]
  },
  {
    id: "L04",
    module: "Module 1 — Survival Basics",
    title: "Lesson 04 — Time & Dates (じかん・ひにち)",
    cards: [
      { jp:"いま", romaji:"ima", id:"sekarang" },
      { jp:"じ", romaji:"~ji", id:"jam (pukul)", note:"contoh: さんじ = jam 3" },
      { jp:"ふん", romaji:"~fun / pun", id:"menit" },
      { jp:"はん", romaji:"han", id:"setengah (lewat 30)" },
      { jp:"ごぜん", romaji:"gozen", id:"pagi / AM" },
      { jp:"ごご", romaji:"gogo", id:"siang-sore / PM" },
      { jp:"なんじ", romaji:"nanji", id:"jam berapa" },
      { jp:"きょう", romaji:"kyō", id:"hari ini" },
      { jp:"あした", romaji:"ashita", id:"besok" },
      { jp:"きのう", romaji:"kinō", id:"kemarin" },
      { jp:"げつようび", romaji:"getsuyōbi", id:"Senin" },
      { jp:"かようび", romaji:"kayōbi", id:"Selasa" },
      { jp:"すいようび", romaji:"suiyōbi", id:"Rabu" },
      { jp:"もくようび", romaji:"mokuyōbi", id:"Kamis" },
      { jp:"きんようび", romaji:"kinyōbi", id:"Jumat" },
      { jp:"どようび", romaji:"doyōbi", id:"Sabtu" },
      { jp:"にちようび", romaji:"nichiyōbi", id:"Minggu" }
    ]
  },
  {
    id: "L05",
    module: "Module 1 — Survival Basics",
    title: "Lesson 05 — Existence: あります・います",
    cards: [
      { jp:"あります", romaji:"arimasu", id:"ada (benda mati)" },
      { jp:"います", romaji:"imasu", id:"ada (benda hidup: orang/hewan)" },
      { jp:"うえ", romaji:"ue", id:"atas" },
      { jp:"した", romaji:"shita", id:"bawah" },
      { jp:"なか", romaji:"naka", id:"dalam" },
      { jp:"まえ", romaji:"mae", id:"depan" },
      { jp:"うしろ", romaji:"ushiro", id:"belakang" },
      { jp:"となり", romaji:"tonari", id:"sebelah (sejenis)" },
      { jp:"みぎ", romaji:"migi", id:"kanan" },
      { jp:"ひだり", romaji:"hidari", id:"kiri" },
      { jp:"つくえ", romaji:"tsukue", id:"meja" },
      { jp:"いす", romaji:"isu", id:"kursi" },
      { jp:"ねこ", romaji:"neko", id:"kucing" },
      { jp:"いぬ", romaji:"inu", id:"anjing" },
      { jp:"へや", romaji:"heya", id:"kamar / ruangan" }
    ]
  },
  {
    id: "L06",
    module: "Module 1 — Survival Basics",
    title: "Lesson 06 — Asking Where Things Are (どこ)",
    cards: [
      { jp:"どこ", romaji:"doko", id:"di mana" },
      { jp:"どちら", romaji:"dochira", id:"di mana / arah mana (sopan)" },
      { jp:"ここ", romaji:"koko", id:"di sini" },
      { jp:"そこ", romaji:"soko", id:"di situ" },
      { jp:"あそこ", romaji:"asoko", id:"di sana" },
      { jp:"えき", romaji:"eki", id:"stasiun" },
      { jp:"トイレ", romaji:"toire", id:"toilet" },
      { jp:"みせ", romaji:"mise", id:"toko" },
      { jp:"コンビニ", romaji:"konbini", id:"minimarket" },
      { jp:"ぎんこう", romaji:"ginkō", id:"bank" },
      { jp:"びょういん", romaji:"byōin", id:"rumah sakit" },
      { jp:"でぐち", romaji:"deguchi", id:"pintu keluar (出口)" },
      { jp:"いりぐち", romaji:"iriguchi", id:"pintu masuk (入口)" }
    ]
  }
];

