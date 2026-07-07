import { useState, type ComponentType, type ReactNode } from "react";
import {
  Button,
  Card,
  Flex,
  Text,
  Heading,
  Box,
  RadioGroup,
  Select,
} from "@radix-ui/themes";
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  GlobeIcon,
  HandIcon,
  LetterCaseToggleIcon,
  SpeakerLoudIcon,
  ChatBubbleIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getLanguageLabel } from "../locales";

interface StepMeta {
  titleKey: string;
  descKey: string;
  icon: ComponentType<{ width?: number; height?: number }>;
}

const STEP_META: StepMeta[] = [
  {
    titleKey: "wizard.step.language.title",
    descKey: "wizard.step.language.description",
    icon: GlobeIcon,
  },
  {
    titleKey: "wizard.step.welcome.title",
    descKey: "wizard.step.welcome.description",
    icon: HandIcon,
  },
  {
    titleKey: "wizard.step.translation.title",
    descKey: "wizard.step.translation.description",
    icon: LetterCaseToggleIcon,
  },
  {
    titleKey: "wizard.step.stt.title",
    descKey: "wizard.step.stt.description",
    icon: SpeakerLoudIcon,
  },
  {
    titleKey: "wizard.step.osc.title",
    descKey: "wizard.step.osc.description",
    icon: ChatBubbleIcon,
  },
  {
    titleKey: "wizard.step.complete.title",
    descKey: "wizard.step.complete.description",
    icon: StarIcon,
  },
];

export interface FirstRunConfig {
  uiLanguage: string;
  translationEngine: "online" | "local";
  translationProvider?: "google" | "deepl" | "baidu";
  sttEngine: "online" | "local";
  sttProvider?: "google" | "azure";
  oscEnabled: boolean;
  oscPort: number;
}

interface FirstRunWizardProps {
  onComplete: (config: FirstRunConfig) => void;
}

function StepIcon({
  icon: Icon,
  size,
}: {
  icon: ComponentType<{ width?: number; height?: number }>;
  size?: number;
}) {
  return <Icon width={size ?? 48} height={size ?? 48} />;
}

function Feature({ children }: { children: ReactNode }) {
  return (
    <Flex align="center" gap="1">
      <CheckIcon color="green" width={12} height={12} />
      <Text size="1">{children}</Text>
    </Flex>
  );
}

