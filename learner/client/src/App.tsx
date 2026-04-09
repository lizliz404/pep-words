import MarkdownDocument from "@/components/MarkdownDocument";
import { datasetMarkdown, datasetWords } from "@/content";
import {
  LOCALE_STORAGE_KEY,
  getDictionary,
  getStoredLocale,
} from "@/i18n";
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
  "rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700";

const inactiveNavClass =
  "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50";

function LanguageSwitch({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("zh")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          locale === "zh"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          locale === "en"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
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
  const datasetInfo = dictionary.datasets[dataset];
  const isDocumentRoute = route.startsWith("docs/");

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = `${dictionary.nav[route]} - ${dictionary.site.title}`;
  }, [dictionary, locale, route]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-sky-100 bg-white/90 backdrop-blur">
        <div className="container py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                {dictionary.site.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                {dictionary.site.subtitle}
              </p>
            </div>

            <LanguageSwitch locale={locale} onChange={setLocale} />
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
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
          </nav>
        </div>
      </header>

      <main className="container py-8">
        {isDocumentRoute ? (
          <MarkdownDocument
            key={route}
            badge={datasetInfo.documentBadge}
            title={datasetInfo.documentTitle}
            description={datasetInfo.documentDescription}
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
