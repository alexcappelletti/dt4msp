import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['tests/integrations/**/*.{test,spec}.ts', 'tests/fixtures/**/*.{test,spec}.ts'], // Include sia integration che unit
		
		
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'app/'),
			'~': resolve(__dirname, 'app'),
			'#':resolve(__dirname)

		},
	},
})