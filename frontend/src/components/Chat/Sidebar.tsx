import { Menu } from 'lucide-react'
import { SidebarNavigation } from './SidebarNavigation'
import { SidebarChatHistory, type ChatItem } from './SidebarChatHistory'
import { UserFooter } from './UserFooter'

interface SidebarProps {
  chats?: ChatItem[]
  onNewChat?: () => void
  onSelectChat?: (id: string) => void
  onSettingsClick?: () => void
  username?: string
  userInitial?: string
}

export function Sidebar({
  chats,
  onNewChat,
  onSelectChat,
  onSettingsClick,
  username,
  userInitial,
}: SidebarProps) {
  return (
    <aside
      className="w-64 border-r border-gray-200 flex flex-col h-full shrink-0 bg-gray-50 overflow-hidden"
      data-purpose="main-sidebar"
    >
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            OI
          </div>
          <span className="font-semibold text-sm">Open WebUI</span>
        </div>
        <button className="p-1 hover:bg-gray-200 rounded">
          <Menu className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <SidebarNavigation onNewChat={onNewChat} />

      {/* Categories Section */}
      <div className="px-3 mt-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Carpetas
        </p>
      </div>

      {/* Chat History */}
      <SidebarChatHistory chats={chats} onSelectChat={onSelectChat} />

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User Footer */}
      <UserFooter username={username} userInitial={userInitial} onSettingsClick={onSettingsClick} />
    </aside>
  )
}
