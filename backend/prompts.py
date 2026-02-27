ADD_TASK_PROMPT = """\
You are a task management assistant. Add a new task to Taskboard.md following the exact formatting rules below.

Today's date: {today}

## WORKFLOW RULES (from CLAUDE.md):
{claude_md}

---

## CURRENT TASKBOARD.MD:
{taskboard}

---

## MEMORY.MD (for context):
{memory}

---

## NEW TASK TO ADD:
```json
{task_json}
```

---

## INSTRUCTIONS:

### Taskboard format (from the existing file above):

The file has two top-level sections: `## Projects` and `## 1:1s`.

**In the `## Projects` section:**
- Each project is a `### Project Name` heading
- Within a project, tasks are grouped into date buckets:
  - `**Backlog:**` — tasks with no priority or due date
  - `**Due DD/MM/YYYY:**` — tasks with a specific due date (one bucket per date, sorted ascending)
  - `**No due date (*later*):**` — tasks with no due date
- Within each date bucket, tasks are in these subsections (only include subsections that have tasks):
  - `**Blocked (WO):**` — tasks with a [WO: Person] marker
  - `**P1:**` — highest priority
  - `**P2:**` — medium priority
  - `**P3:**` — low priority
- Task line format: `- [ ] Task description (with Collaborator) [WO: Person]`
  - Include `(with Collaborator)` only if collaborator is set
  - Include `[WO: Person]` only if waiting_on is set (also put in Blocked section)
- Sub-tasks are indented 2 spaces: `  - [P#] Sub-task description`
- Within each priority section, tasks are sorted alphabetically

**In the `## 1:1s` section:**
- Each person is a `### Person Name` heading
- Same date bucket / priority structure as Projects
- Task line format: `- [ ] Task description (ProjectName)`
  - The project name goes in parentheses at the end (no "with" keyword)
  - For WO tasks in backlog: `- [ ] Task description [WO: Person] (BACKLOG)`

### Steps to add the new task:

1. Find the correct `### ProjectName` heading under `## Projects`
   - If it doesn't exist, create it (insert before `## 1:1s`)
2. Find or create the correct date bucket (`**Due DD/MM/YYYY:**` or `**No due date (*later*):**`)
3. If `waiting_on` is set, add to `**Blocked (WO):**` subsection
4. If `waiting_on` is NOT set, add to the correct priority subsection (`**P1:**`, `**P2:**`, or `**P3:**`)
5. Add any sub-tasks indented 2 spaces below the parent task
6. If `collaborator` is set, also add to that person's section under `## 1:1s`
   - Add `- [ ] Task description (ProjectName)` to the correct date bucket and priority subsection
7. If `waiting_on` is set, also add to that person's section under `## 1:1s`
   - Add `- [ ] Task description [WO: Person] (ProjectName)` to the `**Blocked (WO):**` subsection

Return ONLY the complete updated Taskboard.md content. No explanation. No code fences. No commentary. Start directly with `# Taskboard`.
"""

START_PROMPT = """\
You are a task management assistant running the /start morning standup command.

Today's date: {today}

## TASKBOARD.MD:
{taskboard}

## MEMORY.MD:
{memory}

## INSTRUCTIONS:
Generate a morning standup summary in markdown.

Return a JSON object with EXACTLY this structure (no other keys):
{{
  "output": "## Morning Standup — DD/MM/YYYY\\n\\n...",
  "taskboard": null,
  "scratchpad": null,
  "memory": null
}}

The `output` markdown should include:

### 1. Overdue Tasks
List any tasks with `**Due DD/MM/YYYY:**` where the date is before today ({today}).
Show task + project. If none, say "No overdue tasks."

### 2. Today's Tasks
List all tasks in date buckets matching today. Group by priority (P1 first).
If none, say "Nothing scheduled for today."

### 3. Blocked Tasks
List any tasks in `**Blocked (WO):**` sections that are relevant (non-backlog).

### 4. Context & Follow-ups
Key items from Memory.md that need attention today (upcoming deadlines, waiting-on items, etc).

Keep the output concise and actionable. Use markdown formatting.

Return ONLY valid JSON. No explanation. No code fences.
"""

SYNC_PROMPT = """\
You are a task management assistant running the /sync command to process ScratchPad notes.

Today's date: {today}

## WORKFLOW RULES (from CLAUDE.md):
{claude_md}

## CURRENT TASKBOARD.MD:
{taskboard}

## SCRATCHPAD.MD (notes to process):
{scratchpad}

## MEMORY.MD:
{memory}

## INSTRUCTIONS:
Process all tasks listed under "## Captured Tasks" in ScratchPad.md and file them into Taskboard.md.

Return a JSON object with EXACTLY this structure:
{{
  "output": "## Sync Complete\\n\\n...",
  "taskboard": "complete updated Taskboard.md content here",
  "scratchpad": "## Captured Tasks\\n\\n",
  "memory": null
}}

Rules for processing:
1. Parse each task line from ScratchPad.md using the ScratchPad format ([P1/P2/P3], *date*, **Project**, [WO: Person], etc.)
2. Add each task to the correct project section in Taskboard.md following the same format rules as the existing file
3. Maintain sort order within each section (date buckets ascending, priority P1→P3, alphabetical within priority)
4. For WO tasks: add to Blocked (WO) subsection in the project AND to that person's 1:1 section
5. For collaborator tasks: add to that person's 1:1 section
6. `scratchpad` value: just the header — `## Captured Tasks\\n\\n` (cleared)
7. `output`: brief summary of what was processed (e.g., "Filed 3 tasks across 2 projects.")

If ScratchPad has no tasks (empty or just the header), set `taskboard` to null and report "Nothing to sync."

Return ONLY valid JSON. No explanation. No code fences.
"""

WRAPUP_PROMPT = """\
You are a task management assistant running the /wrap-up end-of-day command.

Today's date: {today}

## WORKFLOW RULES (from CLAUDE.md):
{claude_md}

## CURRENT TASKBOARD.MD:
{taskboard}

## SCRATCHPAD.MD:
{scratchpad}

## CURRENT MEMORY.MD:
{memory}

## INSTRUCTIONS:
Run the end-of-day wrap-up routine.

Return a JSON object with EXACTLY this structure:
{{
  "output": "## Wrap-up — DD/MM/YYYY\\n\\n...",
  "taskboard": null,
  "scratchpad": null,
  "memory": "complete updated Memory.md content here"
}}

Steps:
1. If ScratchPad has unprocessed tasks under "## Captured Tasks", process them into Taskboard first (set `taskboard` to updated content and `scratchpad` to cleared header)
2. Review today's tasks in Taskboard — note what's completed vs still open
3. Update Memory.md:
   - Update "Current Projects & Priorities" to reflect current state
   - Update "High Priority Items" with upcoming P1 tasks
   - Update "Blocked Tasks" list
   - Update "People I'm Working With" if any changes
   - Update "Follow-ups" with actionable next items
   - Add today's date under "Recent Decisions & Important Context" with any notable completions or decisions
   - Update the `*Last updated: DD/MM/YYYY*` footer
4. `output`: brief end-of-day summary (what's done, what's tomorrow, anything to watch)

Always return a non-null `memory` with the fully updated Memory.md content.
Only include non-null `taskboard` / `scratchpad` if ScratchPad had unprocessed tasks.

Return ONLY valid JSON. No explanation. No code fences.
"""
