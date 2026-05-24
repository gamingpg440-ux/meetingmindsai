# Design Document
## AI-Powered Meeting Notes & Task Guidance Web App

**Version:** 1.0  
**Date:** May 2026  
**Status:** Draft

---

## 1. Design Philosophy

The interface follows three principles:

1. **Focus when it matters.** During a meeting, the user's attention is on the conversation — not the screen. The recording view must be minimal and distraction-free.
2. **Structure after the fact.** All organisation, summarisation, and guidance happen after the session, so the user is not overwhelmed mid-meeting.
3. **Guidance over information.** When a user clicks an action item, they must receive a clear next step immediately — not a wall of context.

---

## 2. Information Architecture

```
App (authenticated)
│
├── /dashboard              ← List of all past notes, grouped by date
│   └── [note card]         ← Click to open a note
│
├── /session                ← Active recording screen
│   ├── Live transcript view
│   ├── Recording controls (Start / Stop)
│   └── Session timer
│
├── /notes/:id              ← Single note detail view
│   ├── Title + date
│   ├── Summary (key points)
│   ├── Action items list (each is clickable)
│   ├── Raw transcript (collapsible)
│   └── Guidance panel (slides in when action item clicked)
│
└── /settings               ← User preferences
    ├── Language selection
    ├── Account info
    └── Sign out
```

---

## 3. Screen Designs

### 3.1 Dashboard (Home Screen)

**Purpose:** Show all past meeting notes grouped by date. Entry point to review or start a new session.

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  🎙 MeetingMind                          [+ New Session]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔍 Search notes...                                      │
│                                                          │
│  ── Today, 24 May 2026 ──────────────────────────────── │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📝 Product Roadmap Review                  10:30  │  │
│  │  3 action items · 12 min session                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ── Yesterday, 23 May 2026 ──────────────────────────── │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📝 Budget Planning Call                    14:15  │  │
│  │  5 action items · 28 min session                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📝 Weekly Stand-up                         09:00  │  │
│  │  2 action items · 8 min session                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- **Top bar:** App name/logo on the left; "New Session" primary button on the right.
- **Search bar:** Full-width, filters note cards by keyword in real time.
- **Date group headers:** Sticky section labels as the user scrolls.
- **Note cards:** Title, time, action item count, session duration. Click to open.

---

### 3.2 Session Screen (Active Recording)

**Purpose:** Minimal screen shown during a live meeting. Start/stop recording, watch the transcript appear live.

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  ← Back                                         00:12:34  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                  🔴  Recording...                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │  ...so the deadline for the first milestone is     │  │
│  │  end of June. We need to assign someone to the     │  │
│  │  procurement process and also check with legal     │  │
│  │  about the new vendor contracts before we sign     │  │
│  │  anything off...                                   │  │
│  │                                                    │  │
│  │  ▌ (cursor — text appears here live)               │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│           [ ⏹  Stop & Save Session ]                    │
│                                                          │
│  Tip: Keep this tab open during your meeting.            │
│  Audio is processed locally in your browser.             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- **Timer:** Shows elapsed session duration (top right).
- **Recording indicator:** Pulsing red dot with "Recording..." label.
- **Live transcript area:** Scrollable text box; auto-scrolls to the bottom as new text arrives. Interim (unconfirmed) text is shown in lighter colour.
- **Stop & Save button:** Ends the session, triggers AI summarisation, then navigates to the note detail view.
- **Privacy tip:** Reassures the user that audio is local.

**States:**

| State | UI Behaviour |
|---|---|
| Not started | Large "Start Recording" button centred on screen |
| Microphone permission pending | Spinner + "Waiting for microphone access…" |
| Permission denied | Error message + instructions to enable mic in Chrome |
| Recording active | Pulsing indicator, live transcript, Stop button |
| Processing (after stop) | Loading spinner: "Generating your notes…" |
| Complete | Redirect to note detail view |

---

### 3.3 Note Detail View

**Purpose:** Display the structured summary, action items, and raw transcript for a saved session. Action items are interactive.

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  ← Dashboard          Product Roadmap Review    [✏ Edit]  │
│                        24 May 2026 · 10:30 · 12 min      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SUMMARY                                                 │
│  ─────────────────────────────────────────────────────  │
│  The team discussed the Q3 product roadmap. The first    │
│  milestone deadline is set for end of June. Key topics   │
│  included procurement, vendor contract approvals, and    │
│  resourcing for the design sprint in July.               │
│                                                          │
│  ACTION ITEMS                                            │
│  ─────────────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✅  Assign someone to lead the procurement        │  │
│  │      process                          [Get Help →] │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✅  Check with Legal re: new vendor contracts     │  │
│  │      before sign-off                  [Get Help →] │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✅  Confirm resourcing for July design sprint     │  │
│  │                                       [Get Help →] │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  RAW TRANSCRIPT  [▼ Show]                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- **Header:** Note title, date, time, session duration. Edit button to enable inline editing.
- **Summary section:** Paragraph form, AI-generated.
- **Action items section:** Each item is a card with a checkbox (for marking done) and a "Get Help →" button.
- **Raw transcript:** Collapsed by default; click to expand.

---

### 3.4 AI Guidance Panel

**Purpose:** Slide-in panel that appears when the user clicks "Get Help →" on an action item. Provides a step-by-step plan and allows follow-up chat.

**Layout (panel slides in from the right):**

