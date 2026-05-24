# Implementation Plan
## AI-Powered Meeting Notes & Task Guidance Web App

**Version:** 1.0 | **Date:** May 2026

---

## Build Order Overview

```
Phase 1 → UI Shell (Bolt.new)
Phase 2 → Supabase Setup (manual + SQL)
Phase 3 → Authentication (Supabase Auth + Google OAuth)
Phase 4 → Recording + Transcription (Web Speech API)
Phase 5 → Note Storage (Supabase DB writes/reads)
Phase 6 → AI Summarisation (Claude API)
Phase 7 → AI Guidance Panel (Claude API + chat)
Phase 8 → Search + Edit + Polish
Phase 9 → Deploy (Vercel)
```

Each phase must be complete and working before starting the next.

---

## Phase 1 — UI Shell (Bolt.new)

**Goal:** Build all screens as static UI with no real data. Hardcode dummy content.

**Deliverables:**
- [ ] Dashboard screen with dummy note cards grouped by date
- [ ] Session screen with static transcript area and start/stop button
- [ ] Note Detail screen with dummy summary and action items
- [ ] Guidance Panel slide-in with dummy steps and chat input
- [ ] Routing between all screens (`react-router-dom`)
- [ ] Tailwind CSS applied throughout
- [ ] Colour palette and typography matching design doc

**Done when:** You can click through all screens in the browser with no errors.

---

## Phase 2 — Supabase Project Setup

**Goal:** Create the cloud database and configure tables.

**Steps:**
1. Create a free account at supabase.com
2. Create a new project (note the Project URL and anon key)
3. Run the SQL schema in the Supabase SQL editor (see `environment-setup.md`)
4. Enable Row-Level Security on both tables
5. Add `.env` file to project with Supabase credentials

**Deliverables:**
- [ ] `notes` table created
- [ ] `guidance_sessions` table created
- [ ] RLS policies applied
- [ ] `.env` file in project root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Done when:** Supabase dashboard shows both tables with RLS enabled.

---

## Phase 3 — Authentication

**Goal:** Users can log in with Google and their identity persists.

**Steps:**
1. Enable Google OAuth in Supabase Auth settings
2. Configure OAuth credentials in Google Cloud Console (free)
3. Install `@supabase/supabase-js` in the project
4. Build login screen with "Continue with Google" button
5. Add auth state listener — redirect to dashboard if logged in
6. Add sign-out button in settings or top bar
7. Protect all routes — redirect to login if not authenticated

**Deliverables:**
- [ ] Login screen
- [ ] Google OAuth working
- [ ] Session persists on page refresh
- [ ] Protected routes

**Done when:** You can log in, see the dashboard, refresh, and still be logged in.

---

## Phase 4 — Recording & Live Transcription

**Goal:** Microphone records audio; transcript appears live on screen.

**Steps:**
1. Create `useSpeechRecognition` custom React hook
2. Hook initialises `window.webkitSpeechRecognition`
3. Set `continuous = true`, `interimResults = true`, `lang = 'en-US'`
4. Interim results shown in lighter text; final results appended to transcript state
5. Timer counts up while recording is active
6. Handle permission denied error with a clear message
7. Handle recognition stopping unexpectedly — auto-restart

**Deliverables:**
- [ ] Start button requests mic and begins recognition
- [ ] Live text appears on screen as you speak
- [ ] Stop button ends the session and stores raw transcript in local state
- [ ] Timer shows elapsed time
- [ ] Error state shown if mic is blocked

**Done when:** Speaking into the mic produces live text on the Session screen.

---

## Phase 5 — Note Storage (Database Integration)

**Goal:** When a session ends, save the raw transcript. Load past notes on the dashboard.

**Steps:**
1. Install `@supabase/supabase-js`, initialise client with env vars
2. On session stop: insert a new row into `notes` table with `raw_transcript`, `user_id`, `created_at`
3. On dashboard load: fetch all notes for the logged-in user, ordered by `created_at DESC`
4. Render real note cards (replace dummy data)
5. On note card click: fetch the single note by `id` and render in Note Detail view

