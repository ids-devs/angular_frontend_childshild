# IDS ChildShield Climate AI – Frontend Platform

> The Angular 21 single-page admin interface for the ChildShield Climate AI platform — providing an interactive dashboard for operators, community health workers, and administrators to monitor climate alerts, manage beneficiaries, and oversee AI-generated notifications across Mozambique and Sub-Saharan Africa.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Related Repository](#related-repository)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

The **ChildShield Climate AI Admin Dashboard** is the front-end companion to the [ChildShield Laravel API](https://github.com/ids-devs/laravel_api_childshild). It is a fully responsive Angular SPA consumed by platform administrators and field coordinators to:

- Visualize real-time and historical **climate alert data** on interactive maps
- Monitor **outbound notifications** (SMS, USSD, WhatsApp) and their delivery status
- Manage **users, roles, and permissions** across organizational levels
- Explore **charts and statistics** on alert coverage, community reach, and system health
- Support **multiple languages** (i18n-ready via ngx-translate) for local operators

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Angular 21 |
| Language | TypeScript 5.9 (ES2022, strict mode) |
| Styling | Tailwind CSS 4 + SCSS |
| UI Components | Angular Material 21 + CDK |
| Icons | Angular Tabler Icons, Iconify |
| Maps | Leaflet 1.9 + @types/leaflet |
| Charts | ApexCharts + ng-apexcharts |
| Internationalisation | @ngx-translate/core + http-loader |
| Carousel | ngx-owl-carousel-o |
| Scrollbar | ngx-scrollbar |
| HTTP Client | Angular HttpClient (RxJS 7.8) |
| Testing | Karma + Jasmine |
| Build Tool | Angular CLI 21 / `@angular/build` |

---

## Architecture Overview

```
Browser (Admin SPA)
       │
       ▼
  Angular 21 App
  ┌────────────────────────────────────────┐
  │  Components  ──►  Services             │
  │  (pages, widgets, layout)    │         │
  │                              ▼         │
  │                     HttpClient (JWT)   │
  └──────────────────────────┬────────────┘
                             │  REST / JSON
                             ▼
              ChildShield Laravel API
         (laravel_api_childshild repo)
```

The app is a standalone Angular SPA. All data is fetched from the ChildShield REST API via JWT-authenticated HTTP calls. Leaflet renders geospatial alert maps, ApexCharts powers statistics panels, and ngx-translate serves localized UI strings.

---

## Prerequisites

- **Node.js** 20 LTS or higher
- **npm** 10+
- **Angular CLI** 21 (optional globally, but recommended)

```bash
node -v   # should be >= 20
npm -v    # should be >= 10

# Optional: install Angular CLI globally
npm install -g @angular/cli@21
```

> The Angular CLI is also available locally via `npx ng` after `npm install`, so a global install is not strictly required.

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/ids-devs/angular_frontend_childshild.git
cd angular_frontend_childshild
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API base URL

The app needs to know where the ChildShield Laravel API is running. Set the API base URL in your environment file (see [Environment Configuration](#environment-configuration)).

### 4. Start the development server

```bash
npm start
# or
ng serve
```

The app will be available at **http://localhost:4200** with hot-module reloading enabled.

To serve on a different port:

```bash
ng serve --port 4300
```

To proxy API requests (avoiding CORS in dev), create a `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

And start with:

```bash
ng serve --proxy-config proxy.conf.json
```

---

## Environment Configuration

Angular uses environment files under `src/environments/`. There is no `.env` file — configuration lives in TypeScript environment objects.

`src/environments/environment.ts` (development):

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api',
};
```

`src/environments/environment.production.ts` (production):

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.childshield.mz/api',
};
```

> If these files do not exist yet, create them in `src/environments/`. Angular CLI automatically swaps the files at build time based on the `--configuration` flag.

### i18n / Translation files

Locale JSON files should be placed in `src/assets/i18n/`:

```
src/assets/i18n/
  en.json
  pt.json     # Portuguese (primary locale for Mozambique)
```

---

## Testing

The project uses **Karma** as the test runner and **Jasmine** as the testing framework.

```bash
# Run tests in watch mode (opens a Chrome window)
npm test

# Single run (CI-friendly)
ng test --watch=false --browsers=ChromeHeadless
```

### Code style

There is no dedicated linter config in the repo yet. Enforce consistency via the included `.editorconfig` and Angular's strict TypeScript settings (already enabled in `tsconfig.json`).

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/       # Reusable UI widgets (cards, charts, maps, tables)
│   │   ├── pages/            # Route-level views (dashboard, alerts, users, reports)
│   │   ├── services/         # HTTP + business logic services
│   │   ├── interceptors/     # JWT attachment, error handling
│   │   ├── guards/           # Route auth guards
│   │   └── app.routes.ts     # Lazy-loaded routing
│   ├── assets/
│   │   ├── i18n/             # Translation JSON files (en, pt, ...)
│   │   └── scss/             # Global SCSS partials + theme tokens
│   ├── environments/         # environment.ts / environment.production.ts
│   ├── globals.css           # Tailwind CSS entry point (PostCSS)
│   ├── styles.scss           # Global Angular styles
│   ├── index.html
│   └── main.ts
├── angular.json              # Angular CLI workspace configuration
├── tsconfig.json             # TypeScript compiler options (strict ES2022)
├── .postcssrc.json           # PostCSS + Tailwind CSS 4 pipeline
├── netlify.toml              # Netlify SPA redirect rule
└── package.json              # npm scripts and dependencies
```

> The `src/app/` structure above reflects the standard Angular convention. Actual folder names may vary — check the repo for the authoritative layout.

---

## Related Repository

This frontend is designed to work exclusively with the ChildShield backend API:

| Repo | Description |
|---|---|
| [`laravel_api_childshild`](https://github.com/ids-devs/laravel_api_childshild) | Laravel 12 REST API — authentication, alerts, notifications, PostGIS data |

Make sure the backend API is running and accessible before using the dashboard.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following Angular commit conventions: `git commit -m "feat(alerts): add map clustering"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request against `main`

Please ensure `ng build` runs without errors and existing tests pass before submitting.

---

## Current Status

Working Prototype

---

## License

This project is open-sourced under the [MIT License](LICENSE.txt).

---

> Built with ❤️ by [IDS Devs](https://github.com/ids-devs) · Mozambique 🇲🇿

