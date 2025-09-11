// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',

	devtools: { enabled: true },

	modules: [
		'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxt/test-utils/module',
		'nuxt-pdfmake'
	],

	app: {
		rootId: 'nuxt-root', // opzionale, se vuoi personalizzare l'ID del root element
		// Usa app/app.vue come root: Nuxt 4 lo rileva automaticamente se presente
	},

	css: [
		'@/assets/css/tailwind.css',   // Tailwind prima
		'@/assets/scss/main.scss'
	],

	alias: {
		'@': resolve(__dirname),
		'@assets': resolve(__dirname, 'assets'),
		'@components': resolve(__dirname, 'components'),
		'@utils': resolve(__dirname, 'utils')
	},

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
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@': resolve(__dirname)
			}
		}
	}
})
