# NoteVault

NoteVault is a web-based note-taking application built with React + TypeScript and Vite. It provides a rich-editing experience with support for attachments, tables, selection/management of notes, a sidebar UI, and a collection of reusable UI components.

## Key features
- Rich text editor (formatting, execCommand-based utilities)
- File/image attachments and previews
- Insertable tables and other editor controls
- Note CRUD: create, soft-delete (trash), restore, and permanent delete
- Multi-select and bulk actions for notes
- Sidebar navigation and responsive UI
- Localization support (English/Spanish strings observed)
- Modals for sign-in / sign-up / support / contact / privacy / terms
- Large collection of UI components (Radix-based UI primitives, MUI icons, etc.)

## Tech stack
- Framework: React + TypeScript
- Bundler: Vite
- UI libraries: Radix UI components, MUI icons, tailwind-related tooling
- Styling: Tailwind + custom CSS (see src/styles)
- State & forms: React hooks, react-hook-form
- Other: many UI utility libraries and helpers (see package.json)

## Repo layout (important files & folders)
- index.html — App entry page
- package.json / pnpm-workspace.yaml — project configuration and dependencies
- vite.config.ts — Vite configuration
- src/
  - main.tsx — application bootstrap
  - app/
    - App.tsx — main application (UI, editor, note logic, modals)
    - components/ — reusable UI components
      - ui/ — many UI primitives (button, modal/dialog, sidebar, table, chart, etc.)
  - styles/ — CSS entry (index.css and theme files)

## Requirements
- Node.js (recommend latest LTS)
- pnpm (recommended, repository contains pnpm-workspace.yaml). npm or yarn should also work but pnpm is preferred based on workspace usage.

## Setup & local development
1. Clone the repository:
   git clone https://github.com/tharunoffical054-png/NoteVault1.git
2. Install dependencies:
   pnpm install
3. Start development server:
   pnpm dev
4. Build for production:
   pnpm build

If you prefer npm:
- npm install
- npm run dev
- npm run build

Scripts (from package.json)
- dev — starts Vite dev server
- build — builds production bundle

## How to contribute
- Open an issue to propose changes or report bugs.
- Fork the repo, create a feature branch, and open a pull request when ready.
- Keep changes small and focused; add tests where applicable and update documentation.

## TODO / recommendations
- Add a LICENSE file (none detected in the repository) to make usage terms clear.
- Add a more detailed CONTRIBUTING.md for contributor guidelines.
- Add automated tests and a CI workflow for builds and linting.
- Consider splitting very large files (App.tsx is large) into smaller modules for maintainability.

## Acknowledgements / Attributions
- This project uses many open-source UI primitives and libs (Radix, MUI icons, Tailwind ecosystem, etc.). See ATTRIBUTIONS.md and src/app/Attributions.md for more details.

---

If you'd like, I can:
- Commit this README to the repository for you, or
- Produce a shorter README variant, or
- Generate CONTRIBUTING.md or LICENSE files next.
Which would you like me to do?
