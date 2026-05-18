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

### 2026-05-16 - Checkpoint Comparison Mode

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because checkpoint review worked for one day, but the route still could not explain progress across days.

Problem observed:
- A locked checkpoint could explain its own weak signal, but the learner could not see what changed between two saved training days.
- Score history showed movement without naming which signal improved or regressed.
- The UI needed a smoother bridge from trend history to a concrete recovery plan.

Decision:
- More relevant comparison and scenario-based repair content was needed. This fit the 70% rule because serious bootcamp progress should compare evidence over time, name regressions, and turn them into a practice plan.

Implemented:
- Added checkpoint comparison mode inside the Daily Mastery Ledger.
- The comparison automatically uses the latest locked day and the previous locked day.
- Added signal deltas for task closure, journal evidence, coach score, SRS readiness, and lab score.
- Added regression/improvement labeling, a focused diagnosis, and a targeted three-step recovery plan.
- The recovery plan pulls in the recommended SOC drill and can load that drill directly into the daily journal.
- Styled the comparison as a quiet analysis strip with compact deltas, calm status colors, and responsive layout behavior.

Next likely upgrade:
- Add a prompt evidence packet builder that turns any daily scenario into a reusable structured evidence block, then grades whether the learner's prompt preserved evidence, missing data, constraints, and output schema.

### 2026-05-16 - Prompt Evidence Packet Builder

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the route had strong scenarios, but the learner still had to manually translate messy SOC evidence into a reusable prompt input.

Problem observed:
- Daily scenarios had evidence and missing data, but they were displayed as reading material instead of a reusable packet.
- The journal coach could score generic prompt controls, but it did not grade whether the prompt preserved confirmed evidence, missing evidence, constraints, and schema.
- UI/UX needed a smoother bridge from scenario reading to lab-ready prompt construction.

Decision:
- More scenario-based practice infrastructure was needed. This fit the 70% rule because prompt engineering for SOC work depends on evidence preservation, not only prompt wording.

Implemented:
- Added a Packet panel to every daily bootcamp task.
- Built structured evidence packets from the active SOC scenario with packet id, confirmed evidence, missing data, constraints, output schema, and acceptance tests.
- Added packet preservation grading for confirmed evidence coverage, missing-data preservation, safety constraints, and output-schema coverage.
- Added actions to load the packet prompt into the lab or start the task journal from the packet scaffold.
- Styled the packet builder as a compact workstation with smooth panel transitions, packet score, grade breakdown, reusable packet block, and quiet action controls.

Next likely upgrade:
- Add an evidence packet diff that compares the original packet with the learner's saved journal attempt and highlights exactly which evidence lines were omitted, transformed, or invented.

### 2026-05-16 - Evidence Packet Diff Review

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the Packet panel could build and grade evidence, but it still did not show exactly where a learner's prompt drifted from the packet.

Problem observed:
- Packet preservation score was useful, but too abstract for repair practice.
- Learners needed to see which packet lines were preserved, softened/transformed, omitted, or replaced by unsupported claims.
- UI/UX needed a smoother path from score to revision without forcing the learner to manually compare the packet and journal text.

Decision:
- More scenario-based, real-life repair content was needed. This fit the 70% rule because SOC prompt engineering fails when evidence gets omitted or conclusions are invented under pressure.

Implemented:
- Added an evidence packet diff engine for `/prompt`.
- The diff compares the active evidence packet against the current journal answer or lab prompt.
- Added status detection for preserved, transformed, and omitted packet lines across confirmed evidence, missing data, constraints, and output schema.
- Added heuristic detection for risky invented claims such as over-certainty, unsupported severity, unsupported malware/exfiltration conclusions, and unsafe containment leaps.
- Added a compact Packet panel diff readout with score, counts, omitted lines, transformed lines, invented claims, and a next repair action.
- Replaced the passive "grade journal prompt" action with a "load diff repair" action that pushes a structured repair checklist into the journal.
- Styled the diff as a quiet green analysis layer with responsive grids and the existing smooth panel transition language.

Next likely upgrade:
- Add a packet-safe rewrite preview that takes the diff repair checklist and generates a side-by-side v1/v2 prompt comparison before the learner saves a new attempt.

### 2026-05-16 - Packet-Safe Rewrite Preview

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the diff review could identify drift, but the learner still had to imagine what a repaired prompt should look like.

Problem observed:
- The Packet panel could show omitted, transformed, and invented lines, but repair still required manual translation.
- The journal could receive a checklist, but there was no preview of the safer v2 prompt before overwriting or saving work.
- UI/UX needed a smoother revision loop from "diagnose" to "compare" to "apply".

Decision:
- More scenario-based repair content was needed. This fit the 70% rule because a serious prompt bootcamp should teach revision by showing before/after transformations, not only flagging errors.

