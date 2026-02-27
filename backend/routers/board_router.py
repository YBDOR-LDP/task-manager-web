import re
from fastapi import APIRouter, Depends
from ..models import BoardResponse
from ..auth import get_current_user
from ..github_client import read_file

router = APIRouter(prefix="/api", tags=["board"])

# Section headings to exclude from the project dropdown
_EXCLUDED = {"People & 1:1s", "Backlog"}


@router.get("/board", response_model=BoardResponse)
async def get_board(user: str = Depends(get_current_user)) -> BoardResponse:
    content, _ = await read_file("Taskboard.md")
    projects = _parse_projects(content)
    return BoardResponse(content=content, projects=projects)


def _parse_projects(content: str) -> list[str]:
    """Extract project names from ### headings under the ## Projects section."""
    projects: list[str] = []
    in_projects = False
    for line in content.splitlines():
        if line.startswith("## Projects"):
            in_projects = True
            continue
        if in_projects and line.startswith("## "):
            break  # left the Projects section
        if in_projects and line.startswith("### "):
            name = line[4:].strip()
            if name not in _EXCLUDED:
                projects.append(name)
    return projects
