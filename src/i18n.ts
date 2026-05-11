import type { DatasetKey, Locale } from "@/types";

export const LOCALE_STORAGE_KEY = "pep_vocab_locale";

type TranslationSet = {
  site: {
    title: string;
    subtitle: string;
  };
  nav: {
    "middle-school": string;
    "primary-school": string;
    "docs/middle-school": string;
    "docs/primary-school": string;
  };
  datasets: Record<
    DatasetKey,
    {
      learnerBadge: string;
      learnerTitle: string;
      learnerDescription: string;
      documentBadge: string;
      documentTitle: string;
      documentDescription: string;
    }
  >;
  learner: {
    words: string;
    visible: string;
    favorites: string;
    search: string;
    favoritesButton: (count: number) => string;
    startQuiz: string;
    searchPlaceholder: string;
    list: string;
    cards: string;
    browseByLetter: string;
    searchResults: (count: number) => string;
    letterResults: (letter: string, count: number) => string;
    openCard: string;
    playPronunciation: string;
    save: string;
    saved: string;
    word: string;
    meaning: string;
    revealMeaning: string;
    returnWord: string;
    previous: string;
    next: string;
    noMatches: string;
    privacyNote: string;
    feedback: string;
    feedbackTitle: string;
    feedbackHint: string;
    feedbackPlaceholder: string;
    feedbackSubmit: string;
    feedbackSubmitting: string;
    feedbackSubmitted: string;
    feedbackError: string;
    feedbackContact: string;
    feedbackGithub: string;
    feedbackTabForm: string;
    feedbackWechat: string;
    feedbackWechatHint: string;
    feedbackWechatQrAlt: string;
    feedbackWechatMissing: string;
    feedbackClose: string;
    exportFavorites: string;
    exportEmpty: string;
    shortcutsHint: string;
  };
  favorites: {
    emptyTitle: string;
    emptyDescription: string;
    count: (count: number) => string;
    play: string;
    remove: string;
  };
  quiz: {
    complete: string;
    summary: string;
    questions: string;
    correct: string;
    accuracy: string;
    excellent: string;
    good: string;
    keepPracticing: string;
    reviewFromBasics: string;
    review: string;
    pass: string;
    miss: string;
    correctLabel: string;
    yourAnswer: string;
    backToStudy: string;
    progress: (index: number, total: number) => string;
    chooseMeaning: string;
    previous: string;
    exit: string;
    autoAdvanceHint: string;
  };
};

export type Dictionary = TranslationSet;

const zh: TranslationSet = {
  site: {
    title: "PEP 词汇学习",
    subtitle:
      "基于人教版词汇整理，保留检索、收藏、卡片和测试四个核心动作。",
  },
  nav: {
    "middle-school": "初中词汇",
    "primary-school": "小学词汇",
    "docs/middle-school": "初中原文",
    "docs/primary-school": "小学原文",
  },
  datasets: {
    "middle-school": {
      learnerBadge: "PEP 初中",
      learnerTitle: "初中词汇学习",
      learnerDescription: "浏览、筛选并练习初中词汇。",
      documentBadge: "初中词表原文",
      documentTitle: "初中词表原文",
      documentDescription: "直接浏览整理后的 Markdown 原文。",
    },
    "primary-school": {
      learnerBadge: "PEP 小学",
      learnerTitle: "小学词汇学习",
      learnerDescription: "保留相同的交互方式，切换为小学词库。",
      documentBadge: "小学词表原文",
      documentTitle: "小学词表原文",
      documentDescription: "直接浏览整理后的 Markdown 原文。",
    },
  },
  learner: {
    words: "总词数",
    visible: "当前可见",
    favorites: "已收藏",
    search: "搜索",
    favoritesButton: (count) => `收藏 (${count})`,
    startQuiz: "开始测试",
    searchPlaceholder: "搜索英文单词或中文释义",
    list: "列表",
    cards: "卡片",
    browseByLetter: "按字母浏览",
    searchResults: (count) => `搜索结果 (${count})`,
    letterResults: (letter, count) => `字母 ${letter} (${count})`,
    openCard: "打开卡片",
    playPronunciation: "朗读",
    save: "收藏",
    saved: "已收藏",
    word: "单词",
    meaning: "释义",
    revealMeaning: "点击查看释义",
    returnWord: "再次点击返回单词",
    previous: "上一项",
    next: "下一项",
    noMatches: "当前筛选下没有匹配词汇。",
    privacyNote: "收藏数据只保存在你的浏览器本地。",
    feedback: "提建议 / 报错",
    feedbackTitle: "提建议 / 报错",
    feedbackHint: "直接写你遇到的问题或希望改进的地方。优先在站内提交；GitHub 只留给熟悉它的人。",
    feedbackPlaceholder: "例如：小学词汇里某个释义不准确；卡片模式在手机上不好点；希望增加听写……",
    feedbackSubmit: "提交反馈",
    feedbackSubmitting: "提交中…",
    feedbackSubmitted: "已收到，感谢。",
    feedbackError: "提交失败。你也可以把内容发给 Liz。",
    feedbackContact: "也可以扫码加微信，把问题截图和一句话说明直接发给 Liz。",
    feedbackGithub: "高级入口：GitHub Issues",
    feedbackTabForm: "站内提交",
    feedbackWechat: "微信",
    feedbackWechatHint: "扫码加微信，适合发截图、录屏或一句话反馈。",
    feedbackWechatQrAlt: "Liz 的微信二维码",
    feedbackWechatMissing: "微信二维码图片待放入 public/wechat-qr.png",
    feedbackClose: "关闭",
    exportFavorites: "导出收藏",
    exportEmpty: "还没有可导出的收藏。",
    shortcutsHint: "卡片快捷键：← / → 切换，空格 / Enter 翻面。",
  },
  favorites: {
    emptyTitle: "还没有收藏",
    emptyDescription: "从列表或卡片里收藏单词后，这里会显示出来。",
    count: (count) => `收藏词汇 (${count})`,
    play: "朗读",
    remove: "移除",
  },
  quiz: {
    complete: "测试完成",
    summary: "这里是本轮词汇测试的结果。",
    questions: "题目数",
    correct: "答对",
    accuracy: "正确率",
    excellent: "掌握得很稳，这组词已经比较熟了。",
    good: "完成得不错，把错题再过一遍就够了。",
    keepPracticing: "再练一轮会更稳。",
    reviewFromBasics: "先回看基础词汇，再做一轮测试。",
    review: "答题回顾",
    pass: "正确",
    miss: "错误",
    correctLabel: "正确答案",
    yourAnswer: "你的答案",
    backToStudy: "返回学习",
    progress: (index, total) => `第 ${index} 题 / 共 ${total} 题`,
    chooseMeaning: "选择正确释义",
    previous: "上一题",
    exit: "退出测试",
    autoAdvanceHint: "选中后会自动进入下一题，最后一题会自动提交。",
  },
};

