export interface ChatItem {
  id: string
  title: string
  timestamp: string
  isActive: boolean
}

interface SidebarChatHistoryProps {
  chats?: ChatItem[]
  onSelectChat?: (id: string) => void
}

export function SidebarChatHistory({
  chats = [{ id: '1', title: 'Hola', timestamp: 'hace_2m', isActive: true }],
  onSelectChat,
}: SidebarChatHistoryProps) {
  return (
    <div className="mt-4">
      <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Chats
      </p>
      <p className="px-3 py-2 text-[10px] text-gray-400">Hoy</p>
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat?.(chat.id)}
          className={`flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-lg ${
            chat.isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            <span>{chat.title}</span>
          </div>
          <span className="text-[10px] text-gray-400">{chat.timestamp}</span>
        </button>
      ))}
    </div>
  )
}
