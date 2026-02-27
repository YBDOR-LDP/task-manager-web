import { useState } from 'react'
import SubTaskRow, { type SubTaskData } from './SubTaskRow'
import api from '../../api'

interface BoardData {
  content: string
  projects: string[]
}

interface AddTaskFormProps {
  projects: string[]
  onClose: () => void
  onSubmit: (updatedBoard: BoardData) => void
}

/** Convert YYYY-MM-DD (from <input type="date">) to DD/MM/YYYY */
function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function AddTaskForm({ projects, onClose, onSubmit }: AddTaskFormProps) {
  const [project, setProject] = useState(projects[0] ?? '')
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P2')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [later, setLater] = useState(false)
  const [collaborator, setCollaborator] = useState('')
  const [waitingOn, setWaitingOn] = useState('')
  const [subtasks, setSubtasks] = useState<SubTaskData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const doSubmit = async () => {
    if (!description.trim()) {
      setError('Description is required')
      return
    }
    if (!later && !dueDate) {
      setError('Set a due date or check "Later"')
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = {
        project,
        priority,
        description: description.trim(),
        due_date: later ? null : toDisplayDate(dueDate),
        collaborator: collaborator.trim() || null,
        waiting_on: waitingOn.trim() || null,
        subtasks: subtasks
          .filter((st) => st.description.trim())
          .map((st) => ({
            priority: st.priority,
            description: st.description.trim(),
            waiting_on: st.waiting_on.trim() || null,
          })),
      }
      const res = await api.post('/tasks/add', payload)
      onSubmit(res.data)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Failed to add task'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSubmit()
  }

  const addSubtask = () => {
    setSubtasks([...subtasks, { priority: 'P2', description: '', waiting_on: '' }])
  }

  const updateSubtask = (i: number, updated: SubTaskData) => {
    const next = [...subtasks]
    next[i] = updated
    setSubtasks(next)
  }

  const removeSubtask = (i: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== i))
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-base font-semibold text-white">Add Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form
          id="add-task-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-6 py-5 space-y-4"
        >
          {/* Project */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'P1' | 'P2' | 'P3')}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
              <option value="P3">P3 — Low</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              autoFocus
            />
          </div>

          {/* Due Date + Later toggle */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Due Date
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={later}
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <label className="flex items-center gap-2 text-sm text-gray-300 whitespace-nowrap cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={later}
                  onChange={(e) => setLater(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                Later
              </label>
            </div>
          </div>

          {/* Collaborator */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Collaborator <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              value={collaborator}
              onChange={(e) => setCollaborator(e.target.value)}
              placeholder="e.g. NZ"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          {/* Waiting On */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Waiting On <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              value={waitingOn}
              onChange={(e) => setWaitingOn(e.target.value)}
              placeholder="e.g. GO"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          {/* Sub-tasks */}
          {subtasks.length > 0 && (
            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
                Sub-tasks
              </label>
              <div className="space-y-2">
                {subtasks.map((st, i) => (
                  <SubTaskRow
                    key={i}
                    subtask={st}
                    onChange={(updated) => updateSubtask(i, updated)}
                    onRemove={() => removeSubtask(i)}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={addSubtask}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            + Add sub-task
          </button>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-700">
          <button
            type="submit"
            form="add-task-form"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
