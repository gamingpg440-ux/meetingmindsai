# Environment Setup Guide
## AI-Powered Meeting Notes & Task Guidance Web App

**Complete this guide before writing any code.**

---

## Step 1 — Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS version** (Long Term Support)
3. Run the installer — click Next through all steps
4. Open a terminal (on Windows: search "cmd" or "PowerShell")
5. Verify installation:
   ```
   node --version
   npm --version
   ```
   Both should print a version number. If they do, Node is ready.

---

## Step 2 — Create a Supabase Project

1. Go to https://supabase.com and create a free account
2. Click **New Project**
3. Choose a name (e.g. `meetingmind`), set a database password, pick any region
4. Wait ~2 minutes for the project to be ready
5. Go to **Project Settings → API**
6. Copy and save these two values — you will need them later:
   - **Project URL** (looks like: `https://xyzxyz.supabase.co`)
   - **anon public key** (a long string starting with `eyJ...`)

### Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Paste the following SQL and click **Run**:

```sql
-- Notes table
CREATE TABLE notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now(),
  title text,
  raw_transcript text,
  summary text,
  action_items jsonb DEFAULT '[]'::jsonb
);

-- Guidance sessions table
CREATE TABLE guidance_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  action_item text NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb
);

-- Row-Level Security: users can only access their own data
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own notes"
ON notes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own guidance sessions"
ON guidance_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

4. Confirm both tables appear in the **Table Editor** with the lock icon (RLS enabled).

---

## Step 3 — Set Up Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project (or use an existing one)
3. Go to **APIs & Services → OAuth consent screen**
   - Choose **External**, click Create
   - Fill in App name (e.g. MeetingMind) and your email
   - Save and continue through all steps
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorised redirect URIs — add:
     ```
     https://xyzxyz.supabase.co/auth/v1/callback
     ```
     (Replace `xyzxyz` with your actual Supabase project reference)
6. Copy the **Client ID** and **Client Secret**
7. Go back to your Supabase project → **Authentication → Providers → Google**
8. Enable Google, paste the Client ID and Client Secret, save.

---

## Step 4 — Get an Anthropic API Key

1. Go to https://console.anthropic.com and create a free account
2. Go to **API Keys → Create Key**
3. Copy the key (starts with `sk-ant-...`) — you will not be able to see it again
4. Store it safely (e.g. in a password manager or notes app)

> **Note:** The Anthropic free tier includes enough credits to build and test this app. Ongoing usage costs approximately $2–5 per month for light use.

---

## Step 5 — Set Up the Project (after Bolt.new export)

Once you have downloaded your project from Bolt.new:

1. Open the project folder in VS Code or Cursor
2. Create a file named `.env` in the root of the project folder
3. Add the following — replace the placeholder values with your real credentials:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

4. Open a terminal in the project folder and run:
```
npm install
```

5. Start the development server:
```
npm run dev
```

6. Open your browser and go to: `http://localhost:5173`

The app should load. If you see an error, check that your `.env` file is saved correctly.

---

## Step 6 — Deploy to Vercel

Do this only after the app is fully working locally (Phase 9 in the implementation plan).

1. Go to https://github.com and create a free account
2. Create a new repository and push your project code to it
3. Go to https://vercel.com and create a free account
4. Click **Add New Project → Import from GitHub**
5. Select your repository
6. Before clicking Deploy, go to **Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY`
7. Click **Deploy** — Vercel builds and publishes the app automatically
8. Copy the live URL (e.g. `https://meetingmind.vercel.app`)
9. Add this URL to:
   - Supabase → Authentication → URL Configuration → Site URL
   - Google Cloud Console → OAuth 2.0 Credentials → Authorised redirect URIs:
     ```
     https://meetingmind.vercel.app/auth/callback
     ```

---

## Files That Must Never Be Committed to GitHub

Add a `.gitignore` file to your project root with at minimum:

```
node_modules/
.env
.env.local
dist/
```

This prevents your API keys from being exposed publicly.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Make sure Node.js is installed correctly. Run `node --version` |
| App loads but shows blank screen | Check browser console (F12) for errors. Usually a missing `.env` variable |
| Microphone not working | In Chrome, click the lock icon in the address bar → allow microphone |
| Google login not working | Check that the Supabase callback URL is added to Google OAuth redirect URIs |
| Supabase queries return no data | Check that RLS policies are created and that the user is logged in |
| Vercel deploy fails | Check that all environment variables are added in the Vercel dashboard |
