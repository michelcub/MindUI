import { ChevronDown, Plus, Clock, Settings } from 'lucide-react'

interface ChatHeaderProps {
  modelName?: string
  onModelChange?: () => void
  userInitial?: string
}

export function ChatHeader({
  modelName = 'NVIDIA: Nemotron 3.5 Content Safety (free)',
  onModelChange,
  userInitial = 'A',
}: ChatHeaderProps) {
  return (
    <>
      {/* Top Header Navigation */}
      <header className="flex items-center justify-between px-6 py-3 shrink-0" data-purpose="chat-header">
        <div className="flex items-center space-x-2 cursor-pointer group">
          <h2 className="text-sm font-semibold text-gray-700">{modelName}</h2>
          <button onClick={onModelChange}>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded hover:bg-gray-100">
            <Clock className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {userInitial}
          </div>
        </div>
      </header>

      {/* Sub-header label */}
      <div className="px-6 py-3 shrink-0">
        <p className="text-[10px] text-gray-400">Establecer como Predeterminado</p>
      </div>
    </>
  )
}
