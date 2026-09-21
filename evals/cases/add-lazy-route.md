# Add lazy route

## Task

Add a product route whose implementation loads only when the user visits it.

## Expected invariants

- Route-level code splitting emits an identifiable asynchronous chunk.
- Feature implementation is absent from the initial shell bundle.
- Navigation and error behavior remain correct.

## Machine checks

- `npm run check:bundle`
- `npm run lint`
- `npm run build`

## Expected failure classes

- Static feature import from the initial route tree.
- No asynchronous chunk, or an unidentifiable feature chunk.
- Initial asset growth beyond the reviewed baseline tolerance.
