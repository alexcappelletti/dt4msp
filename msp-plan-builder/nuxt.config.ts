import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	srcDir: "app",
	app: {
		rootId: "nuxt-root",
	},

	alias: {
		"#": resolve(__dirname, "."),
		"@": resolve(__dirname, "."),
		"~": resolve(__dirname, "."),
	},

	modules: ["vuetify-nuxt-module", "@pinia/nuxt"],

	// ✅ ORDINE: Vuetify → Tailwind → tuoi override (SCSS/CSS)
	css: [
		"~/app/assets/css/main-tailwind.css",
		"~/app/assets/scss/app.scss", // se hai override finali, mettili qui
	],

	build: {
		transpile: ["vuetify"],
	},

	vite: {
		plugins: [tailwindcss()],

		server: {
			watch: {
				usePolling: true,
				interval: 100,
			},
		},

		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@use "@/app/assets/scss/abstracts" as *;`,
				},
			},
		},
	},

	vuetify: {
		moduleOptions: {
			disableVuetifyStyles: true, // Disabilita gli stili predefiniti di Vuetify: li importo dentro
		},
		vuetifyOptions: {
			icons: { defaultSet: "mdi" },

			theme: {
				defaultTheme: "light",
				themes: {
					light: {
						dark: false,
						colors: {
							background: "#FFFFFF",
							surface: "#FFFFFF",
							primary: "#cb9aec",
							secondary: "#6750A4",
							error: "#7c3225ff",
							info: "#64f321ff",
							success: "#8171ad",
							warning: "#93ff07ff",

							alex: "#AA77B6",
							ux1: "#233794",
							"main-rose": "#FEF7FF",
							"main-rose-dark": "#F3EDF7",
						},
					},
				},
			},
		},
	},
});
