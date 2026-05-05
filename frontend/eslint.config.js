import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, confirm: 'readonly', alert: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Common, intentional pattern in this codebase: load data inside an effect.
      // The new eslint-plugin-react-hooks rule is overly strict for this case.
      'react-hooks/set-state-in-effect': 'off',
      // Context providers commonly export both the component and a hook.
      'react-refresh/only-export-components': 'off',
      'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    },
  },
])
