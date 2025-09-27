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

2. In a first terminal build and launch the shell in watch mode alongside the Express static host:

   ```bash
   npm run dev:shell
   ```

   This starts Webpack in watch mode and serves the compiled assets from `src/shell-app/server/shell-server.js` on
   [http://localhost:4300](http://localhost:4300).

3. In a second terminal build and serve the sample microfrontend:

   ```bash
   npm run dev:microfront
   ```

   The Operations reports plugin is exposed on [http://localhost:4400](http://localhost:4400). Once its bundle and manifest are available the
   plugin acknowledges the shell via `POST /api/microfrontends/ack`. The shell persists acknowledgement data in
   `src/shell-app/server/data/microfrontends.json` and exposes it through `GET /api/microfrontends` so the React application can lazy-load the
   remote module when its route is visited.

4. Visit [http://localhost:4300](http://localhost:4300) to use the shell. The navigation will automatically display the
   "Operations reports" page contributed by the microfrontend and render it on demand.

5. For a one-off production build run:

   ```bash
   npm run build
   ```

   The command builds both the shell and every microfrontend defined in `microfrontends/`.

6. Lint and format the source when required:

   ```bash
   npm run lint
   npm run format
   ```

## Key scripts

- `npm run dev` – Starts both the shell and the sample microfrontend in watch mode (equivalent to running the two dev scripts in
  parallel).
- `npm run start` – Runs the compiled shell assets behind the Express server.
- `npm run start:microfront` – Serves the pre-built Operations reports microfrontend and replays acknowledgement pings to the shell.
- `npm run build:shell` / `npm run build:microfront` – Targeted builds for the shell or a single microfrontend package.

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

- `src/shell-app/` – Shell React application and Express server organised into `client/` and `server/` packages.
- `src/microfrontends/` – Source for microfrontend clients and their Express hosts, grouped by feature name.
- `src/microfrontends/operations-reports/` – Source, build configuration, manifest, and distribution artefacts for the Operations reports plugin.
- `webpack.config.ts` – Shell build configuration for TypeScript, React, CSS, and PostCSS.
- `.eslintrc.cjs`, `.prettierrc.cjs` – Linting and formatting configuration shared across the monorepo.

The UIF dependencies are pinned to the latest releases and TypeScript module declarations under `src/types/` keep the compiler
happy even before packages are fetched locally.
