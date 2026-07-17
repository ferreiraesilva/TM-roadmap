# Progress Tracker: TrueMobile Roadmap App

This document tracks the phased implementation plan and progress of the **TrueMobile Roadmap Application** (the system replacing static markdown planning files with a database-backed FastAPI & Front-end application).

---

## Current Status (corrected 2026-07-17 — see below)

- **Status:** LIVE in production — https://roadmap.truemobile.com.br/, served by the shared Caddy (`tm-caddy-prd`, `tm-infra`). Also running in homologation on MAC02 (`hermes-roadmap-hml`).
- **Database:** SQLite (`DATABASE_URL=sqlite:////app/data/tm_roadmap.db`), one file per environment inside a named Docker volume (`hermes_roadmap_data_prd` / `hermes_roadmap_data`). **Not PostgreSQL** — this doc previously said "Target Database: PostgreSQL", which was the original plan, never implemented; `database.py` has always used plain SQLAlchemy against SQLite. Correcting this here so nobody (human or agent) assumes a Postgres connection exists.
- **Backend Stack:** FastAPI, SQLAlchemy, Alembic (single migration, `alembic/versions/30cd870d564e_*.py`).
- **Frontend Stack:** HTML5 / JS / Vanilla CSS, served as static files by the FastAPI app itself (`static/`).
- **AI Integration:** MCP Server — **not implemented yet** (Phase 4 below is still open). Nodes are read/written today via the plain REST API (`/api/nodes`), which has **no authentication** — anyone who can reach the container can create/edit/delete nodes. Worth revisiting before this is exposed more broadly.

### How data gets in (important — read before editing markdown files)

Historically, `seed_db.py` derived the entire `nodes` table from the markdown files in `initiatives/`, `epics/`, `stories/`, `bugs/`, `decisions/`, `rfcs/`, `spikes/` — it deletes all nodes and re-parses those files on every run. Until 2026-07-17, the Docker entrypoint ran this **unconditionally on every container start**, meaning any node created/edited directly via the API (not from a markdown file) was silently wiped on the next restart, crash, or redeploy. This was a real bug, not an intended behavior — nobody could recall requesting it.

**Fixed 2026-07-17** (`entrypoint.sh`): the automatic seed now only runs if the `nodes` table is empty (first boot). A running environment with data is never wiped by a restart. Re-syncing new markdown content into an already-seeded environment is still possible, explicitly, via `POST /api/seed` — it is no longer automatic.

**Practical consequence:** now that production is live and has real data, **new decision records, RFCs, etc. should be created directly via the API against the running instance** (`https://roadmap.truemobile.com.br/api/nodes`), not by adding a markdown file to this repo and hoping it gets seeded — it won't, automatically, anymore. The markdown files under `decisions/`, `rfcs/`, etc. remain useful as the original bootstrap content and as human-readable history in git, but they are no longer the live source of truth for what's in production. See decision records `DE-0014` and `DE-0015` for a live example of this pattern (created via `POST`/`PUT /api/nodes`, not as files in this repo).

---

## Core Objectives

1. **Structured Storage:** Store all initiatives, epics, tasks, RFCs, and decisions in a Postgres database instead of text files.
2. **Interactive UI:** A lightweight web dashboard showing a collapsible tree hierarchy of initiatives, epics, and tasks.
3. **AI Agent Integration:** Provide an MCP server interface so Antigravity, Claude Code, and other LLMs can programmatically query and modify the roadmap.
4. **Zero Data Loss:** Build a migration/seed script to parse all existing markdown files in `TM-roadmap` and import them as the initial database state.

---

## Roadmap & Progress Checklist

> **Note (2026-07-17):** the checklist below still reflects the original
> plan and has not been re-audited item by item against what's actually
> implemented. What's confirmed true today: Phase 1 (schema, Alembic,
> seed script) and most of Phase 2 (FastAPI app, `POST/PUT/DELETE
> /api/nodes` CRUD) exist and are live in production — but as a single
> polymorphic `nodes` table/endpoint, not the separate per-type
> tables/routers (`/api/initiatives`, `/api/epics`, ...) originally
> planned. Phase 3 (dashboard) has a working static frontend. Phase 4 (MCP
> server) is **not** implemented. Don't trust the checkboxes below without
> checking the actual code first.

