# Progress Tracker: TrueMobile Roadmap App

This document tracks the phased implementation plan and progress of the **TrueMobile Roadmap Application** (the system replacing static markdown planning files with a Postgres-backed FastAPI & Front-end application).

---

## Current Status

- **Status:** Planning / Designing
- **Target Database:** PostgreSQL (`tm-postgres-hml` / `tm-postgres-prd`)
- **Backend Stack:** FastAPI, SQLAlchemy, Alembic
- **Frontend Stack:** HTML5 / JS / Vanilla CSS (Tailwind optional, standalone tree-view)
- **AI Integration:** MCP Server (Model Context Protocol) for coding agents

---

## Core Objectives

1. **Structured Storage:** Store all initiatives, epics, tasks, RFCs, and decisions in a Postgres database instead of text files.
2. **Interactive UI:** A lightweight web dashboard showing a collapsible tree hierarchy of initiatives, epics, and tasks.
3. **AI Agent Integration:** Provide an MCP server interface so Antigravity, Claude Code, and other LLMs can programmatically query and modify the roadmap.
4. **Zero Data Loss:** Build a migration/seed script to parse all existing markdown files in `TM-roadmap` and import them as the initial database state.

---

## Roadmap & Progress Checklist

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
