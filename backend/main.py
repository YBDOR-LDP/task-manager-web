import os
from dotenv import load_dotenv
load_dotenv()  # Load .env for local dev (no-op in production if .env absent)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from backend.routers import auth_router, board_router, tasks_router, commands_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Task Manager", docs_url=None, redoc_url=None)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: allow_credentials must NOT be used with wildcard origin.
# Since frontend and backend share the same Render domain, CORS only
# matters for local dev (frontend :5173 → backend :8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health check (no auth required) ---
@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


# --- API routers ---
app.include_router(auth_router.router)
app.include_router(board_router.router)
app.include_router(tasks_router.router)
app.include_router(commands_router.router)


# --- Serve React static files (MUST be registered last) ---
_static_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_static_dir):
    app.mount(
        "/",
        StaticFiles(directory=_static_dir, html=True),
        name="static",
    )
