/**
 * 翻译目标语言选项（对齐 HY-MT1.5 支持的 36 语言 + 方言）。
 * value 是传给模型的英文名（HY-MT prompt 用自然语言名）；label 为该语言的母语自称。
 * 来源：https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF#prompts
 */
export const TARGET_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Chinese", label: "简体中文" },
  { value: "Traditional Chinese", label: "繁體中文" },
  { value: "Japanese", label: "日本語" },
  { value: "Korean", label: "한국어" },
  { value: "Cantonese", label: "粵語" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Spanish", label: "Español" },
  { value: "Portuguese", label: "Português" },
  { value: "Italian", label: "Italiano" },
  { value: "Dutch", label: "Nederlands" },
  { value: "Russian", label: "Русский" },
  { value: "Ukrainian", label: "Українська" },
  { value: "Polish", label: "Polski" },
  { value: "Czech", label: "Čeština" },
  { value: "Turkish", label: "Türkçe" },
  { value: "Arabic", label: "العربية" },
  { value: "Hebrew", label: "עברית" },
  { value: "Persian", label: "فارسی" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Bengali", label: "বাংলা" },
  { value: "Tamil", label: "தமிழ்" },
  { value: "Telugu", label: "తెలుగు" },
  { value: "Marathi", label: "मराठी" },
  { value: "Gujarati", label: "ગુજરાતી" },
  { value: "Urdu", label: "اردو" },
  { value: "Thai", label: "ไทย" },
  { value: "Vietnamese", label: "Tiếng Việt" },
  { value: "Indonesian", label: "Bahasa Indonesia" },
  { value: "Malay", label: "Bahasa Melayu" },
  { value: "Filipino", label: "Filipino" },
  { value: "Khmer", label: "ខ្មែរ" },
  { value: "Burmese", label: "မြန်မာ" },
  { value: "Tibetan", label: "བོད་སྐད" },
  { value: "Mongolian", label: "Монгол" },
  { value: "Kazakh", label: "Қазақ" },
  { value: "Uyghur", label: "ئۇيغۇرچە" },
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
