import os
import base64
import asyncio
import httpx
from typing import Tuple, Dict

GITHUB_API = "https://api.github.com"


def _headers() -> dict:
    token = os.environ["GITHUB_TOKEN"]
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _repo() -> str:
    return os.environ["GITHUB_REPO"]


async def read_file(path: str) -> Tuple[str, str]:
    """Returns (content, sha). Raises httpx.HTTPStatusError on failure."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{_repo()}/contents/{path}",
            headers=_headers(),
        )
        resp.raise_for_status()
        data = resp.json()
        # GitHub returns content with newlines in base64 — strip them
        raw = data["content"].replace("\n", "")
        content = base64.b64decode(raw).decode("utf-8")
        return content, data["sha"]


async def write_file(
    path: str,
    content: str,
    sha: str,
    message: str = "Update via task manager",
) -> dict:
    """Write (or update) a file on GitHub. sha must be the current file's SHA."""
    encoded = base64.b64encode(content.encode("utf-8")).decode("ascii")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.put(
            f"{GITHUB_API}/repos/{_repo()}/contents/{path}",
            headers=_headers(),
            json={"message": message, "content": encoded, "sha": sha},
        )
        resp.raise_for_status()
        return resp.json()


async def read_all_context() -> Dict[str, Tuple[str, str]]:
    """Fetch Taskboard + Memory + CLAUDE.md + ScratchPad in parallel.

    Returns dict: filename → (content, sha). Missing files map to ("", "").
    """
    files = ["Taskboard.md", "Memory.md", "CLAUDE.md", "ScratchPad.md"]
    results = await asyncio.gather(
        *[read_file(f) for f in files],
        return_exceptions=True,
    )
    out: Dict[str, Tuple[str, str]] = {}
    for name, result in zip(files, results):
        if isinstance(result, Exception):
            out[name] = ("", "")
        else:
            out[name] = result
    return out
