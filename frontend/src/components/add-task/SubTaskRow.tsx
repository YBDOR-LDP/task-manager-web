export interface SubTaskData {
  priority: 'P1' | 'P2' | 'P3'
  description: string
  waiting_on: string
}

interface SubTaskRowProps {
  subtask: SubTaskData
  onChange: (updated: SubTaskData) => void
  onRemove: () => void
}

export default function SubTaskRow({ subtask, onChange, onRemove }: SubTaskRowProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={subtask.priority}
        onChange={(e) =>
          onChange({ ...subtask, priority: e.target.value as SubTaskData['priority'] })
        }
        className="bg-gray-700 text-white rounded px-2 py-1.5 text-xs w-16 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="P1">P1</option>
        <option value="P2">P2</option>
        <option value="P3">P3</option>
      </select>

      <input
        type="text"
        value={subtask.description}
        onChange={(e) => onChange({ ...subtask, description: e.target.value })}
        placeholder="Sub-task description"
        className="flex-1 bg-gray-700 text-white rounded px-2 py-1.5 text-xs border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
      />

      <input
        type="text"
        value={subtask.waiting_on}
        onChange={(e) => onChange({ ...subtask, waiting_on: e.target.value })}
        placeholder="WO"
        title="Waiting On (optional)"
        className="bg-gray-700 text-white rounded px-2 py-1.5 text-xs w-16 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
      />

      <button
        type="button"
        onClick={onRemove}
        className="text-gray-500 hover:text-red-400 text-base font-bold transition-colors px-1"
        title="Remove sub-task"
      >
        ×
      </button>
    </div>
  )
}
