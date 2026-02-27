import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TaskboardView from '../components/board/TaskboardView'
import AddTaskForm from '../components/add-task/AddTaskForm'
import CommandPanel from '../components/command/CommandPanel'
import api from '../api'

interface BoardData {
  content: string
  projects: string[]
}

interface PanelState {
  title: string
  output: string
}

export default function BoardPage() {
  const [board, setBoard] = useState<BoardData | null>(null)
  const [boardLoading, setBoardLoading] = useState(true)
  const [boardError, setBoardError] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [panel, setPanel] = useState<PanelState | null>(null)
  const [commandLoading, setCommandLoading] = useState(false)

  const fetchBoard = useCallback(async () => {
    setBoardLoading(true)
    setBoardError(false)
    try {
      const res = await api.get('/board')
      setBoard(res.data)
    } catch {
      setBoardError(true)
    } finally {
      setBoardLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleCommand = async (command: string) => {
    setCommandLoading(true)
    try {
      const res = await api.post(`/commands/${command}`)
      setPanel({ title: `/${command}`, output: res.data.output })
      if (res.data.files_updated?.includes('Taskboard.md')) {
        await fetchBoard()
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Command failed'
      setPanel({ title: `/${command}`, output: `**Error:** ${msg}` })
    } finally {
      setCommandLoading(false)
    }
  }

  const handleTaskAdded = (updatedBoard: BoardData) => {
    setBoard(updatedBoard)
    setShowAddTask(false)
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        onAddTask={() => setShowAddTask(true)}
        onCommand={handleCommand}
        commandLoading={commandLoading}
        onRefresh={fetchBoard}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {boardLoading ? (
          <div className="flex items-center gap-2 text-gray-400 mt-8">
            <svg
              className="animate-spin h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading board...
          </div>
        ) : boardError ? (
          <div className="mt-8">
            <p className="text-red-400 mb-3">Failed to load board.</p>
            <button
              onClick={fetchBoard}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Retry
            </button>
          </div>
        ) : board ? (
          <TaskboardView content={board.content} />
        ) : null}
      </main>

      {showAddTask && board && (
        <AddTaskForm
          projects={board.projects}
          onClose={() => setShowAddTask(false)}
          onSubmit={handleTaskAdded}
        />
      )}

      {panel && (
        <CommandPanel
          title={panel.title}
          output={panel.output}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
}
