import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		react({
			include: '**/*.{jsx,js,tsx,ts}'
		})
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@components': resolve(__dirname, './src/components'),
			'@pages': resolve(__dirname, './src/pages'),
			'@lib': resolve(__dirname, './src/lib'),
			'@types': resolve(__dirname, './src/types'),
			'@hooks': resolve(__dirname, './src/hooks'),
			'@utils': resolve(__dirname, './src/utils'),
			'@assets': resolve(__dirname, './src/assets')
		}
	},
	build: {
		sourcemap: true,
		target: 'es2020',
		chunkSizeWarningLimit: 500,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					redux: ['@reduxjs/toolkit', 'react-redux']
				}
			}
		},
		minify: 'esbuild'
	},
	esbuild: {
		drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
	},
	server: {
		port: 3000,
		open: false
	}
})
