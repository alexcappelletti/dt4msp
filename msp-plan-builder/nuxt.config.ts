import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	srcDir: "app",
	runtimeConfig: {
		owsBaseUrl: process.env.OWS_BASE_URL ?? "",
		owsTimeoutMs: Number(process.env.OWS_TIMEOUT_MS ?? 15000),
		public: {
			esriApiKey: process.env.ESRI_APIKEY ?? "",
		},
	},
	app: {
		rootId: "nuxt-root",
	},

	alias: {
		"#": resolve(__dirname, "."),
		"@": resolve(__dirname, "app"),
		"~": resolve(__dirname, "app"),
	},

	modules: ["vuetify-nuxt-module", "@pinia/nuxt"],

	css: [
		"@mdi/font/css/materialdesignicons.css",
		"vuetify/styles",
		"~/assets/css/main-tailwind.css",
		"~/assets/scss/app.scss",
	],

	build: {
		transpile: ["vuetify", "geostyler-mapbox-parser", "geostyler-sld-parser"],
	},

	nitro: {
		externals: {
			inline: ["geostyler-mapbox-parser", "geostyler-sld-parser"],
		},
	},

	vite: {
		ssr: {
			noExternal: ["geostyler-mapbox-parser", "geostyler-sld-parser"],
		},
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
			disableVuetifyStyles: false,
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