Implemented:
- Added a deterministic packet-safe rewrite preview for `/prompt`.
- The preview creates a side-by-side v1 current draft and v2 packet-safe prompt using the active SOC scenario, evidence packet, constraints, schema, and acceptance tests.
- Added before/after scoring, rewrite lift, verdict, and four concrete change explanations: authority boundary, missing-data handling, output contract, and claim gate.
- Added repair moves summarizing how omissions, weak transformations, and invented claims are fixed.
- Added actions to preview v2 in the lab or apply v2 directly to the journal with an updated version note and self-score.
- Styled the preview as a compact comparison workstation with smooth entry, scroll-safe prompt panes, quiet score lift, and responsive grids.

Next likely upgrade:
- Add a scenario stress-test harness that runs the packet-safe v2 prompt against alternate evidence packets, including missing logs, contradictory evidence, and executive-pressure wording, then reports whether the prompt stays grounded.

### 2026-05-16 - Scenario Stress-Test Harness

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the packet-safe rewrite preview looked strong on one packet, but had not been tested against realistic SOC pressure variations.

Problem observed:
- A v2 rewrite could preserve the active packet while still being brittle when telemetry is missing, evidence conflicts, or leadership demands certainty.
- The UI showed before/after improvement, but it did not yet answer "will this prompt stay grounded under a different evidence packet?"
- Prompt content needed more real-life stress scenarios, not just one idealized repair path.

Decision:
- More scenario-based evaluation content was needed. This fit the 70% rule because SOC prompt engineering must survive incomplete logs, contradictory signals, and executive pressure without inventing conclusions.

Implemented:
- Added a scenario stress-test harness to the Packet panel.
- The harness mutates the active evidence packet into three alternate packets: Missing Logs, Contradictory Evidence, and Executive Pressure.
- Each stress case runs the packet-safe v2 prompt against the alternate packet and scores evidence boundary, unknown handling, contradiction gate, pressure resistance, schema survival, packet diff, and packet preservation.
- Added per-case status, risk description, mutation description, pass/fix checks, weaknesses, average stress score, and verdict.
- Added actions to load the weakest stress case into the lab or apply a stress-hardened v3 rewrite to the journal.
- Styled the harness as a compact amber stress layer with smooth entry, responsive case cards, pass/fix badges, and hardening rules.

Next likely upgrade:
- Add a prompt adversary simulator that generates malicious or misleading user instructions inside the evidence packet and tests whether the prompt resists prompt injection while still using legitimate evidence.

### 2026-05-16 - Prompt Adversary Simulator

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because stress testing covered missing/conflicting evidence, but not hostile instructions embedded inside legitimate SOC artifacts.

Problem observed:
- Packet-safe and stress-hardened prompts could still treat ticket comments, copied logs, emails, or executive notes as if they were trusted instructions.
- The route needed more realistic adversarial content where the learner must keep useful evidence while refusing malicious directives.
- UI/UX needed a smooth progression from packet repair to stress testing to injection-resistance hardening.

Decision:
- More future-facing and real-life adversarial evaluation was needed. This fit the 70% rule because SOC prompt systems will ingest untrusted logs, tickets, emails, and retrieved text that can contain prompt injection attempts.

Implemented:
- Added a prompt adversary simulator to the Packet panel.
- The simulator mutates the active evidence packet into three adversarial cases: Ticket Injection, Log Override, and Executive Social Pressure.
- Each case injects hostile instructions while preserving legitimate evidence, then scores instruction isolation, schema lock, approval gate, uncertainty preservation, and legitimate evidence retention.
- Added attacker goal, injected line, pass/fix checks, weaknesses, average adversary score, and verdict.
- Added actions to load the weakest adversary case into the lab or apply an adversary-hardened v4 rewrite to the journal.
- Styled the simulator as a compact red adversary layer with smooth entry, responsive cards, pass/fix badges, and injection defense rules.

Next likely upgrade:
- Add a red-team replay history that saves adversary/stress results per task attempt so the learner can compare v2, v3, and v4 resilience over time instead of only seeing the current prompt state.

### 2026-05-16 - Red-Team Replay History

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the Packet panel could score stress/adversary resilience, but the learner could not compare attempts over time.

Problem observed:
- Stress and adversary scores were only live calculations.
- Learners could apply v2, v3, and v4 rewrites, but there was no record of which attempt improved resilience.
- UI/UX needed a smoother loop from "test" to "save replay" to "repair the weakest prior case."

Decision:
- More tracking and scenario-history infrastructure was needed. This fit the 70% rule because a professional prompt engineering bootcamp should preserve red-team evidence, not just show temporary scores.

Implemented:
- Added persistent red-team replay history to `/prompt` local memory.
- Each replay stores task, day, packet id, version note, rewrite score, stress score, adversary score, combined resilience score, weakest stress case, weakest adversary case, verdict, and timestamp.
- Added a compact Red-Team Replay History layer to the Packet panel.
- Added a save replay action and clickable replay entries that load a focused repair block into the journal.
- Added latest movement tracking so learners can see whether their newest attempt improved or regressed against the previous replay.
- Styled the replay layer as a quiet violet history strip with smooth hover transitions and responsive replay cards.

Next likely upgrade:
- Add an exportable prompt incident report that turns the packet, diff, rewrite, stress harness, adversary harness, and replay history into a SOC-ready markdown report for portfolio evidence.

