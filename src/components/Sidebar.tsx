import { useState, useEffect, type ComponentType } from "react";
import { Box, Flex, Text, Tooltip, IconButton } from "@radix-ui/themes";
import {
  HomeIcon,
  LetterCaseToggleIcon,
  ChatBubbleIcon,
  GearIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export type ViewId = "greet" | "translator" | "osc" | "settings";

export interface NavItem {
  id: ViewId;
  icon: ComponentType<{ width?: number; height?: number }>;
  labelKey: string;
  /** footer 项渲染到底部（紧邻语言切换）。 */
  footer?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "greet", icon: HomeIcon, labelKey: "nav.greet" },
  { id: "translator", icon: LetterCaseToggleIcon, labelKey: "nav.translator" },
  { id: "osc", icon: ChatBubbleIcon, labelKey: "nav.osc" },
  { id: "settings", icon: GearIcon, labelKey: "nav.settings", footer: true },
];

const STORAGE_KEY = "vrc-gotrans.sidebar.collapsed";
const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 64;

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistCollapsed(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore quota / privacy errors */
  }
}

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function Sidebar({
  activeView,
  onNavigate,
}: SidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<boolean>(loadCollapsed);

  useEffect(() => {
    persistCollapsed(collapsed);
  }, [collapsed]);

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const topItems = NAV_ITEMS.filter((i) => !i.footer);
  const footerItems = NAV_ITEMS.filter((i) => i.footer);

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = item.id === activeView;
    const button = (
      <Flex
        align="center"
        gap="3"
        onClick={() => onNavigate(item.id)}
        style={{
          cursor: "pointer",
          height: 40,
          padding: collapsed ? "0" : "0 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 8,
          width: collapsed ? 40 : "100%",
          margin: collapsed ? "0 auto" : undefined,
          backgroundColor: active ? "var(--accent-a4)" : "transparent",
          color: active ? "var(--accent-11)" : "var(--gray-11)",
          fontWeight: active ? 600 : 500,
          transition:
            "background-color 0.15s ease, color 0.15s ease, width 0.15s ease",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.backgroundColor = "var(--gray-a3)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Icon width={18} height={18} />
        {!collapsed && <Text size="2">{t(item.labelKey)}</Text>}
      </Flex>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.id} content={t(item.labelKey)}>
          {button}
        </Tooltip>
      );
    }
    return <Box key={item.id}>{button}</Box>;
  };

  return (
    <Box
      style={{
        width,
        minWidth: width,
        height: "100vh",
        position: "sticky",
        top: 0,
        borderRight: "1px solid var(--gray-5)",
        backgroundColor: "var(--color-panel-solid)",
        transition: "width 0.15s ease, min-width 0.15s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部：品牌 + 收起按钮 */}
      <Flex align="center" justify="between" px="3" py="3" style={{ height: 64 }}>
        <Flex align="center" gap="2" style={{ overflow: "hidden" }}>
          <RocketIcon width={22} height={22} />
          {!collapsed && (
            <Text size="3" weight="bold" truncate>
              VRC-GoTrans
            </Text>
          )}
        </Flex>
        <IconButton
          variant="ghost"
          color="gray"
          size="1"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? t("common.expand") : t("common.collapse")}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Flex>

      {/* 导航 */}
      <Flex direction="column" gap="1" px="2" mt="2">
        {topItems.map(renderNavItem)}
      </Flex>

      {/* 弹性间隔 */}
      <Box style={{ flex: 1 }} />

      {/* 底部：设置 */}
      <Flex direction="column" gap="2" px="2" pb="3">
        {footerItems.map(renderNavItem)}
      </Flex>
    </Box>
  );
}
