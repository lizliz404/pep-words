import {
  BookIcon,
  FileTextIcon,
  GraduationCapIcon,
  LogoIcon,
} from "@/components/Icons";
import HeroiconsLanguage from "~icons/heroicons/language";
import HeroiconsWrenchScrewdriver from "~icons/heroicons/wrench-screwdriver";
import MarkdownDocument from "@/components/MarkdownDocument";
import { loadDatasetMarkdown, loadDatasetWords } from "@/content";
import { LOCALE_STORAGE_KEY, getDictionary, getStoredLocale } from "@/i18n";
import { useHashRoute } from "@/hooks/useHashRoute";
import VocabularyLearner from "@/pages/VocabularyLearner";
import type { DatasetKey, Locale, RouteKey, Word } from "@/types";
import { startTransition, useEffect, useState } from "react";
import type { ReactNode } from "react";

const BRAIN_RUSH_URL = "https://brainrush.lizliz.xyz";
const TRANSITION_MS = 220;

const NAVIGATION_ROUTES: RouteKey[] = [
  "middle-school",
  "primary-school",
  "docs/middle-school",
  "docs/primary-school",
];

const ROUTE_DATASET_MAP: Record<RouteKey, DatasetKey> = {
  "middle-school": "middle-school",
  "primary-school": "primary-school",
  "docs/middle-school": "middle-school",
  "docs/primary-school": "primary-school",
};

const activeNavClass =
  "inline-flex min-w-max items-center justify-center gap-1.5 rounded-full bg-[#312a22] px-3.5 py-2 text-xs font-semibold text-[#f8f2e7] shadow-[0_14px_30px_-24px_rgba(49,42,34,0.55)] sm:gap-2 sm:px-4 sm:text-sm";

const inactiveNavClass =
  "inline-flex min-w-max items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-[#6c6258] transition hover:bg-[#f8f2e7] hover:text-[#312a22] sm:gap-2 sm:px-4 sm:text-sm";

const routeIconMap: Record<RouteKey, typeof GraduationCapIcon> = {
  "middle-school": GraduationCapIcon,
  "primary-school": BookIcon,
  "docs/middle-school": FileTextIcon,
  "docs/primary-school": FileTextIcon,
};

function RouteStatus({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[2rem] border border-[#d6cbbb] bg-[#f8f2e7]/92 p-8 shadow-[0_24px_56px_-44px_rgba(49,42,34,0.42)] sm:p-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700/90">
          PEP Words
        </p>
        <h2 className="text-2xl font-semibold text-[#241f1a] sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-[#6c6258] sm:text-base">{description}</p>
      </div>
    </section>
  );
}

function UtilityTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="tooltip-wrap" data-tooltip={label}>
      {children}
    </span>
  );
}

function LanguageSwitch({
  locale,
  onChange,
  tooltip,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  tooltip: string;
}) {
  return (
    <UtilityTooltip label={tooltip}>
      <button
        type="button"
        onClick={() => onChange(locale === "zh" ? "en" : "zh")}
        aria-label={tooltip}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6cbbb] bg-[#f8f2e7]/92 text-[#526a7f] shadow-[0_16px_34px_-30px_rgba(49,42,34,0.34)] transition hover:-translate-y-0.5 hover:border-[#9c5d30]/50 hover:text-[#312a22]"
      >
        <HeroiconsLanguage className="h-5 w-5" />
      </button>
    </UtilityTooltip>
  );
}

