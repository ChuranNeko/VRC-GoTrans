import { useState, useEffect } from "react";
import { invoke, Channel } from "@tauri-apps/api/core";
import {
  Card,
  Flex,
  Text,
  Heading,
  Button,
  Box,
  Select,
  TextField,
} from "@radix-ui/themes";
import {
  LayersIcon,
  ReloadIcon,
  DownloadIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import {
  MODEL_REPO,
  MODEL_VARIANTS,
  buildModelUrl,
} from "../constants";

type SourceMode = "auto" | "mirror" | "source" | "custom";

interface DownloadProgress {
  downloaded: number;
  total: number;
}

interface SpeedProbe {
  url: string;
  bytesPerSec: number;
  ok: boolean;
}

interface RaceResult {
  mirror: SpeedProbe;
  source: SpeedProbe;
  recommended: string;
}

function formatBytes(n: number): string {
  if (!n) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatSpeed(bps: number): string {
  return `${formatBytes(bps)}/s`;
}

interface ModelDownloaderProps {
  currentModelPath?: string;
  onModelPathChange: (path: string) => void;
}

export function ModelDownloader({
  currentModelPath,
  onModelPathChange,
}: ModelDownloaderProps) {
  const { t } = useTranslation();
  const [variantFile, setVariantFile] = useState(
    MODEL_VARIANTS.find((v) => v.recommended)?.filename ?? MODEL_VARIANTS[0].filename
  );
  const [sourceMode, setSourceMode] = useState<SourceMode>("auto");
  const [customUrl, setCustomUrl] = useState("");
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [racing, setRacing] = useState(false);
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState("");

  const refreshLocal = () => {
    invoke<string[]>("list_local_models")
      .then(setLocalModels)
      .catch(() => setLocalModels([]));
  };

  useEffect(() => {
    refreshLocal();
  }, []);

  const handleRace = async () => {
    setError("");
    setRacing(true);
    setRaceResult(null);
    try {
      const result = await invoke<RaceResult>("race_model_sources", {
        repo: MODEL_REPO,
        filename: variantFile,
      });
      setRaceResult(result);
    } catch (e) {
      setError(`${e}`);
    } finally {
      setRacing(false);
    }
  };

  const resolveDownloadUrl = (): string => {
    if (sourceMode === "custom") return customUrl.trim();
    if (sourceMode === "mirror") return buildModelUrl("mirror", variantFile);
    if (sourceMode === "source") return buildModelUrl("source", variantFile);
    // auto: 用测速推荐；未测过则默认镜像（国内更快）
    return raceResult?.recommended ?? buildModelUrl("mirror", variantFile);
  };

  const handleDownload = async () => {
    const url = resolveDownloadUrl();
    if (!url) {
      setError(t("model.errNoUrl"));
      return;
    }
    setError("");
    setDownloading(true);
    setProgress({ downloaded: 0, total: 0 });

    const channel = new Channel<DownloadProgress>();
    channel.onmessage = (p) => setProgress(p);

    try {
      const savedPath = await invoke<string>("download_model", {
        url,
        filename: variantFile,
        onProgress: channel,
      });
      onModelPathChange(savedPath);
      refreshLocal();
    } catch (e) {
      setError(`${e}`);
    } finally {
      setDownloading(false);
    }
  };

  const canDownload =
    !downloading && (sourceMode !== "custom" || customUrl.trim().length > 0);

  const pct =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.downloaded / progress.total) * 100))
      : 0;

  const currentDisplay = currentModelPath
    ? currentModelPath.split(/[\\/]/).pop()
    : localModels[0] ?? t("model.notInstalled");

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <LayersIcon width={18} height={18} />
          <Heading size="4">{t("model.section")}</Heading>
        </Flex>

        {/* 当前状态 */}
        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {t("model.current")}
          </Text>
          <Text size="2" style={{ fontFamily: "var(--code-font)" }}>
            {currentDisplay}
          </Text>
        </Flex>

        {/* 变体 + 源 */}
        <Flex gap="4" wrap="wrap">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              {t("model.variant")}
            </Text>
            <Select.Root value={variantFile} onValueChange={setVariantFile}>
              <Select.Trigger variant="soft" />
              <Select.Content>
                {MODEL_VARIANTS.map((v) => (
                  <Select.Item key={v.id} value={v.filename}>
                    {v.id} ({v.sizeLabel})
                    {v.recommended ? ` ★` : ""}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              {t("model.source")}
            </Text>
            <Select.Root
              value={sourceMode}
              onValueChange={(v) => setSourceMode(v as SourceMode)}
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Item value="auto">{t("model.sourceAuto")}</Select.Item>
                <Select.Item value="mirror">
                  {t("model.sourceMirror")}
                </Select.Item>
                <Select.Item value="source">
                  {t("model.sourceOfficial")}
                </Select.Item>
                <Select.Item value="custom">
                  {t("model.sourceCustom")}
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>

        {/* 自定义 URL */}
        {sourceMode === "custom" && (
          <TextField.Root
            placeholder="https://example.com/model.gguf"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.currentTarget.value)}
          />
        )}

        {/* 测速结果 */}
        {raceResult && (
          <Card variant="surface">
            <Flex direction="column" gap="1">
              <Text size="1" weight="bold">
                {t("model.raceResult")}
              </Text>
              <Text size="1">
                {t("model.sourceMirror")}:{" "}
                {raceResult.mirror.ok
                  ? formatSpeed(raceResult.mirror.bytesPerSec)
                  : t("model.probeFailed")}
              </Text>
              <Text size="1">
                {t("model.sourceOfficial")}:{" "}
                {raceResult.source.ok
                  ? formatSpeed(raceResult.source.bytesPerSec)
                  : t("model.probeFailed")}
              </Text>
            </Flex>
          </Card>
        )}

        {/* 进度条 */}
        {downloading && progress && (
          <Flex direction="column" gap="1">
            <Box
              style={{
                width: "100%",
                height: 8,
                backgroundColor: "var(--gray-4)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: "var(--accent-9)",
                  transition: "width 0.2s ease",
                }}
              />
            </Box>
            <Text size="1" color="gray">
              {formatBytes(progress.downloaded)}
              {progress.total > 0
                ? ` / ${formatBytes(progress.total)} (${pct}%)`
                : ""}
            </Text>
          </Flex>
        )}

        {/* 操作按钮 */}
        <Flex gap="2">
          <Button
            variant="soft"
            onClick={handleRace}
            disabled={racing || downloading}
          >
            <ReloadIcon />
            {racing ? t("model.racing") : t("model.race")}
          </Button>
          <Button onClick={handleDownload} disabled={!canDownload}>
            <DownloadIcon />
            {downloading ? t("model.downloading") : t("model.download")}
          </Button>
          {currentModelPath && !downloading && (
            <Flex align="center" gap="1" ml="auto">
              <CheckIcon color="green" width={14} height={14} />
              <Text size="1" color="green">
                {t("model.installed")}
              </Text>
            </Flex>
          )}
        </Flex>

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}
      </Flex>
    </Card>
  );
}
