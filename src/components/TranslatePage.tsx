import { useState, useRef, useEffect } from "react";
import {
  Card,
  Flex,
  Text,
  Heading,
  Button,
  Box,
  Select,
  TextArea,
  Switch,
  Badge,
  IconButton,
  Tooltip,
  ScrollArea,
} from "@radix-ui/themes";
import { PlayIcon, StopIcon, PaperPlaneIcon, TrashIcon } from "@radix-ui/react-icons";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { oscService } from "../services/osc";
import { configService } from "../services/config";
import { TARGET_LANGUAGES, DEFAULT_TARGET_LANG } from "../constants";

interface LogEntry {
  id: number;
  original: string;
  translation: string;
  pending: boolean;
  failed: boolean;
}

export function TranslatePage() {
  const { t } = useTranslation();
  const [sessionActive, setSessionActive] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState(DEFAULT_TARGET_LANG);
  const [sendToVrc, setSendToVrc] = useState(true);
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 初始加载：根据配置决定是否默认发送到 VRChat。
  useEffect(() => {
    configService
      .load()
      .then((c) => setSendToVrc(c.oscEnabled))
      .catch(() => {});
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const handleToggleSession = async () => {
    if (sessionActive) {
      setSessionActive(false);
      return;
    }
    setError("");
    setInitializing(true);
    try {
      await invoke("init_translator");
      if (sendToVrc) {
        try {
          await oscService.init();
        } catch (e) {
          // OSC 初始化失败不阻塞翻译会话，仅提示。
          console.warn("OSC init failed:", e);
        }
      }
      setSessionActive(true);
    } catch (e) {
      setError(`${t("home.errInit")}: ${e}`);
    } finally {
      setInitializing(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionActive) return;
    setInput("");
    setError("");

    const id = nextId.current++;
    setEntries((prev) => [
      ...prev,
      { id, original: text, translation: "", pending: true, failed: false },
    ]);

    try {
      const translation = await invoke<string>("translate_text", {
        text,
        targetLang,
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, translation, pending: false } : e
        )
      );
      if (sendToVrc && translation) {
        try {
          await oscService.sendChatbox(translation, true);
        } catch (e) {
          console.warn("OSC send failed:", e);
        }
      }
    } catch (e) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, pending: false, failed: true } : e
        )
      );
      setError(`${t("home.errTranslate")}: ${e}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Flex direction="column" gap="4" style={{ flex: 1, minHeight: 0 }}>
      {/* 顶栏：标题 + 状态 + 开始/停止 */}
      <Card>
        <Flex justify="between" align="center" gap="3" wrap="wrap">
          <Flex align="center" gap="3">
            <Heading size="6">{t("home.title")}</Heading>
            <Badge color={sessionActive ? "green" : "gray"} variant="soft">
              {sessionActive ? t("home.statusRunning") : t("home.statusIdle")}
            </Badge>
          </Flex>
          <Button
            color={sessionActive ? "red" : undefined}
            onClick={handleToggleSession}
            disabled={initializing}
          >
            {sessionActive ? (
              <>
                <StopIcon /> {t("home.stop")}
              </>
            ) : (
              <>
                <PlayIcon />{" "}
                {initializing ? t("home.initializing") : t("home.start")}
              </>
            )}
          </Button>
        </Flex>
      </Card>

      {/* 控制条：目标语言 + 发送到 VRChat */}
      <Card variant="surface">
        <Flex align="center" gap="5" wrap="wrap">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              {t("home.targetLang")}
            </Text>
            <Select.Root
              value={targetLang}
              onValueChange={setTargetLang}
              disabled={sessionActive}
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                {TARGET_LANGUAGES.map((lang) => (
                  <Select.Item key={lang.value} value={lang.value}>
                    {lang.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex align="center" gap="2">
            <Switch
              checked={sendToVrc}
              onCheckedChange={setSendToVrc}
              disabled={sessionActive}
            />
            <Text size="2">{t("home.sendToVrc")}</Text>
          </Flex>
        </Flex>
      </Card>

      {/* 翻译日志 */}
      <Card
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Flex justify="between" align="center" mb="2">
          <Text size="2" weight="medium">
            {t("home.title")}
          </Text>
          <Tooltip content={t("home.clear")}>
            <IconButton
              size="1"
              variant="soft"
              color="gray"
              onClick={() => setEntries([])}
              disabled={entries.length === 0}
              aria-label={t("home.clear")}
            >
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </Flex>
        <ScrollArea type="auto" style={{ flex: 1 }} scrollbars="vertical">
          {entries.length === 0 ? (
            <Flex align="center" justify="center" style={{ minHeight: 160 }}>
              <Text size="2" color="gray">
                {t("home.logEmpty")}
              </Text>
            </Flex>
          ) : (
            <Flex direction="column" gap="3" pr="2">
              {entries.map((entry) => (
                <Flex
                  key={entry.id}
                  direction="column"
                  align="end"
                  gap="1"
                >
                  <Box style={{ maxWidth: "80%" }}>
                    <Card variant="classic" size="1">
                      <Text size="2" as="div">
                        {entry.original}
                      </Text>
                    </Card>
                  </Box>
                  <Box style={{ maxWidth: "80%" }}>
                    <Card variant="surface" size="1">
                      {entry.pending ? (
                        <Text size="2" color="gray">
                          ...
                        </Text>
                      ) : entry.failed ? (
                        <Text size="2" color="red">
                          {t("home.errTranslate")}
                        </Text>
                      ) : (
                        <Text size="2" weight="medium" as="div">
                          {entry.translation}
                        </Text>
                      )}
                    </Card>
                  </Box>
                </Flex>
              ))}
              <div ref={logEndRef} />
            </Flex>
          )}
        </ScrollArea>
      </Card>

      {/* 输入栏 */}
      <Card>
        <Flex direction="column" gap="2">
          <TextArea
            placeholder={
              sessionActive ? t("home.inputPlaceholder") : t("home.start")
            }
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={!sessionActive}
          />
          <Flex justify="between" align="center">
            <Text size="1" color="gray">
              {t("home.inputHint")}
            </Text>
            <Button onClick={handleSend} disabled={!input.trim() || !sessionActive}>
              <PaperPlaneIcon /> {t("home.inputSend")}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {error && (
        <Card variant="surface">
          <Text size="2" color="red">
            {error}
          </Text>
        </Card>
      )}
    </Flex>
  );
}
