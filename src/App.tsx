import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Flex, Text, Box } from "@radix-ui/themes";
import { OscTestPanel } from "./components/OscTestPanel";
import { TranslatorTestPanel } from "./components/TranslatorTestPanel";
import { TranslatePage } from "./components/TranslatePage";
import { FirstRunWizard, FirstRunConfig } from "./components/FirstRunWizard";
import { Sidebar, NAV_ITEMS, type ViewId } from "./components/Sidebar";
import { SettingsPage } from "./components/SettingsPage";
import { configService } from "./services/config";
import { DEFAULT_LANGUAGE } from "./locales";
import "./App.css";

function App() {
  const { t, i18n } = useTranslation();
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewId>(NAV_ITEMS[0].id);

  useEffect(() => {
    checkFirstRun();
  }, []);

  async function checkFirstRun() {
    try {
      const config = await configService.load();
      i18n.changeLanguage(config.uiLanguage || DEFAULT_LANGUAGE);

      const firstRun = await configService.isFirstRun();
      setIsFirstRun(firstRun);
    } catch (error) {
      console.error("Failed to check first run:", error);
      setIsFirstRun(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWizardComplete(config: FirstRunConfig) {
    try {
      await configService.completeFirstRun(config);
      i18n.changeLanguage(config.uiLanguage);
      setIsFirstRun(false);
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Text color="gray">{t("common.loading")}</Text>
      </Flex>
    );
  }

  if (isFirstRun) {
    return <FirstRunWizard onComplete={handleWizardComplete} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case "greet":
        return <TranslatePage />;
      case "translator":
        return <TranslatorTestPanel />;
      case "osc":
        return <OscTestPanel />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <Flex style={{ minHeight: "100vh" }}>
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
      />
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          padding: "clamp(16px, 3vw, 32px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {renderContent()}
      </Box>
    </Flex>
  );
}

export default App;
