import { ChatInput } from './ChatInput'
import { SuggestedPrompts, type Suggestion } from './SuggestedPrompts'

interface ChatAreaProps {
  modelName?: string
  suggestions?: Suggestion[]
  onSubmitMessage?: (message: string) => void
  onSelectSuggestion?: (id: string) => void
  isLoading?: boolean
  isEmpty?: boolean
}

export function ChatArea({
  modelName = 'NVIDIA: Nemotron 3.5 Content...',
  suggestions,
  onSubmitMessage,
  onSelectSuggestion,
  isLoading = false,
  isEmpty = true,
}: ChatAreaProps) {
  if (!isEmpty) {
    return (
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Chat messages would go here */}
        <div className="flex-1 overflow-y-auto">
          {/* Messages */}
        </div>
        <div className="flex items-center justify-center p-4">
          <ChatInput onSubmit={onSubmitMessage} isLoading={isLoading} />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Centered Branding and Suggestions */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Model Logo and Title */}
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
            <span className="font-bold text-lg">OI</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800">{modelName}</h1>
        </div>

        {/* Chat Input Box */}
        <ChatInput onSubmit={onSubmitMessage} isLoading={isLoading} />

        {/* Suggested Prompts - Centered */}
        <div className="w-full flex justify-center">
          <SuggestedPrompts suggestions={suggestions} onSelectSuggestion={onSelectSuggestion} />
        </div>
      </div>
    </main>
  )
}
