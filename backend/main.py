import os
from dotenv import load_dotenv
load_dotenv()  # Load .env for local dev (no-op in production if .env absent)

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth_router, board_router, tasks_router, commands_router

app = FastAPI(title="Task Manager", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health check (no auth required) ---
@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/api/env-check")
async def env_check() -> dict:
    """Diagnostic: shows which required env vars are present (no values)."""
    keys = ["ANTHROPIC_API_KEY", "GITHUB_TOKEN", "GITHUB_REPO", "APP_PASSWORD", "JWT_SECRET"]
    return {k: ("SET" if os.environ.get(k) else "MISSING") for k in keys}


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
