# Votecatcher

A modern, full-stack voting and user management app built with Next.js 
---

## 📁 Project Structure
```
app/
  account/         # User profile pages & forms
  auth/            # Auth routes (signout, confirm)
  error/           # Error page
  login/           # Login/signup page & actions
  globals.css      # Global styles
  layout.tsx       # App layout
  page.tsx         # Root redirect
middleware.ts      # Next.js middleware (session, host check)
utils/
  supabase/        # Supabase client/server/middleware utils
package.json       # Project config
README.md          # This file
```

---

## 🏁 Getting Started

### 1. Register for Supabase and Create a Project
1. Go to [supabase.com](https://supabase.com/) and sign up for a free account.
2. Click **New Project** in your Supabase dashboard.
3. Choose a project name, password, and region, then click **Create new project**.
4. Once your project is created, find the [migration.sql](migration.sql) file, and run it's contents in the project's SQL Editor.
5. Go to **Project Settings > API** to find your Project URL and Anon Public Key.


### 2. Set up environment variables
Replace the `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url # http://<project name>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key # found at https://supabase.com/dashboard/project/<project name>/settings/api-keys
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the development server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 📄 License

MIT License. See [LICENSE](LICENSE.md) for details.