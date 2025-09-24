# Enterprise App Optimization

This project bootstraps the [KasperskyLab UIF quick-start example](https://github.com/KasperskyLab/uif/tree/master/examples/quick-start)
while modernizing the tooling stack. The original template uses Vite; this starter replaces it with a Webpack based
build optimized for enterprise environments that require explicit bundler configuration.

The application mirrors the quick-start demo shell, including:

- A sidebar navigation that exposes monitoring, management, and administration menu groups.
- The enterprise optimization dashboard with KPI cards, task and activity panels, and contextual placeholders for
  secondary sections.
- A guided footer with documentation and escalation entry points.

## Getting started

1. Install dependencies (requires access to the private UIF packages):

   ```bash
   npm install
   ```

2. Launch the development server:

   ```bash
   npm start
   ```

   The dev server runs on [http://localhost:5173](http://localhost:5173) by default.

3. Build a production bundle:

   ```bash
   npm run build
   ```

4. Lint and format the codebase:

   ```bash
   npm run lint
   npm run format
   ```

   Both commands rely on ESLint, TypeScript-aware rules, and Prettier. Package installation is required before they can be executed.

## Project structure

- `public/` – HTML template injected by Webpack.
- `src/` – TypeScript source code mirroring the UIF quick-start layout (entry point, application shell, dashboard
  components, and lightweight type declarations for UIF React bindings).
- `src/components/` – Layout shell, sidebar navigation, and dashboard building blocks copied from the quick-start
  reference implementation.
- `webpack.config.ts` – Webpack configuration tuned for TypeScript, React, CSS, and PostCSS with autoprefixer.
- `.eslintrc.cjs`, `.prettierrc.cjs` – Linting and formatting rules shared across the project.

## Notes

- UIF libraries are referenced via `latest` tags so the starter automatically tracks the most recent releases.
- Module declarations in `src/types/uif.d.ts` make the project compile even when UIF packages are not locally
  installed yet.
- You may extend the configuration with organization-specific optimizations such as aliases, environment variable
  injection, or additional loaders depending on your deployment target.
- ESLint is pinned to the latest 8.x series so existing `.eslintrc`-based setups continue to work without migrating to
  the new flat configuration introduced in ESLint 9.
