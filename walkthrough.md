# Comprehensive Portfolio Website Walkthrough

Welcome to the full walkthrough of the **Portfolio & CMS Web Application**. This document provides an all-inclusive guide covering the entire architecture, frontend layout, backend database models & API endpoints, admin management system, authentication flow, and deployment setup across all three main applications: `frontend`, `backend`, and `admin`.

---

## 1. System Architecture Overview

The system is designed as a full-stack, headless, dynamic portfolio powered by a modern **3-Tier Architecture**:

```
 ┌────────────────────────────────┐         ┌────────────────────────────────┐
 │        Frontend Client         │         │      Admin CMS Dashboard       │
 │   (React + Vite + TypeScript)  │         │   (React + Vite + TypeScript)  │
 └───────────────┬────────────────┘         └───────────────┬────────────────┘
                 │ Read-Only Data Fetch                     │ Authenticated CRUD
                 └───────────────────┐   ┌──────────────────┘ (JWT Auth)
                                     ▼   ▼
                        ┌────────────────────────┐
                        │   Node.js/Express API  │
                        │        Backend         │
                        └────────────┬───────────┘
                                     │ Mongoose ORM
                                     ▼
                        ┌────────────────────────┐
                        │    MongoDB Database    │
                        └────────────────────────┘
```

---

## 2. Project Modules & Directory Structure

```
portfolio_web/
├── frontend/             # Public portfolio application
│   └── src/
│       ├── components/   # UI elements (Navbar, Modals, etc.)
│       ├── layouts/      # Main layout & background container
│       ├── sections/     # Hero, About, Skills, Projects, Experience, Certs, etc.
│       └── services/     # API connectors (fetchPortfolioData, submitContact)
├── backend/              # Node.js Express REST API server
│   ├── server.js         # Server entry point, CORS & MongoDB connection
│   ├── models.js         # Mongoose database schemas
│   ├── routes.js         # API endpoints & authentication logic
│   └── seed.js           # Database seeding script
├── admin/                # Admin CMS dashboard app
│   └── src/
│       ├── components/   # Dashboard tabs & Login view
│       └── api.ts        # Admin API client with token management
├── render.yaml           # One-click deployment blueprint for Render
└── walkthrough.md        # Full site walkthrough & documentation
```

---

## 3. Detailed Component Breakdown

### A. Public Frontend (`/frontend`)
The frontend is a dynamic, single-page application (SPA) featuring glassmorphism design, interactive micro-animations, and dynamic theme elements.

