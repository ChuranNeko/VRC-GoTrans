from __future__ import annotations

import logging
import sys

_initialized = False

_FORMAT = "[*] %(asctime)s %(levelname)-5s %(name)s: %(message)s"
_DATEFMT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: int = logging.INFO) -> None:
    global _initialized
    if _initialized:
        return
    handler = logging.StreamHandler(stream=sys.stderr)
    handler.setFormatter(logging.Formatter(_FORMAT, datefmt=_DATEFMT))
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)
    _initialized = True


def get_logger(name: str) -> logging.Logger:
    if not _initialized:
        setup_logging()
    return logging.getLogger(name)