export function FirstRunWizard({ onComplete }: FirstRunWizardProps) {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<FirstRunConfig>({
    uiLanguage: "zh-Hans",
    translationEngine: "online",
    translationProvider: "google",
    sttEngine: "online",
    sttProvider: "google",
    oscEnabled: true,
    oscPort: 9000,
  });

  const handleNext = () => {
    if (currentStep === 0) {
      i18n.changeLanguage(config.uiLanguage);
    }

    if (currentStep < STEP_META.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(config);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 步骤 0 实时预览语言切换
  const handleLanguageChange = (lang: string) => {
    setConfig((c) => ({ ...c, uiLanguage: lang }));
    i18n.changeLanguage(lang);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Flex direction="column" gap="5" align="center">
            <LanguageSwitcher
              value={config.uiLanguage}
              onChange={handleLanguageChange}
              size="3"
              variant="classic"
            />
            <Text size="1" color="gray">
              {getLanguageLabel(config.uiLanguage)}
            </Text>
          </Flex>
        );

      case 1:
        return (
          <Flex direction="column" gap="4" align="center">
            <Text align="center">{t("wizard.step.welcome.intro")}</Text>
            <Text align="center" color="gray" size="2">
              {t("wizard.step.welcome.note")}
            </Text>
          </Flex>
        );

      case 2:
        return (
          <Flex direction="column" gap="4">
            <RadioGroup.Root
              value={config.translationEngine}
              onValueChange={(value) =>
                setConfig({ ...config, translationEngine: value as "online" | "local" })
              }
            >
              <Flex direction="column" gap="3">
                <Card variant="surface" style={{ cursor: "pointer" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <RadioGroup.Item value="online" />
                    <Flex direction="column" gap="1">
                      <Text weight="bold">{t("wizard.step.translation.onlineLabel")}</Text>
                      <Text size="2" color="gray">
                        {t("wizard.step.translation.onlineDesc")}
                      </Text>
                      <Feature>{t("wizard.step.translation.onlinePros")}</Feature>
                    </Flex>
                  </label>
                </Card>

                <Card variant="surface" style={{ cursor: "pointer" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <RadioGroup.Item value="local" />
                    <Flex direction="column" gap="1">
                      <Text weight="bold">{t("wizard.step.translation.localLabel")}</Text>
                      <Text size="2" color="gray">
                        {t("wizard.step.translation.localDesc")}
                      </Text>
                      <Text size="1" color="gray">
                        {t("wizard.step.translation.localNote")}
                      </Text>
                    </Flex>
                  </label>
                </Card>
              </Flex>
            </RadioGroup.Root>

            {config.translationEngine === "online" && (
              <Box mt="3">
                <Text size="2" mb="2" as="div">
                  {t("wizard.step.translation.providerLabel")}
                </Text>
                <Select.Root
                  value={config.translationProvider}
                  onValueChange={(value) =>
                    setConfig({ ...config, translationProvider: value as FirstRunConfig["translationProvider"] })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="google">
                      {t("wizard.step.translation.providerGoogle")}
                    </Select.Item>
                    <Select.Item value="deepl">
                      {t("wizard.step.translation.providerDeepL")}
                    </Select.Item>
                    <Select.Item value="baidu">
                      {t("wizard.step.translation.providerBaidu")}
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            )}
          </Flex>
        );

      case 3:
        return (
          <Flex direction="column" gap="4">
            <RadioGroup.Root
              value={config.sttEngine}
              onValueChange={(value) =>
                setConfig({ ...config, sttEngine: value as "online" | "local" })
              }
            >
              <Flex direction="column" gap="3">
                <Card variant="surface" style={{ cursor: "pointer" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <RadioGroup.Item value="online" />
                    <Flex direction="column" gap="1">
                      <Text weight="bold">{t("wizard.step.stt.onlineLabel")}</Text>
                      <Text size="2" color="gray">
                        {t("wizard.step.stt.onlineDesc")}
                      </Text>
                      <Feature>{t("wizard.step.stt.onlinePros")}</Feature>
                    </Flex>
                  </label>
                </Card>

                <Card variant="surface" style={{ cursor: "pointer" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <RadioGroup.Item value="local" />
                    <Flex direction="column" gap="1">
                      <Text weight="bold">{t("wizard.step.stt.localLabel")}</Text>
                      <Text size="2" color="gray">
                        {t("wizard.step.stt.localDesc")}
                      </Text>
                      <Feature>{t("wizard.step.stt.localPros")}</Feature>
                      <Text size="1" color="gray">
                        {t("wizard.step.stt.localNote")}
                      </Text>
                    </Flex>
                  </label>
                </Card>
              </Flex>
            </RadioGroup.Root>

            {config.sttEngine === "online" && (
              <Box mt="3">
                <Text size="2" mb="2" as="div">
                  {t("wizard.step.stt.providerLabel")}
                </Text>
                <Select.Root
                  value={config.sttProvider}
                  onValueChange={(value) =>
                    setConfig({ ...config, sttProvider: value as FirstRunConfig["sttProvider"] })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="google">
                      {t("wizard.step.stt.providerGoogle")}
                    </Select.Item>
                    <Select.Item value="azure">
                      {t("wizard.step.stt.providerAzure")}
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            )}
          </Flex>
        );

      case 4:
        return (
          <Flex direction="column" gap="4">
            <Card>
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <Text weight="bold">{t("wizard.step.osc.enableLabel")}</Text>
                  <Text size="2" color="gray">
                    {t("wizard.step.osc.enableNote")}
                  </Text>
                </Flex>

                <Text size="2">{t("wizard.step.osc.desc")}</Text>

                <Box>
                  <Text size="2" mb="2" as="div">
                    {t("wizard.step.osc.portLabel")}
                  </Text>
                  <Select.Root
                    value={String(config.oscPort)}
                    onValueChange={(value) =>
                      setConfig({ ...config, oscPort: parseInt(value) })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="9000">
                        {t("wizard.step.osc.portDefault")}
                      </Select.Item>
                      <Select.Item value="9001">9001</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Card variant="surface">
                  <Flex direction="column" gap="1">
                    <Text size="1" weight="bold">
                      {t("wizard.step.osc.noteTitle")}
                    </Text>
                    <Text size="1">{t("wizard.step.osc.note1")}</Text>
                    <Text size="1">{t("wizard.step.osc.note2")}</Text>
                    <Text size="1">{t("wizard.step.osc.note3")}</Text>
                  </Flex>
                </Card>
              </Flex>
            </Card>
          </Flex>
        );

      case 5:
        return (
          <Flex direction="column" gap="4" align="center">
            <Card variant="surface" style={{ width: "100%" }}>
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  {t("wizard.step.complete.summaryTitle")}
                </Text>
                <Text size="2">
                  {t("wizard.step.complete.uiLanguageLabel")}
                  {getLanguageLabel(config.uiLanguage)}
                </Text>
                <Text size="2">
                  {t("wizard.step.complete.translationEngineLabel")}
                  {config.translationEngine === "online"
                    ? t("wizard.step.complete.onlineShort")
                    : t("wizard.step.complete.localShort")}
                  {config.translationEngine === "online" &&
                    config.translationProvider &&
                    ` (${config.translationProvider})`}
                </Text>
                <Text size="2">
                  {t("wizard.step.complete.sttLabel")}
                  {config.sttEngine === "online"
                    ? t("wizard.step.complete.onlineShort")
                    : t("wizard.step.complete.localWhisperShort")}
                  {config.sttEngine === "online" &&
                    config.sttProvider &&
                    ` (${config.sttProvider})`}
                </Text>
                <Text size="2">
                  {t("wizard.step.complete.oscPortLabel")}
                  {config.oscPort}
                </Text>
              </Flex>
            </Card>
            <Text size="2" color="gray" align="center">
              {t("wizard.step.complete.finishNote")}
            </Text>
          </Flex>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
        <Card size="4" style={{ maxWidth: 600, width: "100%" }}>
          <Flex direction="column" gap="5">
            {/* 进度指示器 */}
            <Flex gap="2" justify="center">
              {STEP_META.map((_, index) => (
                <Box
                  key={index}
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor:
                      index <= currentStep ? "var(--accent-9)" : "var(--gray-5)",
                    borderRadius: 2,
                    transition: "background-color 0.3s",
                  }}
                />
              ))}
            </Flex>

            {/* 步骤图标 + 标题 */}
            <Flex direction="column" gap="2" align="center">
              <Box style={{ color: "var(--indigo-10)" }}>
                <StepIcon icon={STEP_META[currentStep].icon} size={48} />
              </Box>
              <Heading size="6">{t(STEP_META[currentStep].titleKey)}</Heading>
              <Text color="gray" size="2">
                {t(STEP_META[currentStep].descKey)}
              </Text>
            </Flex>

            {/* 步骤内容 */}
            <Box style={{ minHeight: 300 }}>{renderStepContent()}</Box>

            {/* 导航按钮 */}
            <Flex gap="3" justify="between">
              <Button
                variant="soft"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeftIcon />
                {t("common.back")}
              </Button>

              <Button onClick={handleNext}>
                {currentStep === STEP_META.length - 1 ? (
                  <>
                    <CheckIcon />
                    {t("common.complete")}
                  </>
                ) : (
                  <>
                    {t("common.next")}
                    <ChevronRightIcon />
                  </>
                )}
              </Button>
            </Flex>
          </Flex>
        </Card>
    </Box>
  );
}
