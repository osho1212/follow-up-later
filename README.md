# Follow Up Later — Prototype

Interactive React + Vite prototype showcasing the premium dual-platform experience for the “Follow Up Later” reminder app.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL (default `http://localhost:5173`) to explore the prototype. Use the mode toggle at the top to switch between the mobile shell (390 × 844 reference) and the desktop application (1280 × 800 reference).

## Key inclusions

- **Mobile UI**: timeline with filters, create (share/manual) sheets, reminder detail drawer, search overlay, templates, settings, integrations, and paywall surfaces.
- **Desktop UI**: navigation rail, command bar, timeline with grouped segments, create workspace, template grid, settings panels, and persistent detail slide-over.
- **Design system tokens**: shared CSS variables for colors, typography, spacing, radii, shadows, and interaction states.
- **Sample data**: realistic reminders, templates, and integrations to ground visuals and interactions.

## Verification

- `npm run build` confirms the prototype bundles successfully (used Vite for production build).
- UI is static-first; no backend connections are required. Buttons and inputs demonstrate layout, hierarchy, and interactivity through hover/focus states.

## Next steps

- Extend component state handling to simulate snooze/reschedule outcomes.
- Wire analytics instrumentation and mock permission flows if needed for usability testing.
