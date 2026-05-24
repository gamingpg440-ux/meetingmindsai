# Product Requirements Document (PRD)
## AI-Powered Meeting Notes & Task Guidance Web App

**Version:** 1.0  
**Date:** May 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary

This is a browser-based web application that listens to meeting conversations in real time, transcribes speech to text, organises the output into structured notes, stores them by date, and provides AI-powered guidance on how to act on any tasks or topics that are mentioned. The product requires no installation and runs entirely inside Google Chrome or Microsoft Edge.

### 1.2 Problem Statement

Office professionals frequently attend meetings where:

- Action items and tasks are mentioned verbally but not captured in writing.
- Unfamiliar projects or topics are introduced without adequate context.
- There is no immediate guide on how to begin working on a newly assigned task.
- Notes taken manually during meetings are incomplete or hard to review later.

Office-managed laptops additionally prevent the installation of third-party desktop software, making conventional note-taking tools difficult to deploy.

### 1.3 Goals

- Automatically transcribe live meeting audio in real time.
- Summarise spoken content into clean, structured notes.
- Store notes in a cloud database, organised by date.
- Offer AI-generated guidance for every task or action item identified.
- Operate entirely within a web browser with no installation required.

### 1.4 Non-Goals

- This product will not integrate with video conferencing platforms (e.g. Zoom, Teams) in v1.
- This product will not support multiple simultaneous users editing a shared note in real time (collaborative editing) in v1.
- This product will not provide speaker diarisation (identifying who said what) in v1.

---

## 2. Target Users

### Primary User

**The Office Professional**

- Attends multiple meetings per week.
- Is frequently assigned tasks verbally without written follow-up.
- Works on a company-managed laptop with restricted software installation rights.
- May encounter unfamiliar projects and needs context or a starting point quickly.
- Comfortable using web browsers and cloud tools (e.g. Gmail, Google Docs).

### User Personas

| Persona | Description |
|---|---|
| The Overwhelmed Manager | Attends back-to-back meetings, forgets details, needs a structured record |
| The New Joiner | Hears unfamiliar project names and terminology, needs guided next steps |
| The Individual Contributor | Gets assigned tasks in passing, wants to know how to start immediately |

---

## 3. User Stories

### Recording & Transcription
- As a user, I want to click a button to start recording my meeting audio so that the app begins capturing what is said.
- As a user, I want to see the transcription appear on screen in real time so that I know the app is working.
- As a user, I want to click a button to stop recording so that the session ends and my notes are saved.

### Notes Management
- As a user, I want my notes to be automatically summarised from the raw transcription so that I do not have to read through everything verbatim.
- As a user, I want my notes to be saved with the current date so that I can find them later.
- As a user, I want to browse all past meeting notes organised by date so that I can review what was discussed previously.
- As a user, I want to search through past notes by keyword so that I can find a specific topic quickly.
- As a user, I want to edit a note after it is saved so that I can correct any transcription errors.

### AI Task Guidance
- As a user, I want the app to automatically identify action items from the transcription so that nothing is missed.
- As a user, I want to click on any task or action item and receive step-by-step guidance from an AI on how to approach it so that I know where to begin.
- As a user, I want to ask a follow-up question about a task in a chat interface so that I can explore it further.
- As a user, I want the AI to consider the context of the meeting when giving me guidance so that its advice is relevant.

### Access & Settings
- As a user, I want to log in with my Google account so that my notes are private and tied to my identity.
- As a user, I want my data to persist across sessions so that I never lose a past meeting record.

---

## 4. Functional Requirements

### 4.1 Audio Recording & Transcription

| ID | Requirement | Priority |
|---|---|---|
| F-01 | The app shall request microphone access via the browser's native permission prompt | Must Have |
| F-02 | The app shall transcribe speech to text in real time using the Web Speech API | Must Have |
| F-03 | The app shall display the live transcript on screen as words are recognised | Must Have |
| F-04 | The app shall handle pauses in speech gracefully without stopping the session | Must Have |
| F-05 | The app shall support English language transcription in v1 | Must Have |
| F-06 | The app shall show a visual indicator (e.g. pulsing icon) while recording is active | Should Have |

