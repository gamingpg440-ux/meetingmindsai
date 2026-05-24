# Tech Stack Document
## AI-Powered Meeting Notes & Task Guidance Web App

**Version:** 1.0  
**Date:** May 2026  
**Status:** Draft

---

## 1. Guiding Principles

The following constraints shape every technology decision in this document:

1. **Zero installation on end-user devices.** The app must run entirely in a web browser with no plugins, extensions, or desktop software.
2. **Free or low-cost to operate.** All core services should have a free tier adequate for a single-user or small-team use case.
3. **Minimal infrastructure to manage.** Prefer managed services over self-hosted infrastructure.
4. **Security by default.** All data must be encrypted in transit and at rest. Audio must never leave the browser.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            React Frontend (Vite)                 │   │
│  │                                                  │   │
│  │  ┌─────────────────┐   ┌──────────────────────┐  │   │
│  │  │  Web Speech API │   │   Supabase JS Client │  │   │
│  │  │  (transcription)│   │ (auth + database)    │  │   │
│  │  └─────────────────┘   └──────────────────────┘  │   │
│  │                                                  │   │
│  │  ┌───────────────────────────────────────────┐   │   │
│  │  │         Anthropic Claude API Client       │   │   │
│  │  │   (note summarisation + task guidance)    │   │   │
│  │  └───────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
          │                          │
          ▼                          ▼
┌──────────────────┐      ┌──────────────────────────┐
│  Supabase Cloud  │      │   Anthropic Claude API   │
│  - Auth (OAuth)  │      │   - claude-sonnet-4-6     │
│  - PostgreSQL DB │      │   - Summarisation         │
│  - Row-level     │      │   - Task guidance chat    │
│    security      │      └──────────────────────────┘
└──────────────────┘
          │
          ▼
