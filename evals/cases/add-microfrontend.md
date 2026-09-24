# Add microfrontend

## Task

Add a product microfrontend and register it with the shell using the repository's current contracts.

## Expected invariants

- Canonical descriptor, ES-module loading, common webpack helper, and window externals are preserved.
- Client/server project names and workspace registrations remain aligned.
- The shell owns React/router runtimes, and microfrontends do not depend on one another.
- Stable manifest identity and route contracts are present.

## Machine checks

- `npm run check:architecture`
- `npm run check:bundle`
- `npm run lint`
- `npm run build`

## Expected failure classes

- New Module Federation or script-loader runtime.
- Project-local webpack configuration that bypasses the common helper.
- Bundled React/router copy or direct sibling-microfrontend import.
- Missing or inconsistent Nx/workspace/manifest registration.
