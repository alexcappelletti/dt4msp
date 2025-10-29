// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcssPlugin from '@tailwindcss/vite'
import { normalize, resolve } from 'path'


export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/fonts',
		'@nuxt/icon',
		'@nuxt/ui',
		'@nuxt/test-utils/module',
		'nuxt-pdfmake',
		'vuetify-nuxt-module'],
	app: {
		rootId: 'nuxt-root', // opzionale, se vuoi personalizzare l'ID del root element
		// Usa app/app.vue come root: Nuxt 4 lo rileva automaticamente se presente
	},
	css: [
		'./app/assets/css/tailwind.css', 
		'./app/assets/scss/main.scss',
		// 'vuetify/styles', // Rimosso: il modulo Vuetify gestisce già gli stili
		// '@mdi/font/css/materialdesignicons.css' // Rimosso: il modulo Vuetify gestisce già le icone MDI
	],

	build: {
		transpile: ['vuetify'] // Aggiunto: necessario per l'SSR e per risolvere l'errore .css
	},

	nitro: {
		preset: 'node'
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
	icon: {
		mode: 'css',
		cssLayer: 'base'
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
			prefixComposables: true, // Renames `useLocale` to `vUseLocale`
		},
		vuetifyOptions: {
			/* vuetify options */
			icons: {
				defaultSet: 'mdi'
			}
		}
	},
})