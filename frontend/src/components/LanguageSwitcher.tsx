import { useTranslations } from '../hooks/useTranslations'

export function LanguageSwitcher() {
  const { changeLanguage, currentLanguage, t } = useTranslations()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded ${
          currentLanguage === 'en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {t('language.en')}
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1 rounded ${
          currentLanguage === 'es'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {t('language.es')}
      </button>
    </div>
  )
}
