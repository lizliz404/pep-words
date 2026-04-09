import type { DatasetKey, Locale } from "@/types";

export const LOCALE_STORAGE_KEY = "pep_vocab_locale";

type TranslationSet = {
  site: {
    title: string;
    subtitle: string;
    activePage: string;
    dataset: string;
    source: string;
    interface: string;
    structuredSource: string;
    markdownSource: string;
    zhInterface: string;
    enInterface: string;
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
    mode: string;
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
    next: string;
    submit: string;
    exit: string;
  };
};

export type Dictionary = TranslationSet;

const zh: TranslationSet = {
  site: {
    title: "PEP 词汇学习",
    subtitle: "保留词汇浏览、收藏、卡片和测试四个核心功能",
    activePage: "当前页面",
    dataset: "词库",
    source: "来源",
    interface: "界面",
    structuredSource: "结构化词库",
    markdownSource: "Markdown 原文",
    zhInterface: "中文界面",
    enInterface: "英文界面",
  },
  nav: {
    "middle-school": "初中词汇",
    "primary-school": "小学词汇",
    "docs/middle-school": "初中原文",
    "docs/primary-school": "小学原文",
  },
  datasets: {
    "middle-school": {
      learnerBadge: "PEP 初中词汇",
      learnerTitle: "初中词汇学习",
      learnerDescription: "当前页保留搜索、按字母浏览、收藏、卡片和小测试。",
      documentBadge: "初中 Markdown 原文",
      documentTitle: "初中词汇原文浏览",
      documentDescription: "直接浏览整理后的 Markdown 词表原文。",
    },
    "primary-school": {
      learnerBadge: "PEP 小学词汇",
      learnerTitle: "小学词汇学习",
      learnerDescription: "页面结构与初中词汇一致，只切换为小学词库数据。",
      documentBadge: "小学 Markdown 原文",
      documentTitle: "小学词汇原文浏览",
      documentDescription: "直接浏览整理后的 Markdown 词表原文。",
    },
  },
  learner: {
    words: "总词数",
    visible: "当前可见",
    favorites: "收藏数",
    mode: "模式",
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
    previous: "上一个",
    next: "下一个",
    noMatches: "当前筛选下没有匹配词汇。",
  },
  favorites: {
    emptyTitle: "还没有收藏",
    emptyDescription: "从列表或卡片中收藏词汇后，会显示在这里。",
    count: (count) => `收藏词汇 (${count})`,
    play: "朗读",
    remove: "移除",
  },
  quiz: {
    complete: "测试完成",
    summary: "这是你本轮词汇测试的小结。",
    questions: "题目数",
    correct: "答对",
    accuracy: "正确率",
    excellent: "很稳，这组单词你已经比较熟了。",
    good: "不错，把错题再过一遍就够了。",
    keepPracticing: "再练一轮会更稳。",
    reviewFromBasics: "先回看基础词汇，再试一次。",
    review: "答题回顾",
    pass: "正确",
    miss: "错误",
    correctLabel: "正确答案",
    yourAnswer: "你的答案",
    backToStudy: "返回学习",
    progress: (index, total) => `第 ${index} 题 / 共 ${total} 题`,
    chooseMeaning: "请选择正确释义",
    previous: "上一题",
    next: "下一题",
    submit: "提交测试",
    exit: "退出测试",
  },
};

const en: TranslationSet = {
  site: {
    title: "PEP Vocabulary",
    subtitle: "Keep only the core workflow: browse, save, review, and quiz",
    activePage: "Active Page",
    dataset: "Dataset",
    source: "Source",
    interface: "Interface",
    structuredSource: "Structured Vocabulary",
    markdownSource: "Markdown",
    zhInterface: "Chinese Interface",
    enInterface: "English Interface",
  },
  nav: {
    "middle-school": "Middle School",
    "primary-school": "Primary School",
    "docs/middle-school": "Middle School Docs",
    "docs/primary-school": "Primary School Docs",
  },
  datasets: {
    "middle-school": {
      learnerBadge: "PEP Middle School Vocabulary",
      learnerTitle: "Middle School Vocabulary",
      learnerDescription:
        "This page keeps search, letter browsing, favorites, flashcards, and the quiz.",
      documentBadge: "Middle School Markdown",
      documentTitle: "Middle School Word List",
      documentDescription: "Browse the original markdown word list directly.",
    },
    "primary-school": {
      learnerBadge: "PEP Primary School Vocabulary",
      learnerTitle: "Primary School Vocabulary",
      learnerDescription:
        "The interaction stays the same as the middle-school page, with the primary-school dataset.",
      documentBadge: "Primary School Markdown",
      documentTitle: "Primary School Word List",
      documentDescription: "Browse the original markdown word list directly.",
    },
  },
  learner: {
    words: "Words",
    visible: "Visible",
    favorites: "Favorites",
    mode: "Mode",
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
    reviewFromBasics: "Start from the basics again and retry after review.",
    review: "Question Review",
    pass: "PASS",
    miss: "MISS",
    correctLabel: "Correct",
    yourAnswer: "Your answer",
    backToStudy: "Back to Study",
    progress: (index, total) => `Question ${index} / ${total}`,
    chooseMeaning: "Choose the correct meaning",
    previous: "Previous",
    next: "Next",
    submit: "Submit Quiz",
    exit: "Exit Quiz",
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
