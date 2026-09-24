# Enterprise App Optimization

Use Node.js 22 or newer. This Nx monorepo contains a shell and independently hosted React microfrontends.

## Repository map

- Architecture: `docs/architecture/`
- Performance: `docs/performance.md`
- Change specifications: `openspec/changes/`
- Agent skills: `.agents/skills/`
- Shell: `src/shell-app/`
- Microfrontends: `src/microfrontends/`

When repository documentation and neighboring legacy code disagree, treat canonical architecture documentation as the source of truth.

## Validation

- `npm run check` — architecture, lint, and build validation
- `npm run check:architecture` — microfrontend architecture invariants
- `npm run check:bundle` — bundle/loading regression gate
- `npm run check:memory -- tests/memlab/<route>.scenario.js` — explicit route-specific MemLab scenario

Follow the validation required by the active specification. Do not report a change as complete while validation required by its spec is failing.
