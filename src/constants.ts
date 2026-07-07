/**
 * 翻译目标语言选项。
 * value 是后端 translate_text 命令期望的英文字符串；label 为该语言的母语自称。
 */
export const TARGET_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Chinese", label: "中文" },
  { value: "Japanese", label: "日本語" },
  { value: "Korean", label: "한국어" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Spanish", label: "Español" },
  { value: "Russian", label: "Русский" },
] as const;

export const DEFAULT_TARGET_LANG = "English";

/**
 * 翻译模型仓库（HuggingFace）。
 * 同一仓库的镜像与源站：
 *   mirror: https://hf-mirror.com/{repo}/resolve/main/{filename}
 *   source: https://huggingface.co/{repo}/resolve/main/{filename}
 */
export const MODEL_REPO = "tencent/HY-MT1.5-1.8B-GGUF";

export interface ModelVariant {
  id: string;
  filename: string;
  sizeLabel: string;
  recommended: boolean;
}

export const MODEL_VARIANTS: ModelVariant[] = [
  {
    id: "Q4_K_M",
    filename: "HY-MT1.5-1.8B-Q4_K_M.gguf",
    sizeLabel: "~1.13 GB",
    recommended: true,
  },
  {
    id: "Q6_K",
    filename: "HY-MT1.5-1.8B-Q6_K.gguf",
    sizeLabel: "~1.47 GB",
    recommended: false,
  },
];

const MIRROR_BASE = "https://hf-mirror.com";
const SOURCE_BASE = "https://huggingface.co";

export function buildModelUrl(
  source: "mirror" | "source",
  filename: string
): string {
  const base = source === "mirror" ? MIRROR_BASE : SOURCE_BASE;
  return `${base}/${MODEL_REPO}/resolve/main/${filename}`;
}