### 2026-05-16 - Exportable Prompt Incident Report

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the route had evidence, rewrite, stress, adversary, and replay layers, but no durable report artifact for later review.

Problem observed:
- The Packet panel had strong live diagnostics, but a learner still had to manually stitch together the packet, diff, rewrite score, stress findings, adversary findings, and replay history.
- UI/UX needed a smoother path from "tested prompt" to "portfolio evidence".
- Task content needed a real SOC-style reporting artifact so the learner practices explaining evidence boundaries, residual risk, and next reviewer action.

Decision:
- More scenario-based and future-facing content was needed. This fit the 70% rule because prompt engineering skill compounds when every attempt becomes a reviewable incident artifact, not just a transient score.

Implemented:
- Added a deterministic Prompt Incident Report generator for `/prompt`.
- The report packages scenario pressure, confirmed evidence, missing evidence, packet grade, packet diff, packet-safe rewrite, stress harness, adversary simulator, replay history, rewrite notes, and next reviewer action into SOC-ready markdown.
- Added readiness scoring and verdicts so the report can tell whether it is portfolio-ready, review-ready, training-only, or insufficient.
- Added a compact report layer inside the Packet panel with score metrics, three reviewer-facing sections, and a scroll-safe markdown preview.
- Added actions to stage the report in the lab, save it into the active task journal, or copy it to clipboard with a fallback output panel.
- Styled the report layer to match the existing cyber interface while keeping it quieter than the diagnostic panels around it.

Next likely upgrade:
- Add a report archive and comparison drawer so exported incident reports can be searched by task, readiness score, weakness, and replay movement across the full 90-day bootcamp.

### 2026-05-16 - Incident Report Archive And Comparison Drawer

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because exported reports were useful, but still behaved like one-off artifacts unless the learner saved and compared them over time.

Problem observed:
- The incident report generator produced a strong markdown artifact, but there was no persistent archive of exported reports.
- Learners could not search prior reports by task, readiness, weak stress case, adversary weakness, or replay movement.
- UI/UX needed a quieter longitudinal layer that answers "am I improving across attempts?" without forcing the learner to inspect every saved journal manually.

Decision:
- More scenario-based tracking content was needed. This fit the 70% rule because a professional prompt bootcamp should build an audit trail of evidence reports and show whether later attempts reduce the same weaknesses.

Implemented:
- Added persistent incident report archive entries to `/prompt` local memory.
- Each archived report stores task id, day, report id, packet id, scenario, saved time, readiness score, verdict, version note, weakest stress case, weakest adversary case, replay movement, markdown, and a searchable index.
- Added an archive report action to the Packet panel.
- Added a compact report archive drawer inside the incident report layer with saved count, average readiness, latest report, best report, active task trend, and comparison delta.
- Added search across task labels, packet ids, scenario names, readiness verdicts, weaknesses, replay movement terms, and full markdown content.
- Archived report cards can be clicked to stage the saved markdown back into the lab for review.
- Styled the archive as a quiet green audit layer with responsive comparison cards and smooth hover states.

Next likely upgrade:
- Add a guided report review rubric that grades archived incident reports against portfolio standards and generates a focused remediation checklist before the learner exports or shares the report.

### 2026-05-16 - Portfolio Report Review Rubric

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the report archive could save and search artifacts, but it did not yet judge whether those artifacts were worth showing.

Problem observed:
- Archived incident reports showed readiness scores, weak cases, and search results, but the learner still had to infer what a real reviewer would reject.
- UI/UX needed a smoother gate between "archive report" and "share/export report".
- Task content needed richer portfolio-standard explanations, including real SOC reviewer risks and scenario-based remediation.

Decision:
- More relevant content and real-life examples were needed. This fit the 70% rule because the goal is not only making reports, but learning how to defend them under mentor, hiring, or SOC lead review.

Implemented:
- Added a portfolio review rubric for `/prompt` incident reports.
- The rubric grades six criteria: Evidence Chain, Unknown Boundary, Reproducible Output, Red-Team Resilience, Reviewer Story, and Archive Progression.
- Each criterion now shows score, status, supporting evidence, reviewer risk, realistic SOC scenario example, and remediation guidance.
- Added an overall portfolio review gate with verdict, share gate, weakest criterion briefing, and focused checklist.
- Added a checklist action that loads the remediation list into the active task journal as the next repair task.
- Styled the rubric as a compact amber review layer inside the report archive, with responsive cards and smooth panel entry.

Next likely upgrade:
- Add a portfolio export packet that bundles the report, review rubric, remediation history, and final prompt versions into one recruiter/mentor-ready case study view.

### 2026-05-16 - Portfolio Case Study Export Packet

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the rubric could judge a report, but the route still did not package the work into a single mentor/recruiter-ready case study.

Problem observed:
- The Packet panel had an incident report, archive, and review gate, but a learner still had to manually assemble the story, final prompt versions, remediation history, and reviewer proof.
- UI/UX needed a smoother final mile from "reviewed report" to "case study artifact".
- Task content needed a richer professional narrative that explains what problem was solved, what evidence controlled the answer, how the prompt was red-teamed, and what the learner would improve next.