┌──────────────────┐
│  Vercel Hosting  │
│  (static deploy) │
└──────────────────┘
```

---

## 3. Technology Decisions

### 3.1 Frontend Framework — React + Vite

| Property | Detail |
|---|---|
| **Technology** | React 18 with Vite as the build tool |
| **Language** | TypeScript |
| **Why React** | Large ecosystem, component-based architecture suits the panel-heavy UI, excellent community support |
| **Why Vite** | Near-instant hot reload during development, fast production builds, simple configuration |
| **Alternatives considered** | Next.js (adds unnecessary server complexity for this use case), plain HTML (too slow to build) |

### 3.2 Speech Transcription — Web Speech API

| Property | Detail |
|---|---|
| **Technology** | Browser-native `SpeechRecognition` API |
| **Why** | Built into Chrome and Edge — zero cost, zero installation, no audio leaves the browser |
| **Supported browsers** | Chrome 25+, Edge 79+ (covers the vast majority of office environments) |
| **Language support** | English (en-US, en-GB) in v1; extensible to other locales |
| **Limitations** | Requires an active internet connection; not available in Firefox or Safari |
| **Fallback (v2)** | If Web Speech API is unavailable, integrate OpenAI Whisper API as a fallback |

```javascript
// Example initialisation
const recognition = new window.webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
```

### 3.3 AI Model — Anthropic Claude API

| Property | Detail |
|---|---|
| **Technology** | Anthropic Claude API (`claude-sonnet-4-6`) |
| **Usage 1** | Post-session: summarise raw transcript into structured notes with action items |
| **Usage 2** | On-demand: generate step-by-step task guidance when user clicks an action item |
| **Usage 3** | Conversational follow-up: chat interface for questions about a task |
| **Why Claude** | Strong instruction-following, long context window (handles long transcripts), precise structured output |
| **API call location** | Called directly from the browser frontend using the Anthropic JS SDK |
| **Cost control** | API calls are made only at session end (summarisation) and on explicit user action (guidance) — not continuously |

### 3.4 Database & Authentication — Supabase

| Property | Detail |
|---|---|
| **Technology** | Supabase (managed PostgreSQL + Auth + REST API) |
| **Authentication** | Google OAuth via Supabase Auth |
| **Database** | PostgreSQL with Row-Level Security (RLS) enforcing per-user data isolation |
| **SDK** | `@supabase/supabase-js` (browser-compatible) |
| **Why Supabase** | Free tier is generous, no backend server needed, built-in auth, real-time capable |
| **Alternatives considered** | Firebase (less SQL-friendly), PlanetScale (no auth layer), self-hosted PostgreSQL (too much ops) |

### 3.5 Hosting — Vercel

| Property | Detail |
|---|---|
| **Technology** | Vercel (static site hosting) |
| **Deployment** | Automatic deployments from GitHub on every push to `main` |
| **URL** | Custom domain or free `*.vercel.app` subdomain |
| **Why Vercel** | Free tier, zero config for Vite/React apps, global CDN, HTTPS by default |
| **Alternatives considered** | Netlify (equivalent, either works), GitHub Pages (less CDN optimisation) |

### 3.6 Styling — Tailwind CSS

| Property | Detail |
|---|---|
| **Technology** | Tailwind CSS v3 |
| **Why** | Utility-first approach allows rapid UI development without writing custom CSS files |
| **Component library** | shadcn/ui for pre-built accessible components (dialogs, buttons, cards, inputs) |

### 3.7 State Management

| Property | Detail |
|---|---|
| **Technology** | React Context API + `useState` / `useReducer` |
| **Why** | The app's state is not complex enough to justify Redux or Zustand in v1 |
| **Scope** | Auth state (global), current session transcript (local), notes list (local with Supabase sync) |

---

## 4. Database Schema

### Table: `notes`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Auto-generated unique identifier |
| `user_id` | `uuid` (FK → auth.users) | Owner of the note |
| `created_at` | `timestamptz` | Date and time the session ended |
| `title` | `text` | AI-generated title for the meeting |
| `raw_transcript` | `text` | The full verbatim transcription |
| `summary` | `text` | AI-generated summary (key points) |
| `action_items` | `jsonb` | Array of action item objects |
| `updated_at` | `timestamptz` | Last manual edit timestamp |

### Table: `guidance_sessions`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Unique identifier |
| `note_id` | `uuid` (FK → notes) | The note this guidance belongs to |
| `user_id` | `uuid` (FK → auth.users) | Owner |
| `action_item` | `text` | The task being discussed |
| `messages` | `jsonb` | Full chat history (role + content array) |
| `created_at` | `timestamptz` | When the guidance session started |

### Row-Level Security Policy (example)

```sql
-- Users can only read their own notes
CREATE POLICY "Users can access own notes"
ON notes
FOR ALL
USING (auth.uid() = user_id);
```

---

## 5. Key Third-Party Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI framework |
| `react-dom` | 18.x | DOM rendering |
| `typescript` | 5.x | Type safety |
| `vite` | 5.x | Build tool and dev server |
| `tailwindcss` | 3.x | Utility CSS framework |
| `@supabase/supabase-js` | 2.x | Supabase client (auth + database) |
| `@anthropic-ai/sdk` | latest | Claude API client |
| `lucide-react` | latest | Icon set |
| `date-fns` | 3.x | Date formatting and grouping |
| `shadcn/ui` | latest | Accessible UI component library |

---

## 6. Security Considerations

| Concern | Approach |
|---|---|
| **API key exposure** | Anthropic API key stored as a Vercel environment variable; never committed to source code |
| **User data isolation** | Supabase Row-Level Security ensures users can only query their own rows |
| **Audio privacy** | Audio is processed entirely by the browser's built-in engine; raw audio bytes are never transmitted |
| **Transport security** | All communication over HTTPS (enforced by Vercel and Supabase) |
| **Authentication** | Google OAuth via Supabase Auth; no passwords stored |
| **Session tokens** | Supabase manages JWT-based sessions with automatic refresh |

---

## 7. Development Environment

| Tool | Purpose |
|---|---|
| **Node.js 20+** | JavaScript runtime for build tools |
| **npm** | Package manager |
| **VS Code** | Recommended editor |
| **ESLint + Prettier** | Code linting and formatting |
| **Git + GitHub** | Version control and CI/CD trigger |

---

## 8. Deployment Pipeline

```
Developer pushes to GitHub (main branch)
        ↓
Vercel detects push via webhook
        ↓
Vercel runs: npm install → npm run build
        ↓
Static files deployed to Vercel CDN
        ↓
App live at https://your-app.vercel.app
```

Total deployment time: approximately 60–90 seconds.

---

## 9. Cost Estimate (Single User, Monthly)

| Service | Free Tier | Estimated Usage | Cost |
|---|---|---|---|
| Vercel | 100 GB bandwidth | < 1 GB | **Free** |
| Supabase | 500 MB DB, 50k auth users | < 50 MB | **Free** |
| Anthropic API | Pay per token | ~5 meetings/week × ~2k tokens | ~**$2–5/month** |
| **Total** | | | **~$2–5/month** |
