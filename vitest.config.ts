// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'path'

export default defineVitestConfig({
	test: {
		environment: 'nuxt',
		globals: true,
		include: ['tests/**/*.test.ts'],
		alias: {
			'@': resolve(__dirname, './app/')
		},
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: ['tests/', 'vitest.config.ts']
		}

	}
})