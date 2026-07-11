# [EPIC] ConcienciaTM curation front-end (designed with claude-design)

## Status

Draft

## Product

ConcienciaTM (Truemobile — cross-project)

## Parent Initiative

INITIATIVE-0003 — ConcienciaTM, Truemobile shared knowledge service

## Problem

All knowledge entry and maintenance today is manual command-line work: running
scripts to ingest, no way to see what the base knows, no surface to approve a
merge, fix a page, or retire an artifact. The operator is tired of feeding
knowledge by hand. Curation (the human editor-in-chief role that keeps OKF
pages improving monotonically) is impossible without a UI.

## Objective

A front-end over ConcienciaTM where the operator (and later, clients at their
own scope) can feed, see, approve, edit and retire knowledge — replacing the
command line entirely for knowledge work.

## Design Process (explicit requirement)

- The UI will be designed with **claude-design**.
- **Deliverable of this epic's first task: a huge, super-detailed prompt** for
  claude-design covering every flow below — screens, states, roles, entities
  (acervo item, OKF page, conflict, consumer credential), empty/loading/error
  states, and the curation queue UX. Write the prompt before any front-end
  code exists; it is the design contract.

## Scope (the five jobs)

1. **Enter knowledge** — submit text, files (PDF, PPT, video, photo, book),
   YouTube/links; choose scope (global / project / client) and retention
   (knowledge-only vs knowledge + deliverable artifact); watch
   extraction/distillation status.
2. **See knowledge** — browse/search OKF pages and the acervo; see each page's
   sources, history (git log) and which consumers query what.
3. **Approve (curation)** — a conflict/merge queue: when a new source diverges
   from an existing page, the distiller flags it and the curator decides
   (accept, reject, edit); nothing merges silently on conflict.
4. **Edit knowledge** — edit an OKF page directly in the UI (persisted as a
   git commit, keeping the versioned-knowledge guarantee).
5. **Retire artifacts** — mark acervo files as no-longer-deliverable (agents
   stop receiving them) without destroying history; optional hard removal as
   an explicit, separate action.

Plus:

- Role-based access: Truemobile sees all scopes; a client only its own.
- Extraction/distillation status feedback per submission.

## Out of Scope

- The distillation/merge engine, consultation API and storage — those are the
  ConcienciaTM service itself (EPIC-0005/INITIATIVE-0003). This epic is the
  management surface over them.
- The consumer-side agent integration (EPIC-0006).

## User Flow

1. Operator signs in; role determines visible scopes.
2. Uploads a training PDF → picks scope + retention → sees distillation
   progress → the topic page updates (or a conflict lands in the queue).
3. Opens the curation queue, reviews a flagged divergence side-by-side,
   approves the merge.
4. Searches a page, fixes a phrase inline (git commit under the hood).
5. Retires an outdated deck so agents stop delivering it.

## Target Repository

`tm-conciencia` (or a sibling front-end repo, decided at design time), talking
to the ConcienciaTM API.

## Dependencies

- ConcienciaTM service API (ingestion, OKF read/write, acervo, conflict queue).
- claude-design for the UI design phase.
- Auth (may share infra with the config/credentials front-end from
  INITIATIVE-0002, as separate surfaces).

## User Stories

- [ ] As the operator, I add knowledge (any modality) from a UI, never the CLI.
- [ ] As the operator, I browse and search everything the base knows, with sources and history.
- [ ] As the curator, I get a queue of conflicts and nothing merges silently when sources diverge.
- [ ] As the curator, I edit an OKF page in the UI and it lands as a git commit.
- [ ] As the operator, I retire an artifact so agents stop delivering it, without losing history.
- [ ] As a client, I manage only my own scope.

## Technical Tasks

- [ ] **Write the claude-design mega-prompt** (screens, flows, roles, entities, states) — first deliverable.
- [ ] Run the design phase with claude-design; iterate.
- [ ] Authenticated UI with role→scope enforcement.
- [ ] Submission flow (upload/link/text + scope + retention) with status feedback.
- [ ] OKF browse/search/edit views (edit = git commit via API).
- [ ] Curation queue (conflict review: side-by-side, accept/reject/edit).
- [ ] Acervo management (list, retire-from-delivery, explicit hard delete).

## Acceptance Criteria

- [ ] Zero CLI needed for the five jobs (enter, see, approve, edit, retire).
- [ ] Every ingestion option (modality, scope, retention) is usable from the UI.
- [ ] Conflicting merges always pass through human approval.
- [ ] UI edits are versioned (visible in `tm-conciencia` git history).
- [ ] Scope boundaries enforced in UI and backend.
