// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { resolve } from 'path'

export default defineConfig({
	test: {
		include: ['tests/{e2e,unit}/*.{test,spec}.ts'],
		environment: 'jsdom',
		globals: true,
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'app/'),
		},
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