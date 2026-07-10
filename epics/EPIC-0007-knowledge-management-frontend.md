# [EPIC] Knowledge management front-end (Truemobile + client)

## Status

Draft

## Product

MinhaIncorporadora

## Parent Initiative

INITIATIVE-0003 — MinhaIncorporadora Knowledge Platform

## Problem

Authoring and maintaining knowledge (EPIC-0005) and configuring how the assistant
uses it (EPIC-0006) currently require running scripts. There is no interface for
Truemobile or for a client to register and maintain their knowledge.

## Objective

A front-end where Truemobile manages global and any client's knowledge, and each
client manages only its own — covering both the ingestion (EPIC-0005) and the
retrieval configuration (EPIC-0006).

## Scope

- **Truemobile view:** author/maintain global knowledge and any client's
  knowledge; pick scope per entry.
- **Client view:** author/maintain only its own knowledge.
- Submit inputs (text/file/video/photo), choose retention (knowledge-only vs
  knowledge + artifact), see extraction status.
- List/search/edit/remove existing knowledge entries by scope.
- Role-based access enforcing scope boundaries.

## Out of Scope

- The extraction engine (EPIC-0005) and retrieval (EPIC-0006) themselves — this
  epic is the management surface over them.

## User Flow

1. User signs in; role determines available scopes (Truemobile = all; client =
   its own).
2. Creates a knowledge entry: picks scope, uploads input, sets retention, submits.
3. Watches extraction status; browses and maintains existing entries.

## Target Repository

A new front-end surface (to be defined), talking to MinhaIncorporadora.

## Dependencies

- EPIC-0005 (ingestion service) and EPIC-0006 (retrieval config) as the backend.
- May share the configuration/credentials front-end from INITIATIVE-0002
  (open question).

## User Stories

- [ ] As Truemobile, I register knowledge for all clients or for one, from a UI.
- [ ] As a client, I register and maintain only my own knowledge, from a UI.
- [ ] As an author, I set retention (knowledge-only vs with artifact) per entry.
- [ ] As an author, I browse, edit and remove existing knowledge at my scope.

## Technical Tasks

- [ ] Authenticated UI with role→scope enforcement.
- [ ] Upload + submission flow to the ingestion service.
- [ ] Knowledge browse/search/edit/remove views by scope.
- [ ] Extraction status feedback.

## Acceptance Criteria

- [ ] Truemobile can manage global and per-client knowledge; a client only its own.
- [ ] Every ingestion option from EPIC-0005 (modality, scope, retention) is usable.
- [ ] Scope boundaries are enforced in the UI and the backend.
