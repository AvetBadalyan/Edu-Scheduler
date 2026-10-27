import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

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
	build: {
		sourcemap: 'hidden', // maps are generated for error tools but not served to browsers
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes('node_modules')) return
					if (id.includes('lucide-react')) return 'icons'
					if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux'))
						return 'redux'
					if (id.includes('react-router') || id.includes('react-router-dom')) return 'router'
					if (
						id.includes('/react/') ||
						id.includes('/react-dom/') ||
						id.includes('/scheduler/')
					)
						return 'vendor'
				},
			},
		},
	},
	server: {
		port: 3000,
		open: false,
	},
})
