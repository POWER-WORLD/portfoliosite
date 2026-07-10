# Comprehensive Portfolio Website & CMS Walkthrough

Welcome to the full system walkthrough of the **Portfolio & CMS Web Application**. This document provides an all-inclusive guide covering the entire system architecture, frontend user interface (UI), backend server API, admin content management panel (CMS), security protocols, and deployment models.

---

## 1. System Architecture Overview

The application utilizes a decoupled, modern **3-Tier Headless CMS Architecture** designed for speed, security, and absolute customizability:

```
 ┌────────────────────────────────┐         ┌────────────────────────────────┐
 │        Frontend Client         │         │      Admin CMS Dashboard       │
 │   (React + Vite + TypeScript)  │         │   (React + Vite + TypeScript)  │
 └───────────────┬────────────────┘         └───────────────┬────────────────┘
                 │ Read-Only Data Fetch                     │ Authenticated CRUD
                 └───────────────────┐   ┌──────────────────┘ (JWT Bearer Auth)
                                     ▼   ▼
                         ┌────────────────────────┐
                         │   Node.js/Express API  │
                         │    Backend Server      │
                         └───────┬────────────┬───┘
                    Mongoose ORM │            │ Supabase Storage API
                                 ▼            ▼
                     ┌───────────────┐    ┌─────────────────────────┐
                     │MongoDB Database│    │ Supabase Bucket Storage │
                     └───────────────┘    │ (PDFs, Images, Resumes) │
                                          └─────────────────────────┘
```

* **Frontend SPA**: Serves as the public portfolio interface, consuming JSON data read-only.
* **Admin CMS Dashboard**: Authenticated workspace for the owner to perform full Create, Read, Update, and Delete (CRUD) operations, change settings, and upload assets.
* **Backend REST API**: An Express application performing validation, database operations via Mongoose, authentication session guarding, and file uploads.
* **Database & File Storage**: MongoDB houses document data, while binary assets (resumes, credentials, and projects pictures) are pushed to Supabase Cloud Storage.

---

## 2. Project Modules & Directory Structure

The repository is divided into three isolated web applications and core configuration blueprints:

```
portfolio_web/
├── frontend/                     # Public portfolio web application (React, TS, Vite)
│   └── src/
│       ├── components/           # UI Layout blocks (GalaxyBackground, SectionHeader, etc.)
│       ├── layouts/              # Main layout enclosing smooth scroll & background container
│       ├── sections/             # Content sections (Hero, About, Codex Skills, Projects, etc.)
│       ├── services/             # Client-side API connectors
│       └── utils/                # Sanitization & input clamping utilities
├── admin/                        # Content Management System (CMS) Dashboard (React, TS, Vite)
│   └── src/
│       ├── components/           # Tab managers (Personal, Skills, Tech Stack, Projects, etc.)
│       ├── utils/                # Security helpers & modal confirmation controls
│       └── api.ts                # Axios/Fetch wrapper injecting Bearer token authentication
├── backend/                      # Node.js Express REST API server
│   └── src/                      # Source directory
│       ├── models.js             # Mongoose collection schemas for MongoDB
│       ├── routes.js             # API endpoints, validations & Supabase file storage client
│       ├── seed.js               # Development & production initial database seeder
│       └── server.js             # Server configurations, CORS middleware, and DB connection
├── render.yaml                   # Infrastructure blueprint for Render One-Click deployment
└── walkthrough.md                # System-wide walkthrough and implementation documentation (This file)
```

---

## 3. Detailed Component Breakdown

### A. Public Frontend (`/frontend`)
The public-facing portfolio is built with interactive graphics, premium typography, and responsive single-page navigation:

