# Canonical frontend invariants

These invariants describe required outcomes. They deliberately do not prescribe a particular React API or optimization technique.

## Component identity

Component identity must remain stable unless remounting is intentional. Do not create component types as a side effect of rendering another component: an unrelated render must not reset local state, effects, or DOM ownership.

## Render cost

Expensive synchronous work must not execute repeatedly as a consequence of unrelated renders. Keep derived work proportional to the data that changed and verify behavior with profiling or a focused reproduction before choosing an optimization.

## Ownership and lifecycle

The component or service that acquires a resource owns its cleanup. Timers, subscriptions, observers, requests, event listeners, and references into the DOM must stop or be released when that ownership ends. Long-lived application state must not retain detached DOM nodes.

## Routing boundaries

A product page is a loading boundary. Page implementation should be loaded only when its route is needed; registering a route or navigation item must not pull feature code into the initial shell bundle.

## Dependency boundaries

The shell owns application-wide concerns and the shared browser runtime. Microfrontends own their product UI and API integration, must not import one another, and communicate with the shell only through the manifest, route module, and documented server contracts. See [microfrontends.md](./microfrontends.md) for the runtime contract.

## History behind these rules

The React performance sequence from PR #24 to PR #54 exposed unstable component types, remounts, and repeated synchronous work. The memory sequence PR #28 → #36/#38 → #55 turned detached-DOM retention from an observed problem into a reproducible MemLab check. These histories motivate the invariants; their individual implementation choices are not universal rules.
