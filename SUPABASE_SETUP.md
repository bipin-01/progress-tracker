# Supabase Hosted Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Set:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-project-anon-or-publishable-key
```

4. Link the project and push migrations:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

5. In Supabase Auth settings, enable Email signups and add these Site URLs:

```text
http://127.0.0.1:5173
http://localhost:5173
```

Add the deployed web URL later when the app is hosted.

## Data Ownership

All synced tables now use `user_id` and row-level security. Users can only read and mutate their own goals, habits, task projects, calendar events, Kanban cards, and Kanban activity history.

## Kanban Data Model

Kanban cards keep a `data` JSONB compatibility snapshot, but the important fields are also stored as queryable columns:

- `kanban_cards`: title, description, column, priority, due date, tags, time estimates, blocked/archived state, and order
- `kanban_card_labels`: visual labels per card
- `kanban_card_subtasks`: checklist items per card
- `kanban_card_attachments`: links/files attached to a card
- `kanban_card_comments`: progress notes per card
- `kanban_activity`: card movement and board-history events

This structure is ready for future analytics and AI behavior analysis without scraping opaque JSON blobs.
