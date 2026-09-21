# Practical demo guide

This guide is for the speaker running the live portion. It is not an implementation prompt for the coding agent.

## Message

The demonstration compares engineering environments, not model intelligence:

`repository knowledge → spec → bounded context → executable constraints → feedback loop`

Use the same internal model for both runs. Keep model settings and the product task constant, and explain that the repository harness is the independent variable.

## Preparation

1. Keep the existing performance PRs (#52–#55 and #64) open for archaeology.
2. Prepare two clean checkouts without merging those PRs: `main` for the baseline and `demo/agent-ready` for the harness run.
3. Install dependencies with Node.js 22 or newer, as declared by the root `package.json` engine, and confirm the documented validation commands behave as described.
4. Warm any local build caches consistently or clear them for both runs; do not compare unlike cache states.
5. Record the commit, model configuration, prompt, commands, timings, and artifacts for each run.

## Run A — baseline

Start from `main`. Use this exact prompt:

> Add a new Application Security page and microfrontend like the neighboring implementation.

Do not reveal the harness documents or evaluator oracle. Observe which plausible historical patterns it copies, what it validates, and where it declares completion.

## Run B — agent-ready

Start from `demo/agent-ready`. Use this exact prompt:

> Implement `openspec/changes/add-application-security/`.

Let the agent navigate from `AGENTS.md`, classify performance impact with the skill, and use the executable checks. Avoid coaching it toward a particular implementation.

## 20-minute flow

| Time | Segment |
| --- | --- |
| 0–2 | Introduce the product task and start Run A. |
| 2–5 | Show agent exploration and ambiguity in neighboring legacy code. |
| 5–7 | Use PR archaeology to expose multiple plausible historical approaches. |
| 7–9 | Introduce `AGENTS.md` and canonical architecture as repository knowledge. |
| 9–11 | Show OpenSpec as the product and definition-of-done contract. |
| 11–14 | Start Run B with the exact prompt and follow its repository navigation. |
| 14–17 | Show architecture, bundle, and route-specific memory feedback loops. |
| 17–18 | Show the performance skill selecting checks rather than encoding architecture. |
| 18–20 | Explain the hidden eval oracle and conclude with harness-driven differences. |

## Evidence to show

Compare observable outcomes rather than prose quality:

- architecture/runtime chosen;
- route chunking and initial-bundle result;
- rendering work during unrelated updates;
- MemLab result after navigation/pagination;
- failed checks found and corrected before completion;
- remaining uncertainty explicitly reported.

Use PR history to explain why neighboring code is insufficient context: the repository has contained Module Federation, eager/singleton sharing, window externals, registry loading, and reverts. Then show how current documentation plus checks resolves that ambiguity.

## Guardrails

Do not merge performance PRs merely to make the demo pass. Do not create the Application Security implementation while preparing the harness. Do not present one run as a statistically meaningful model benchmark; these are two representative, independently recorded demonstrations.

## Fallback plan

Prepare four artifacts from a rehearsal and keep them independent of live model availability:

- a saved trace of each agent's repository exploration;
- a saved diff for Run A and Run B;
- output from a representative failed executable check with its actionable diagnosis;
- output from the successful checks after correction.

If a live run stalls or behaves nondeterministically, switch to the corresponding saved artifact and continue the same timeline. The conclusion must rest on inspectable diffs and checks, not on the model producing a particular live performance.
