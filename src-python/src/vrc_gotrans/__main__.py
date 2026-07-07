from __future__ import annotations

import asyncio
import sys

from vrc_gotrans.logging_setup import setup_logging
from vrc_gotrans.server import run

setup_logging()

if __name__ == "__main__":
    sys.exit(asyncio.run(run()))