* **[MainLayout](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/layouts/MainLayout.tsx)**: Wraps all sections. Integrates **Lenis** smooth scroll engine for natural scrolling and binds custom transit event scroll animations.
* **[GalaxyBackground](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/components/GalaxyBackground.tsx)**: A high-performance 3D HTML Canvas background rendering custom particle physics. Features rotating stars, dark dust lanes, custom constellation stars, falling meteor sparks, and shooting stars. Translates cursor coordinates and scrolling velocity to apply smooth parallax shifting.
* **[Navbar](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/components/Navbar.tsx)**: Sticky header displaying navigation sections. Uses a custom scroll spy hook to dynamically highlight active states as the user views the page.
* **[Hero Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Hero.tsx)**: Displays the primary heading and dynamic resume links. Uses Framer Motion letter-by-letter spring animation with customized multi-word linear gradients. Supports auto-converting Google Drive links into direct download vectors.
* **[About Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/About.tsx)**: Renders the narrative biography, highlighted achievements, and academic timeline.
* **[Skills Section (Codex Book)](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Skills.tsx)**: Displays skills as a realistic **Interactive Knowledge Codex** (3D book-style layout) where users can flip pages using corner arrows, table of contents links, or keyboard arrows. Automatically collapses into a single-card layout on mobile viewports with responsive bottom pagination buttons (Turn Back/Next) and native touch swipe gestures (`touch-pan-y` support).
* **[Projects Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Projects.tsx)**: Filterable grid categorized dynamically by tags. Incorporates a modal window to preview selected items.
* **[Experience Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Experience.tsx)**: Interactive timeline representing company associations, roles, and job descriptions.
* **[Certificates Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Certificates.tsx)**: Dynamic grid containing professional certifications with link vectors and modal previews.
* **[Tech Stack Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/TechStack.tsx)**: Dynamic floating bubble layout showing framework logos with neon color dropshadow glows.
* **[Achievements Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Achievements.tsx)**: Displays key statistics counters representing experience metrics.
* **[Contact Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Contact.tsx)**: Glassmorphic form allowing visitors to send messages. Incorporates client-side email format checking and success banners.
* **[Footer](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Footer.tsx)**: Renders social networking connectors.
* **[PortfolioSkeleton](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/components/PortfolioSkeleton.tsx)**: Multi-section skeleton loader shown during backend cold starts.
* **[ErrorBoundary](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/components/ErrorBoundary.tsx)**: Prevents structural application failure by catching rendering errors.

---

### B. Admin CMS Panel (`/admin`)
The protected admin console offers a responsive workspace to maintain portfolio contents in real time:

