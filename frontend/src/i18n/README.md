# Internationalization (i18n) Guide

This project uses **i18next** with **react-i18next** for multi-language support.

## Supported Languages

- **English** (en)
- **Spanish** (es)

## Directory Structure

```
frontend/
├── public/locales/
│   ├── en/
│   │   └── common.json     # English translations
│   └── es/
│       └── common.json     # Spanish translations
├── src/i18n/
│   ├── config.ts           # i18next configuration
│   └── README.md           # This file
└── src/hooks/
    └── useTranslations.ts  # Custom hook for translations
```

## Adding a New Language

1. Create a new folder in `public/locales/`:
   ```bash
   mkdir frontend/public/locales/fr
   ```

2. Copy `common.json` from an existing language and translate:
   ```bash
   cp frontend/public/locales/en/common.json frontend/public/locales/fr/common.json
   ```

3. Update `src/i18n/config.ts` to include the new language:
   ```typescript
   const resources = {
     en: { ... },
     es: { ... },
     fr: {
       common: require('../../public/locales/fr/common.json'),
     },
   }
   
   i18next.init({
     ...
     supportedLngs: ['en', 'es', 'fr'],
     ...
   })
   ```

4. Translate the JSON file

## Using Translations in Components

### Basic Usage

```typescript
import { useTranslations } from '../hooks/useTranslations'

export function MyComponent() {
  const { t } = useTranslations()
  
  return (
    <div>
      <h1>{t('header.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  )
}
```

### Switching Languages

```typescript
import { useTranslations } from '../hooks/useTranslations'

export function LanguageSwitcher() {
  const { changeLanguage, currentLanguage, t } = useTranslations()
  
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
      <p>Current: {currentLanguage}</p>
    </div>
  )
}
```

## Translation Key Structure

Keep translation keys organized hierarchically:

```json
{
  "header": {
    "title": "...",
    "subtitle": "..."
  },
  "common": {
    "loading": "...",
    "error": "..."
  },
  "forms": {
    "login": {
      "email": "...",
      "password": "..."
    }
  }
}
```

## Interpolation

Use interpolation for dynamic values:

**Translation file (common.json):**
```json
{
  "greeting": "Hello, {{name}}!"
}
```

**Component:**
```typescript
const { t } = useTranslations()
return <p>{t('greeting', { name: 'John' })}</p>
```

## Pluralization

Use pluralization for plural forms:

**Translation file:**
```json
{
  "items": "You have {{count}} item",
  "items_plural": "You have {{count}} items"
}
```

**Component:**
```typescript
const { t } = useTranslations()
return <p>{t('items', { count: 5 })}</p>
```

## Adding Translations to Existing Components

1. Identify all hardcoded strings
2. Create translation keys in `common.json` for each language
3. Replace hardcoded strings with `t('key')`

Example:
```typescript
// Before
<button>Click me</button>

// After
const { t } = useTranslations()
<button>{t('common.button')}</button>
```

## Language Persistence

The selected language is automatically saved to `localStorage` and restored on page reload.

## Best Practices

- ✅ Always use translation keys, never hardcode strings
- ✅ Keep keys organized hierarchically
- ✅ Use descriptive key names
- ✅ Add context comments in JSON files if needed
- ✅ Keep translations synchronized across all languages
- ✅ Use `useTranslations()` hook instead of `useTranslation()` for consistency

## Troubleshooting

**Keys not translating?**
- Check that the key exists in all language files
- Verify the JSON syntax is valid
- Check browser console for errors
- Clear localStorage if needed

**Language not switching?**
- Ensure the language code is in `supportedLngs`
- Check that the language folder exists in `public/locales/`
- Verify the JSON file is named `common.json`
