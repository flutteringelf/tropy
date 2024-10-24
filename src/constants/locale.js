const LOCALE = {
  'cn': 'cn',
  'zh': 'cn',
  'de': 'de',
  'en': 'en',
  'es': 'es',
  'fr': 'fr',
  'it': 'it',
  'ja': 'ja',
  'nl-NL': 'nl-NL',
  'pt': 'pt',
  'pt-BR': 'pt-BR',
  'uk': 'uk'
}

export const supportedLanguages = Object.keys(LOCALE).sort()

LOCALE.default = 'cn'
export default LOCALE