* **[App Entry Guard](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/App.tsx)**: Handles JWT validation. Dispatches `admin-session-expired` events to clear state and redirect to the login overlay on credentials invalidation.
* **[PersonalTab](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/components/PersonalTab.tsx)**: Edits base bio details, display name, biography highlights, and education arrays. Houses a **Resume Versioning Collection** to upload multiple resumes, select which resume is active across the site, and delete historical PDF versions.
* **[SkillsTab](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/components/SkillsTab.tsx)**: Customizes the Codex Book welcome title and page introduction. Manages skill categories (Title, Icon component names, and domain capabilities) and nested skills (Name, Tag, and Percentage sliders).
* **[TechStackTab](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/components/TechStackTab.tsx)**: Provides full CRUD controls for the floating bubbles. Allows selection of brand icons from prefixes (SimpleIcons/FontAwesome) and dynamic hex colors.
* **[ProjectsTab](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/components/ProjectsTab.tsx)**: Updates projects showcase. Uploads file objects directly to Supabase storage to store cover pictures.
* **[ExperienceTab](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/components/ExperienceTab.tsx)**: Manages employment records.
* **[CertificatesTab](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/components/CertificatesTab.tsx)**: Coordinates credentials lists and achievement numbers.
* **[ConfirmModal](file:///d:/VS%20code%20file/React_projects/portfolio_web/admin/src/components/ConfirmModal.tsx)**: Global modal protecting against accidental deletions.

---

### C. Backend API & Storage (`/backend`)
The backend routes API calls, connects MongoDB schemas, and pipes uploaded files to cloud storage:

* **[server.js](file:///d:/VS%20code%20file/React_projects/portfolio_web/backend/src/server.js)**: Configures server startup, parses environment variables, configures CORS origins, and establishes connection to MongoDB database.
* **[models.js](file:///d:/VS%20code%20file/React_projects/portfolio_web/backend/src/models.js)**: Holds the Mongoose structural database blueprints:
  * `PersonalInfo`: Holds location, email, and the `resumes` version array `[{ id, title, url, isActive, createdAt }]`.
  * `About`: Narrative biographies, education metrics, and highlights.
  * `SkillCategory`: Skills welcome message references, capabilities, and nested skills list.
  * `Project`: Project titles, descriptions, categories (Strict category enum check), tags, and cover image URLs.
  * `Experience`: Employment periods, companies, roles, and descriptions.
  * `Certificate`: Issued date, titles, organizations, and credential urls.
  * `Achievement`: Numerical metrics and labels.
  * `ContactMessage`: Inbox messages submitted via the frontend.
  * `TechStack`: Ecosystem technology objects with names, brand icons, and hex color values.
  * `SkillsWelcome`: Dynamic intro text for the skills book.
* **[routes.js](file:///d:/VS%20code%20file/React_projects/portfolio_web/backend/src/routes.js)**: Houses REST APIs, parses incoming files via `multer.memoryStorage()`, and pipes files to **Supabase Storage API**. Automatically separates folders (`resumes/`, `images/`, `others/`) depending on file types.
* **[seed.js](file:///d:/VS%20code%20file/React_projects/portfolio_web/backend/src/seed.js)**: Seeds default profile mock data, including tech items and Codex skills categories, when the database is initialized.

---

## 4. API Endpoint Reference

The REST API exposes the following endpoints, secured by authorization middleware (`authMiddleware`) injecting JWT validation headers:

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portfolio` | Public | Fetches complete portfolio configuration payload in a single query. |
| `POST` | `/api/contact` | Public | Submits a contact message from visitors. |
| `POST` | `/api/auth/login` | Public | Validates admin password against env config. Returns JWT valid for 7 days. |
| `GET` | `/api/auth/verify` | Admin Required | Validates existing authorization token session. |
| `POST` | `/api/upload` | Admin Required | Accepts dynamic binary upload up to 25MB. Uploads to Supabase bucket. |
| `PUT` | `/api/personal-info` | Admin Required | Updates display profile information. |
| `PATCH` | `/api/personal-info/resume` | Admin Required | Quickly overrides active resume link. |
| `POST` | `/api/personal-info/resumes` | Admin Required | Appends a new resume to the multi-resume collection. |
| `PATCH` | `/api/personal-info/resumes/:id/active` | Admin Required | Makes the specified resume active and updates the main download link. |
| `DELETE`| `/api/personal-info/resumes/:id` | Admin Required | Deletes the specified resume entry. |
| `PUT` | `/api/about` | Admin Required | Edits narration, highlights, and education listings. |
| `GET` | `/api/skills-welcome` | Public | Retrieves welcome details for the Codex. |
| `PUT` | `/api/skills-welcome` | Admin Required | Updates Codex book welcome title & intro message. |
| `POST` | `/api/skills` | Admin Required | Creates a new skills category inside Codex. |
| `PUT` | `/api/skills/:id` | Admin Required | Updates skills category structure and nested skills. |
| `DELETE`| `/api/skills/:id` | Admin Required | Removes a skills category. |
| `POST` | `/api/projects` | Admin Required | Appends a project card. |
| `PUT` | `/api/projects/:id` | Admin Required | Edits a project details card. |
| `DELETE`| `/api/projects/:id` | Admin Required | Removes a project card. |
| `POST` | `/api/experience` | Admin Required | Creates an employment entry. |
| `PUT` | `/api/experience/:id` | Admin Required | Edits an employment entry. |
| `DELETE`| `/api/experience/:id` | Admin Required | Removes an employment entry. |
| `POST` | `/api/certificates` | Admin Required | Inserts a credential card. |
| `PUT` | `/api/certificates/:id` | Admin Required | Modifies a credential card. |
| `DELETE`| `/api/certificates/:id` | Admin Required | Removes a credential card. |
| `POST` | `/api/achievements` | Admin Required | Appends a numerical metric indicator. |
| `PUT` | `/api/achievements/:id` | Admin Required | Edits a metric indicator. |
| `DELETE`| `/api/achievements/:id` | Admin Required | Removes a metric indicator. |
| `POST` | `/api/techstack` | Admin Required | Creates a floating bubble technology item. |
| `PUT` | `/api/techstack/:id` | Admin Required | Modifies a technology item's name, color, or icon. |
| `DELETE`| `/api/techstack/:id` | Admin Required | Deletes a technology item. |

---

## 5. Security & Validation Protocols

Solid protection layers are integrated on both client and server applications:

### Client-Side Security & Validation ([security.ts](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/utils/security.ts))
1. **URL Sanitization (`sanitizeUrl`)**: Intercepts URLs to block dangerous scripts (e.g. `javascript:`, `vbscript:`, or `data:text/html`). Restricts outputs to protocols like `http:`, `https:`, `mailto:`, `tel:`, or safe `data:image/` / `data:application/pdf` vectors.
2. **Numeric Clamping (`safeClamp`)**: Validates skills ratings values (ranging from `0` to `100`%) to prevent visual overflows or invalid types.

### Server-Side Protection
1. **Token Authentication Middleware**: Restricts administrative endpoints using Bearer JWT tokens.
2. **Strict Environment Decoupling**: Admin passwords (`ADMIN_PASSWORD`) are loaded strictly from the environment, and credentials have been cleaned from code repositories.
3. **CORS Configuration**: Restricts access to the REST API to trusted frontend domain names.
4. **File Size Limits**: Imposes a 25MB upload limit via Multer to prevent denial-of-service storage exhaustion.

---

## 6. Environment Configuration & Deployment Guide

### Configuration Setup
The backend requires setting up an environment file:

* **Backend Environment (`.env`)**:
  ```ini
  PORT=5000
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio
  JWT_SECRET=your_super_secure_jwt_secret_key
  ADMIN_PASSWORD=your_admin_dashboard_password
  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
  
  # Supabase Cloud Storage Configurations
  SUPABASE_DB_URL=https://<project-id>.supabase.co
  SUPABASE_DB_KEY=your_supabase_anon_public_key
  SUPABASE_BUCKET=portfoliosite_files
  ```

* **Frontend & Admin Environments (`.env`)**:
  ```ini
  VITE_API_BASE_URL=http://localhost:5000
  ```

---

### Deployment via Render Blueprint ([render.yaml](file:///d:/VS%20code%20file/React_projects/portfolio_web/render.yaml))
The application features a root declaration file `render.yaml` enabling one-click deployment pipelines on Render Cloud:

1. Push your repository modifications to GitHub.
2. Inside your Render Dashboard, click **New -> Blueprint**.
3. Select your linked project repository. Render reads the configuration, provisioning:
   * **Node Web Service**: Runs the backend server (`/backend`).
   * **Static Web App**: Hosts the public portfolio SPA (`/frontend`).
   * **Static Web App**: Hosts the administration dashboard CMS (`/admin`).
4. Enter values for database URIs and administrative access passwords when prompted. The infrastructure will compile and deploy automatically.

---

## 7. Recent Enhancements: Skills Codex Mobile Page Turning

To optimize user experience on small/mobile devices, the [Skills Codex](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Skills.tsx) has been upgraded with complete, responsive navigation controls:
* **Symmetrical Navigation Controls**: Both the `Turn Back` and `Turn Next` buttons are now displayed on mobile screens at the bottom of the card, enabling bidirectional page turning on the single-card layout.
* **Native Swipe Gestures**: Fully integrated touch event listeners (`onTouchStart`, `onTouchMove`, and `onTouchEnd`) to detect horizontal swipe gestures on mobile screens. Swiping left turns to the next page, and swiping right turns to the previous page.
* **Scroll Optimization**: Applied `touch-pan-y` CSS behavior to ensure that vertical swiping continues to scroll the main page smoothly without accidentally triggering horizontal page flips.
* **Dynamic Instructions**: The "Reader Instructions" box now adapts to the user's viewport, suggesting swipe actions and mobile buttons on mobile, while displaying keyboard shortcuts and corner buttons on desktop.