**Deliverables:**
- [ ] Session stop saves to Supabase
- [ ] Dashboard loads real notes from database
- [ ] Note Detail view loads real note content
- [ ] Only the logged-in user's notes are visible

**Done when:** Record a session → stop → refresh the page → note appears on dashboard.

---

## Phase 6 — AI Summarisation

**Goal:** After a session ends, send the transcript to Claude and display the structured summary.

**Steps:**
1. Install `@anthropic-ai/sdk`, add `VITE_ANTHROPIC_API_KEY` to `.env`
2. After session stop, call Claude API with the raw transcript
3. Prompt Claude to return JSON: `{ title, summary, action_items: string[] }`
4. Parse the response and update the `notes` row in Supabase with `title`, `summary`, `action_items`
5. Show loading state ("Generating your notes…") while API call is in progress
6. Display summary and action items in Note Detail view

**Deliverables:**
- [ ] Loading spinner shown after session stop
- [ ] Title auto-generated from meeting content
- [ ] Summary paragraph displayed
- [ ] Action items list displayed as cards
- [ ] Data persisted in Supabase

**Done when:** Record a short test meeting → stop → see a real AI-generated summary.

---

## Phase 7 — AI Guidance Panel

**Goal:** Clicking an action item opens a panel with step-by-step guidance and a follow-up chat.

**Steps:**
1. Build `GuidancePanel` component (slide-in from right)
2. On "Get Help →" click: call Claude API with the action item text + full meeting summary as context
3. Stream the response into the panel (use streaming API)
4. Render the steps as formatted markdown
5. Add follow-up chat input — maintain message history in local state
6. Each follow-up sends full chat history back to Claude for context
7. Add copy-to-clipboard button

**Deliverables:**
- [ ] Panel slides in from the right
- [ ] Step-by-step guidance generated for any action item
- [ ] Response streams word by word
- [ ] Follow-up questions work in chat format
- [ ] Panel can be closed

**Done when:** Click any action item → see real AI steps → ask a follow-up → get a relevant answer.

---

## Phase 8 — Search, Edit & Polish

**Goal:** Finish remaining functional requirements and fix rough edges.

**Steps:**
1. Search bar on dashboard filters notes by keyword (client-side filter on title + summary)
2. Edit mode on Note Detail — user can change title, summary, action items
3. Save edits back to Supabase
4. Delete note with confirmation dialog
5. Mark action items as done (checkbox state saved to DB)
6. Handle all error states (see design doc)
7. Mobile responsive check

**Deliverables:**
- [ ] Search works
- [ ] Edit and save works
- [ ] Delete works
- [ ] Checkbox state persists
- [ ] All error states show correct messages

---

## Phase 9 — Deploy to Vercel

**Goal:** App is live at a public URL, accessible from any browser.

**Steps:**
1. Push project to a GitHub repository
2. Connect GitHub repo to Vercel (free account at vercel.com)
3. Add all environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY`
4. Add the Vercel deployment URL to Supabase Auth allowed redirect URLs
5. Add the Vercel URL to Google OAuth authorised redirect URIs
6. Trigger deploy — Vercel builds and publishes automatically

**Done when:** App opens at `https://your-app.vercel.app` and everything works end to end.

---

## Prompt Sequence (for AI Coding Agents)

Use these prompts in order. Do not skip phases.

| # | Agent Prompt Summary | Tool |
|---|---|---|
| 1 | Build full static UI from design doc | Bolt.new |
| 2 | Set up Supabase tables and RLS | Manual (Supabase dashboard) |
| 3 | Add Google OAuth authentication | Cursor / Kilo |
| 4 | Implement Web Speech API recording hook | Cursor / Kilo |
| 5 | Connect Supabase — save and load notes | Cursor / Kilo |
| 6 | Add Claude API summarisation on session end | Cursor / Kilo |
| 7 | Build AI Guidance Panel with streaming + chat | Cursor / Kilo |
| 8 | Add search, edit, delete, polish | Cursor / Kilo |
| 9 | Deploy to Vercel | Manual (Vercel dashboard) |
