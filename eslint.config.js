import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Disable ESLint rules that conflict with Prettier's formatting.
  prettier,
  {
    // The whole project runs on Node (CLI binary, e2e scripts, tests).
    languageOptions: { globals: { ...globals.node } },
    rules: {
      // Unused bindings are an error, but a leading underscore marks one as
      // intentionally unused (e.g. an interface-mandated parameter a given agent
      // doesn't need, like claude's `_defaultModel`).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
