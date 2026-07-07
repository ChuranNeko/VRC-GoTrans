import { useState } from "react";
import { Button, Card, Flex, Text, TextArea, Select, Box } from "@radix-ui/themes";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { TARGET_LANGUAGES } from "../constants";

const QUICK_TESTS = [
  { key: "panel.translator.quickTestJa2en", value: "こんにちは、世界！" },
  { key: "panel.translator.quickTestEn2zh", value: "Hello, world!" },
  { key: "panel.translator.quickTestZh2en", value: "你好，世界！" },
] as const;

export function TranslatorTestPanel() {
  const { t } = useTranslation();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleInit = async () => {
    try {
      setError("");
      setStatus(t("panel.translator.statusInitializing"));
      await invoke("init_translator");
      setIsInitialized(true);
      setStatus(t("panel.translator.statusInitSuccess"));
    } catch (err) {
      setError(`${t("panel.translator.errInitFailed")}: ${err}`);
      setStatus("");
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError(t("panel.translator.errEmpty"));
      return;
    }

    try {
      setError("");
      setIsTranslating(true);
      setStatus(t("panel.translator.translating"));

      const result = await invoke<string>("translate_text", {
        text: sourceText,
        targetLang: targetLang,
      });

      setTranslatedText(result);
      setStatus(t("panel.translator.statusDone"));
    } catch (err) {
      setError(`${t("panel.translator.errTranslateFailed")}: ${err}`);
      setStatus("");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      <Flex direction="column" gap="4">
        <Text size="5" weight="bold">
          {t("panel.translator.title")}
        </Text>

        {/* 初始化按钮 */}
        {!isInitialized && (
          <Box>
            <Button onClick={handleInit} size="3">
              {t("panel.translator.initButton")}
            </Button>
            <Text size="1" color="gray" as="div" mt="2">
              {t("panel.translator.initHint")}
            </Text>
          </Box>
        )}

        {isInitialized && (
          <>
            {/* 目标语言选择 */}
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                {t("panel.translator.targetLang")}
              </Text>
              <Select.Root value={targetLang} onValueChange={setTargetLang}>
                <Select.Trigger />
                <Select.Content>
                  {TARGET_LANGUAGES.map((lang) => (
                    <Select.Item key={lang.value} value={lang.value}>
                      {lang.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* 源文本输入 */}
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                {t("panel.translator.source")}
              </Text>
              <TextArea
                placeholder={t("panel.translator.sourcePlaceholder")}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={5}
              />
            </Flex>

            {/* 翻译按钮 */}
            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              size="3"
            >
              {isTranslating
                ? t("panel.translator.translating")
                : t("panel.translator.translateButton")}
            </Button>

            {/* 翻译结果 */}
            {translatedText && (
              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">
                  {t("panel.translator.result")}
                </Text>
                <Card variant="surface">
                  <Text>{translatedText}</Text>
                </Card>
              </Flex>
            )}

            {/* 快速测试示例 */}
            <Card variant="surface">
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  {t("panel.translator.quickTest")}
                </Text>
                <Flex gap="2" wrap="wrap">
                  {QUICK_TESTS.map((item) => (
                    <Button
                      key={item.key}
                      size="1"
                      variant="soft"
                      onClick={() => setSourceText(item.value)}
                    >
                      {t(item.key)}
                    </Button>
                  ))}
                </Flex>
              </Flex>
            </Card>
          </>
        )}

        {/* 状态显示 */}
        {status && (
          <Card variant="surface">
            <Text size="2" color="blue">
              {status}
            </Text>
          </Card>
        )}

        {/* 错误显示 */}
        {error && (
          <Card variant="surface">
            <Text size="2" color="red">
              {error}
            </Text>
          </Card>
        )}

        {/* 使用说明 */}
        <Card variant="surface">
          <Flex direction="column" gap="1">
            <Text size="1" weight="bold">
              {t("panel.translator.helpTitle")}
            </Text>
            <Text size="1">{t("panel.translator.help1")}</Text>
            <Text size="1">{t("panel.translator.help2")}</Text>
            <Text size="1">{t("panel.translator.help3")}</Text>
            <Text size="1">{t("panel.translator.help4")}</Text>
          </Flex>
        </Card>
      </Flex>
    </Card>
  );
}
