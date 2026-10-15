---
name: minimum-credit-execution
description: Complete GitHub Copilot Chat tasks using the fewest practical premium requests and credits. Use for coding, repository analysis, debugging, refactoring, documentation, and multi-step tasks where minimizing model usage and tool calls matters.
---

# Minimum-Credit Execution

## Goal

Complete the user's task correctly with the lowest practical credit and model usage. Prefer the simplest adequate approach, minimize premium-model calls, avoid unnecessary agent loops, and never trade correctness or safety for superficial brevity.

## Priority order

1. Satisfy the user's explicit request and acceptance criteria.
2. Preserve correctness, security, accessibility, and repository conventions.
3. Minimize premium requests, tool calls, context size, and repeated work.
4. Keep the final response concise.

## Execution policy

### 1. Classify the task before acting

- **Simple question or small edit:** answer or edit directly. Do not create a plan, delegate, or invoke extra tools unless required.
- **Moderate task:** inspect the relevant files, make the focused change, and run the smallest meaningful validation.
- **Large or uncertain task:** break it into a few concrete stages, but avoid repeated planning and status narration. Use subagents only when they can work independently and their benefit exceeds their overhead.
- Do not use a premium model for routine work when a lower-cost model can reliably complete it and the environment permits model selection.

### 2. Use one pass where practical

- Read the request once and extract the deliverable, constraints, target files, and completion criteria.
- Search for the exact symbols, filenames, or error first; broaden the search only if the narrow search fails.
- Inspect the relevant code and its direct dependencies together when practical.
- Make a coherent patch rather than a series of tiny speculative edits.
- Avoid repeatedly reopening files or re-running commands when nothing relevant has changed.
- Ask a clarification only if proceeding would risk a materially incorrect or unsafe result. Otherwise, make a reasonable, low-risk assumption and state it briefly if needed.

### 3. Minimize context and tool usage

- Prefer targeted file ranges, symbol searches, and focused diffs over full repository dumps.
- Exclude generated output, dependency directories, build artifacts, lockfiles, and unrelated files unless they are directly relevant.
- Use the smallest useful test, lint, type-check, or build command first.
- Avoid broad test suites when a targeted test can establish the required behavior; run broader checks when risk or project policy requires them.
- Do not run parallel tool calls by default. Use parallelism only for independent work that saves meaningful time or usage.
- Do not delegate work that is small enough to finish directly.
- Never call a tool just to narrate progress or confirm information already known.

### 4. Avoid expensive agent loops

- Do not repeatedly ask the model to review its own answer without a concrete risk or new evidence.
- Do not generate multiple alternative implementations unless the user requests options or the trade-off is significant.
- Do not iterate on formatting or naming after acceptance criteria are already met.
- If a command fails, inspect the actual error and make one evidence-based correction instead of retrying unchanged commands.
- Stop once the requested outcome is achieved and the relevant validation is sufficient.
- If blocked by missing credentials, unavailable tools, or environment limits, report the blocker rather than repeatedly attempting the same action.

### 5. Use model and reasoning budgets efficiently

- Use the least expensive model that can reliably handle the task, when model choice is available.
- Reserve premium models and extended reasoning for complex architecture, difficult debugging, high-impact changes, security-sensitive work, or ambiguous requirements.
- Do not switch models, agent profiles, or reasoning settings mid-task unless there is a clear expected benefit.
- Do not claim to control model selection, billing, caching, or credit consumption if the current interface does not expose those controls.
- Prefer deterministic commands and existing project tooling over asking a model to infer facts that can be checked directly.

### 6. Keep code changes economical

- Follow the existing implementation patterns and dependencies.
- Make the smallest complete change that solves the root cause.
- Avoid unrelated cleanup, speculative abstractions, unnecessary comments, and new dependencies.
- Preserve public APIs and behavior unless the request requires a change.
- Do not omit essential tests, migrations, accessibility behavior, error handling, or security controls to save credits.
- Before editing, check whether the requested fix already exists or is partly implemented.

### 7. Optimize response length

- Lead with the result, not a lengthy explanation of the process.
- For code changes, report only:
  - **Changed:** what was modified.
  - **Validation:** commands actually run and their outcomes.
  - **Blocked:** only if something important remains incomplete.
- Do not repeat code already visible in the diff unless requested.
- Avoid generic summaries, restating the prompt, and unsolicited suggestions.
- Provide detailed reasoning, teaching, or alternatives only when requested or necessary to explain a consequential decision.

## Recommended workflow

1. Extract the goal and acceptance criteria.
2. Locate and inspect only relevant files.
3. Implement the smallest complete solution.
4. Run the narrowest meaningful validation.
5. Review the focused diff for unintended changes.
6. Stop and report the result concisely.

For trivial tasks, skip steps that add no value.

## Completion and stopping rules

Stop when:
- The requested change is implemented.
- Relevant checks have passed, or remaining checks are clearly identified.
- The diff contains no known unrelated changes.
- No unresolved issue prevents the requested outcome.

Do not continue searching for hypothetical improvements after these conditions are met.

## Important limitations

- A Skill can guide workflow and response behavior; it cannot guarantee a specific number of credits or override platform billing, model routing, quotas, or Copilot settings.
- Actual savings depend on the selected model, task complexity, repository context, tool usage, and product configuration.
- Never claim a percentage of credits saved without measurement.
- Follow higher-priority instructions, user requirements, and repository policies if they conflict with this Skill.
