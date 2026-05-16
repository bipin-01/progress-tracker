# Prompt Route Detailed Task Log

Use this file before every `/prompt` route task. The default decision is that the task probably needs more teaching content, stronger real-life examples, and a clearer practice loop. Treat "no more content needed" as the exception, not the rule.

## Decision Rule

- 70% default: add more relevant content, a real scenario, an example, and a practice action.
- Keep upgrades useful, not decorative. If the change only looks futuristic but does not help the learner practice, skip it.
- Every major `/prompt` task should answer: What is the learner trying to do, what evidence do they have, what mistake could happen, what output should they produce, and how will they know they are improving?
- Prefer scenario-based SOC practice over abstract prompt theory.
- Keep the UI cyber/futuristic, but make interaction quieter, smoother, and easier to scan.

## Content Quality Checklist

- Does the lesson explain the concept from zero?
- Does it include a realistic SOC or cybersecurity scenario?
- Does it show evidence and missing evidence separately?
- Does it include a concrete lab action, not only reading?
- Does it include reflection questions?
- Does it include a future-facing upgrade that could become an AI coach, eval system, telemetry loop, or automation guardrail?
- Does the UI reveal the content progressively instead of dumping everything at once?

## Work Log

### 2026-05-16 - Daily Bootcamp Depth + Smooth Task UX

Problem observed:
- Daily tasks opened, but the content still felt too generic for a serious 90-day prompt engineering bootcamp.
- Task cards did not carry enough real-life pressure, incident evidence, or practical lab steps.
- Transitions were functional but not polished enough for a futuristic training route.

Decision:
- More content was needed. This matched the 70% default rule because the task surface lacked scenario depth and a full practice loop.

Implemented:
- Added `prompt_detailed_task.md` as the permanent reference file for future `/prompt` decisions.
- Expanded daily task data with real-world SOC scenarios, evidence packets, time pressure, success moves, practice labs, reflection prompts, and futuristic upgrade notes.
- Added scenario-driven examples for alert triage, phishing analysis, malware synthesis, SIEM hunting, incident timeline, executive briefing, prompt evaluation, agent handoff, retrieval grounding, and red-team defense.
- Updated the Daily Bootcamp panel to show real-life scenario, evidence packet, practice lab, reflection prompts, and future upgrade content.
- Added smoother panel entrance animation, hover transitions, active task emphasis, and calmer content grouping.

Next likely upgrade:
- Add an in-route "task journal" that lets the learner write their answer under each daily task, compare it against a rubric, and save v1/v2/v3 prompt attempts per day.
