import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ChatHeader } from './ChatHeader'
import { ChatArea } from './ChatArea'
import { SettingsPanel } from './SettingsPanel'

interface ChatLayoutProps {
  modelName?: string
  username?: string
  userInitial?: string
}

export function ChatLayout({
  modelName = 'NVIDIA: Nemotron 3.5 Content Safety (free)',
  username = 'admin',
  userInitial = 'A',
}: ChatLayoutProps) {
  const [showSettings, setShowSettings] = useState(false)

  const handleNewChat = () => {
    // TODO: Create new chat
  }

  const handleSubmitMessage = (_message: string) => {
    // TODO: Submit message to API
  }

  const handleSelectSuggestion = (_id: string) => {
    // TODO: Handle suggestion selection
  }

  return (
    <div className="flex w-full h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        onSettingsClick={() => setShowSettings(true)}
        username={username}
        userInitial={userInitial}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <ChatHeader modelName={modelName} userInitial={userInitial} />

        {/* Chat Area */}
        <ChatArea
          modelName={modelName}
          onSubmitMessage={handleSubmitMessage}
          onSelectSuggestion={handleSelectSuggestion}
          isEmpty
        />
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
