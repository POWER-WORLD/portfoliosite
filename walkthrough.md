# Walkthrough - Dynamic Portfolio & Admin Dashboard Integration

The task of converting the static React portfolio into a fully dynamic website, backed by a Node.js + Express API server connected to MongoDB, and adding a dark-theme glassmorphic Admin panel, is complete.

---

## 1. Summary of Accomplishments

### Backend API Server (`backend/`)
- **Express Server**: Configured server with CORS and high limit JSON payload processing (up to 10MB) to handle Base64 images easily.
- **MongoDB Connection**: Hooked up connection using Mongoose and the user's connection URI in `.env`.
- **Database Schemas**: Designed collections for:
  - Personal Information (logo name, header title, tagline, location, email, resume).
  - Biography story, highlight metrics, and education history.
  - Skills (categorized with icon titles and sliding level percentages).
  - Project Cards (title, description, category, tags array, urls, cover image).
  - Employment experiences (timeline roles).
  - Certificates (credentials and badges) & Achievements metrics.
- **Data Seeding**: Implemented a standalone seeding script (`npm run seed`) to initially populate MongoDB with the developer's records.
- **Admin JWT Verification**: Created a secure endpoint verifying master passwords and issuing JWT tokens valid for 7 days.

### Frontend dynamic client (`frontend/`)
- **API Fetch Service**: Implemented [api.ts](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/services/api.ts) fetching the entire portfolio in a single call, sharing the pending promise so only one request goes to the server.
- **Offline / Server-Down Fallback**: Configured all rendering sections (`Hero`, `About`, `Skills`, `Projects`, `Experience`, `Certificates`, `Achievements`, `Contact`, `Footer`) to use static constants as the initial/fallback state. If the server is offline, the site loads instantly with the static constants.
- **React Icon Resolvers**: Built a mapping layer to resolve string representation of icons stored in the database (e.g. `"FaCode"`) back into live React Icons.

### Admin Dashboard Portal (`admin/`)
- **Tech Stack**: Created a Vite + React + TypeScript + Vanilla CSS dashboard.
- **Auth Guard**: Center-aligned login page gating the content editor behind the master password.
- **Premium Glassmorphic Theme**: Hand-coded `index.css` styling: dark backgrounds, card glassmorphism, sliders, forms, grids, and modal wrappers.
- **Modular CMS Tabs**:
  - **Core Profile**: Edit personal info, biography description, add/remove timeline educations.
  - **Core Skills**: Manage categories, visual icons, and drag range sliders.
  - **Project Cards**: Create projects with a built-in Base64 file uploader (for screenshots) and tags.
  - **Professional Timeline**: CRUD table managing roles and employment periods.
  - **Certs & Metrics**: Manage credentials and portfolio metric counters (e.g. Lighthouse score).

---

## 2. Active Development Environment

All three services have been successfully launched in the background on their respective ports:

| Service | Port / Address | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | Dynamic portfolio website |
| **Admin Dashboard** | [http://localhost:5174](http://localhost:5174) | CMS panel to add, edit, or delete data |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | Express backend server connected to MongoDB Atlas |

### Credentials
- **Master Admin Password**: `admin123` (configured in [backend/.env](file:///d:/VS%20code%20file/React_projects/portfolio_web/backend/.env))

---

## 3. Verification Details

### Automated Build Checks
- **Admin Panel Build**: Passed compilation check with no TypeScript compiler errors or module warnings.
- **Frontend App Build**: Built the production client cleanly.

### Manual Verification
1. Open [http://localhost:5174](http://localhost:5174) in your browser.
2. Enter `admin123` to log in.
3. Edit the Full Display Name or details on the Core Profile tab and click Save.
4. Reload the portfolio site at [http://localhost:5173](http://localhost:5173) to see the name update in the Hero header and footer in real time.
