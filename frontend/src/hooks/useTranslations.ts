import { useTranslation } from 'react-i18next'

export function useTranslations() {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const currentLanguage = i18n.language

  const isLanguageSupported = (lang: string) => {
    const supported = i18n.options.supportedLngs
    if (!supported) return false
    if (typeof supported === 'boolean') return !supported // false means disabled, true means all allowed
    return supported.includes(lang)
  }

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    isLanguageSupported,
  }
}
