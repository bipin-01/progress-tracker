# Chinese Route Upgrade Log

Purpose: keep `/chinese` upgrades cumulative and intentional. Read this before choosing the next feature so the route keeps moving toward a polished Mandarin learning cockpit instead of becoming a pile of widgets.

## Product References

- Duolingo: short daily loops, visible streak/progress, fast success feedback.
- Anki: spaced repetition and review scheduling should drive what returns next.
- Pleco: fast dictionary-style scanning for hanzi, pinyin, tones, and meaning.
- Skritter: character practice should make stroke memory feel physical and traceable.
- HelloChinese: beginner flow should stay structured from sound to phrase to sentence.

## Implemented Updates

- `1445db0` - Added the first `/chinese` route with a Mandarin Zero dashboard, lesson ladder, tone lab, glyph practice, and active recall.
- `6901b6d` - Polished Glyph Forge so character practice had a stronger writing-grid surface and better visual hierarchy.
- `d747352` - Added Tone Scope to map lesson pinyin into tone contours before vocabulary memorization.
- `b4b155c` - Added Phrase Reactor to split a phrase into hanzi, pinyin, and meaning lanes.
- `9f4ee28` - Added Pinyin Decoder so users can type pinyin and get exact/tone/miss feedback.
- `14ce27d` - Added Stroke Matrix for observe, trace, recall, and output passes on each active glyph.
- `86aa4f1` - Added Tone Radar with active lesson contour and tone distribution.
- `a3458c1` - Added Sentence Assembler with clickable hanzi tiles, slots, alignment score, and reset.
- 2026-05-15 - Added Memory Queue, an Anki-inspired spaced repetition panel with hard/ok/easy grading, review intervals, ease, reps, and due queue.
- 2026-05-15 - Rebuilt `/chinese` as a standalone Chinese Protocol cockpit based on the provided reference: full-width shell, primary hanzi flashcard, reveal/grading loop, HSK ladder, tone vectors, heatmap, deck queue, pattern reactor, sentence assembler, pinyin decoder, stroke trace, and daily circuit.
- 2026-05-15 - Deepened the current feature set: SM-2-style review scheduling with due days, retention, lapses, accuracy, XP/combo rewards, 7-day streak cells, dynamic deck due counts, 10-card review queue statuses, Pleco-style dictionary drawer, clickable sentence characters, richer component/radical entries, and a Skritter-inspired stroke grid.
- 2026-05-15 - Added a 500-day Chinese practice database: 5 words/day for days 1-50, then +5 words/day every 50 days through 50 words/day, with 13,750 scheduled word slots, phase metadata, review anchors, day navigation, and clickable daily words wired into the dictionary drawer.
- 2026-05-15 - Added Daily Mission Uplink above the main lesson surface: the selected 500-day plan now exposes an active word, quick word rail, review-anchor jumps, phase signal, and new/review/total workload so the database behaves like a Duolingo-style daily loop instead of a buried reference table.
- 2026-05-15 - Added local Memory Core persistence for `/chinese`: review ratings, SRS intervals, XP, combo, selected practice day, completed drills, and stroke progress now survive refresh, with a compact synced/restored/offline signal inside the mission footer.
- 2026-05-15 - Added Guided Circuit orchestration inside the flashcard panel: the route now detects the next unfinished listen, meaning, build, write, or recall gate and exposes one compact command that plays audio, reveals meaning, places the next sentence tile, advances stroke practice, or grades the phrase.
- 2026-05-15 - Added Focus Tunnel lesson mode: the Guided Circuit can now open an immersive overlay that strips away telemetry, centers the active hanzi and sentence, preserves the one-command lesson flow, shows progress gates, and exits with Escape or the exit control.
- 2026-05-15 - Added Focus Tunnel keyboard control: Escape exits, Enter runs the active gate command, Space replays Mandarin audio, and number keys 1-5 jump between listen, meaning, build, write, and recall gates without adding visible shortcut clutter.
- 2026-05-15 - Added Focus Tunnel speech gate: browser Mandarin recognition can capture spoken output, align recognized hanzi against the active sentence, show mic confidence and phrase match, and feed strong spoken recall into the SRS rating loop.
- 2026-05-15 - Added persistent voice trace history: spoken attempts now save into Memory Core with transcript, score, confidence, matched hanzi, rating, and timestamp, then surface recent attempts per card inside Focus Tunnel for future coach-agent behavior analysis.
- 2026-05-15 - Added voice weakness analytics: saved speech attempts now group low-score misses by hanzi and sentence pattern, rank weak spots, and generate compact repair drills inside Focus Tunnel.
- 2026-05-15 - Added voice weakness heatmap: Focus Tunnel now scans the last 30 spoken attempts, converts missed hanzi into tone-risk bars, surfaces hanzi hotspots, and lets each tone replay its reference sound.
- 2026-05-15 - Added adaptive repair missions: Daily Mission Uplink now converts the weakest spoken tone and missed hanzi into a next-day repair injection with compact drills and one-command loading.

## Next Upgrade Candidates

- Promote Memory Core from localStorage to Supabase/IndexedDB sync so the future Mac app and web app share one Chinese review timeline.
- Add a true Skritter canvas: pointer/touch handwriting capture, stroke direction checking, and replay.
- Expand the dictionary into a real local mini-Pleco with search, variants, measure words, and related grammar notes.
- Add repair mission completion tracking so injected tone/hanzi drills can be checked off, scored, and fed back into Memory Core.

## Design Rules For Future Passes

- Keep additions inside the existing cyber command-center language.
- Prefer compact learning loops over decorative panels.
- Every new panel should answer one of these: what do I hear, what do I read, what do I write, what do I recall next?
- If a feature adds visual weight, remove or compress equal weight nearby.
