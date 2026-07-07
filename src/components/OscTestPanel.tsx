import { useState } from "react";
import { Button, Card, Flex, Text, TextArea, Switch, Box } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { oscService } from "../services/osc";

export function OscTestPanel() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [sendImmediately, setSendImmediately] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleInit = async () => {
    try {
      setError("");
      await oscService.init();
      setStatus(t("panel.osc.statusClientInit"));
    } catch (err) {
      setError(`${t("panel.osc.errInitFailed")}: ${err}`);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError(t("panel.osc.errEmpty"));
      return;
    }

    try {
      setError("");
      await oscService.sendChatbox(message, sendImmediately);
      const truncated =
        message.length > 50 ? message.slice(0, 50) + "..." : message;
      setStatus(
        sendImmediately
          ? t("panel.osc.statusSent", { msg: truncated })
          : t("panel.osc.statusPreviewed", { msg: truncated })
      );
    } catch (err) {
      setError(`${t("panel.osc.errSendFailed")}: ${err}`);
    }
  };

  const handleToggleTyping = async () => {
    const newTyping = !isTyping;
    try {
      setError("");
      await oscService.setTypingIndicator(newTyping);
      setIsTyping(newTyping);
      setStatus(
        newTyping
          ? t("panel.osc.statusTypingShow")
          : t("panel.osc.statusTypingHide")
      );
    } catch (err) {
      setError(`${t("panel.osc.errSetFailed")}: ${err}`);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: "0 auto" }}>
      <Flex direction="column" gap="4">
        <Text size="5" weight="bold">
          {t("panel.osc.title")}
        </Text>

        {/* 初始化按钮 */}
        <Box>
          <Button onClick={handleInit} disabled={oscService.isInitialized()}>
            {oscService.isInitialized()
              ? t("panel.osc.initialized")
              : t("panel.osc.initButton")}
          </Button>
        </Box>

        {/* 消息输入 */}
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("panel.osc.messageLabel")}
          </Text>
          <TextArea
            placeholder={t("panel.osc.messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={144}
            rows={3}
          />
          <Text size="1" color="gray">
            {t("panel.osc.charCount", { count: message.length })}
          </Text>
        </Flex>

        {/* 发送选项 */}
        <Flex align="center" gap="2">
          <Switch
            checked={sendImmediately}
            onCheckedChange={setSendImmediately}
          />
          <Text size="2">{t("panel.osc.sendImmediately")}</Text>
        </Flex>

        {/* 发送按钮 */}
        <Button onClick={handleSendMessage} disabled={!message.trim()}>
          {t("panel.osc.sendButton")}
        </Button>

        {/* 打字指示器 */}
        <Flex align="center" gap="2">
          <Switch
            checked={isTyping}
            onCheckedChange={handleToggleTyping}
          />
          <Text size="2">{t("panel.osc.typingIndicator")}</Text>
        </Flex>

        {/* 状态显示 */}
        {status && (
          <Card variant="surface">
            <Text size="2" color="green">
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
              {t("panel.osc.helpTitle")}
            </Text>
            <Text size="1">{t("panel.osc.help1")}</Text>
            <Text size="1">{t("panel.osc.help2")}</Text>
            <Text size="1">{t("panel.osc.help3")}</Text>
            <Text size="1">{t("panel.osc.help4")}</Text>
          </Flex>
        </Card>
      </Flex>
    </Card>
  );
}
