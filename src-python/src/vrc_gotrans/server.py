from __future__ import annotations

import asyncio
import json
import os
import signal
import sys
from pathlib import Path
from typing import Any

from aiohttp import web

from vrc_gotrans.logging_setup import get_logger
from vrc_gotrans.translator.local import LocalTranslator

logger = get_logger("vrc_gotrans.server")

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
_DEFAULT_MODEL = _PROJECT_ROOT / "models" / "HY-MT1.5-1.8B-Q4_K_M.gguf"

HANDSHAKE_PREFIX = "VRCGOTRANS"


def _emit_handshake(payload: dict[str, Any]) -> None:
    line = json.dumps(payload, ensure_ascii=False)
    sys.stdout.write(f"{HANDSHAKE_PREFIX} {line}\n")
    sys.stdout.flush()


def _error(status: int, code: str, message: str) -> web.Response:
    return web.json_response(
        {"error": {"code": code, "message": message}}, status=status
    )


@web.middleware
async def _error_middleware(request: web.Request, handler):
    try:
        return await handler(request)
    except web.HTTPException:
        raise
    except Exception as exc:
        logger.exception("unhandled error in %s %s", request.method, request.path)
        return _error(500, "internal", str(exc))


async def _health(request: web.Request) -> web.Response:
    return web.json_response(
        {"status": "ok", "version": request.app["version"]}
    )


async def _translate(request: web.Request) -> web.Response:
    try:
        data = await request.json()
    except json.JSONDecodeError:
        return _error(400, "invalid_json", "Request body is not valid JSON")

    text = str(data.get("text", "")).strip()
    target_lang = str(data.get("targetLang", "")).strip()
    if not text:
        return _error(400, "empty_text", "text is required")
    if not target_lang:
        return _error(400, "empty_target_lang", "targetLang is required")

    translator = request.app["translator"]
    if translator is None:
        return _error(503, "translator_unavailable", "Translator not initialized")

    try:
        result = await translator.translate(text, target_lang)
    except Exception as exc:
        logger.exception("translate failed")
        return _error(500, "translate_failed", str(exc))
    return web.json_response({"translation": result})


async def _shutdown(request: web.Request) -> web.Response:
    app = request.app
    asyncio.create_task(_graceful_shutdown(app))
    return web.json_response({"status": "shutting_down"})


async def _graceful_shutdown(app: web.Application) -> None:
    await asyncio.sleep(0.05)
    app["stop_event"].set()


def _build_app(translator: Any, version: str) -> web.Application:
    app = web.Application(middlewares=[_error_middleware])
    app["version"] = version
    app["translator"] = translator
    app["stop_event"] = asyncio.Event()
    app.router.add_get("/health", _health)
    app.router.add_post("/translate", _translate)
    app.router.add_post("/shutdown", _shutdown)
    return app


async def run(version: str = "0.1.0") -> int:
    model_path = os.environ.get("VRCGOTRANS_MODEL_PATH") or str(_DEFAULT_MODEL)
    translator = LocalTranslator(model_path)
    logger.info("local translator configured: %s", model_path)
    app = _build_app(translator=translator, version=version)
    runner = web.AppRunner(app)
    await runner.setup()

    loop = asyncio.get_running_loop()
    server = await loop.create_server(runner.server, "127.0.0.1", 0)
    port = int(server.sockets[0].getsockname()[1])
    app["port"] = port

    _emit_handshake({"ready": True, "port": port, "version": version})
    logger.info("sidecar listening on 127.0.0.1:%d", port)

    stop = app["stop_event"]

    def _on_signal() -> None:
        logger.info("signal received, initiating shutdown")
        stop.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _on_signal)
        except (NotImplementedError, RuntimeError):
            break

    await stop.wait()
    logger.info("cleaning up server")
    server.close()
    await server.wait_closed()
    await runner.cleanup()
    return 0
