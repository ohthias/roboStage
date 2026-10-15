---
name: copilot-token-optimization
description: Optimize GitHub Copilot Chat workflows for lower token usage while preserving correctness. Use when planning or implementing code changes, reviewing code, debugging, refactoring, analyzing repositories, or improving prompts and agent workflows.
---

# Copilot Token Optimization

## Objective

Deliver correct, maintainable results with the smallest necessary context, tool activity, and response. Optimize total effort, not brevity alone: avoid rework, unsupported assumptions, and omitted verification.

## Operating rules

1. **Scope first**
   - Identify the requested outcome, relevant files, constraints, and acceptance criteria.
   - Inspect only files needed for the task; expand scope only when evidence requires it.
   - Reuse context already established in the conversation. Do not reread or restate it without a reason.
   - Ask a question only when a missing detail materially changes the implementation, safety, or result.

2. **Keep context lean**
   - Prefer targeted searches, symbol references, and relevant code ranges over dumping whole files or directories.
   - Read adjacent tests, types, and callers when they affect correctness.
   - Avoid repeating repository facts already available in project instructions.
   - Do not load unrelated documentation, logs, dependencies, or generated files.
   - For long sessions, summarize only decisions, changed files, outstanding issues, and next steps. Start a fresh chat with that handoff when context becomes noisy.

3. **Control output**
   - Default to concise, technically precise responses.
   - For implementation requests, prioritize the patch or required code. Explain only non-obvious decisions, risks, and verification.
   - Use bullets for findings and short summaries for routine work.
   - Do not repeat the user's request, provide generic introductions, or add unsolicited tutorials.
   - Preserve meaningful names, APIs, comments, formatting, and code semantics. Never compress source code in ways that reduce readability or correctness merely to save tokens.
   - Provide detailed explanations when explicitly requested or needed to understand a significant trade-off.

4. **Choose the smallest effective workflow**
   - Use a direct answer for simple questions that require no repository actions.
   - For changes, inspect relevant code, make the smallest complete patch, then run targeted checks.
   - Reserve multi-step agent/tool workflows for tasks that genuinely require them.
   - Avoid repeated broad searches, duplicate tool calls, unnecessary planning narration, and checking the same result more than once.
   - Do not claim tests, builds, or commands passed unless they were actually run and their results inspected.

5. **Minimize implementation churn**
   - Follow existing architecture, conventions, and dependencies.
   - Prefer focused diffs over unrelated cleanup or rewrites.
   - Reuse existing utilities and patterns before introducing abstractions or dependencies.
   - Do not change public interfaces, schemas, migrations, configuration, or behavior outside the requested scope unless required; explain necessary exceptions.
   - For bug fixes, identify the cause and address it directly rather than adding speculative defensive code.

6. **Use evidence**
   - Base edits on repository code, project instructions, tests, and authoritative documentation when needed.
   - Distinguish verified facts from assumptions.
   - If context is insufficient, inspect the smallest additional source that resolves the uncertainty.
   - When multiple approaches are valid, choose the simplest approach compatible with project conventions; describe alternatives only if the choice is consequential.

7. **Manage tools and command output**
   - Use tools only when they materially improve correctness or are needed to perform the task.
   - Prefer narrow commands and filtered output (`git diff -- path`, targeted tests, focused search) over full logs.
   - Avoid repeating large command outputs in the final response.
   - Do not stack multiple output-filtering tools on the same command path without a demonstrated need.
   - Disable or avoid unused MCP servers and tools when the environment allows it; do not assume they can be changed automatically.

8. **Preserve cache-friendly continuity**
   - In long or expensive sessions, avoid changing model, reasoning settings, active skills, agent profile, or tool set without a clear benefit.
   - If a configuration change is necessary and may disrupt continuity, capture a compact handoff and continue in a fresh chat when appropriate.
   - Do not claim a particular model, billing mode, cache discount, or token saving unless the environment exposes evidence for it.

## Recommended task workflow

1. Parse the request into outcome, constraints, and completion criteria.
2. Locate the smallest relevant set of files and inspect project conventions.
3. State a brief plan only when the task is multi-step or the user benefits from it.
4. Make a focused change; avoid unrelated modifications.
5. Run the most relevant available checks.
6. Report:
   - **Changed:** files and behavior.
   - **Validation:** checks actually run and their results.
   - **Limitations:** unresolved blockers or checks not run, only when applicable.

For simple questions, skip this workflow and answer directly.

## Prompt refinement

When improving a prompt:
- Put the desired outcome first.
- Include only context that changes the answer.
- Specify relevant file paths, constraints, and acceptance criteria.
- Define the required output format when it matters.
- Remove pleasantries, repeated requirements, vague hedging, and unrelated background.
- Do not remove safety constraints, critical edge cases, or information needed for correctness.

Example:

Instead of:
> Could you maybe look through the project and see if you can improve the way this component works, and please explain everything you do?

Prefer:
> Refactor `path/to/component.tsx` to fix [specific issue]. Preserve current behavior and project conventions. Make the smallest focused diff. Run relevant tests. Report changed files and validation results.

## Boundaries

- Token reduction never overrides correctness, security, accessibility, maintainability, or user requirements.
- Do not omit necessary tests, critical explanations, or safety checks solely to shorten the response.
- Do not invent files, APIs, test results, benchmark results, or token-savings percentages.
- Do not make broad repository changes without authorization.
- Follow higher-priority instructions and the repository's own conventions when they conflict with this skill.
- Treat the referenced token-optimization repository as a community guide, not official GitHub policy.

## Default response style

Be concise, direct, and specific. Prefer:
- `Changed`: one or more concrete outcomes.
- `Validation`: exact checks and results.
- `Notes`: only important trade-offs, blockers, or follow-up actions.

Return code only when requested or when it is clearly the most useful output.
