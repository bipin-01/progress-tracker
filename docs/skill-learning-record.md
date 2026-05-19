# Skill Learning Record

## 2026-05-19 - Skill Memory And Planner Agent

Built the first durable learning-memory layer for the app.

What changed:
- Added `skill_records` as a first-class database table in IndexedDB and Supabase.
- Seeded five career tracks: SOC Prompt Engineering, Authorized Pentesting, AI-Assisted Pentesting, Mandarin Chinese, and SENTINEL SOC Analyst.
- Each skill record stores route, career, domain, level, XP, streak, current focus, learned concepts, evidence, and linked task IDs.
- Planner now reads skill records, activity history, and linked tasks to generate agent task proposals.
- Accepted planner proposals become real tasks. The user can send them into an existing task tab/current day or into a `Today independent tasks` project.
- Deferred or deleted proposals are logged as skill activity events.
- Accepted skill tasks carry `skillRecordId`, `skillDomain`, `linkedRoute`, `linkedQuestionId`, and learning evidence so completion logs can be traced back to Prompt, Pentest, Pentest AI, Chinese, or SOC systems.

Reflection contract:
- A route should write learning evidence into its matching `skill_records` row when the user completes a lesson, drill, pointer, lab, or review.
- A task created from Planner should keep its skill metadata until completion.
- When a linked task is completed, the task activity event becomes the shared proof that the learning route can read later.
- Future route upgrades should surface linked task status inside the relevant bootcamp question, drill, lesson, or SOC case instead of duplicating progress state.

Next strong upgrade:
- Add a compact skill ledger panel inside `/prompt`, `/pentesting`, `/pentestAi`, `/chinese`, and `/sentinel` showing linked tasks, completed proof, and the next planner proposal for that route.

## Learning Ledger Template

Use this section as the human-readable record of what was actually learned. The app stores machine-readable progress in `skill_records`; this file is the narrative memory.

### Prompt Engineering
- Date:
- Concept learned:
- Real scenario practiced:
- Prompt version saved:
- Weakness noticed:
- Next task:

### Pentesting
- Date:
- Scope or method learned:
- Lab or authorized scenario practiced:
- Evidence collected:
- Mistake avoided:
- Next task:

### Pentest AI
- Date:
- Manual baseline:
- AI-assisted improvement:
- Guardrail used:
- Quality check:
- Next task:

### Chinese
- Date:
- Words or characters learned:
- Tone issue:
- Sentences written:
- Review result:
- Next task:

### SOC / SENTINEL
- Date:
- Alert or incident pattern:
- Evidence packet:
- Decision made:
- Escalation rule:
- Next task:
