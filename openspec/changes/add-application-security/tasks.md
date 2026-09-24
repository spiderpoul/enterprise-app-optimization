# Implementation tasks

1. Read the repository entry point and canonical frontend, microfrontend, and performance contracts.
2. Inspect one current microfrontend end to end: manifest, client route export, shared webpack helper, server, Nx registration, and root workspace registration.
3. Add the Application Security product route, shell navigation entry, inventory data flow, and required user states.
4. Verify architecture boundaries and runtime ownership with `npm run check:architecture`.
5. Verify the route loading boundary and baseline impact with `npm run check:bundle`; investigate any regression rather than weakening the gate.
6. Add a route-specific scenario using the reusable MemLab helper, exercise navigation and pagination, and run `npm run check:memory -- tests/memlab/application-security.scenario.js`.
7. Run lint and the full build, fix detected regressions, and report executed checks, results, failures, and remaining uncertainty.
