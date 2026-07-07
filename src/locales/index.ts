import en from "./en";
import ja from "./ja";
import ko from "./ko";
import zhHans from "./zh-Hans";

export type TranslationShape = typeof zhHans;

export const SUPPORTED_LANGUAGES = [
  { code: "zh-Hans", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "zh-Hans";

export const resources: Record<string, { translation: TranslationShape }> = {
  "zh-Hans": { translation: zhHans },
  en: { translation: en },
  ja: { translation: ja },
  ko: { translation: ko },
};

export function getLanguageLabel(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
