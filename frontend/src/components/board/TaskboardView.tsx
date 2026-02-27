import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

interface TaskboardViewProps {
  content: string
}

// Custom renderers to style the Taskboard markdown nicely
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold text-gray-300 uppercase tracking-widest mt-8 mb-3 border-b border-gray-800 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-blue-400 mt-5 mb-1">{children}</h3>
  ),
  // Bold text used for date/priority group headings like **P1:** or **Due 01/03/2026:**
  strong: ({ children }) => {
    const text = String(children)
    const isDateHeading = text.startsWith('Due ') || text.startsWith('No due')
    const isPriorityHeading = /^(P1|P2|P3|Blocked \(WO\)|Backlog):/.test(text)

    if (isDateHeading) {
      return (
        <strong className="block text-xs text-gray-400 uppercase tracking-wide mt-3 mb-1">
          {children}
        </strong>
      )
    }
    if (isPriorityHeading) {
      const colorMap: Record<string, string> = {
        P1: 'text-red-400',
        P2: 'text-yellow-400',
        P3: 'text-green-400',
        'Blocked (WO)': 'text-orange-400',
        Backlog: 'text-gray-500',
      }
      const key = text.replace(':', '').trim()
      const color = colorMap[key] ?? 'text-gray-400'
      return (
        <strong className={`block text-xs font-semibold uppercase tracking-wide mt-2 mb-0.5 ${color}`}>
          {children}
        </strong>
      )
    }
    return <strong className="font-semibold text-white">{children}</strong>
  },
  ul: ({ children }) => <ul className="list-none pl-0 space-y-0.5">{children}</ul>,
  li: ({ children }) => (
    <li className="text-sm text-gray-300 pl-3 border-l-2 border-gray-700 hover:border-blue-500 py-0.5 transition-colors">
      {children}
    </li>
  ),
  p: ({ children }) => (
    <p className="text-sm text-gray-300 my-0.5">{children}</p>
  ),
  hr: () => <hr className="border-gray-800 my-6" />,
  em: ({ children }) => (
    <em className="not-italic text-gray-400">{children}</em>
  ),
}

export default function TaskboardView({ content }: TaskboardViewProps) {
  return (
    <div className="max-w-4xl">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  )
}
