import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { Theme } from "@radix-ui/themes";

export type ThemeMode = "light" | "dark" | "auto";
type Appearance = "light" | "dark";

const STORAGE_KEY = "vrc-gotrans.theme";
export const DEFAULT_THEME_MODE: ThemeMode = "auto";

/**
 * 根据用户选择 + 系统当前深浅，解析出实际生效的外观。
 * 不使用 Radix 的 "inherit"：那个依赖 CSS 媒体查询，系统切换时不会触发 React 重渲染，
 * 导致 auto 模式“没有真跟随”。这里主动解析，系统一变即重渲染。
 */
function resolveAppearance(mode: ThemeMode, systemDark: boolean): Appearance {
  if (mode === "auto") return systemDark ? "dark" : "light";
  return mode;
}

function loadFromStorage(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch {
    /* localStorage 不可用时回退默认 */
  }
  return DEFAULT_THEME_MODE;
}

function readSystemDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  /** 当前系统是否为深色（themeMode=auto 时用于显示实际生效的外观）。 */
  systemDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: DEFAULT_THEME_MODE,
  setThemeMode: () => {},
  systemDark: false,
});

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(loadFromStorage);
  const [systemDark, setSystemDark] = useState<boolean>(readSystemDark);

  // 监听系统深浅变化：auto 模式下系统切换时，立即重渲染 Theme 为对应外观。
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  const appearance = resolveAppearance(themeMode, systemDark);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, systemDark }}>
      <Theme appearance={appearance}>{children}</Theme>
    </ThemeContext.Provider>
  );
}
