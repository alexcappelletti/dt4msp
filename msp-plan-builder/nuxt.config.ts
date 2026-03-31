import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	srcDir: "app",
	app: {
		rootId: "nuxt-root",
	},

	alias: {
		"#": resolve(__dirname, "."), // project root (used like "#	/shared/...")
		"@": resolve(__dirname, "app"), // source dir (used like "@/components/...")
		"~": resolve(__dirname, "app"), // alternative source alias
	},

	modules: ["vuetify-nuxt-module", "@pinia/nuxt"],

	// ✅ ORDINE: Vuetify → Tailwind → tuoi override (SCSS/CSS)
	css: [
		"@mdi/font/css/materialdesignicons.css",
		"~/assets/css/main-tailwind.css",
		"~/assets/scss/app.scss", // se hai override finali, mettili qui
	],

	build: {
		transpile: ["vuetify"],
	},

	vite: {
		resolve: {
			alias: {
				"#": resolve(__dirname, "."),
				"@": resolve(__dirname, "app"),
				"~": resolve(__dirname, "app"),
			},
		},
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
					additionalData: `@use "@/assets/scss/abstracts" as *;`,
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