```
┌───────────────────────────────────────────────────────────────────┐
│  Note Detail View              │  AI GUIDANCE                  ✕  │
│                                │  ─────────────────────────────── │
│  [note content as before]      │  Task:                           │
│                                │  "Check with Legal re: vendor     │
│                                │  contracts before sign-off"       │
│                                │                                   │
│                                │  Here is how to approach this:    │
│                                │                                   │
│                                │  1. Identify the specific         │
│                                │     contracts that need review.   │
│                                │     Look at your vendor list and  │
│                                │     flag any signed in the past   │
│                                │     12 months.                    │
│                                │                                   │
│                                │  2. Draft a short briefing email  │
│                                │     to the Legal team summarising │
│                                │     the context from today's      │
│                                │     meeting.                      │
│                                │                                   │
│                                │  3. Request a 20-minute review    │
│                                │     slot before the end-of-June   │
│                                │     milestone deadline.           │
│                                │                                   │
│                                │  4. Prepare a list of specific    │
│                                │     clauses or concerns to        │
│                                │     discuss in the meeting.       │
│                                │                                   │
│                                │  ─────────────────────────────── │
│                                │  Ask a follow-up question...      │
│                                │  ┌─────────────────────────────┐ │
│                                │  │                             │ │
│                                │  └─────────────────────────────┘ │
│                                │                        [Send →]   │
└───────────────────────────────────────────────────────────────────┘
```

**Components:**
- **Panel header:** Task label and close button.
- **Guidance content:** Numbered steps rendered as markdown.
- **Follow-up chat:** Input field and send button. Chat history grows upward. Responses stream in word by word.
- **Copy button:** Copies the full guidance to clipboard.

---

## 4. Component Library

| Component | Type | Usage |
|---|---|---|
| `NoteCard` | Display | Shown on dashboard for each saved note |
| `RecordButton` | Control | Start/stop session toggle |
| `LiveTranscript` | Display | Scrollable live text area during session |
| `SummaryBlock` | Display | AI-generated summary paragraph |
| `ActionItemCard` | Interactive | Checkbox + Get Help button per task |
| `GuidancePanel` | Overlay | Slide-in panel with AI steps + chat |
| `SearchBar` | Input | Filters note list on dashboard |
| `DateGroupHeader` | Display | Sticky date label in note list |
| `LoadingOverlay` | Feedback | "Generating your notes…" spinner |
| `ErrorBanner` | Feedback | Microphone permission denied, API error, etc. |

---

## 5. Colour Palette & Typography

### Colours

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#6366F1` (Indigo 500) | Primary buttons, links, active states |
| `--color-primary-dark` | `#4F46E5` (Indigo 600) | Button hover states |
| `--color-surface` | `#FFFFFF` | Card and panel backgrounds |
| `--color-background` | `#F9FAFB` | Page background |
| `--color-text-primary` | `#111827` | Headings and body copy |
| `--color-text-secondary` | `#6B7280` | Metadata (date, duration) |
| `--color-recording` | `#EF4444` | Recording indicator (red) |
| `--color-action-item` | `#F0FDF4` | Action item card background (light green) |
| `--color-border` | `#E5E7EB` | Card and input borders |

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| App name | Inter | 20px | 700 |
| Page heading | Inter | 22px | 600 |
| Section label | Inter | 12px uppercase | 600 |
| Body text | Inter | 15px | 400 |
| Note card title | Inter | 16px | 500 |
| Metadata / labels | Inter | 13px | 400 |
| Transcript text | JetBrains Mono | 14px | 400 |

---

## 6. Responsive Behaviour

The app is designed primarily for laptop screens (1280px+). On smaller screens:

| Screen width | Behaviour |
|---|---|
| > 1280px | Full two-panel layout (note + guidance side by side) |
| 768px – 1280px | Guidance panel overlays the note (full-height drawer) |
| < 768px | Mobile layout: single column; guidance panel is a bottom sheet |

---

## 7. User Flows

### Flow 1: Record a New Meeting

```
Open app → Dashboard → Click "New Session"
    → Session screen loads → Click "Start Recording"
    → Chrome asks for microphone permission → Allow
    → Live transcript appears
    → Meeting ends → Click "Stop & Save Session"
    → Loading spinner ("Generating your notes…")
    → Redirected to Note Detail View
    → Summary and action items displayed
```

### Flow 2: Get Help with a Task

```
Dashboard → Click a note card
    → Note Detail View opens
    → User reads action items
    → Clicks "Get Help →" on one item
    → Guidance Panel slides in from right
    → Step-by-step plan appears (streamed)
    → User types a follow-up question
    → AI responds in the chat area
```

### Flow 3: Review Past Notes

```
Dashboard → Type keyword in search bar
    → Note cards filter in real time
    → User clicks the relevant note
    → Note Detail View opens
    → User expands raw transcript to verify a detail
```

---

## 8. Accessibility

| Requirement | Implementation |
|---|---|
| Keyboard navigation | All interactive elements reachable via Tab key |
| Screen reader support | ARIA labels on icon-only buttons; live region on transcript |
| Colour contrast | All text meets WCAG AA (4.5:1 contrast ratio minimum) |
| Focus indicators | Visible focus ring on all focusable elements |
| Error messages | Described in text, not colour alone |

---

## 9. Empty & Error States

| State | Message shown |
|---|---|
| No notes yet | "No meetings recorded yet. Click 'New Session' to get started." |
| Microphone denied | "Microphone access was blocked. Please enable it in your browser settings and try again." |
| API error (summarisation) | "We couldn't generate your notes right now. Your transcript has been saved — try again shortly." |
| Search returns no results | "No notes match your search. Try a different keyword." |
| Guidance panel API error | "Something went wrong generating guidance. Please try again." |
