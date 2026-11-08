# Revised implementation plan: React + Node.js, no Vite

## Updated technical direction

The existing portal's routes, visual design, content, form validation, Firestore integration and staff-only management flow remain unchanged. The user's updated instruction replaces the previous Vite toolchain: use React with Node.js and do not use Vite. The browser application will remain React; webpack will bundle its JSX/CSS into `dist/assets`; a Node.js Express server will serve the built assets, health response, route manifest and client-side route fallback. The Firebase JavaScript SDK remains client-side and is configured from browser-safe Firebase web-app values read from `.env.local` at build time. No Firebase credentials are available yet and none will be invented.

## Dependencies and runtime

- Keep React 18, React DOM, React Router DOM, and Firebase JavaScript SDK.
- Remove Vite and `vite` and `@vitejs/plugin-react` entirely.
- Add webpack for JSX/CSS bundling, Express for the Node.js web server, and dotenv for loading optional local Firebase configuration.
- Pin the npm package manager in `package.json` and keep the lockfile and lifecycle policy checked in.
- `npm run dev` will start an webpack watch build and the Express server on the project's configured port 3000. `npm run build` will create production assets in `dist/`; `npm start` will serve that output. Respect the platform-supplied `PORT` when set and bind to `0.0.0.0` in Cloud Preview.
- The Express server provides a simple health response and serves the React entry document for browser-side routes. The existing `/manus-routes.json` remains a public static file and describes pages, not API endpoints.
- Firebase remains a client SDK integration. No private service credentials, database keys, or fabricated project IDs are introduced. Live requests, staff sign-in and CRUD still require the user's Firebase setup and deployed rules.
- This change is for the project's working Preview and source handoff; it does not publish the site or enable an irreversible hosted-server feature.

## Existing product and design to preserve

Keep the six services, dynamic details, request form, confirmation, request-management route, security-conscious Firestore rules and README setup. Preserve the approved minimalist university aesthetic: warm ivory surfaces; deep navy editorial headings; restrained muted-blue and gold accents; DM Sans body text paired with DM Serif Display headlines; generous spacing; a custom shield/L mark; quiet motion; accessible controls; and layouts responsive from mobile to desktop.

## Project structure and responsibilities

```text
.
├── public/                  # Favicon, campus photograph, route manifest
├── scripts/
│   ├── build.mjs            # Copy static assets and use webpack to compile React/CSS
│   └── dev.mjs              # Watch client sources and run the Node server
├── src/
│   ├── components/          # Reusable portal UI
│   ├── data/                # Six service records
│   ├── layouts/              # Shared routed shell
│   ├── pages/                # Home, services, detail, request, confirmation, admin, 404
│   ├── services/             # Firebase setup and Firestore/Auth operations
│   ├── styles/               # Responsive visual system
│   └── utils/                 # Date formatting
├── dist/                      # Generated production client output; not source-controlled
├── server.js                 # Express static serving, health, SPA fallback
├── index.html                # Production React root document template
├── .env.example              # Firebase placeholders only
├── firebase.json             # Firestore rules deploy config
└── firestore.rules            # Public create validation and staff-only management
```

The Express layer serves compiled static files and the SPA document only; request records remain in Firebase Firestore. This keeps rendering, navigation and data boundaries clear for the group assignment and avoids a second, unused API implementation.
