# Agent-adoption eval cases

This directory is a small, versioned dataset for comparing the same model and tasks against a baseline repository and the agent-ready repository. It is not an eval runner or scoring platform.

For a comparison, hold the model, settings, task text, starting commit, and environment constant. Record produced changes, commands, machine-check output, and remaining uncertainty. Judge observable invariant compliance rather than implementation resemblance or prose style. Run trials independently; do not leak harness documentation into the baseline condition.

The cases name expected failure classes so a reviewer can inspect them consistently. They do not authorize merging historical performance PRs or changing a failing baseline.

## Input and evaluator oracle

Only the **Task** section of a case may be used as input to an agent. **Expected invariants**, **Machine checks**, and **Expected failure classes** are the evaluator oracle and must remain hidden from the baseline agent until its work is complete. Evaluate both conditions with the same oracle after completion.

When the baseline commit does not contain a harness command, the evaluator runs the closest available independent verification after the agent finishes. Do not tell the baseline agent that a script is missing, provide the agent-ready command as a hint, or otherwise use the absence of harness files to reveal the expected solution.
