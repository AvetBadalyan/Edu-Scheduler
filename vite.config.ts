import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [
		tailwindcss(),
		react({
			include: '**/*.{jsx,js,tsx,ts}',
		}),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@components': resolve(__dirname, './src/components'),
			'@pages': resolve(__dirname, './src/pages'),
			'@lib': resolve(__dirname, './src/lib'),
			'@types': resolve(__dirname, './src/types'),
			'@hooks': resolve(__dirname, './src/hooks'),
			'@assets': resolve(__dirname, './src/assets'),
		},
	},
	// Vitest config — test config lives here to avoid CLI path-with-spaces issues
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
		coverage: { provider: 'v8', reporter: ['text', 'html'] },
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
					redux: ['@reduxjs/toolkit', 'react-redux'],
				},
			},
		},
		minify: 'esbuild',
	},
	esbuild: {
		drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
	},
	server: {
		port: 3000,
		open: false,
	},
})
