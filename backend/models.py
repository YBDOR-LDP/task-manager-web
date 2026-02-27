from pydantic import BaseModel
from typing import Optional, List


class SubTask(BaseModel):
    priority: str  # "P1", "P2", "P3"
    description: str
    waiting_on: Optional[str] = None


class AddTaskRequest(BaseModel):
    project: str
    priority: str  # "P1", "P2", "P3"
    description: str
    due_date: Optional[str] = None  # "DD/MM/YYYY" or None for *later*
    collaborator: Optional[str] = None
    waiting_on: Optional[str] = None
    subtasks: List[SubTask] = []


class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class BoardResponse(BaseModel):
    content: str
    projects: List[str]


class CommandResponse(BaseModel):
    output: str
    files_updated: List[str] = []
