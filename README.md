# Enterprise App Optimization

The Enterprise App Optimization project now acts as a microfrontend shell on top of the UIF quick-start demo. The shell is
responsible for serving the core dashboard experience, exposing a discovery API for plugin teams, and lazily rendering any
registered microfrontends. Each remote microfrontend is served by its own Express static host and acknowledges itself with the
shell when it becomes available.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the entire workspace in watch mode with Nx:

   ```bash
   npm run dev
   ```

   The command orchestrates four long-running targets via Nx:

   - `shell-client:serve` – Webpack dev server for the shell UI on [http://localhost:5173](http://localhost:5173).
   - `shell-server:serve` – Express host that serves the compiled shell bundle on [http://localhost:4300](http://localhost:4300).
   - `operations-reports-client:serve` – Webpack dev server for the Operations reports microfrontend on [http://localhost:4400](http://localhost:4400).
   - `operations-reports-server:serve` – Express wrapper that serves the remote bundle and manifest for integration testing.

   Each project has its own `package.json` and dependency tree, and Nx keeps build outputs isolated under the corresponding workspace folder.

3. Visit [http://localhost:4300](http://localhost:4300) to use the production-like shell. Authenticate with any username and the shared
   `optimize` password to access the dashboard and registered microfrontends.

4. For a one-off production build run:

   ```bash
   npm run build
   ```

   Nx executes `build` for every project (shell client/server and microfront client/server) so each microfrontend can be shipped independently.

5. Lint and format the source when required:

   ```bash
   npm run lint
   npm run format
   ```

## Key scripts

- `npm run dev` – Boots all Nx `serve` targets (shell UI + server and microfrontend UI + server) in parallel.
- `npm run build` – Invokes `build` for every project managed by Nx.
- `npm run analyze` – Produces bundle analyzer and Statoscope reports for the shell and Operations reports client bundles.
- `npm run lint` / `npm run format` – Run ESLint and Prettier with the shared configuration.

## Architecture highlights

- **Shell discovery API** – `src/shell-app/server/shell-server.js` persists acknowledgements and exposes REST endpoints for discovery and
  lifecycle management. Client-side code fetches `/api/microfrontends` on boot and constructs lazy React routes for each
  registered plugin.
- **Dynamic module loading** – The shell uses `React.lazy` together with dynamic `import()` calls (`webpackIgnore: true`) so that
  remote bundles are fetched only when a user navigates to the corresponding route.
- **Error isolation** – `MicrofrontendBoundary` wraps every remote component to keep failures contained and provide actionable
  feedback in the shell UI.
- **Plugin contract** – Each microfrontend ships a `manifest.json`, serves static assets over Express, and periodically
  acknowledges the shell with the route, menu label, and remote entry URL.
- **Sample microfrontend** – `src/microfrontends/operations-reports` contributes an “Operations reports” page. It demonstrates the contract by
  registering a route, injecting a navigation item, and rendering a standalone React component once the user selects it.

## Project layout

- `src/shell-app/` – Shell React application and Express server organised into `client/` and `server/` packages with their own workspaces.
- `src/microfrontends/` – Source for microfrontend clients and their Express hosts, grouped by feature name.
- `src/microfrontends/operations-reports/` – Source, build configuration, manifest, and Dockerfile for the Operations reports plugin.
- `src/shell-app/client/webpack.config.ts` – Shell build configuration for TypeScript, React, CSS, and PostCSS.
- `nx.json` – Nx workspace configuration describing every project.
- `docker-compose.yml` – Local orchestration for the shell and Operations reports microfrontend images.
- `src/shell-app/Dockerfile` / `src/microfrontends/operations-reports/Dockerfile` – Container definitions for the shell and Operations reports microfrontend.
- `.eslintrc.cjs`, `.prettierrc.cjs` – Linting and formatting configuration shared across the monorepo.

The UIF dependencies are pinned to the latest releases and TypeScript module declarations under `src/types/` keep the compiler
happy even before packages are fetched locally.
