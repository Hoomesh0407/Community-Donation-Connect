import { createContext, useContext, useState, useCallback, ReactNode, createElement } from "react";

type Language = "en" | "te";

const translations: Record<string, { en: string; te: string }> = {
  "app.title": { en: "Community Donation Connect", te: "కమ్యూనిటీ డొనేషన్ కనెక్ట్" },
  "app.subtitle": { en: "Donate Locally. Help Directly.", te: "స్థానికంగా దానం చేయండి. నేరుగా సహాయం చేయండి." },
  "nav.home": { en: "Home", te: "హోమ్" },
  "nav.donations": { en: "Donations", te: "విరాళాలు" },
  "nav.requests": { en: "Requests", te: "అభ్యర్థనలు" },
  "nav.matches": { en: "Matches", te: "మ్యాచ్‌లు" },
  "nav.leaderboard": { en: "Leaderboard", te: "లీడర్‌బోర్డ్" },
  "nav.login": { en: "Login", te: "లాగిన్" },
  "nav.register": { en: "Register", te: "నమోదు" },
  "nav.profile": { en: "Profile", te: "ప్రొఫైల్" },
  "nav.logout": { en: "Logout", te: "లాగౌట్" },
  "action.donate": { en: "I Want To Donate", te: "నేను దానం చేయాలనుకుంటున్నాను" },
  "action.request": { en: "I Need Help", te: "నాకు సహాయం కావాలి" },
  "lang.english": { en: "English", te: "ఇంగ్లీష్" },
  "lang.telugu": { en: "Telugu", te: "తెలుగు" },
  "lang.select": { en: "Select Language", te: "భాషను ఎంచుకోండి" },
};

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key, fallback) => fallback ?? key,
});

function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem("cdc_lang");
    if (stored === "en" || stored === "te") return stored;
  } catch {}
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  const setLang = useCallback((l: Language) => {
    try { localStorage.setItem("cdc_lang", l); } catch {}
    setLangState(l);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => translations[key]?.[lang] || fallback || key,
    [lang]
  );

  return createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useTranslation() {
  return useContext(I18nContext);
}

export const useI18n = useTranslation;
