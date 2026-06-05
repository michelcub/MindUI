interface UserFooterProps {
  username?: string
  userInitial?: string
  onSettingsClick?: () => void
}

export function UserFooter({
  username = 'admin',
  userInitial = 'A',
  onSettingsClick,
}: UserFooterProps) {
  return (
    <div className="p-4 border-t border-gray-200">
      <button
        onClick={onSettingsClick}
        className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
      >
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold mr-3">
          {userInitial}
        </div>
        <span>{username}</span>
      </button>
    </div>
  )
}
