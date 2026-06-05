import { Zap } from 'lucide-react'

export interface Suggestion {
  id: string
  title: string
  description: string
}

interface SuggestedPromptsProps {
  suggestions?: Suggestion[]
  onSelectSuggestion?: (id: string) => void
}

export function SuggestedPrompts({
  suggestions = [
    { id: '1', title: 'Help me study', description: 'vocabulary for a college entrance exam' },
    { id: '2', title: 'Give me ideas', description: "for what to do with my kids' art" },
    { id: '3', title: 'Overcome procrastination', description: 'give me tips' },
  ],
  onSelectSuggestion,
}: SuggestedPromptsProps) {
  return (
    <div className="mt-8 space-y-4 px-4 w-full max-w-2xl">
      <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs mb-4">
        <Zap className="w-3 h-3" />
        <span className="font-medium">Sugerido</span>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelectSuggestion?.(suggestion.id)}
            className="w-full text-left group hover:opacity-80 transition-opacity bg-gray-50 hover:bg-gray-100 p-3 rounded-lg"
          >
            <p className="text-sm font-semibold text-gray-700">{suggestion.title}</p>
            <p className="text-xs text-gray-400">{suggestion.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