### [ ] Phase 1: Database Schema & Migration Setup
*Goal: Model the database relations, configure migrations, and write the import script.*

- [ ] **1.1. Database Design:** Define SQL schemas for:
  - `initiatives` (id, title, status, description, created_at)
  - `epics` (id, initiative_id, title, status, description, created_at)
  - `tasks` (id, epic_id, title, type [story, bug, tech_task, spike], status, priority, description, created_at)
  - `rfcs` (id, title, status, file_path, content, created_at)
  - `decisions` (id, title, status, file_path, content, created_at)
  - `links` (polymorphic associations between RFCs/Decisions and Initiatives/Epics/Tasks)
- [ ] **1.2. Alembic Configuration:** Initialize Alembic migrations inside the repository.
- [ ] **1.3. Markdown Parser & Seed Script:** Write a Python script (`scripts/seed_from_markdown.py`) that:
  - Parses frontmatter and body from existing files in `initiatives/`, `epics/`, `stories/`, `bugs/`, `spikes/`, `rfcs/`, and `decisions/`.
  - Imports all data into the Postgres tables, linking child items to parents appropriately.

---

### [ ] Phase 2: Backend API Development (FastAPI)
*Goal: Build the REST API server to manage the roadmap data.*

- [ ] **2.1. Project Skeleton:** Create the FastAPI app structure (database session helpers, schemas, routers).
- [ ] **2.2. CRUD Endpoints:** Implement API routers for:
  - `/api/initiatives`
  - `/api/epics`
  - `/api/tasks`
  - `/api/rfcs`
  - `/api/decisions`
- [ ] **2.3. Tree Query Endpoint:** Implement `GET /api/roadmap/tree` to return the complete nested hierarchy in a single optimized JSON payload.
- [ ] **2.4. Tests:** Write API unit tests using `pytest` and `httpx.AsyncClient`.

---

### [ ] Phase 3: Web Dashboard (Front-end)
*Goal: Create a beautiful, responsive web interface for humans.*

- [ ] **3.1. UI/UX Prompting (Claude Design):** Write a robust, highly detailed prompt to pass to Claude Design to generate the frontend mockup and design system assets before coding begins.
- [ ] **3.2. Design System:** Set up custom CSS with sleek dark/light modes, premium typography, and micro-animations based on the mockup.
- [ ] **3.3. Tree-View Component:** Implement a collapsible hierarchical tree structure visualizing Initiatives ➔ Epics ➔ Tasks.
- [ ] **3.4. Status & Priority Badges:** Visually distinguish task status and priority with matching color palettes.
- [ ] **3.5. Document Viewer:** Add a side drawer or modal to view RFCs and Decisions with full markdown rendering.
- [ ] **3.6. Quick Actions:** Implement simple forms to create tasks, change statuses, or link documents directly from the UI.

---

### [ ] Phase 4: AI Agent Interface (MCP Server)
*Goal: Allow LLMs to interact with the roadmap programmatically.*

- [ ] **4.1. MCP Server Setup:** Integrate a Model Context Protocol (MCP) server directly into the FastAPI application (or as a separate python package).
- [ ] **4.2. Tool Registration:** Register MCP tools for:
  - `get_roadmap_tree`
  - `create_task`
  - `update_task_status`
  - `link_document`
- [ ] **4.3. Configuration Documentation:** Update `AGENTS.md` with instructions on how AI assistants should locate and use the MCP server.

---

### [ ] Phase 5: Decommissioning Static Files & Launch
*Goal: Final import, verification, and cleaning up.*

- [ ] **5.1. Import & Verification:** Run the seed script against the production database, verifying that all tasks, RFCs, and Decisions are correctly linked.
- [ ] **5.2. UI/API Verification:** Perform a full manual walkthrough of the dashboard and verify the MCP server tools.
- [ ] **5.3. Clean Up:** Remove the static markdown files from the repository (leaving only templates, configuration, and app code) once the system is fully operational.
