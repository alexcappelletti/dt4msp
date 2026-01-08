import { resolve } from 'path';
// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	app: {
		rootId: 'nuxt-root', // opzionale, se vuoi personalizzare l'ID del root element
		// Usa app/app.vue come root: Nuxt 4 lo rileva automaticamente se presente
	},
	alias: {
		 "#":resolve(__dirname, ".")


	},
})
