import { useState } from 'react'
import { Plus, Image, Mic, ArrowUp } from 'lucide-react'

interface ChatInputProps {
  placeholder?: string
  onSubmit?: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({
  placeholder = '¿Cómo puedo ayudarte hoy?',
  onSubmit,
  isLoading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit?.(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
        <div className="px-1 pb-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full text-gray-900 text-base bg-white outline-none resize-none"
            rows={1}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex space-x-2">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              disabled={isLoading}
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              disabled={isLoading}
            >
              <Image className="w-5 h-5" />
            </button>
          </div>

          <div className="flex space-x-2 items-center">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              className="bg-black text-white p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