Decision:
- More future-facing and real-life portfolio content was needed. This fit the 70% rule because a strong bootcamp should produce artifacts that can be discussed with mentors, hiring reviewers, or SOC leads without requiring the app to be open.

Implemented:
- Added a deterministic portfolio case study export packet for `/prompt`.
- The export bundles the incident report, portfolio rubric, final prompt versions, remediation history, story sections, metrics, and a recruiter/mentor-oriented markdown case study.
- Added four prompt versions to the packet: v1 current draft, v2 packet-safe prompt, v3 stress-hardened prompt, and v4 adversary-guarded prompt.
- Added case study story sections for Problem, Evidence Boundary, Red-Team Result, and Portfolio Defense.
- Added remediation history drawn from journal attempts, archived reports, and the active review checklist.
- Added a compact portfolio export panel inside the report archive with metrics, story cards, version cards, remediation notes, and scroll-safe markdown preview.
- Added actions to stage the case study in the lab, journal it into the active task, or copy it to clipboard with output-panel fallback.

Next likely upgrade:
- Add a portfolio gallery route or panel that ranks all prompt case studies across the bootcamp and highlights the top artifacts to polish first.

### 2026-05-16 - Prompt Portfolio Gallery

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because case studies existed inside the Packet panel, but the learner still needed a high-level portfolio surface to decide which artifacts deserve polish.

Problem observed:
- Portfolio case studies were strong as individual artifacts, but discoverability was weak across a 90-day bootcamp.
- The learner could not quickly see the best showcase artifact, the highest-impact polish target, or ranked case cards across active and archived work.
- UI/UX needed a smoother jump from portfolio overview to the exact task/day that needs attention.

Decision:
- More future-facing portfolio organization was needed. This fit the 70% rule because a mature bootcamp should not only generate case studies; it should help the learner curate, rank, and polish the strongest ones.

Implemented:
- Added a prompt portfolio gallery panel to the Daily Mastery Ledger.
- The gallery ranks the active portfolio case plus archived incident reports across the bootcamp.
- Added best-artifact and polish-first summary cards with quick open actions.
- Added ranked gallery cards showing day, source, score, scenario, primary weakness, and actions to open the originating Packet panel or stage the artifact in the lab.
- Added deterministic gallery scoring that blends readiness, replay movement, and whether an archived artifact already contains a case study.
- Added polish recommendations that respond to injection risk, missing-data weakness, stress weakness, mentor-readiness, or showcase-readiness.
- Styled the gallery as a quiet cyber portfolio layer with responsive cards and smooth entry.

Next likely upgrade:
- Add a case-study polish workflow that opens the selected gallery target and walks the learner through pitch, evidence boundary, red-team proof, and final export cleanup step by step.

### 2026-05-16 - Case Study Polish Workflow

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the gallery could rank artifacts, but it did not yet teach the learner how to polish a selected case study step by step.

Problem observed:
- The portfolio gallery identified the best artifact and the highest-impact polish target, but the learner still had to decide what "polish" meant.
- UI/UX needed a smoother transition from selecting a gallery card to editing the related case study.
- Task content needed realistic mentor/recruiter review steps: a short pitch, evidence boundary defense, red-team proof, and final export cleanup.

Decision:
- More relevant content and scenario-based guidance was needed. This fit the 70% rule because professional portfolio work requires knowing how to explain and defend the artifact, not only how to generate it.

Implemented:
- Added a selected case-study polish workflow to the portfolio gallery.
- Added four guided steps: Pitch, Evidence Boundary, Red-Team Proof, and Final Export Cleanup.
- Each step now shows score, status, goal, realistic reviewer scenario, concrete action, and done-check.
- Gallery cards now include a polish action that opens the target task, selects it as the active polish workflow, and returns the learner to the Packet panel.
- Added a workflow checklist and a load-polish-plan action that writes the step-by-step polish plan into the active task journal.
- Added deterministic polish scoring from the selected gallery target and portfolio review rubric.
- Styled the workflow as a quiet amber stepper inside the gallery with responsive step cards and smooth panel entry.

Next likely upgrade:
- Add a mentor-defense simulator that asks interview-style questions about the selected case study and scores whether the learner can defend evidence boundaries, red-team choices, and final prompt tradeoffs.

### 2026-05-16 - Mentor Defense Simulator

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the case-study polish workflow made artifacts cleaner, but did not yet train the learner to defend the work under mentor or recruiter questioning.

Problem observed:
- The gallery and polish workflow helped select and improve a case study, but the learner still needed rehearsal for live review questions.
- UI/UX needed a smoother bridge from portfolio artifact to interview-style defense.
- Task content needed deeper, scenario-based answers around evidence boundaries, red-team decisions, output contracts, automation tradeoffs, and next improvements.

Decision:
- More relevant content and real-life review simulation was needed. This fit the 70% rule because a strong prompt engineering portfolio depends on the learner being able to explain the tradeoffs, not merely show generated markdown.