function App() {
  const { route, navigate } = useHashRoute();
  const [locale, setLocale] = useState<Locale>(() => getStoredLocale());
  const [words, setWords] = useState<Word[] | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackClosing, setFeedbackClosing] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [feedbackView, setFeedbackView] = useState<"form" | "wechat">("form");
  const [wechatQrReady, setWechatQrReady] = useState(true);

  const dictionary = getDictionary(locale);
  const dataset = ROUTE_DATASET_MAP[route];
  const isDocumentRoute = route.startsWith("docs/");

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = `${dictionary.nav[route]}｜${dictionary.site.title}｜PEP 英语单词检索、卡片与测试`;
  }, [dictionary, locale, route]);

  useEffect(() => {
    let isCancelled = false;

    setLoadError(null);

    if (isDocumentRoute) {
      startTransition(() => {
        setMarkdown(null);
        setWords(null);
      });

      loadDatasetMarkdown(dataset)
        .then((nextMarkdown) => {
          if (isCancelled) {
            return;
          }

          startTransition(() => {
            setMarkdown(nextMarkdown);
          });
        })
        .catch((error: unknown) => {
          if (isCancelled) {
            return;
          }

          setLoadError(error instanceof Error ? error.message : "Unknown load error");
        });

      return () => {
        isCancelled = true;
      };
    }

    startTransition(() => {
      setWords(null);
      setMarkdown(null);
    });

    loadDatasetWords(dataset)
      .then((nextWords: Word[]) => {
        if (isCancelled) {
          return;
        }

        startTransition(() => {
          setWords(nextWords);
        });
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : "Unknown load error");
      });

    return () => {
      isCancelled = true;
    };
  }, [dataset, isDocumentRoute]);

  const loadingTitle = locale === "zh" ? "内容加载中" : "Loading content";
  const loadingDescription =
    locale === "zh"
      ? "当前页面的数据会按需加载，这样首屏更轻，也能减少部署构建时的噪音。"
      : "This route loads its data on demand to keep the initial bundle smaller.";
  const errorTitle = locale === "zh" ? "内容加载失败" : "Failed to load content";
  const errorDescription =
    locale === "zh"
      ? "请刷新页面重试；如果仍然失败，再检查构建产物和静态资源路径。"
      : "Refresh and try again. If it still fails, inspect the built assets and paths.";

  const openFeedback = () => {
    setFeedbackView("form");
    setFeedbackClosing(false);
    setFeedbackOpen(true);
  };

  const closeFeedback = () => {
    setFeedbackClosing(true);
    window.setTimeout(() => {
      setFeedbackOpen(false);
      setFeedbackClosing(false);
    }, TRANSITION_MS);
  };

  const submitFeedback = async () => {
    const message = feedbackText.trim();
    if (!message) return;

    setFeedbackStatus("submitting");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app: "pep-words",
          message,
          locale,
          route,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Feedback request failed: ${response.status}`);
      }

      setFeedbackStatus("submitted");
      setFeedbackText("");
    } catch {
      setFeedbackStatus("error");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="pt-6 sm:pt-8">
        <div className="container">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-3xl min-w-0">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-[#d6cbbb] bg-[#f8f2e7]/92 text-[#526a7f] shadow-[0_18px_40px_-30px_rgba(49,42,34,0.32)]">
                    <LogoIcon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#526a7f]">
                      PEP Words
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#2a241f]">
                      {dictionary.site.title}
                    </p>
                  </div>
                </div>
                <div className="mt-4 max-w-2xl space-y-2 text-[15px] leading-7 text-[#5f564d] sm:text-base">
                  <p>{dictionary.site.subtitle}</p>
                  <p>{dictionary.site.capability}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <UtilityTooltip label={dictionary.learner.feedback}>
                  <button
                    type="button"
                    onClick={openFeedback}
                    aria-label={dictionary.learner.feedback}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6cbbb] bg-[#f8f2e7]/92 text-[#526a7f] shadow-[0_16px_34px_-30px_rgba(49,42,34,0.34)] transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:border-[#9c5d30]/50 hover:text-[#312a22]"
                  >
                    <HeroiconsWrenchScrewdriver className="h-4.5 w-4.5" />
                  </button>
                </UtilityTooltip>
                <UtilityTooltip label={locale === "zh" ? "打开 Brain Rush 速算与单词小游戏" : "Open Brain Rush math and word game"}>
                  <a
                    href={BRAIN_RUSH_URL}
                    aria-label="Brain Rush"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6cbbb] bg-[#f8f2e7]/92 shadow-[0_16px_34px_-30px_rgba(49,42,34,0.34)] transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:border-[#9c5d30]/50"
                  >
                    <img src="/brain-rush-icon.svg" alt="" aria-hidden="true" className="h-5 w-5 rounded-[0.35rem]" />
                  </a>
                </UtilityTooltip>
                <LanguageSwitch
                  locale={locale}
                  onChange={setLocale}
                  tooltip={locale === "zh" ? "切换到 English" : "Switch to Chinese"}
                />
              </div>
            </div>

            <nav
              aria-label="PEP Words sections"
              className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="inline-flex min-w-full items-center gap-1 rounded-[1.35rem] border border-[#d6cbbb] bg-[#efe4d3]/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_18px_42px_-36px_rgba(49,42,34,0.34)] sm:min-w-0">
                {NAVIGATION_ROUTES.map((routeKey) => {
                  const Icon = routeIconMap[routeKey];

                  return (
                    <button
                      key={routeKey}
                      type="button"
                      onClick={() => navigate(routeKey)}
                      className={route === routeKey ? activeNavClass : inactiveNavClass}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{dictionary.nav[routeKey]}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {feedbackOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-start justify-center bg-slate-950/24 px-4 pt-20 backdrop-blur-sm ${feedbackClosing ? "animate-fade-out" : "animate-fade-in"}`}
          role="dialog"
          aria-modal="true"
          onClick={closeFeedback}
        >
          <div
            className={`w-full max-w-lg rounded-[2.125rem] border border-[#ddd7ca] bg-[#fffdf8]/98 p-5 text-left shadow-[0_24px_72px_-44px_rgba(20,20,19,0.36)] sm:p-6 ${feedbackClosing ? "animate-pop-out" : "animate-pop-in"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">{dictionary.learner.feedbackTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{dictionary.learner.feedbackHint}</p>
              </div>
              <button type="button" onClick={closeFeedback} aria-label={dictionary.learner.feedbackClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl font-semibold leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                ×
              </button>
            </div>
            <div className="mt-5 inline-flex rounded-full border border-sky-100 bg-sky-50/70 p-1">
              <button
                type="button"
                onClick={() => setFeedbackView("form")}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${feedbackView === "form" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                {dictionary.learner.feedbackTabForm}
              </button>
              <button
                type="button"
                onClick={() => setFeedbackView("wechat")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${feedbackView === "wechat" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                aria-label={dictionary.learner.feedbackWechat}
              >
                <span aria-hidden="true">💬</span>
                <span>{dictionary.learner.feedbackWechat}</span>
              </button>
            </div>

            {feedbackView === "form" ? (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  placeholder={dictionary.learner.feedbackPlaceholder}
                  className="mt-4 min-h-36 w-full resize-y rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                  <div className="flex items-center gap-3">
                    {feedbackStatus === "submitted" && <span className="text-xs font-semibold text-emerald-700">{dictionary.learner.feedbackSubmitted}</span>}
                    {feedbackStatus === "error" && <span className="text-xs font-semibold text-rose-700">{dictionary.learner.feedbackError}</span>}
                    <button type="button" onClick={submitFeedback} disabled={feedbackText.trim().length === 0 || feedbackStatus === "submitting"} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                      {feedbackStatus === "submitting" ? dictionary.learner.feedbackSubmitting : dictionary.learner.feedbackSubmit}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-center">
                <div className="mx-auto flex h-56 w-56 max-w-full items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white p-2 shadow-sm sm:h-64 sm:w-64">
                  {wechatQrReady ? (
                    <img src="/wechat-qr.png" alt={dictionary.learner.feedbackWechatQrAlt} className="h-full w-full object-cover" onError={() => setWechatQrReady(false)} />
                  ) : (
                    <div className="text-sm font-semibold leading-6 text-slate-500">{dictionary.learner.feedbackWechatMissing}</div>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{dictionary.learner.feedbackWechatHint}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <main key={route} className="container animate-fade-in py-7 sm:py-9">
        {loadError ? (
          <RouteStatus title={errorTitle} description={`${errorDescription} (${loadError})`} />
        ) : isDocumentRoute ? (
          markdown === null ? (
            <RouteStatus title={loadingTitle} description={loadingDescription} />
          ) : (
          <MarkdownDocument
            key={route}
            badge={dictionary.datasets[dataset].documentBadge}
            title={dictionary.datasets[dataset].documentTitle}
            description={dictionary.datasets[dataset].documentDescription}
            markdown={markdown}
          />
          )
        ) : words === null ? (
          <RouteStatus title={loadingTitle} description={loadingDescription} />
        ) : (
          <VocabularyLearner
            key={route}
            dataset={dataset}
            words={words}
            dictionary={dictionary}
          />
        )}
      </main>

      <footer className="container pb-8 pt-4 sm:pb-10">
        <div className="border-t border-[#d6cbbb]/80 pt-4 text-center">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-1 text-[12px] leading-5 text-[#6c6258] sm:flex-row sm:gap-3 sm:text-sm">
            <span>{dictionary.learner.privacyNote}</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#b8a893] sm:inline-block" aria-hidden="true" />
            <span>© {new Date().getFullYear()} Liz · PEP Words</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
