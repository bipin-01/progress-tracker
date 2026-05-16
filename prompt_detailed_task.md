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

### 2026-05-16 - Guided Mission Console + Rubric Depth

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and decided more content was needed because the daily task detail still lacked coaching depth, anti-pattern repair, rubric language, and progressive reveal.

Problem observed:
- The task cards had scenario content, but the learner still had to read it as one large expansion.
- The content explained what to do, but did not teach enough like a coach: no mentor script, no explicit bad prompt, no failure mode, no repair move, and no weak-vs-strong grading rubric.
- UI transitions existed, but the interaction did not yet feel like a guided training flow.

Decision:
- More relevant content and a more guided UI were needed. This fit the 70% rule because a serious bootcamp task should include scenario, evidence, mistake, repair, practice, rubric, and future system thinking.

Implemented:
- Added mentor walkthroughs to each daily task so the learner gets coaching before practicing.
- Added deliverables so every task has a concrete artifact to produce.
- Added anti-patterns with bad prompt, failure mode, and repair move for every task type.
- Added weak-vs-strong rubrics for learning, building, iterating, evaluating, and review tasks.
- Rebuilt the daily task detail UI into four progressive panels: Mission, Lab, Rubric, and Future.
- Added smoother panel transitions and active tab states so switching sections feels intentional instead of jumpy.

Next likely upgrade:
- Add an in-route task journal with saved learner answers, rubric self-score, and v1/v2/v3 prompt history per day. This would make the bootcamp trackable, not just readable.

### 2026-05-16 - Trackable Daily Task Journal

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and decided the route needed a more relevant practice loop, not just more static explanation.

Problem observed:
- The task content was richer, but the learner still had no built-in place to do the work.
- Daily task progress could be marked done, but the app did not capture the actual prompt attempt, self-score, or revision note.
- The UI had progressive Mission/Lab/Rubric/Future panels, but no trackable work surface connecting those panels to the live prompt lab.

Decision:
- More task infrastructure was needed. This fit the 70% rule because serious bootcamp content should produce saved artifacts and measurable attempts, not just reading.

Implemented:
- Added a new Journal panel to every daily task.
- Added persistent task journals to prompt academy local memory.
- Each task journal now stores the learner answer, self-score, version note, timestamp, and the last six saved attempts.
- Added buttons to pull the current playground prompt into the task journal, send the journal answer back to the lab, and save a versioned attempt.
- Styled the journal as a compact workstation with smooth hover/focus states and quiet history cards.

Next likely upgrade:
- Add automatic task feedback: when a journal attempt is saved, run the local prompt analyzer against it and attach detected controls, missing controls, and a suggested next revision directly to the saved attempt.
