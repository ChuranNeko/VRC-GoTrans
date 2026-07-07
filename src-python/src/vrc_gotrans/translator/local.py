from __future__ import annotations

import asyncio
import threading
from pathlib import Path

from llama_cpp import Llama

from vrc_gotrans.logging_setup import get_logger

logger = get_logger("vrc_gotrans.translator.local")

_GEN_KW: dict[str, float | int] = dict(
    max_tokens=512,
    temperature=0.7,
    top_k=20,
    top_p=0.6,
    repeat_penalty=1.05,
)


def _has_cjk(s: str) -> bool:
    return any("\u4e00" <= c <= "\u9fff" for c in s)


def build_prompt(text: str, target_lang: str) -> str:
    if _has_cjk(text) or _has_cjk(target_lang) or target_lang in ("Chinese", "中文"):
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


class LocalTranslator:
    """HY-MT 本地翻译器。

    模型懒加载：首次翻译时才加载（避免启动阻塞，与 VRCT 的启动加载卡死相反）。
    用 threading.Lock 串行化加载与推理（llama-cpp-python 的 Llama 非线程安全），
    推理在 executor 线程跑，不阻塞 asyncio 事件循环。
    """

    def __init__(
        self,
        model_path: str,
        n_gpu_layers: int = 0,
        n_ctx: int = 1024,
    ) -> None:
        self._model_path = model_path
        self._n_gpu_layers = n_gpu_layers
        self._n_ctx = n_ctx
        self._llm: Llama | None = None
        self._lock = threading.Lock()

    @property
    def loaded(self) -> bool:
        return self._llm is not None

    async def translate(self, text: str, target_lang: str) -> str:
        prompt = build_prompt(text, target_lang)
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._call_sync, prompt)

    def _call_sync(self, prompt: str) -> str:
        with self._lock:
            if self._llm is None:
                path = Path(self._model_path)
                if not path.is_file():
                    raise FileNotFoundError(f"model not found: {path}")
                logger.info("loading model: %s", path)
                self._llm = Llama(
                    model_path=str(path),
                    n_ctx=self._n_ctx,
                    n_gpu_layers=self._n_gpu_layers,
                    verbose=False,
                )
                logger.info("model loaded")
            assert self._llm is not None
            result = self._llm(prompt, **_GEN_KW)
            return str(result["choices"][0]["text"]).strip()
