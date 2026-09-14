// ESLint flat config (ESLint 9+)
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	// Ignore build output and deps
	{ ignores: ['dist/**', 'node_modules/**', 'server/**', 'tests/**'] },

	// Base JS rules
	js.configs.recommended,

	// TypeScript rules
	...tseslint.configs.recommended,

	// React rules
	{
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			// React Hooks
			...reactHooks.configs.recommended.rules,
			// set-state-in-effect fires on valid patterns like closing a mobile drawer on route change
			// or setting a loading flag after an async call. Downgrade to warn.
			'react-hooks/set-state-in-effect': 'warn',

			// React Refresh (Vite HMR)
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

			// TypeScript — relax a few rules that are too noisy for a 3yr developer
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-non-null-assertion': 'off', // we use ! deliberately with RTK adapters
			'@typescript-eslint/no-empty-object-type': 'off', // shadcn/ui pattern: interface Props extends HTMLAttrs<T> {}
			'@typescript-eslint/no-unused-expressions': 'off', // void x fire-and-forget is used intentionally

			// General quality
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'prefer-const': 'error',
			'no-var': 'error',
		},
	}
)