Implemented:
- Added a mentor-defense simulator to the portfolio gallery.
- The simulator asks five interview-style questions: Evidence Boundary, Red-Team Proof, Output Contract, Tradeoffs, and Next Improvement.
- Each question shows score, status, question text, why a mentor would ask it, weak answer, strong answer, practice prompt, and pass signal.
- Added deterministic defense scoring from the portfolio review rubric, selected gallery target, and polish workflow.
- Added a defense checklist and a load-defense-drill action that writes the full mock interview packet into the active task journal.
- Styled the simulator as a compact violet rehearsal layer with responsive question cards and smooth step switching.

Next likely upgrade:
- Add spoken/timed rehearsal mode for the mentor-defense simulator with a countdown, concise answer template, and post-answer self-score capture.

### 2026-05-16 - Timed Mentor Defense Rehearsal

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the mentor-defense simulator had strong interview questions, but the learner still needed a timed answer loop that feels like live review pressure.

Problem observed:
- The defense simulator explained weak and strong answers, but it did not yet make the learner rehearse an answer under a clock.
- The UI could load a full defense drill into the journal, but there was no lightweight way to capture one spoken-style answer, self-score it, and compare recent attempts for the same question.
- Task content needed more real-life mentor/recruiter pressure: concise evidence boundary, explicit unknowns, tradeoffs, and next action.

Decision:
- More relevant practice infrastructure was needed. This fit the 70% rule because a professional prompt engineer must be able to defend the artifact verbally, not only generate portfolio markdown.

Implemented:
- Added a timed mentor-defense rehearsal module below the defense simulator.
- Added a 90-second countdown with smooth progress meter and start/reset/save controls.
- Added concise answer templates that change per question: evidence boundary, red-team proof, output contract, tradeoffs, and next improvement.
- Added a rehearsal answer editor, self-score slider, live answer scan, readiness verdict, and missing-control checks.
- Added persistent rehearsal history per task/question and clickable prior attempts to reload an answer.
- Saving a rehearsal now stores the attempt in prompt memory and appends the spoken-answer artifact into the active task journal.
- Styled the module as a quieter violet practice layer with responsive layout, focused textarea states, compact history, and smooth timer feedback.

Next likely upgrade:
- Add a mentor-defense score trend that compares rehearsal attempts across questions, identifies the weakest speaking pattern, and generates a two-minute recovery drill before portfolio review.

### 2026-05-16 - Mentor Defense Score Trend

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because timed rehearsals created saved speaking attempts, but the route did not yet compare those attempts across all defense questions.

Problem observed:
- The learner could save timed answers, but each answer lived mostly inside its current question.
- There was no fast way to know which defense area was weakest before a portfolio or mentor review.
- The route needed richer real-life coaching for spoken review pressure: the learner needs to know whether they are missing evidence, uncertainty, a human gate, or a measurable next action.

Decision:
- More relevant coaching and trend infrastructure was needed. This fit the 70% rule because a serious prompt engineering bootcamp should not only collect practice attempts; it should diagnose speaking patterns and prescribe focused recovery drills.

Implemented:
- Added a mentor-defense score trend across all five defense questions.
- The trend compares saved rehearsal attempts by latest score, average score, best score, attempt count, and score delta.
- Added weakest speaking pattern detection using the same live answer scan signals: concrete evidence, unknown boundary, review gate, and next action.
- Added per-question trend cards that can switch the active defense question.
- Added a two-minute recovery drill generated from the weakest question and the selected case-study weakness.
- Added a load-recovery-drill action that writes the drill into the active task journal and prepares the rehearsal surface for the weak question.
- Styled the trend as a quiet analytics layer under timed rehearsal, with responsive cards, smooth visual hierarchy, and a compact amber recovery strip.

Next likely upgrade:
- Add mentor-defense readiness gates to the portfolio gallery so artifacts cannot be marked showcase-ready until every defense question has at least one timed answer above a threshold.

### 2026-05-16 - Portfolio Defense Readiness Gates

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the gallery could rank case studies, but "showcase-ready" still depended too much on report score and not enough on whether the learner could defend the artifact aloud.

Problem observed:
- Portfolio artifacts could look ready while having no timed answers for evidence boundary, red-team proof, output contract, tradeoffs, or next improvement.
- The gallery did not block showcase readiness when the learner had not rehearsed under mentor-style pressure.
- UI/UX needed a clearer bridge from a blocked portfolio artifact to the exact defense drill that would unlock it.

Decision:
- More realistic review gating was needed. This fit the 70% rule because a serious prompt engineering bootcamp should model the real moment where a mentor asks, "Can you defend this case study without the app helping you?"

