// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcssPlugin from '@tailwindcss/vite'


export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: [
		'@vueuse/nuxt',
		'@nuxt/test-utils/module',
		'vuetify-nuxt-module',
		'nuxt-pdfmake',],
	app: {
		rootId: 'nuxt-root', // opzionale, se vuoi personalizzare l'ID del root element
		// Usa app/app.vue come root: Nuxt 4 lo rileva automaticamente se presente
	},
	css: [
		'vuetify/styles',
		'./app/assets/css/tailwind.css', 
		'./app/assets/scss/main.scss',
	],

	// build: {
	// 	transpile: ['vuetify'] // Aggiunto: necessario per l'SSR e per risolvere l'errore .css
	// },

	nitro: {
		
	},
	vite: {
		server: {
			watch: {
				// force polling on environments where native file watching is unreliable (Windows, Docker, WSL)
				usePolling: true,
				interval: 100,
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@use "@/assets/scss/variables" as *;`
				}
			}
		},
		plugins: [
			tailwindcssPlugin(),
		],
		// resolve: {
		// 	alias: {
		// 		'@': resolve(__dirname, 'app')
		// 	}
		// }
	},
	postcss: {
		plugins: {
			'@tailwindcss/postcss': {},
			autoprefixer: {},
		},
	},
	// fonts: {
	// 	families: [
	// 		{name: 'Roboto', weights: [400, 700], styles: ['normal', 'italic']}, // Google Fonts with weights and italics	
	// 		// 'DynaPuff', // Google Fonts without weights (all weights included by default		
	// 		// 'Fira Code', // Fontsource (npm) font
	// 		// 'Bitcount Single Ink' // Fontsource (npm) font
	// 		{name: 'DynaPuff'},
	// 		{name: 'Fira Code', },
	// 		{name: 'Bitcount Single Ink', weights: [400]}
	// 	]
	// }
	vuetify: {
		moduleOptions: {
			/* module specific options */
		},
		vuetifyOptions: {
			/* vuetify options */
			treeShake: true,
			icons: {
				defaultSet: 'mdi'
			},
			theme: {
				// Imposta il tema di default all'avvio
				defaultTheme: 'light', 
				themes: {
					light: {
						colors: {
							// Colori predefiniti di Vuetify (light)
							background: '#FFFFFF',
							surface: '#FFFFFF',
							primary: '#48a10cff',
							secondary: '#424242',
							error: '#7c3225ff',
							info: '#64f321ff',
							success: '#89b88bff',
							warning: '#93ff07ff',
							// Aggiungi qui i tuoi colori personalizzati per il tema chiaro
							alex: '#AA77B6',
							ux1: '#C6D0FF',
						},
					},
					dark: {
						colors: {
							// Colori predefiniti di Vuetify (dark)
							background: '#121212',
							surface: '#1E1E1E',
							primary: '#2196F3',
							secondary: '#424242',
							error: '#FF5252',
							info: '#2196F3',
							success: '#4CAF50',
							warning: '#FFC107',
							// Aggiungi qui i tuoi colori personalizzati per il tema scuro
							alex: '#8C4D9A',
							ux1: '#A3B4FC',
						},
					},
				},
			}
		}
	},
})