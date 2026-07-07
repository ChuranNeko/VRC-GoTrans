import {
  useState,
  useEffect,
  useRef,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Card,
  Flex,
  Text,
  Heading,
  Select,
  Switch,
  TextField,
  Box,
  Badge,
} from "@radix-ui/themes";
import {
  GearIcon,
  GlobeIcon,
  SunIcon,
  LetterCaseToggleIcon,
  SpeakerLoudIcon,
  ChatBubbleIcon,
  LockClosedIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { configService, type AppConfig } from "../services/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useThemeMode, type ThemeMode } from "../theme";
import { SystemInfoSection } from "./SystemInfoSection";
import { ModelDownloader } from "./ModelDownloader";

type ApiKeyProvider = "deepl" | "google" | "azure" | "baidu";

type IconType = ComponentType<{ width?: number; height?: number }>;

interface KeyField {
  provider: ApiKeyProvider;
  labelKey: string;
}

const KEY_FIELDS: KeyField[] = [
  { provider: "deepl", labelKey: "settings.apiKey.deepl" },
  { provider: "google", labelKey: "settings.apiKey.google" },
  { provider: "azure", labelKey: "settings.apiKey.azure" },
  { provider: "baidu", labelKey: "settings.apiKey.baidu" },
];

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: IconType;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Icon width={18} height={18} />
          <Heading size="4">{title}</Heading>
        </Flex>
        <Flex direction="column" gap="3">
          {children}
        </Flex>
      </Flex>
    </Card>
  );
}