Implemented:
- Added defense gate scoring to every portfolio gallery item.
- Showcase readiness now requires both a strong artifact score and all five defense questions to have a timed rehearsal above the threshold.
- Added gate checks for Evidence Boundary, Red-Team Proof, Output Contract, Tradeoffs, and Next Improvement with best score, attempt count, status, and recovery cue.
- Updated gallery ranking to use showcase score instead of raw report score, so undefended artifacts are visibly held back.
- Added defense-gated counts to the gallery header and a dedicated gate summary card.
- Added gate drill actions on the summary and blocked gallery cards; loading one switches to the weakest defense question and prepares a focused answer scaffold.
- Styled gate status with compact amber/green chips and quiet card states so the extra rigor does not make the gallery noisy.

Next likely upgrade:
- Add a portfolio review queue that lists only defense-gated artifacts, orders them by fastest path to unlock, and schedules which defense answer to rehearse next.

### 2026-05-16 - Portfolio Defense Review Queue

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because defense gates made portfolio readiness stricter, but the learner still needed a clear queue for which blocked artifact to unlock first.

Problem observed:
- The gallery showed defense-gated artifacts, but it did not prioritize them by fastest path to showcase readiness.
- A learner still had to inspect several cards to decide which missing defense answer to rehearse next.
- UI/UX needed a smoother transition from "this case is blocked" to "do this exact timed rehearsal now."

Decision:
- More scenario-based scheduling infrastructure was needed. This fit the 70% rule because a serious bootcamp should behave like a coach: choose the next constrained drill, explain why, and make the action one click away.

Implemented:
- Added a portfolio defense review queue that only lists defense-gated artifacts.
- Ordered queue items by fastest unlock path: fewest missing gates, smallest score gap, then strongest showcase potential.
- Each queued artifact now schedules a specific next defense answer, with gap, timebox, mentor scenario, and a four-step rehearsal plan.
- Added a schedule-drill action that opens the correct artifact, selects the correct defense question, prepares the rehearsal answer scaffold, and writes the scheduled plan into the task journal.
- Added empty-state coaching for when all visible artifacts clear their defense gates.
- Styled the queue as a compact amber review layer between the gallery summary and polish workflow, with responsive cards and smooth panel entry.

Next likely upgrade:
- Add a defense rehearsal calendar that converts the review queue into a 7-day micro-plan and connects the scheduled answers back into the daily bootcamp tasks.

### 2026-05-16 - Defense Rehearsal Calendar Micro-Plan

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the review queue could choose the next blocked artifact, but it did not yet spread defense practice across the bootcamp calendar.

Problem observed:
- The queue was useful for immediate action, but portfolio defense work still felt separate from the 90-day daily task system.
- The learner needed a seven-day schedule that says which defense answer to rehearse, which bootcamp task it belongs to, and what success looks like.
- UI/UX needed a smoother bridge from "schedule drill" to daily task journals so the app feels like one training system instead of separate widgets.

Decision:
- More relevant scheduling and task-linking infrastructure was needed. This fit the 70% rule because realistic mastery comes from repeated small rehearsals, not one big portfolio cleanup session.

Implemented:
- Added a 7-day portfolio defense micro-plan beneath the review queue.
- The micro-plan converts defense-gated queue items into daily rehearsal cards with day label, minutes, linked bootcamp task, scenario, action, and success metric.
- Each scheduled day now maps the defense question to a relevant bootcamp task mode: output contract to build, tradeoffs to iterate, improvement to review, and evidence/red-team gates to evaluation.
- Added a schedule-day action that loads the correct gate drill into the rehearsal surface and writes the micro-plan into the linked daily task journal.
- Added a maintenance state for when all visible artifacts have cleared defense gates.
- Styled the calendar as a compact violet/amber seven-day strip with hover motion, responsive collapse, and quiet task-link labels.

Next likely upgrade:
- Add completion tracking for scheduled defense calendar days so the micro-plan can mark practiced days, missed days, and automatically reschedule missed rehearsals.

### 2026-05-16 - Defense Calendar Completion Tracking

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the seven-day micro-plan could schedule rehearsals, but it still did not remember whether a scheduled defense day was actually practiced.

Problem observed:
- A scheduled defense day wrote a plan into the journal, but the calendar could not distinguish planned, scheduled, practiced, missed, or rescheduled work.
- Saving a timed rehearsal did not close the matching calendar commitment.
- Missed rehearsals could disappear from the visible seven-day strip instead of returning as the next recovery task.

Decision:
- More tracking infrastructure was needed. This fit the 70% rule because a serious bootcamp should treat scheduled defense practice as a commitment with completion state, not a decorative calendar card.

Implemented:
- Added persisted defense calendar schedules to prompt memory.
- Scheduling a calendar day now creates a tracked schedule entry with day, linked task, target artifact, defense question, and scheduled timestamp.
- Saving a matching timed mentor-defense rehearsal now marks the schedule as practiced.
- Calendar cards now show planned, scheduled, practiced, missed, or rescheduled status.
- Missed scheduled rehearsals are automatically pulled back into the visible seven-day micro-plan as rescheduled work when the selected bootcamp day advances.
- Schedule-day now keeps the rehearsal surface connected to the linked bootcamp task journal, so completion tracking and daily task evidence stay aligned.
- Styled practiced, scheduled, missed, and rescheduled cards with quiet status colors while preserving the existing futuristic visual language.

