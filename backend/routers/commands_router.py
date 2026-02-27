from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..github_client import read_all_context, write_file
from ..claude_client import run_command

router = APIRouter(prefix="/api/commands", tags=["commands"])

VALID_COMMANDS = {"start", "sync", "wrap-up"}

# Maps JSON key in Claude's response → filename in the data repo
FILE_MAP = {
    "taskboard": "Taskboard.md",
    "scratchpad": "ScratchPad.md",
    "memory": "Memory.md",
}


@router.post("/{command}")
async def execute_command(
    command: str,
    user: str = Depends(get_current_user),
) -> dict:
    if command not in VALID_COMMANDS:
        raise HTTPException(status_code=400, detail=f"Unknown command: {command}")

    context = await read_all_context()

    try:
        result = await run_command(command, context)
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Claude error: {str(exc)}"
        ) from exc

    files_updated: list[str] = []
    for key, filename in FILE_MAP.items():
        new_content = result.get(key)
        if new_content is not None:
            _, sha = context.get(filename, ("", ""))
            if not sha:
                # File may not exist yet — skip rather than crash
                continue
            await write_file(
                filename,
                new_content,
                sha,
                f"/{command}: update {filename}",
            )
            files_updated.append(filename)

    return {
        "output": result.get("output", ""),
        "files_updated": files_updated,
    }
