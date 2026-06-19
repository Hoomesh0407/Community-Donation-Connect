---
name: i18n infinite loop fix
description: Zustand store with object-returning selector causes React infinite loops; use plain React context for i18n
---

## Rule
Do NOT implement i18n/language stores with zustand using object-returning selectors like:
```ts
useI18n((state) => ({ t: state.t, lang: state.lang, setLang: state.setLang }))
```
This creates a new object reference on every render, causing zustand's getSnapshot to detect constant changes, leading to "Maximum update depth exceeded" errors.

**Why:** Zustand's useSyncExternalStore-based subscription uses reference equality. A new object on every call never equals the previous snapshot.

**How to apply:** Use a plain React context with useState + useCallback for i18n stores:
```ts
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);
  const setLang = useCallback((l) => { localStorage.setItem("cdc_lang", l); setLangState(l); }, []);
  const t = useCallback((key, fallback) => translations[key]?.[lang] || fallback || key, [lang]);
  return createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
}
```
