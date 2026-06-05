import { Edit, Search, FileText, Grid2X2 } from 'lucide-react'

interface SidebarNavigationProps {
  onNewChat?: () => void
}

export function SidebarNavigation({ onNewChat }: SidebarNavigationProps) {
  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
      <div className="space-y-1">
        <button
          onClick={onNewChat}
          className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
        >
          <Edit className="w-4 h-4 mr-3" />
          Nuevo Chat
        </button>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
        >
          <Search className="w-4 h-4 mr-3" />
          Buscar
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
        >
          <FileText className="w-4 h-4 mr-3" />
          Notas
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
        >
          <Grid2X2 className="w-4 h-4 mr-3" />
          Espacio de Trabajo
        </a>
      </div>
    </nav>
  )
}
