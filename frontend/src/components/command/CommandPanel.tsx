import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

interface CommandPanelProps {
  title: string
  output: string
  onClose: () => void
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-white mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-bold text-blue-400 mt-4 mb-2 border-b border-gray-700 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-200 mt-3 mb-1">{children}</h3>
  ),
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
  li: ({ children }) => (
    <li className="text-sm text-gray-300">{children}</li>
  ),
  p: ({ children }) => <p className="text-sm text-gray-300 my-1.5">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  hr: () => <hr className="border-gray-700 my-3" />,
}

export default function CommandPanel({ title, output, onClose }: CommandPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[420px] max-w-full bg-gray-850 border-l border-gray-700 shadow-2xl z-50 flex flex-col bg-gray-900">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="font-semibold text-white font-mono">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ReactMarkdown components={components}>{output}</ReactMarkdown>
        </div>
      </div>
    </>
  )
}
