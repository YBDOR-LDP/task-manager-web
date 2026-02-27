import os
import re
import json
from datetime import datetime
import anthropic
from .prompts import ADD_TASK_PROMPT, START_PROMPT, SYNC_PROMPT, WRAPUP_PROMPT

MODEL = "claude-opus-4-6"
MAX_TOKENS = 8192


def _client() -> anthropic.AsyncAnthropic:
    return anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


def _today() -> str:
    return datetime.now().strftime("%d/%m/%Y")


def strip_fences(text: str) -> str:
    """Strip leading/trailing markdown code fences (```json, ```markdown, etc.)."""
    text = text.strip()
    text = re.sub(r"^```[a-zA-Z]*\n?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


async def add_task(task_data: dict, context_files: dict) -> str:
    """Returns updated Taskboard.md as a plain string."""
    taskboard, _ = context_files.get("Taskboard.md", ("", ""))
    memory, _ = context_files.get("Memory.md", ("", ""))
    claude_md, _ = context_files.get("CLAUDE.md", ("", ""))

    prompt = ADD_TASK_PROMPT.format(
        today=_today(),
        claude_md=claude_md,
        taskboard=taskboard,
        memory=memory,
        task_json=json.dumps(task_data, indent=2, ensure_ascii=False),
    )

    client = _client()
    message = await client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return strip_fences(message.content[0].text)


async def run_command(command: str, context_files: dict) -> dict:
    """Run a /start, /sync, or /wrap-up command. Returns parsed JSON dict."""
    taskboard, _ = context_files.get("Taskboard.md", ("", ""))
    memory, _ = context_files.get("Memory.md", ("", ""))
    claude_md, _ = context_files.get("CLAUDE.md", ("", ""))
    scratchpad, _ = context_files.get("ScratchPad.md", ("", ""))

    today = _today()

    prompt_map = {
        "start": START_PROMPT.format(
            today=today,
            taskboard=taskboard,
            memory=memory,
        ),
        "sync": SYNC_PROMPT.format(
            today=today,
            claude_md=claude_md,
            taskboard=taskboard,
            scratchpad=scratchpad,
            memory=memory,
        ),
        "wrap-up": WRAPUP_PROMPT.format(
            today=today,
            claude_md=claude_md,
            taskboard=taskboard,
            scratchpad=scratchpad,
            memory=memory,
        ),
    }

    if command not in prompt_map:
        raise ValueError(f"Unknown command: {command}")

    client = _client()
    message = await client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt_map[command]}],
    )

    raw = strip_fences(message.content[0].text)
    return json.loads(raw)
