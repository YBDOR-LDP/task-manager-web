import re
from fastapi import APIRouter, Depends, HTTPException
from ..models import AddTaskRequest
from ..auth import get_current_user
from ..github_client import read_all_context, write_file
from ..claude_client import add_task
from .board_router import _parse_projects

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("/add")
async def add_task_endpoint(
    request: AddTaskRequest,
    user: str = Depends(get_current_user),
) -> dict:
    context = await read_all_context()

    task_data = request.model_dump()
    updated_taskboard = await add_task(task_data, context)

    _, sha = context.get("Taskboard.md", ("", ""))
    if not sha:
        raise HTTPException(status_code=500, detail="Could not read Taskboard.md SHA")

    await write_file(
        "Taskboard.md",
        updated_taskboard,
        sha,
        f"Add task: {request.description[:60]}",
    )

    projects = _parse_projects(updated_taskboard)
    return {"content": updated_taskboard, "projects": projects}
