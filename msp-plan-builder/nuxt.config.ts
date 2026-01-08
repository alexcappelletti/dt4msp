import { resolve } from 'path';
// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	app: {
		rootId: "nuxt-root", // opzionale, se vuoi personalizzare l'ID del root element
		// Usa app/app.vue come root: Nuxt 4 lo rileva automaticamente se presente
	},

	alias: {
		"#": resolve(__dirname, "."),
	},

	modules: ["vuetify-nuxt-module"],
	css: [
		"vuetify/styles",
		//qui tailwind eventualmente
		
	],
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
					additionalData: `@use "~/assets/scss/variables" as *;`
				}
			}
		},
	},
	vuetify: {
		moduleOptions: {
			/* module specific options */
		},
		vuetifyOptions: {
			/* vuetify options */
			treeShake: true,
			icons: {
				defaultSet: "mdi",
			},
			theme: {
				// Imposta il tema di default all'avvio
				defaultTheme: "light",
				themes: {
					light: {
						dark: false,
						colors: {
							// Colori predefiniti di Vuetify (light)
							background: "#FFFFFF",
							surface: "#FFFFFF",
							primary: "#48a10cff",
							secondary: "#424242",
							error: "#7c3225ff",
							info: "#64f321ff",
							success: "#89b88bff",
							warning: "#93ff07ff",
							// Aggiungi qui i tuoi colori personalizzati per il tema chiaro
							alex: "#AA77B6",
							ux1: "#C6D0FF",
							"main-rose": "#FEF7FF",
							"main-rose-dark": "#F3EDF7",
						},
					},
					// dark: {
					// 	colors: {
					// 		// Colori predefiniti di Vuetify (dark)
					// 		background: "#121212",
					// 		surface: "#1E1E1E",
					// 		primary: "#2196F3",
					// 		secondary: "#424242",
					// 		error: "#FF5252",
					// 		info: "#2196F3",
					// 		success: "#4CAF50",
					// 		warning: "#FFC107",
					// 		// Aggiungi qui i tuoi colori personalizzati per il tema scuro
					// 		alex: "#8C4D9A",
					// 		ux1: "#A3B4FC",
					// 	},
					// },
				},
			},
		},
	},

});