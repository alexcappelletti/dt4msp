import type { Config } from 'tailwindcss'

export default {
  theme: {
    
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        ':root': {
          '--color-primary': theme('colors.primary'),
          '--color-secondary': theme('colors.secondary')
        }
      })
    }
  ]
}

