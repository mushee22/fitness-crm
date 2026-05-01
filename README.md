# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# fitness-crm

## Automated Sessions Flow

The admin panel includes an `Automated Sessions` section for managing recurring daily session rules.

### UI flow

- Open `Automated Sessions` from sidebar.
- Use `Create Rule` to add a recurring rule.
- Use row actions to `Edit`, `Pause`, `Resume`, or `Cancel` a rule.
- Filter list by `All`, `Active`, or `Paused`.
- Pagination is server-driven (`page`, `per_page`).

### API mapping

- `GET /api/automated-sessions?is_active=1&per_page=15` -> list rules (`automatedSessionsService.getRules`)
- `POST /api/automated-sessions` -> create rule (`automatedSessionsService.createRule`)
- `GET /api/automated-sessions/{id}` -> fetch one rule (`automatedSessionsService.getRule`)
- `PATCH /api/automated-sessions/{id}` -> update rule (`automatedSessionsService.updateRule`)
- `POST /api/automated-sessions/{id}/pause` -> pause rule (`automatedSessionsService.pauseRule`)
- `POST /api/automated-sessions/{id}/resume` -> resume rule (`automatedSessionsService.resumeRule`)
- `DELETE /api/automated-sessions/{id}` -> cancel rule (`automatedSessionsService.cancelRule`)

### Validation and error handling

- Client-side checks:
  - `end_time` must be after `start_time`
  - `ends_on` must be the same day or after `starts_on`
- API `422` validation errors are shown inline in the rule form.
- All mutations show loading states and success/error toast feedback.