### 4.2 Note Generation & Storage

| ID | Requirement | Priority |
|---|---|---|
| F-07 | Upon session end, the app shall send the raw transcript to an LLM to generate a structured summary | Must Have |
| F-08 | The summary shall include: a title, key discussion points, and a list of action items | Must Have |
| F-09 | Each note shall be stored in the database with a timestamp (date and time) | Must Have |
| F-10 | Notes shall be retrievable and displayed in a list sorted by date (newest first) | Must Have |
| F-11 | The user shall be able to edit and save changes to any stored note | Should Have |
| F-12 | The user shall be able to delete a note | Should Have |
| F-13 | The user shall be able to search notes by keyword | Should Have |

### 4.3 AI Task Guidance

| ID | Requirement | Priority |
|---|---|---|
| F-14 | The app shall highlight detected action items within the note summary | Must Have |
| F-15 | The user shall be able to click any action item to open an AI guidance panel | Must Have |
| F-16 | The AI guidance panel shall display a step-by-step plan for completing the task | Must Have |
| F-17 | The user shall be able to type follow-up questions in the guidance panel | Must Have |
| F-18 | The AI shall use the full meeting context when generating task guidance | Must Have |
| F-19 | The user shall be able to copy the AI guidance to clipboard | Should Have |

### 4.4 Authentication & Access

| ID | Requirement | Priority |
|---|---|---|
| F-20 | The app shall support login via Google OAuth | Must Have |
| F-21 | Each user shall only be able to view their own notes | Must Have |
| F-22 | Sessions shall persist so the user does not have to log in every time | Should Have |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Availability** | The app shall be accessible via any modern browser (Chrome 90+, Edge 90+) |
| **Performance** | Transcription latency shall not exceed 3 seconds behind real speech |
| **Security** | All data in transit shall be encrypted via HTTPS |
| **Security** | Audio is processed in-browser; raw audio shall never be transmitted to the server |
| **Privacy** | Transcripts and notes shall be stored per user account and never shared |
| **Scalability** | The backend shall handle concurrent users without degradation |
| **Reliability** | If the transcription engine pauses, the app shall attempt to resume automatically |
| **Usability** | A new user shall be able to start their first recording within 60 seconds of opening the app |

---

## 6. Out of Scope (v1)

- Mobile application (iOS / Android)
- Speaker identification / diarisation
- Integration with Zoom, Teams, or Google Meet
- Offline mode
- Export to PDF or Word
- Team / shared workspace features
- Custom vocabulary or domain-specific language model fine-tuning

---

## 7. Success Metrics

| Metric | Target |
|---|---|
| Time to first recording | Under 60 seconds from first visit |
| Transcription accuracy | > 85% word accuracy in a quiet environment |
| Note generation time | Summary generated within 10 seconds of session end |
| User retention | User returns to review notes within 24 hours of a meeting |
| Task guidance satisfaction | User rates guidance as helpful (qualitative feedback in v2) |

---

## 8. Assumptions & Dependencies

- The user's browser is Google Chrome (version 90 or later) or Microsoft Edge.
- The user has a working microphone connected to their laptop.
- The user has internet access during meetings.
- The Anthropic Claude API is available and accessible from the frontend.
- Supabase is used as the cloud database and authentication provider.

---

## 9. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Web Speech API not supported in some browsers | Low | Clearly communicate Chrome/Edge requirement |
| Microphone blocked by IT policy in the browser | Medium | Document how to enable microphone in Chrome settings |
| Background noise reducing transcription accuracy | Medium | Recommend headset use; add noise guidance in onboarding |
| API cost overrun from heavy LLM usage | Low | Implement per-user API call limits in v1 |
| Supabase free tier limits exceeded | Low | Monitor usage; upgrade plan if needed |
