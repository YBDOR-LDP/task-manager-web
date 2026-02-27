interface SidebarProps {
  onAddTask: () => void
  onCommand: (command: string) => void
  commandLoading: boolean
  onRefresh: () => void
}

const COMMANDS = [
  { cmd: 'start', label: '/start', desc: 'Morning standup' },
  { cmd: 'sync', label: '/sync', desc: 'File scratchpad notes' },
  { cmd: 'wrap-up', label: '/wrap-up', desc: 'End-of-day closeout' },
]

export default function Sidebar({
  onAddTask,
  onCommand,
  commandLoading,
  onRefresh,
}: SidebarProps) {
  return (
    <aside className="w-52 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-2">
      <div className="mb-3">
        <h1 className="text-base font-bold text-white">Task Manager</h1>
        <p className="text-xs text-gray-500">Personal board</p>
      </div>

      <button
        onClick={onAddTask}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-3 py-2 text-left transition-colors"
      >
        + Add Task
      </button>

      <button
        onClick={onRefresh}
        className="text-gray-400 hover:text-white text-sm text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
      >
        ↺ Refresh
      </button>

      <div className="border-t border-gray-700 my-2" />
      <p className="text-xs text-gray-500 uppercase tracking-wider px-1">
        Commands
      </p>

      {COMMANDS.map(({ cmd, label, desc }) => (
        <button
          key={cmd}
          onClick={() => onCommand(cmd)}
          disabled={commandLoading}
          title={desc}
          className="text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {commandLoading ? (
            <span className="text-gray-500">Running...</span>
          ) : (
            label
          )}
        </button>
      ))}

      <div className="flex-1" />

      <button
        onClick={() => {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }}
        className="text-xs text-gray-600 hover:text-gray-400 text-left px-3 py-1 transition-colors"
      >
        Logout
      </button>
    </aside>
  )
}
