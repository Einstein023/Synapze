# Synapze: Your Knowledge Garden 🌿

> **Sow, nurture, and harvest your ideas.**  
> Synapze is an organic personal digital garden and markdown studio designed to cultivate thoughts, projects, and actionable tasks with mindful progression, an evolving botanical AI companion, and zero-compromise privacy.

---

## 📖 Table of Contents

- [Vision & Concept](#-vision--concept)
- [Key Features](#-key-features)
  - [Organic Seedling Lifecycle](#1-organic-seedling-lifecycle)
  - [Botanical AI Companion System](#2-botanical-ai-companion-system)
  - [Fast Capture & Command Palette](#3-fast-capture--command-palette)
  - [Privacy-First Architecture](#4-privacy-first-architecture)
  - [High-Performance Admin Console](#5-high-performance-admin-console)
  - [SEO & Discovery Optimization](#6-seo--discovery-optimization)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Development Server](#running-the-development-server)
  - [Production Build & Deployment](#production-build--deployment)
- [Security & Firestore Rules](#-security--firestore-rules)
- [Admin Console Specifications](#-admin-console-specifications)
- [License & Credits](#-license--credits)

---

## 🌱 Vision & Concept

Traditional note-taking apps often feel like cold filing cabinets or chaotic junk drawers. **Synapze** reframes intellectual work through the metaphor of horticulture:

- **Fleeting thoughts are seeds**: Quick to plant, unformed, and deserving of space to sprout.
- **Active projects are growing plants**: Requiring continuous care, pruning, and mindful attention.
- **Finished insights are harvests**: Stored in your vault to cross-pollinate future thinking.
- **Dead ends are compost**: Recycled as nutrient-rich context without cluttering your daily workspace.

Every action—writing notes, completing tasks, tending daily streaks—rewards you with XP and evolves your botanical companion.

---

## ✨ Key Features

### 1. Organic Seedling Lifecycle
- **Dual-Mode Editor**: Seamlessly toggle between write mode and formatted markdown preview with real-time word and character counters.
- **Seed Stages**:
  - `Seedling`: Newly captured thoughts and nascent outlines.
  - `Growing`: Actively developed knowledge artifacts and ongoing projects.
  - `Harvested`: Completed milestones and evergreen reference material.
  - `Composted`: Safely archived or retired concepts that no longer demand attention.
- **Actionable Task Checklists**: Convert any note into a plantable task with interactive checkboxes and completion tracking.
- **Image Attachments**: Built-in support for uploading and previewing image references directly within your notes.

### 2. Botanical AI Companion System
- **Adaptive Companions**: Choose your companion archetype (Sprout, Fern, Blossom, Willow, or Oak).
- **Gamified Progression**: Earn XP through daily gardening habits (logging notes, completing tasks, maintaining streaks).
- **Evolution Modals**: Watch your companion transform across 5 distinct evolutionary stages with visual celebrations.
- **Contextual Gardening Advice**: Engage your AI botanist for creative brainstorming, note synthesis, and thoughtful prompts.

### 3. Fast Capture & Command Palette
- **Global Command Search (`⌘K` / `Ctrl+K`)**: Rapidly locate notes, jump to categories, or execute navigation commands from anywhere in the app.
- **Quick Capture Drawer**: Capture fleeting inspirations with a single keystroke without interrupting your current focus.
- **Responsive History**: Integrated browser history handling (`popstate`) ensures native back/forward button behavior across desktop, tablet, and mobile devices.

### 4. Privacy-First Architecture
- **Complete Content Isolation**: User notes, drafts, and task bodies are strictly scoped to individual user authentication IDs.
- **Zero Third-Party Tracking**: No invasive telemetry or advertising trackers.
- **Account Deletion & Data Rights**: Full self-service account deletion with automated data wipeout and optional exit feedback.

### 5. High-Performance Admin Console
- **Secure Access Control**: Gated by Firestore security rules and client authentication exclusively for authorized operators (`uhunomaof@gmail.com`).
- **Privacy Shield**: The admin console deliberately monitors *platform vitality* (aggregate activity, streaks, XP, companion distribution) while keeping all user seedling content inaccessible.
- **Optimized Directory**:
  - Client-side memoized search across display names, UIDs, and emails.
  - Companion type filtering and multi-field sorting (Daily Streak, Total XP, Display Name, Last Active).
  - Fluid client-side pagination (12 gardeners per page) ensuring sub-millisecond table interactions.
  - Instant one-click CSV report generation for user metrics and account deletion logs.
  - One-click copy-to-clipboard for user identifiers and email records.

### 6. SEO & Discovery Optimization
- **Full Metadata Suite**: Open Graph, Twitter Cards, and canonical tags configured for rich link previews.
- **Search Engine Crawling**: Includes `/public/robots.txt` and `/public/sitemap.xml` configured for Google Search Console and major search engines.
- **JSON-LD Structured Data**: Embedded Schema.org `SoftwareApplication` markup for search listing richness.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Recharts |
| **Backend** | Express 4.x, Node.js, `@google/genai` (Gemini API integration), `tsx`, `esbuild` |
| **Database & Auth** | Firebase Firestore (Cloud Database), Firebase Authentication (Email/Password) |
| **Asset Pipeline** | Embedded SVG botanical iconography, static asset serving via Express |

---

## 📁 Project Architecture

```
synapze/
├── .env.example               # Required environment variables template
├── firestore.rules            # Granular Firestore security and validation rules
├── firebase-blueprint.json    # Firestore schema specification blueprint
├── index.html                 # App shell with SEO meta tags & JSON-LD schema
├── metadata.json              # Application identity & permissions declaration
├── package.json               # Dependencies & lifecycle scripts
├── public/
│   ├── favicon.svg            # Botanical leaf favicon
│   ├── og-image.jpg           # OpenGraph social preview card
│   ├── robots.txt             # Search crawler directives
│   └── sitemap.xml            # Canonical search engine URL map
├── server.ts                  # Express backend with Gemini API proxy & security headers
├── src/
│   ├── App.tsx                # Primary view controller & state manager
│   ├── firebase.ts            # Client Firebase SDK initialization
│   ├── index.css              # Global styles with Tailwind CSS directives
│   ├── main.tsx               # React application entry point
│   ├── types.ts               # Shared TypeScript interfaces & enumerations
│   └── components/
│       ├── AdminConsoleView.tsx   # Optimized admin dashboard with pagination & exports
│       ├── AuthView.tsx           # Authentication view (Sign In / Sign Up)
│       ├── CommandSearch.tsx      # Global ⌘K command and note search dialog
│       ├── CompanionCenter.tsx    # AI companion evolution & interaction center
│       ├── DashboardView.tsx      # Core garden overview & seedling grid
│       ├── DeleteAccountView.tsx  # Self-serve account removal workflow
│       ├── EditorView.tsx         # Markdown editor with preview & image uploading
│       ├── EvolutionModal.tsx     # Level-up celebration modal
│       ├── FastCapture.tsx        # Quick thought recording shortcut
│       ├── FloatingXpAlerts.tsx   # Micro-interaction XP reward toasts
│       ├── LandingView.tsx        # Public marketing & feature overview page
│       ├── LegalView.tsx          # Privacy Policy, Terms of Service & Changelog
│       ├── SettingsView.tsx       # Profile, preferences, and data backup options
│       ├── ToastNotification.tsx  # Global floating alert notifications
│       └── VaultArchive.tsx       # Harvested & composted seedling repository
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**: standard package manager
- **Firebase Project**: A Firebase project with Firestore Database and Authentication (Email/Password provider enabled).

### Installation

1. Clone or extract the repository:
   ```bash
   git clone https://github.com/your-org/synapze.git
   cd synapze
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Google Gemini API Key for botanical companion reasoning & suggestions
GEMINI_API_KEY=your_gemini_api_key_here

# Port Configuration (defaults to 3000)
PORT=3000
```

> **Note**: Firebase configuration is loaded client-side via `src/firebase-applet-config.json` and initialized through `src/firebase.ts`.

### Running the Development Server

Start the full-stack development environment:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build & Deployment

1. Compile the client and bundle the server:
   ```bash
   npm run build
   ```
   This command executes `vite build` for the React frontend and bundles `server.ts` into a self-contained CommonJS artifact at `dist/server.cjs` via `esbuild`.

2. Start the production server:
   ```bash
   npm start
   ```

---

## 🔒 Security & Firestore Rules

Synapze implements strict role-based access control and schema validation within `firestore.rules`:

1. **Deny by Default**: The root document matcher denies all reads and writes unless explicitly permitted.
2. **Owner-Scoped Seedlings**: Notes and tasks (`/users/{userId}/seedlings/{seedlingId}`) can **only** be read, written, modified, or deleted by the document owner (`request.auth.uid == userId`). No administrator has read access to personal seedlings.
3. **Immutable Activity Logs**: Activity documents (`/users/{userId}/activities/{activityId}`) can be created by the owner but cannot be updated (`allow update: if false;`), guaranteeing non-repudiation of metrics.
4. **Strict Schema Validation**:
   - `isValidUser`: Enforces constraints on display names, companion types, and streak integers.
   - `isValidSeedling`: Validates title length (<= 200 chars), content size (<= 100,000 chars), and strict enum stages (`seedling`, `growing`, `harvested`, `composted`).
   - `isValidActivityLog`: Ensures log text size and positive XP values.
5. **Admin Access Privileges**:
   - Only the designated email address (`uhunomaof@gmail.com`) passes the `isAdmin()` rule verification.
   - Authorized admins can inspect user profiles and aggregated activity summaries, but **never** user seedling text.

---

## 📊 Admin Console Specifications

The **Admin Console** (`src/components/AdminConsoleView.tsx`) is designed for operational monitoring while maintaining user privacy:

- **Authorized Operator**: `uhunomaof@gmail.com`
- **Performance Optimizations**:
  - `useMemo` hooks for high-speed multi-criteria filtering and sorting across gardener rosters.
  - Page-based rendering (`PAGE_SIZE = 12`) to prevent DOM bloat.
  - Query limits (`limit(50)`) on activity log inspections to prevent heavy Firestore payloads.
- **Exporting Tools**:
  - **Export Gardeners CSV**: Generates a downloadable CSV containing User IDs, Display Names, Emails, Companion Archetypes, Daily Streaks, and Total XP.
  - **Export Deletions CSV**: Exports departure reasons, feedback logs, and timestamps from deleted accounts for product review.
- **Quick Controls**:
  - One-click copy for user UID and Email fields with visual confirmation.
  - Keyboard navigation: Press `Escape` to close user drill-down modals.

---

## 📄 License & Credits

- Designed and built for mindful thinkers, writers, and knowledge cultivators.
- Icons provided by [Lucide Icons](https://lucide.dev/).
- UI animations powered by [Motion](https://motion.dev/).