function Row({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <Flex justify="between" align="center" gap="4">
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor={htmlFor} size="2" weight="medium">
          {label}
        </Text>
        {hint && (
          <Text size="1" color="gray">
            {hint}
          </Text>
        )}
      </Flex>
      <Box style={{ minWidth: 220, maxWidth: 280, flex: 1 }}>{children}</Box>
    </Flex>
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { themeMode, setThemeMode, systemDark } = useThemeMode();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    configService.load().then((c) => setConfig(c));
  }, []);

  const flashSaved = () => {
    setSavedFlash(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedFlash(false), 1200);
  };

  // 离散控件（Select/Switch/语言）：变更即提交。
  const commit = (partial: Partial<AppConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...partial } : prev));
    configService
      .save(partial)
      .catch((e) => console.error("Failed to save settings:", e));
    flashSaved();
  };

  const handleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    commit({ uiLanguage: lang });
  };

  // API Key 文本框：编辑时只更新本地状态，失焦时持久化（避免逐键写入）。
  const updateApiKeyLocal = (provider: ApiKeyProvider, value: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...(prev.apiKeys ?? {}) };
      if (value) next[provider] = value;
      else delete next[provider];
      return { ...prev, apiKeys: next };
    });
  };

  const persistApiKeys = () => {
    if (!config) return;
    configService
      .save({ apiKeys: config.apiKeys })
      .catch((e) => console.error("Failed to save API keys:", e));
    flashSaved();
  };

  if (!config) {
    return <Text color="gray">{t("common.loading")}</Text>;
  }

  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 760 }}>
      {/* 标题栏 */}
      <Flex align="center" justify="between">
        <Flex align="center" gap="2">
          <GearIcon width={22} height={22} />
          <Heading size="6">{t("settings.title")}</Heading>
        </Flex>
        {savedFlash && (
          <Badge color="green" variant="soft" radius="full">
            <CheckIcon width={12} height={12} /> {t("settings.saved")}
          </Badge>
        )}
      </Flex>
      <Text size="2" color="gray">
        {t("settings.autoSaved")}
      </Text>

      {/* 界面 */}
      <Section icon={GlobeIcon} title={t("settings.section.interface")}>
        <Row
          label={t("settings.field.language")}
          hint={t("settings.field.languageHint")}
        >
          <LanguageSwitcher
            value={config.uiLanguage}
            onChange={handleLanguage}
            variant="classic"
            fullWidth
          />
        </Row>
      </Section>

      {/* 外观 */}
      <Section icon={SunIcon} title={t("settings.section.appearance")}>
        <Row
          label={t("settings.field.themeMode")}
          hint={
            themeMode === "auto"
              ? t("settings.theme.autoHint", {
                  resolved: t(
                    systemDark ? "settings.theme.dark" : "settings.theme.light"
                  ),
                })
              : undefined
          }
        >
          <Select.Root
            value={themeMode}
            onValueChange={(v) => setThemeMode(v as ThemeMode)}
          >
            <Select.Trigger variant="classic" />
            <Select.Content>
              <Select.Item value="light">
                {t("settings.theme.light")}
              </Select.Item>
              <Select.Item value="dark">{t("settings.theme.dark")}</Select.Item>
              <Select.Item value="auto">{t("settings.theme.auto")}</Select.Item>
            </Select.Content>
          </Select.Root>
        </Row>
      </Section>

      {/* 翻译引擎 */}
      <Section
        icon={LetterCaseToggleIcon}
        title={t("settings.section.translation")}
      >
        <Row label={t("settings.field.translationEngine")}>
          <Select.Root
            value={config.translationEngine}
            onValueChange={(v) =>
              commit({ translationEngine: v as AppConfig["translationEngine"] })
            }
          >
            <Select.Trigger variant="classic" />
            <Select.Content>
              <Select.Item value="online">
                {t("settings.engine.online")}
              </Select.Item>
              <Select.Item value="local">
                {t("settings.engine.local")}
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </Row>
        {config.translationEngine === "online" && (
          <Row label={t("settings.field.translationProvider")}>
            <Select.Root
              value={config.translationProvider ?? "google"}
              onValueChange={(v) =>
                commit({
                  translationProvider:
                    v as AppConfig["translationProvider"],
                })
              }
            >
              <Select.Trigger variant="classic" />
              <Select.Content>
                <Select.Item value="google">
                  {t("settings.provider.google")}
                </Select.Item>
                <Select.Item value="deepl">
                  {t("settings.provider.deepl")}
                </Select.Item>
                <Select.Item value="baidu">
                  {t("settings.provider.baidu")}
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Row>
        )}
      </Section>

      {/* 翻译模型（下载与管理） */}
      <ModelDownloader
        currentModelPath={config.modelPath}
        onModelPathChange={(path) => commit({ modelPath: path })}
      />

      {/* 语音识别 */}
      <Section icon={SpeakerLoudIcon} title={t("settings.section.stt")}>
        <Row label={t("settings.field.sttEngine")}>
          <Select.Root
            value={config.sttEngine}
            onValueChange={(v) =>
              commit({ sttEngine: v as AppConfig["sttEngine"] })
            }
          >
            <Select.Trigger variant="classic" />
            <Select.Content>
              <Select.Item value="online">
                {t("settings.engine.online")}
              </Select.Item>
              <Select.Item value="local">
                {t("settings.engine.local")}
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </Row>
        {config.sttEngine === "online" && (
          <Row label={t("settings.field.sttProvider")}>
            <Select.Root
              value={config.sttProvider ?? "google"}
              onValueChange={(v) =>
                commit({ sttProvider: v as AppConfig["sttProvider"] })
              }
            >
              <Select.Trigger variant="classic" />
              <Select.Content>
                <Select.Item value="google">
                  {t("settings.provider.google")}
                </Select.Item>
                <Select.Item value="azure">
                  {t("settings.provider.azure")}
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Row>
        )}
      </Section>

      {/* OSC */}
      <Section icon={ChatBubbleIcon} title={t("settings.section.osc")}>
        <Row label={t("settings.field.oscEnabled")}>
          <Switch
            checked={config.oscEnabled}
            onCheckedChange={(v) => commit({ oscEnabled: v })}
          />
        </Row>
        <Row label={t("settings.field.oscPort")}>
          <Select.Root
            value={String(config.oscPort)}
            onValueChange={(v) => commit({ oscPort: parseInt(v) })}
          >
            <Select.Trigger variant="classic" />
            <Select.Content>
              <Select.Item value="9000">{t("wizard.step.osc.portDefault")}</Select.Item>
              <Select.Item value="9001">9001</Select.Item>
            </Select.Content>
          </Select.Root>
        </Row>
      </Section>

      {/* API 密钥 */}
      <Section icon={LockClosedIcon} title={t("settings.section.apiKeys")}>
        <Text size="1" color="gray">
          {t("settings.apiKey.hint")}
        </Text>
        <Row label={t("settings.field.showKeys")}>
          <Switch checked={showKeys} onCheckedChange={setShowKeys} />
        </Row>
        {KEY_FIELDS.map(({ provider, labelKey }) => (
          <Row key={provider} label={t(labelKey)} htmlFor={`apikey-${provider}`}>
            <TextField.Root
              id={`apikey-${provider}`}
              type={showKeys ? "text" : "password"}
              placeholder={t("settings.apiKey.placeholder")}
              value={config.apiKeys?.[provider] ?? ""}
              onChange={(e) =>
                updateApiKeyLocal(provider, e.currentTarget.value)
              }
              onBlur={persistApiKeys}
            />
          </Row>
        ))}
      </Section>

      {/* 系统信息 */}
      <SystemInfoSection />
    </Flex>
  );
}
