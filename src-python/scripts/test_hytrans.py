"""HY-MT1.5 翻译模型验证脚本（开发阶段）。

prompt 格式来自官方模型卡：
https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF#prompts
两种模板按是否含中文切换，不暗猜。
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

from llama_cpp import Llama

MODEL = str(Path.home() / ".vrc-gotrans" / "models" / "HY-MT1.5-1.8B-Q4_K_M.gguf")


def has_cjk(s: str) -> bool:
    return any("\u4e00" <= c <= "\u9fff" for c in s)


def build_prompt(text: str, target_lang: str) -> str:
    if has_cjk(text) or has_cjk(target_lang) or target_lang in ("Chinese", "中文"):
        return (
            f"将以下文本翻译为{target_lang}，"
            "注意只需要输出翻译后的结果，不要额外解释：\n\n"
            f"{text}"
        )
    return (
        f"Translate the following segment into {target_lang}, "
        "without additional explanation.\n\n"
        f"{text}"
    )


def main() -> int:
    print("loading model...", file=sys.stderr)
    t0 = time.time()
    llm = Llama(model_path=MODEL, n_ctx=512, n_gpu_layers=0, verbose=False)
    print(f"loaded in {time.time() - t0:.1f}s", file=sys.stderr)

    gen_kw = dict(
        max_tokens=128,
        temperature=0.7,
        top_k=20,
        top_p=0.6,
        repeat_penalty=1.05,
    )

    cases = [
        ("你好，很高兴认识你", "Korean"),
        ("Hello, nice to meet you", "Korean"),
        ("안녕하세요, 만나서 반갑습니다", "Chinese"),
        ("안녕하세요, 만나서 반갑습니다", "English"),
        ("감사합니다, 정말 도와주셔서 고마워요", "Chinese"),
        ("VRChat에서 같이 놀아요", "English"),
        ("Where is the bathroom?", "Korean"),
        ("오늘 날씨가 정말 좋네요", "English"),
    ]

    for text, target in cases:
        prompt = build_prompt(text, target)
        t0 = time.time()
        r = llm(prompt, **gen_kw)
        dt = time.time() - t0
        out = r["choices"][0]["text"].strip()
        print(f"[{dt:4.1f}s] {text!r} -> {target}")
        print(f"        => {out!r}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
