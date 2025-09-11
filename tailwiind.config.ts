import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: '#007bff', // oppure importa da SCSS se usi un plugin
      }
    }
  }
}

export default config
