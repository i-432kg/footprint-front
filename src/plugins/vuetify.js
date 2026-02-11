import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1d9bf0',
          background: '#f8f9fa',
          surface: '#ffffff',
          'border-color': '#f0f0f0',
        },
      },
    },
  },
})