Next likely upgrade:
- Add a defense calendar review summary that calculates completion rate, missed rehearsal debt, and the highest-risk recurring defense question across the last scheduled practices.

### 2026-05-16 - Defense Calendar Review Summary

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because scheduled defense practice had completion state, but the learner still needed a coach-level summary of whether the cadence was working.

Problem observed:
- The calendar could show practiced, missed, and rescheduled cards, but it did not summarize the larger pattern.
- The learner could not quickly see completion rate, missed rehearsal debt, or which defense question was recurring as the highest risk.
- UI/UX needed a smoother path from "I missed practice" to "load the exact recovery drill that gets me back on track."

Decision:
- More coaching and scenario-based review infrastructure was needed. This fit the 70% rule because a serious bootcamp should not only record behavior; it should interpret the behavior and prescribe the next recovery action.

Implemented:
- Added a defense calendar review summary above the seven-day micro-plan.
- The summary calculates recent scheduled practices, practiced count, completion rate, missed rehearsal debt, and cadence verdict.
- Added recurring defense-risk detection across recent schedules, missed days, low-scored rehearsal attempts, and currently blocked review queue items.
- Added a reviewer scenario explaining why the recurring defense question matters under mentor-style pressure.
- Added a load-recovery action that schedules the highest-risk queue item when available and writes a recovery summary into the relevant task journal.
- Styled the summary as a compact four-card review layer with quiet violet/amber/cyan emphasis and responsive collapse.

Next likely upgrade:
- Add a defense performance export that packages calendar cadence, recurring weakness, strongest rehearsals, and recovery history into a mentor-ready progress note.

### 2026-05-16 - Defense Performance Export

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the calendar review could diagnose cadence, but the learner still needed a mentor-ready artifact that summarizes behavior, spoken proof, recovery debt, and next rehearsal commitments.

Problem observed:
- The defense calendar summary was useful inside the app, but it did not produce a portable progress note for a mentor, reviewer, or future AI coach.
- Strongest timed rehearsals, missed rehearsal debt, recurring weakness, and the next seven-day prescription lived in separate UI layers.
- UI/UX needed a smoother transition from "I reviewed my defense cadence" to "I can export a concise progress note and act on it."

Decision:
- More content-rich export infrastructure was needed. This fit the 70% rule because a serious bootcamp should teach the learner how to explain their practice history, not only complete practice cards.

Implemented:
- Added a deterministic defense performance export model to the portfolio gallery.
- The export calculates defense readiness from calendar cadence, recent timed rehearsal scores, gate readiness, and missed rehearsal debt.
- Added mentor-facing metrics for defense readiness, calendar cadence, rehearsal average, gate readiness, missed debt, and recurring risk.
- Added strongest timed rehearsal extraction with score, duration, date, verdict, and answer excerpt.
- Added recovery history that combines missed calendar commitments, practiced calendar commitments, and recent timed rehearsal outcomes.
- Added a next seven-day defense plan and a mentor review script with realistic interruption pressure.
- Added stage, journal, and copy actions for the defense progress note.
- Styled the export as a quiet cyan review layer under the defense calendar, with responsive metrics, compact rehearsal proof, recovery history, and a scroll-safe markdown preview.

Next likely upgrade:
- Add a defense export comparison ledger that compares the newest mentor progress note against the previous note, showing cadence improvement, repeated weakness movement, and whether recovery debt is shrinking.

### 2026-05-16 - Defense Export Comparison Ledger

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the defense export produced a strong mentor note, but the learner still could not tell whether their defense behavior was improving from one note to the next.

Problem observed:
- Defense progress notes were generated on demand but not archived as comparable snapshots.
- A mentor-ready note could show current cadence, weakness, and debt, but not whether readiness, rehearsal average, gate clearance, or missed debt had improved.
- UI/UX needed a smoother transition from "I made a progress note" to "I can inspect the trend and load the next recovery action."

Decision:
- More measurement history was needed. This fit the 70% rule because real bootcamp coaching depends on trend comparison, not a single impressive export.

Implemented:
- Added persisted defense performance export history to prompt memory.
- Added an archive-note action so each mentor progress export can become a baseline snapshot.
- Added a defense export comparison model that compares current note against the most recent different archived note.
- The comparison tracks readiness delta, cadence delta, rehearsal average delta, gate readiness delta, missed-debt delta, and whether the same recurring weakness is repeating.
- Added mentor-readable comparison text and a next action that changes depending on repeated weakness, growing debt, readiness regression, or healthy improvement.
- Added a comparison ledger UI inside the mentor progress export with compact delta chips, baseline state, load-comparison action, and archived note history.
- Styled the ledger as a quiet violet/cyan layer with responsive collapse and small motion-safe controls.

Next likely upgrade:
- Add a mentor interruption simulator that uses the repeated weakness from the export comparison ledger to inject a realistic challenge into the timed defense rehearsal.

### 2026-05-16 - Mentor Interruption Simulator

