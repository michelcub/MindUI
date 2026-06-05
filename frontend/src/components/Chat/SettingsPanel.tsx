import { ArrowLeft, Settings, Zap, Lock } from 'lucide-react'
import { useState } from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose?: () => void
}

type SettingsTab = 'General' | 'Conexiones' | 'Modelos'

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('General')
  const [enableNewUserSignups, setEnableNewUserSignups] = useState(false)
  const [showAdminDetails, setShowAdminDetails] = useState(true)

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 bg-white z-50 flex">
      {/* Sidebar within Settings */}
      <div className="w-64 border-r border-gray-200 h-full flex flex-col p-4 bg-gray-50">
        <div className="mb-4">
          <div className="relative">
            <input
              className="w-full text-xs bg-gray-200 border-none rounded-lg pl-8 py-2"
              placeholder="Buscar"
              type="text"
            />
            <svg
              className="w-3 h-3 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
        </div>

        <nav className="space-y-1">
          {['General', 'Conexiones', 'Modelos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as SettingsTab)}
              className={`flex w-full items-center px-3 py-2 text-xs font-semibold rounded-lg ${
                activeTab === tab
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {tab === 'General' && <Settings className="w-4 h-4 mr-3" />}
              {tab === 'Conexiones' && <Zap className="w-4 h-4 mr-3" />}
              {tab === 'Modelos' && <Lock className="w-4 h-4 mr-3" />}
              {tab}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={onClose}
            className="flex items-center text-xs text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
      </div>

      {/* Settings Main View */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar bg-white">
        {/* Tabs */}
        <div className="border-b border-gray-100 flex items-center px-8 py-2 space-x-6 text-sm">
          {['Usuarios', 'Analíticas', 'Evaluaciones', 'Funciones', 'Ajustes'].map((tab) => (
            <span
              key={tab}
              className={`cursor-pointer pb-2 pt-2 ${
                tab === 'Ajustes'
                  ? 'text-gray-900 border-b-2 border-black font-semibold'
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl">
          <h3 className="text-xl font-bold mb-6">{activeTab}</h3>

          {activeTab === 'General' && (
            <>
              {/* Version Section */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold">Versión</p>
                    <p className="text-xs text-gray-500">v0.9.6 (la última)</p>
                    <a className="text-xs text-blue-500 underline" href="#">
                      Ver las novedades
                    </a>
                  </div>
                  <button className="bg-gray-100 text-xs px-4 py-1.5 rounded-lg font-medium hover:bg-gray-200">
                    Buscar actualizaciones
                  </button>
                </div>
              </div>

              {/* Help Section */}
              <div className="mb-8">
                <p className="text-sm font-semibold mb-2">Ayuda</p>
                <p className="text-xs text-gray-500 mb-4">
                  Descubre cómo usar Open WebUI y busca Soporte Comunitario.{' '}
                  <a className="text-blue-500 underline float-right" href="#">
                    Documentación
                  </a>
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center bg-indigo-600 text-white px-2 py-1 rounded text-[10px] space-x-1">
                    <span>Discord</span>
                    <span className="bg-indigo-700 px-1 rounded">Open WebUI</span>
                  </div>
                  <div className="flex items-center bg-black text-white px-2 py-1 rounded text-[10px] space-x-1">
                    <span>Follow @OpenWebUI</span>
                  </div>
                  <div className="flex items-center border border-gray-200 px-2 py-1 rounded text-[10px] space-x-1">
                    <span>Star us on Github</span>
                    <span className="bg-gray-100 px-1 rounded">140k</span>
                  </div>
                </div>
              </div>

              {/* License Section */}
              <div className="mb-8">
                <p className="text-sm font-semibold">Licencia</p>
                <p className="text-xs text-gray-400">
                  Mejore a un plan con licencia para tener capacidades mejoradas, incluyendo
                  personalización de marca e interfaz, y soporte dedicado.
                </p>
              </div>

              {/* Authentication Section */}
              <h3 className="text-lg font-bold mb-4 mt-12">Autenticación</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rol predeterminado de los nuevos usuarios</span>
                  <div className="flex items-center text-xs text-gray-400 cursor-pointer">
                    pendiente
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Grupo Predeterminado</span>
                  <div className="flex items-center text-xs text-gray-400 cursor-pointer">
                    None
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Habilitar Registros de Nuevos Usuarios</span>
                  <button
                    onClick={() => setEnableNewUserSignups(!enableNewUserSignups)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                      enableNewUserSignups ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                        enableNewUserSignups ? 'right-0.5 top-0.5' : 'left-0.5 top-0.5'
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Mostrar Detalles Admin en la sobrecapa de 'Cuenta Pendiente'</span>
                  <button
                    onClick={() => setShowAdminDetails(!showAdminDetails)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                      showAdminDetails ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                        showAdminDetails ? 'right-0.5 top-0.5' : 'left-0.5 top-0.5'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* Input Sections */}
              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-xs font-semibold mb-2">Correo Electrónico de Contacto del Admin</p>
                  <input
                    className="w-full bg-gray-50 border-none rounded-lg text-xs p-3"
                    placeholder="Dejar vacío para utilizar el primer usuario administrador"
                    type="text"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2">Título de la SobreCapa Usuario Pendiente</p>
                  <input
                    className="w-full bg-gray-50 border-none rounded-lg text-xs p-3"
                    placeholder="Ingresar un título para la sobrecapa informativa de usuario pendiente. Dejar vacío para usar el predeterminado."
                    type="text"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab !== 'General' && (
            <div className="text-gray-500 text-sm">Contenido de {activeTab}</div>
          )}
        </div>

        {/* Fixed Footer Button */}
        <div className="mt-auto border-t border-gray-100 p-6 flex justify-end">
          <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800">
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
