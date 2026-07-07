import { useState, useEffect, useCallback } from "react";
import { Card, Flex, Text, Heading, IconButton, Tooltip } from "@radix-ui/themes";
import {
  InfoCircledIcon,
  CopyIcon,
  ReloadIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { getName, getVersion, getTauriVersion } from "@tauri-apps/api/app";
import * as os from "@tauri-apps/plugin-os";

interface InfoEntry {
  labelKey: string;
  value: string | null;
}

function valueOf(r: PromiseSettledResult<string | null>): string | null {
  return r.status === "fulfilled" ? r.value : null;
}

async function fetchSystemInfo(): Promise<InfoEntry[]> {
  const results = await Promise.allSettled([
    getName(),
    getVersion(),
    getTauriVersion(),
    os.platform(),
    os.version(),
    os.arch(),
    os.hostname(),
    os.locale(),
  ]);
  return [
    { labelKey: "settings.system.appName", value: valueOf(results[0]) },
    { labelKey: "settings.system.appVersion", value: valueOf(results[1]) },
    { labelKey: "settings.system.tauriVersion", value: valueOf(results[2]) },
    { labelKey: "settings.system.platform", value: valueOf(results[3]) },
    { labelKey: "settings.system.osVersion", value: valueOf(results[4]) },
    { labelKey: "settings.system.arch", value: valueOf(results[5]) },
    { labelKey: "settings.system.hostname", value: valueOf(results[6]) },
    { labelKey: "settings.system.locale", value: valueOf(results[7]) },
  ];
}

export function SystemInfoSection() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<InfoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await fetchSystemInfo());
    } catch (e) {
      console.error("Failed to load system info:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCopy = async () => {
    const text = entries
      .map((e) => `${t(e.labelKey)}: ${e.value ?? t("settings.system.unavailable")}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Clipboard write failed:", e);
    }
  };

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <InfoCircledIcon width={18} height={18} />
            <Heading size="4">{t("settings.section.system")}</Heading>
          </Flex>
          <Flex gap="2">
            <Tooltip content={t("settings.system.copy")}>
              <IconButton
                size="1"
                variant="soft"
                color={copied ? "green" : "gray"}
                onClick={handleCopy}
                disabled={loading}
                aria-label={t("settings.system.copy")}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip content={t("settings.system.refresh")}>
              <IconButton
                size="1"
                variant="soft"
                color="gray"
                onClick={load}
                disabled={loading}
                aria-label={t("settings.system.refresh")}
              >
                <ReloadIcon />
              </IconButton>
            </Tooltip>
          </Flex>
        </Flex>

        {loading ? (
          <Text color="gray">{t("common.loading")}</Text>
        ) : (
          <Flex direction="column" gap="2">
            {entries.map((entry) => (
              <Flex key={entry.labelKey} justify="between" gap="4" align="center">
                <Text size="2" color="gray">
                  {t(entry.labelKey)}
                </Text>
                <Text size="2" weight="medium" style={{ fontFamily: "var(--code-font)" }}>
                  {entry.value ?? t("settings.system.unavailable")}
                </Text>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
