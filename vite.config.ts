import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tailwindcss(), react()],
	resolve: {
		alias: {
			'@': resolve(import.meta.dirname, './src'),
			'@components': resolve(import.meta.dirname, './src/components'),
			'@pages': resolve(import.meta.dirname, './src/pages'),
			'@lib': resolve(import.meta.dirname, './src/lib'),
			'@types': resolve(import.meta.dirname, './src/types'),
			'@hooks': resolve(import.meta.dirname, './src/hooks'),
			'@assets': resolve(import.meta.dirname, './src/assets'),
		},
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
		coverage: { provider: 'v8', reporter: ['text', 'html'] },
	},
	build: {
		sourcemap: true,
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				// Rolldown (Vite 8) requires manualChunks as a function
				manualChunks(id) {
					if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
						return 'vendor'
					if (id.includes('node_modules/react-router')) return 'router'
					if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux'))
						return 'redux'
				},
			},
		},
	},
	server: {
		port: 3000,
		open: false,
	},
})