* **[Navbar](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/components/Navbar.tsx)**: Sticky header with smooth scroll navigation links and mobile drawer.
* **[Hero Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Hero.tsx)**: Displays profile headline, custom tagline, primary call to action, and dynamic active resume download button.
* **[About Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/About.tsx)**: Narrative biography, professional highlights, and education timeline.
* **[Skills Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Skills.tsx)**: Interactive skill matrices with category tabs (Frontend, Backend, DevOps, etc.), proficiency level bars, tag labels, and domain capabilities.
* **[Projects Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Projects.tsx)**: Filterable grid showcasing work (`frontend`, `fullstack`, `creative`), project modal preview, tag pills, GitHub repository link, and live demo link.
* **[Experience Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Experience.tsx)**: Vertical interactive timeline of career history, roles, companies, and key accomplishments.
* **[Certificates Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Certificates.tsx)**: Visual cards displaying verified certifications and credentials.
* **[Tech Stack Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/TechStack.tsx)**: Framework & tool icon grid highlighting core technical competencies.
* **[Achievements Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Achievements.tsx)**: Key statistics counters (completed projects, experience years, etc.).
* **[Contact Section](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Contact.tsx)**: Interactive contact form sending messages directly to MongoDB (`ContactMessage`) and social links.
* **[Footer](file:///d:/VS%20code%20file/React_projects/portfolio_web/frontend/src/sections/Footer.tsx)**: Quick links, social media channels, and copyright notice.

---

### B. Admin CMS Panel (`/admin`)
A protected content management system allowing real-time edits to the public site without redeploying code.

1. **Authentication Guard**: Protected by JWT verification. Password hashed using `bcryptjs`.
2. **Core Profile Tab**: Edit bio story, display name, job title, location, education, and manage multiple resumes (upload URL/file link, set active resume, delete old versions).
3. **Core Skills Tab**: Add/edit/delete skill categories, modify capability lists, edit individual skills, tags, and proficiency sliders (0-100%).
4. **Project Cards Tab**: Full CRUD interface for project portfolio cards (title, category, tags, base64 or URL cover images, repository & live links).
5. **Professional Timeline Tab**: Manage work experience timeline entries (company, role, duration, duties description).
6. **Certs & Metrics Tab**: Manage professional certificates and achievement counters.

---

### C. Backend API & Database (`/backend`)

#### Database Schemas ([models.js](file:///d:/VS%20code%20file/React_projects/portfolio_web/backend/models.js))
* **`PersonalInfo`**: Stores name, title, tagline, location, email, active `resumeUrl`, and an array of `resumes` `[{ id, title, url, isActive, createdAt }]`.
* **`About`**: Stores story narrative, `highlights` `[{ title, desc }]`, and `education` `[{ degree, school, year, description }]`.
* **`SkillCategory`**: Stores category title, categoryType, icon, capabilities `[String]`, and `skills` `[{ name, level, experience, tag, icon }]`.
* **`Project`**: Stores project title, description, category (`frontend`, `fullstack`, `creative`), tags `[String]`, githubUrl, liveUrl, and imageUrl.
* **`Experience`**: Stores role, company, period, and description.
* **`Certificate`**: Stores title, organization, date, credentialUrl, and imageUrl.
* **`Achievement`**: Stores numerical value, label, and optional suffix.
* **`AdminPassword`**: Stores bcrypt salted hash of the admin access key.
* **`ContactMessage`**: Stores user inquiry messages submitted via the frontend (`name`, `email`, `subject`, `message`).

---

## 4. API Endpoint Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portfolio` | Public | Fetches all combined portfolio data for the main frontend in a single query. |
| `POST` | `/api/auth/login` | Public | Authenticates admin password, returns JWT token valid for 7 days. |
| `GET` | `/api/auth/verify` | Admin | Validates existing JWT session token. |
| `PUT` | `/api/personal-info` | Admin | Updates personal profile display information. |
| `POST` | `/api/personal-info/resumes` | Admin | Adds a new resume link/version to multi-resume collection. |
| `PATCH` | `/api/personal-info/resumes/:id/active` | Admin | Sets specified resume as active across the site. |
| `DELETE` | `/api/personal-info/resumes/:id` | Admin | Deletes a resume entry. |
| `PUT` | `/api/about` | Admin | Updates About story, highlights, and education history. |
| `POST` / `PUT` / `DELETE` | `/api/skills[/:id]` | Admin | CRUD operations for skill categories and nested skills. |
| `POST` / `PUT` / `DELETE` | `/api/projects[/:id]` | Admin | CRUD operations for showcase projects. |
| `POST` / `PUT` / `DELETE` | `/api/experience[/:id]` | Admin | CRUD operations for work timeline items. |
| `POST` / `PUT` / `DELETE` | `/api/certificates[/:id]` | Admin | CRUD operations for digital certificates. |
| `POST` / `PUT` / `DELETE` | `/api/achievements[/:id]` | Admin | CRUD operations for count metrics. |
| `POST` | `/api/contact` | Public | Receives visitor messages and saves them into database. |

---

## 5. Environment & Deployment Guide

### Environment Variables
* **Backend (`.env`)**:
  * `PORT` = `5000`
  * `MONGO_DB` or `MONGODB_URI` = MongoDB connection string
  * `JWT_SECRET` = Random secure secret key
  * `ADMIN_PASSWORD` = Admin access password (read directly from environment)
  * `FRONTEND_URL` / `ADMIN_URL` / `ALLOWED_ORIGINS` = CORS origins list

* **Frontend & Admin (`.env`)**:
  * `VITE_API_BASE_URL` = Full URL of the backend API (e.g. `http://localhost:5000` or `https://portfolio-backend.onrender.com`)

### Deployment via Render Blueprint (`render.yaml`)
The workspace includes a root [render.yaml](file:///d:/VS%20code%20file/React_projects/portfolio_web/render.yaml) file for one-click blueprint deployment on Render:
1. Push code repository to GitHub.
2. In Render Dashboard, select **New -> Blueprint**.
3. Link the repository. Render automatically provisions:
   * **portfolio-backend** (Node Web Service)
   * **portfolio-frontend** (Static Site)
   * **portfolio-admin** (Static Site)
4. Provide environment values (`MONGO_DB`, `ADMIN_PASSWORD`) when prompted.

