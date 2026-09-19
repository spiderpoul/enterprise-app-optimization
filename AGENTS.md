# Enterprise App Optimization

Nx monorepo with a shell and independently hosted microfrontends. Use Node.js 22 or newer.

## Structure

- `src/shell-app`: host client and discovery/proxy server.
- `src/microfrontends/<name>/client`: a React plugin bundle.
- `src/microfrontends/<name>/server`: the plugin API and static host.
- `src/microfrontends/<name>/manifest.json`: discovery contract presented to the shell.
- `src/microfrontends/common`: shared bootstrap and webpack helpers.

## Working rules

- Inspect an existing microfrontend before creating or changing one.
- Keep client and server project names aligned as `<name>-client` and `<name>-server`.
- Register every project in `nx.json` and every workspace package in the root `package.json`.
- Do not add direct dependencies between microfrontends.
- Treat manifest IDs and route paths as stable public contracts.
- Read `docs/architecture/microfrontends.md` before changing discovery, routing, manifests, or plugin layout.

## Verification

Run `npm run check` before finishing repository changes. If the full build is intentionally skipped, state which target was skipped and why.
