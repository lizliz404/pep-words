import {
  BookIcon,
  FileTextIcon,
  GraduationCapIcon,
  LogoIcon,
} from "@/components/Icons";
import MarkdownDocument from "@/components/MarkdownDocument";
import { loadDatasetMarkdown, loadDatasetWords } from "@/content";
import { LOCALE_STORAGE_KEY, getDictionary, getStoredLocale } from "@/i18n";
import { useHashRoute } from "@/hooks/useHashRoute";
import VocabularyLearner from "@/pages/VocabularyLearner";
import type { DatasetKey, Locale, RouteKey, Word } from "@/types";
import { startTransition, useEffect, useState } from "react";

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
  "inline-flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.8)] transition";

const inactiveNavClass =
  "inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900";

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
    <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_56px_-44px_rgba(15,23,42,0.4)] sm:p-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700/90">
          PEP Words
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
      </div>
    </section>
  );
}

function LanguageSwitch({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/92 p-1.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
      <button
        type="button"
        onClick={() => onChange("zh")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          locale === "zh"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          locale === "en"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        English
      </button>
    </div>
  );
}

function App() {
  const { route, navigate } = useHashRoute();
  const [locale, setLocale] = useState<Locale>(() => getStoredLocale());
  const [words, setWords] = useState<Word[] | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const dictionary = getDictionary(locale);
  const dataset = ROUTE_DATASET_MAP[route];
  const isDocumentRoute = route.startsWith("docs/");

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = `${dictionary.nav[route]} - ${dictionary.site.title}`;
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

  return (
    <div className="min-h-screen">
      <header className="pt-6 sm:pt-8">
        <div className="container">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-sky-100/80 bg-white/92 text-sky-700 shadow-[0_18px_40px_-30px_rgba(14,116,144,0.28)]">
                    <LogoIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700/90">
                      PEP Words
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                      {dictionary.site.title}
                    </p>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-[15px] leading-8 text-slate-600 sm:text-base">
                  {dictionary.site.subtitle}
                </p>
              </div>

              <LanguageSwitch locale={locale} onChange={setLocale} />
            </div>

            <div className="flex flex-wrap gap-2">
              {NAVIGATION_ROUTES.map((routeKey) => {
                const Icon = routeIconMap[routeKey];

                return (
                  <button
                    key={routeKey}
                    type="button"
                    onClick={() => navigate(routeKey)}
                    className={route === routeKey ? activeNavClass : inactiveNavClass}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{dictionary.nav[routeKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-7 sm:py-9">
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
    </div>
  );
}

export default App;
