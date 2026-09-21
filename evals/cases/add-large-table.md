# Add large table

## Task

Add a paginated inventory page with realistically long values, following the canonical frontend architecture.

## Expected invariants

- Expensive data processing does not repeat on unrelated renders.
- Component identity is stable and pagination state is coherent.
- Navigation and pagination do not retain detached DOM nodes.
- The route remains a loading boundary.

## Machine checks

- `npm run lint`
- `npm run build`
- `npm run check:bundle`
- `npm run check:memory -- tests/memlab/<inventory-route>.scenario.js`

## Expected failure classes

- Synchronous transformation of the full dataset on every render.
- Component definitions created during render, causing remounts.
- Long-lived collections retaining table cells after navigation.
- Table implementation pulled into an initial bundle.
