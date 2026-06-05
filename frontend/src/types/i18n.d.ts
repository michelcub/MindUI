import 'react-i18next'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    ns: ['common']
    resources: {
      common: {
        header: {
          title: string
          subtitle: string
        }
        common: {
          loading: string
          error: string
          success: string
          cancel: string
          save: string
          delete: string
          edit: string
          back: string
          next: string
          previous: string
          confirm: string
          close: string
        }
        language: {
          en: string
          es: string
        }
      }
    }
  }
}
