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
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
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
  const datasetInfo = dictionary.datasets[dataset];
  const isDocumentRoute = route.startsWith("docs/");

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = `${dictionary.nav[route]} - ${dictionary.site.title}`;
  }, [dictionary, locale, route]);

  return (
    <div className="min-h-screen">
      <header className="pt-5 sm:pt-7">
        <div className="container">
          <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 px-5 py-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(99,102,241,0.06),transparent)]" />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                    {dictionary.site.title}
                  </div>
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

              <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {dictionary.site.activePage}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {isDocumentRoute
                      ? datasetInfo.documentTitle
                      : datasetInfo.learnerTitle}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {dictionary.site.dataset}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {dictionary.nav[dataset]}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {dictionary.site.source}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {isDocumentRoute
                      ? dictionary.site.markdownSource
                      : dictionary.site.structuredSource}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {dictionary.site.interface}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {locale === "zh"
                      ? dictionary.site.zhInterface
                      : dictionary.site.enInterface}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
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
