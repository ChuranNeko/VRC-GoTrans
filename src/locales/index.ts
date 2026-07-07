import en from "./en";
import zhHans from "./zh-Hans";
import ja from "./ja";

/**
 * 应用支持的界面语言。
 * label 为该语言的自称（endonym），始终以其本身语言显示。
 */
export const SUPPORTED_LANGUAGES = [
  { code: "zh-Hans", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "zh-Hans";

export const resources = {
  en: { translation: en },
  "zh-Hans": { translation: zhHans },
  ja: { translation: ja },
} as const;

/** 根据语言代码返回自称名称（找不到时回退到代码本身） */
export function getLanguageLabel(code: string): string {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code
  );
}
