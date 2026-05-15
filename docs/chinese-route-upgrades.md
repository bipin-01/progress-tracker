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

## Next Upgrade Candidates

- Pleco-style dictionary drawer: click any hanzi/pinyin tile and open a compact entry with definition, tone, radical, example words, and related lesson.
- Skritter-style stroke order simulation: animate stroke ghost paths for active characters and add stroke count checkpoints.
- Duolingo-style streak circuit: daily XP, streak freeze, lesson completion burst, and tiny reward state tied to Daily Circuit.
- HelloChinese-style guided lesson flow: one focused step at a time with listen, choose, speak, write, and review checkpoints.
- Speech scoring: compare browser speech recognition output against active phrase and mark tone/pinyin confidence.

## Design Rules For Future Passes

- Keep additions inside the existing cyber command-center language.
- Prefer compact learning loops over decorative panels.
- Every new panel should answer one of these: what do I hear, what do I read, what do I write, what do I recall next?
- If a feature adds visual weight, remove or compress equal weight nearby.
