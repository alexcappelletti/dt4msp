// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcssPlugin from '@tailwindcss/vite'
import { normalize, resolve } from 'path'


export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },

	modules: [
		//'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxt/test-utils/module',
		'@nuxt/ui',
		'nuxt-pdfmake',

	],

	app: {
		rootId: 'nuxt-root', // opzionale, se vuoi personalizzare l'ID del root element
		// Usa app/app.vue come root: Nuxt 4 lo rileva automaticamente se presente
	},

	css: [
		'./app/assets/css/tailwind.css',
		'./app/assets/scss/main.scss'],


	nitro: {
		preset: 'node'
	},
	vite: {
		server: {
			port: 3000
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
})
// 