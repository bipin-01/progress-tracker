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

### 2026-05-16 - Automatic Journal Coach Scan

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the journal made tasks trackable, but did not yet teach from the saved attempt.

Problem observed:
- Journal attempts were saved, but the learner still had to judge quality manually.
- The app had enough static task content, but the saved work did not receive immediate coaching about missing prompt controls.
- The future-facing idea of telemetry/evals was visible in copy, but not reflected in the task workflow.

Decision:
- More relevant, scenario-based feedback infrastructure was needed. This fit the 70% rule because serious prompt training should turn each saved attempt into evidence for the next revision.

Implemented:
- Added automatic coach feedback for daily task journal attempts using the local prompt analyzer.
- Each saved attempt now stores detected controls, missing controls, coach score, readiness label, automation gate, and next revision guidance.
- Added a live Coach Scan inside the Journal panel so the learner sees feedback before saving.
- Added saved-attempt feedback summaries in journal history.
- Styled feedback as a quiet cyber scan with smoother transitions and readable control chips.

Next likely upgrade:
- Add a day-level mastery ledger that aggregates journal feedback, completed tasks, SRS results, and playground scores into a daily mastery score with trend history.

### 2026-05-16 - Daily Mastery Ledger

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because task-level feedback existed, but the route still lacked a day-level answer to "am I improving?"

Problem observed:
- Daily tasks, journal attempts, coach scans, SRS, and playground work existed as separate signals.
- The user could save artifacts, but the app did not aggregate those artifacts into a clear day-level training score.
- UI/UX still needed a calmer way to show progress beyond raw completion percentages.

Decision:
- More relevant measurement infrastructure was needed. This fit the 70% rule because a serious bootcamp should show mastery, next action, and trend, not only content.

Implemented:
- Added a Daily Mastery Ledger to `/prompt`.
- The ledger aggregates task completion, journal coverage, coach scan score, SRS readiness, and playground/iteration score.
- Added a seven-day mastery trend so the route starts showing progress direction, not only today's status.
- Fixed the trend window to show distinct bootcamp days even at the start of the course, instead of repeating D01.
- Tightened SRS readiness so overdue cards are not treated as mastered unless reviewed on the selected day.
- Added a next-best-action recommendation that changes based on weak signals such as missing journals, low coach score, incomplete tasks, due SRS, or weak lab score.
- Styled the ledger as a quiet cockpit instrument with compact signal cards and animated trend bars.

Next likely upgrade:
- Add mastery history persistence by saving each day's ledger snapshot, then show real trend history instead of recomputing the last seven days from current state.

### 2026-05-16 - Persisted Mastery History

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the mastery score existed, but it still behaved like a temporary dashboard calculation.

Problem observed:
- The Daily Mastery Ledger computed a useful score, but it did not create a durable day-by-day record.
- The trend bars were still mostly derived from current state, which made progress feel less like a real bootcamp history.
- The learner had no explicit ritual for closing a training day and saving the evidence trail.

Decision:
- More tracking infrastructure was needed. This fit the 70% rule because real mastery requires a saved checkpoint, visible trend history, and a reviewable archive rather than another static explanation block.

Implemented:
- Added persisted mastery history to `/prompt` local memory with backwards-compatible loading for existing users.
- Added a lock/update checkpoint action to the Daily Mastery Ledger.
- Changed the seven-day trend to distinguish locked checkpoints, the current draft day, and empty days with calmer visual states.
- Added a compact archive summary showing history average, best day, latest checkpoint, and total archived days.
- Kept the UI cyber/futuristic but quieter by using small status labels, dashed draft bars, muted empty bars, and smooth hover transitions.

Next likely upgrade:
- Add a checkpoint review drawer that opens any locked day and shows the exact weak signal, saved journal attempts, and recommended next drill for that day.

### 2026-05-16 - Checkpoint Review Drawer

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because saved mastery history existed, but the learner could not yet inspect why a locked day scored the way it did.

Problem observed:
- Locked checkpoints showed score history, but the score did not explain the exact weakest training signal.
- The learner could not open a locked day to see saved journal attempts or decide what to practice next.
- UI/UX still needed a smoother path from "I see a weak day" to "load the next drill and improve it."

Decision:
- More relevant review content and a practice loop were needed. This fit the 70% rule because mastery history is only useful if each saved day becomes a coachable artifact with evidence, attempts, and a next action.

Implemented:
- Added a checkpoint review drawer for locked mastery days.
- Locked trend bars and the latest archive can now open a day review.
- The drawer identifies the weakest signal across task closure, journal evidence, coach score, SRS readiness, and lab score.
- The drawer lists saved journal attempts from that day and lets the learner send any attempt back into the prompt lab.
- Added a recommended next drill with realistic SOC scenario context, evidence snippets, and a one-click load into the daily journal.
- Styled the drawer with quieter locked/draft/empty trend states, compact review cards, smooth entrance animation, and responsive layout behavior.

Next likely upgrade:
- Add a checkpoint comparison mode that compares two locked days, explains what improved or regressed, and generates a targeted 3-step recovery plan.
