# Lang Buddy Agent Notes

## Product goal
Build a daily morning check-in experience for a young Spanish-first learner to practice beginner English vocabulary and concepts through:
- Flash-card style repetition
- Short, friendly conversation with a voice agent
- Context-rich examples across English, reading, science, and math

## MVP scope (implemented)
- Next.js client app with a side-by-side bilingual card UI
- 10 starter cards (includes: parallel lines, perpendicular lines, hardwood floors)
- Daily deck generation target of 20 cards (uses as many as available today)
- Per-card local progress tracking (`attempts`, `mastered`, `lastReviewed`)
- Conversation panel wired to ElevenLabs React SDK (`@elevenlabs/react`)
- Local storage persistence for cards, progress, and today deck

## Current data model

### Card
- `id: string`
- `english: string`
- `spanish: string`
- `topic: "english" | "reading" | "science" | "math"`
- `context: string`
- `prompt: string`
- `exampleEnglish: string`
- `exampleSpanish: string`

### Progress (by card id)
- `attempts: number`
- `mastered: boolean`
- `lastReviewed: string | null` (ISO date, `YYYY-MM-DD`)

### Daily deck
- `date: string` (ISO date, `YYYY-MM-DD`)
- `cardIds: string[]`

## Local storage keys
- `lang-buddy.cards.v1`
- `lang-buddy.progress.v1`
- `lang-buddy.daily-deck.v1`

## ElevenLabs integration
- Use `useConversation()` from `@elevenlabs/react`
- Start session in one of two modes:
  - Public agent mode: `startSession({ agentId, connectionType: "webrtc" })`
  - Secure token mode: call server route `POST /api/elevenlabs/conversation-token`, then `startSession({ conversationToken, connectionType: "webrtc" })`
- Env vars:
  - Public mode: `NEXT_PUBLIC_ELEVENLABS_AGENT_ID=...`
  - Secure mode: `ELEVENLABS_API_KEY=...` and `ELEVENLABS_AGENT_ID=...`
- The app sends contextual updates and user prompts based on the active card.

## Why local storage first
- Fast iteration on card schema and tutoring flow
- No backend dependency during early UX tuning
- Easy migration path to Supabase/Convex once schema stabilizes

## Near-term next steps
1. Add parent/teacher card management UI (create/edit/archive cards).
2. Track learner outcomes per session (accuracy, response latency, confidence).
3. Add spaced repetition scheduling beyond a single daily deck.
4. Move card + progress state to Supabase and add auth/profile per child.
5. Add guardrails in agent prompt (age-appropriate language, max response length).