const en: TranslationSet = {
  site: {
    title: "PEP Vocabulary",
    subtitle:
      "A lightweight PEP vocabulary site focused on search, favorites, flashcards, and quick quizzes.",
  },
  nav: {
    "middle-school": "Middle School",
    "primary-school": "Primary School",
    "docs/middle-school": "Middle School Docs",
    "docs/primary-school": "Primary School Docs",
  },
  datasets: {
    "middle-school": {
      learnerBadge: "PEP Middle School",
      learnerTitle: "Middle School Vocabulary",
      learnerDescription: "Browse, filter, and practice the middle-school dataset.",
      documentBadge: "Middle School Source",
      documentTitle: "Middle School Word List",
      documentDescription: "Read the cleaned markdown source directly.",
    },
    "primary-school": {
      learnerBadge: "PEP Primary School",
      learnerTitle: "Primary School Vocabulary",
      learnerDescription: "Keep the same workflow and switch to the primary-school dataset.",
      documentBadge: "Primary School Source",
      documentTitle: "Primary School Word List",
      documentDescription: "Read the cleaned markdown source directly.",
    },
  },
  learner: {
    words: "Words",
    visible: "Visible",
    favorites: "Favorites",
    search: "Search",
    favoritesButton: (count) => `Favorites (${count})`,
    startQuiz: "Start Quiz",
    searchPlaceholder: "Search by English word or meaning",
    list: "List",
    cards: "Cards",
    browseByLetter: "Browse by letter",
    searchResults: (count) => `Search results (${count})`,
    letterResults: (letter, count) => `Letter ${letter} (${count})`,
    openCard: "Open Card",
    playPronunciation: "Play",
    save: "Save",
    saved: "Saved",
    word: "Word",
    meaning: "Meaning",
    revealMeaning: "Click to reveal the meaning",
    returnWord: "Click again to return to the word",
    previous: "Previous",
    next: "Next",
    noMatches: "No words match the current filter.",
    privacyNote: "Favorites stay local to this browser.",
    feedback: "Suggest / report issue",
    feedbackTitle: "Suggest / report issue",
    feedbackHint: "Describe the problem or improvement. Submit here first; GitHub stays as the advanced path.",
    feedbackPlaceholder: "Example: a word meaning is inaccurate; flashcards are hard to tap on mobile; dictation mode would help…",
    feedbackSubmit: "Submit feedback",
    feedbackSubmitting: "Submitting…",
    feedbackSubmitted: "Received. Thank you.",
    feedbackError: "Submit failed. You can still send it to Liz directly.",
    feedbackContact: "You can also scan WeChat and send Liz a screenshot plus one sentence.",
    feedbackGithub: "Advanced: GitHub Issues",
    feedbackTabForm: "Submit here",
    feedbackWechat: "WeChat",
    feedbackWechatHint: "Scan WeChat for screenshots, screen recordings, or short feedback.",
    feedbackWechatQrAlt: "Liz's WeChat QR code",
    feedbackWechatMissing: "WeChat QR image should be placed at public/wechat-qr.png",
    feedbackClose: "Close",
    exportFavorites: "Export Favorites",
    exportEmpty: "No favorites to export yet.",
    shortcutsHint: "Card shortcuts: ← / → to move, Space / Enter to flip.",
  },
  favorites: {
    emptyTitle: "No favorites yet",
    emptyDescription: "Saved words from the list or card view will appear here.",
    count: (count) => `Favorites (${count})`,
    play: "Play",
    remove: "Remove",
  },
  quiz: {
    complete: "Quiz Complete",
    summary: "Here is a quick summary of your result.",
    questions: "Questions",
    correct: "Correct",
    accuracy: "Accuracy",
    excellent: "Excellent. You already know these words well.",
    good: "Good work. Review the missed words once more.",
    keepPracticing: "Keep practicing. One more round will help.",
    reviewFromBasics: "Review the basics first, then try again.",
    review: "Question Review",
    pass: "PASS",
    miss: "MISS",
    correctLabel: "Correct",
    yourAnswer: "Your answer",
    backToStudy: "Back to Study",
    progress: (index, total) => `Question ${index} / ${total}`,
    chooseMeaning: "Choose the correct meaning",
    previous: "Previous",
    exit: "Exit Quiz",
    autoAdvanceHint:
      "After you choose an option, the quiz moves forward automatically.",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return locale === "en" ? en : zh;
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "zh";
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" ? "en" : "zh";
}
