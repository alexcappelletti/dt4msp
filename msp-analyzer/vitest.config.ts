// vitest.config.ts


import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'path'
export default defineVitestConfig({
	test: {
		// Usa l'environment 'nuxt' per i test che interagiscono con l'app Nuxt (come il test Redis E2E)
		environment: 'nuxt', 
		globals: true,
		include: ['tests/e2e/**/*.{test,spec}.ts'], // Include sia e2e che unit
		alias: {
			// Assicurati che l'alias punti alla radice della tua app
			'~': resolve(__dirname, 'app/'),
			'@': resolve(__dirname, 'app/') 
		},
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: ['tests/', 'vitest.config.ts']
		}
	},
})





// import { defineVitestConfig } from '@nuxt/test-utils/config'
// import { resolve } from 'path'

// export default defineVitestConfig({
// 	test: {
// 		environment: 'nuxt',
// 		globals: true,
// 		include: ['tests/**/*.test.ts'],
// 		alias: {
// 			'@': resolve(__dirname, './app/')
// 		},
// 		coverage: {
// 			reporter: ['text', 'json', 'html'],
// 			exclude: ['tests/', 'vitest.config.ts']
// 		}

// 	}
// })