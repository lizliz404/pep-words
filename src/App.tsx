import MarkdownDocument from "@/components/MarkdownDocument";
import { datasetMarkdown, datasetWords } from "@/content";
import { LOCALE_STORAGE_KEY, getDictionary, getStoredLocale } from "@/i18n";
import { useHashRoute } from "@/hooks/useHashRoute";
import VocabularyLearner from "@/pages/VocabularyLearner";
import type { DatasetKey, Locale, RouteKey } from "@/types";
import { useEffect, useState } from "react";

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
  "rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.8)] transition";

const inactiveNavClass =
  "rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900";

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

  const dictionary = getDictionary(locale);
  const dataset = ROUTE_DATASET_MAP[route];
  const isDocumentRoute = route.startsWith("docs/");

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = `${dictionary.nav[route]} - ${dictionary.site.title}`;
  }, [dictionary, locale, route]);

  return (
    <div className="min-h-screen">
      <header className="pt-6 sm:pt-8">
        <div className="container">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/90">
                  {dictionary.site.title}
                </p>
                <p className="mt-4 max-w-2xl text-[15px] leading-8 text-slate-600 sm:text-base">
                  {dictionary.site.subtitle}
                </p>
              </div>

              <LanguageSwitch locale={locale} onChange={setLocale} />
            </div>

            <div className="flex flex-wrap gap-2">
              {NAVIGATION_ROUTES.map((routeKey) => (
                <button
                  key={routeKey}
                  type="button"
                  onClick={() => navigate(routeKey)}
                  className={route === routeKey ? activeNavClass : inactiveNavClass}
                >
                  {dictionary.nav[routeKey]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-7 sm:py-9">
        {isDocumentRoute ? (
          <MarkdownDocument
            key={route}
            badge={dictionary.datasets[dataset].documentBadge}
            title={dictionary.datasets[dataset].documentTitle}
            description={dictionary.datasets[dataset].documentDescription}
            markdown={datasetMarkdown[dataset]}
          />
        ) : (
          <VocabularyLearner
            key={route}
            dataset={dataset}
            words={datasetWords[dataset]}
            dictionary={dictionary}
          />
        )}
      </main>
    </div>
  );
}

export default App;