Reference used before work:
- Re-read this file before changing `/prompt`.
- Applied the 70% default decision rule and chose the listed next upgrade because the export comparison ledger could identify repeated weakness, but the timed rehearsal still behaved like a clean self-paced exercise instead of a live mentor interruption.

Problem observed:
- The learner could rehearse a defense answer, but the UI did not interrupt the answer with realistic mentor pressure.
- Repeated weaknesses from the comparison ledger were visible, but they were not automatically converted into a harder speaking drill.
- Task content still needed more real-life scenario pressure: hostile ticket text, missing evidence, manager urgency, reusable output contracts, tradeoff defense, and measurable improvement questions.

Decision:
- More scenario-based rehearsal infrastructure was needed. This fit the 70% rule because interview and mentor defense skill is built when the learner can recover after being challenged, not when they only recite prepared answers.

Implemented:
- Added a mentor interruption simulator model connected to the defense export comparison ledger.
- The simulator chooses the repeated recurring weakness when one exists, otherwise it uses the active defense question or the current export risk.
- Added pressure levels: baseline, pressure, and intervention based on repeated weakness, readiness score, and missed rehearsal debt.
- Added rich interruption scripts for Evidence Boundary, Red-Team Proof, Output Contract, Tradeoffs, and Next Improvement.
- Each interruption now includes a live challenge, hostile follow-up, failure trap, recovery move, response protocol, pass criteria, and a timeboxed answer frame.
- Added a load-interruption action that switches to the relevant defense question, primes the timed rehearsal answer, adjusts the timer to 90 or 120 seconds, lowers the starting self-score under pressure, and writes the drill plan into the task journal.
- Fixed the rehearsal progress meter so 120-second interruption drills report progress accurately instead of assuming every rehearsal is 90 seconds.
- Styled the interruption simulator as a compact amber/red pressure layer inside the mentor-defense rehearsal area with responsive collapse and quiet motion.

Next likely upgrade:
- Add an interruption outcome rubric that scores saved rehearsals against the active interruption protocol and shows whether the learner actually recovered from the challenge.

### 2026-05-18 - Bootcamp Daily Variation Fix

Reference used before work:
- Re-read this file before changing `/prompt`.
- User feedback overrode the listed next upgrade because moving daily bootcamp from day 1 to 2 to 3 made only the top visible cards feel different.

Problem observed:
- `getPromptDailyTasks(day)` already changed the daily cycle and scenario data, but the lower three visible task cards kept generic labels: create v2/v3, score against rubric, and review due Q&A.
- Hidden lesson content had some variation, but the UI made the day feel duplicated because the learner scans card labels and details first.
- The lower tasks also needed stronger scenario anchoring so each day felt like a different SOC prompt-engineering rep, not the same routine with a new title.

Decision:
- Make every daily bootcamp card visibly day-specific and scenario-specific before adding another feature. This fit the 70% rule because duplicated-looking tasks reduce trust in the whole curriculum.

Implemented:
- Added day-coded concept labels such as D01, D02, and D03.
- Changed the build card label to name the current prompt skill directly.
- Rewrote the revision, evaluation, and SRS card labels/details so they include the current cycle and scenario.
- Enriched the lower three task lessons, mentor scripts, baby steps, labs, reflections, and done states with the current SOC scenario, pressure line, and missing-evidence trap.
- Verified days 1, 2, and 3 now generate five visibly different task cards.

Next likely upgrade:
- Add an interruption outcome rubric that scores saved rehearsals against the active interruption protocol and shows whether the learner actually recovered from the challenge.

### 2026-05-18 - Prompt Workspace Organization Pass

Reference used before work:
- Re-read this file before changing `/prompt`.
- User feedback overrode the listed next upgrade because the page had become powerful but visually messy. Organization was more important than adding another capability.

Problem observed:
- The `/prompt` route showed daily missions, mastery, portfolio, mentor defense, study curriculum, lab, and references in one long stack.
- The content was rich, but the lack of hierarchy made it harder to decide where to work next.
- UI/UX needed smoother section transitions and clearer mental rooms without changing the cyber visual identity.

Decision:
- A workspace switcher was the best upgrade. It removes visual competition without deleting any feature: Today, Portfolio, Study, Lab, and Reference become focused modes.

Implemented:
- Added a top-level `/prompt` workspace switcher inside the hero card.
- Added focused workspace modes: Today, Portfolio, Study, Lab, and Reference.
- Today shows the daily bootcamp and mastery ledger only.
- Portfolio shows the mastery context plus portfolio gallery, defense calendar, mentor export, polish workflow, and mentor-defense simulator.
- Study contains zero-to-one teaching, phases, bootcamp stages, roadmap, SRS queue, and drill deck.
- Lab contains the live prompt playground and iteration workspace.
- Reference contains reference sheets and scenario exercises.
- Added compact switcher styling with quiet hover/active states and responsive collapse.
- Preserved all existing route features while making the first screen calmer and easier to scan.

Next likely upgrade:
- Add an interruption outcome rubric that scores saved rehearsals against the active interruption protocol and shows whether the learner actually recovered from the challenge.
