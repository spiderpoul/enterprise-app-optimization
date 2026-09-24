# Microfrontend architecture

This document is the source of truth for the current runtime. Similar-looking code in a historical commit is not a template unless it matches this contract.

## Canonical runtime

The shell server discovers independently hosted microfrontends and exposes normalized descriptors through `/api/microfrontends`. The shell client loads each descriptor's `entryUrl` with runtime `import()`, resolves the exported React Router `RouteObject`, and adds it to the shell route tree.

Each microfrontend:

- declares its stable ID, route, entry, menu label, and API proxy in `src/microfrontends/<name>/manifest.json`;
- builds through `src/microfrontends/common/webpack/createMicrofrontendConfig.cjs`;
- produces an independently hosted ES-module entry and uses the common server bootstrap;
- is registered as aligned `<name>-client` and `<name>-server` Nx projects and root workspaces;
- does not import another microfrontend.

Do not add an alternative registry, script injector, federation container, or project-local copy of the common webpack/runtime setup.

## Runtime ownership and shared dependencies

The shell owns React, React DOM, JSX runtimes, React Router, and React Router DOM. Microfrontend bundles resolve those packages through the canonical `window` externals declared by the common webpack helper. A microfrontend must not bundle another React runtime or define its own sharing mechanism.

Product-specific libraries may be bundled by a microfrontend. Promoting another package to an application-wide external requires an explicit architecture change, compatible provisioning by the shell, and architecture/bundle validation.

## Loading

Discovery identifies available products; it does not make all product implementation part of the initial shell bundle. Feature routes should preserve route-level loading boundaries. The manifest route is a public fallback and must agree with the route exported by the module.

## Historical approaches

The repository history contains several plausible but non-canonical designs:

- PR #25 introduced Module Federation sharing; PR #26 reverted it.
- PR #27 and PR #29 explored broader singleton/eager shared-module mappings.
- PR #31 moved microfrontends to `window` externals, which is the basis of the current runtime.
- PR #33 explored registry/script loading and PR #34 reverted that particular integration.

A revert records a decision in its context, not a timeless prohibition. Conversely, code that survived in a neighboring or historical implementation is not automatically canonical. Propose contract changes in this document first and update the executable architecture check with them.
