import { Select, Flex } from "@radix-ui/themes";
import { GlobeIcon } from "@radix-ui/react-icons";
import {
  SUPPORTED_LANGUAGES,
  getLanguageLabel,
} from "../locales";

interface LanguageSwitcherProps {
  value: string;
  onChange: (lang: string) => void;
  size?: "1" | "2" | "3";
  variant?: "surface" | "soft" | "classic" | "ghost";
  showIcon?: boolean;
  showLabel?: boolean;
  fullWidth?: boolean;
}

/**
 * 语言切换下拉菜单。
 * 在首次运行向导与主界面侧边栏中复用。
 */
export function LanguageSwitcher({
  value,
  onChange,
  size = "2",
  variant = "surface",
  showIcon = true,
  showLabel = true,
  fullWidth = false,
}: LanguageSwitcherProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={onChange}
      size={size}
      disabled={SUPPORTED_LANGUAGES.length <= 1}
    >
      <Select.Trigger
        variant={variant}
        style={fullWidth ? { width: "100%" } : undefined}
      >
        <Flex align="center" gap="2" justify={showLabel ? "start" : "center"}>
          {showIcon && <GlobeIcon />}
          {showLabel && <span>{getLanguageLabel(value)}</span>}
        </Flex>
      </Select.Trigger>
      <Select.Content>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Select.Item key={lang.code} value={lang.code}>
            {lang.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
