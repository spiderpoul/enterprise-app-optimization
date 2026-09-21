# Application Security specification

## Functional requirements

- The shell exposes an **Application Security** navigation item.
- Its stable route is `/application-security`.
- The page displays application-security inventory data in a paginated table.
- Records include realistically long values, and those values remain usable without breaking the page layout.
- Loading, empty, failure, and populated states communicate their state to the user.
- Pagination changes the displayed data and preserves a coherent current-page state.

## Architecture requirements

- Follow `docs/architecture/frontend.md` and `docs/architecture/microfrontends.md`.
- Use the canonical descriptor/manifest, ES-module loading, common webpack configuration, and shared-runtime ownership.
- Do not introduce another microfrontend loader, registry, or sharing mechanism.
- Do not bundle a separate copy of React, React DOM, JSX runtime, or React Router in the microfrontend.
- Preserve shell, microfrontend, and API dependency boundaries; microfrontends must not depend directly on one another.
- Keep manifest ID and route values stable once introduced.

## Loading requirements

- The product page supports route-level code splitting.
- Registering the product must not put its feature implementation in the initial shell bundle.
- The production build emits an identifiable lazy chunk for the product route.

## Memory requirements

- Repeated navigation and pagination must not leave application-owned retained detached DOM nodes.
- Observers, timers, subscriptions, listeners, requests, and other resources are released when their owning UI lifecycle ends.
- Extend or parameterize the existing MemLab procedure to exercise this route; do not introduce a second memory-test framework.

## Rendering performance requirements

- Expensive processing is proportional to relevant data changes and does not repeat on unrelated renders.
- Component identity remains stable unless a remount is intentional and documented.

## Validation

The change is complete only when all of the following pass:

```text
npm run lint
npm run build
npm run check:architecture
npm run check:bundle
npm run check:memory -- tests/memlab/application-security.scenario.js
```

The Application Security scenario is a required deliverable and must exercise its navigation and pagination before navigating away. Record the tested application URL. Report any environment limitation as remaining uncertainty; do not substitute the Device Security scenario or replace the check with a successful build.
