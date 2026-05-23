# Browser Sandbox — MERN IDE

A browser-based coding environment where users can write, run, and preview web projects without any local setup.

## Architecture

**Frontend** (React + Vite, deployed on Vercel)
- Monaco Editor for code editing
- Zustand for client-side state
- Socket.io client for real-time sync
- React Router for navigation

**Backend** (Express + Node.js, deployed on Render)
- REST API for CRUD operations
- Socket.io server for real-time file sync
- JWT auth with bcrypt password hashing
- npm package installation via child_process

**Database** (MongoDB Atlas)
- Users collection (auth)
- Projects collection (files, folders, metadata, packages)

## AI Usage Strategy

Used Claude to:
- Scaffold the full monorepo structure and wiring
- Design the file/folder data model (flat array with parentId references)
- Write the Socket.io real-time sync logic
- Implement the live preview using Blob URLs in a sandboxed iframe

Reasoned through manually:
- Security tradeoffs around sandboxed iframe vs server-side execution
- Session persistence strategy (JWT + MongoDB vs in-memory)
- Package install isolation using per-project temp directories

## Technical Tradeoffs

- **Preview**: Uses client-side Blob URLs (simple, no server needed) vs server-side execution (more powerful but complex). Chose Blob URLs for Phase 1.
- **File storage**: Flat array with parentId in MongoDB vs nested documents. Flat array is simpler to query and update.
- **Auth**: JWT (stateless, easy to deploy) vs sessions (easier to revoke). JWT chosen for simplicity.

## Known Limitations

- Preview only supports vanilla HTML/CSS/JS (no bundler)
- npm installs run in a temp dir per project, not isolated containers
- No collaborative editing (Socket.io sync is one-way broadcast)
- No file upload support

## Setup

### Local development

```bash
# Install all deps
npm install

# Add server/.env (see server/.env.example)

# Run both client and server
npm run dev
```

### Deploy

- **Frontend**: Push client/ to Vercel, set VITE_API_URL env var
- **Backend**: Push server/ to Render as a Node.js web service, set MONGO_URI and JWT_SECRET
