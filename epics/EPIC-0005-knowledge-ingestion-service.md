# [EPIC] Knowledge Ingestion Service

## Status

Draft

## Product

MinhaIncorporadora

## Parent Initiative

INITIATIVE-0003 — ConcienciaTM, Truemobile shared knowledge service

## Problem

There is no way to deliberately teach the assistant. Knowledge only appears as a
side effect of ingesting a client's marketing content, is always per-client, can
only be produced by pipelines, and always ties knowledge to a deliverable
artifact. Truemobile cannot teach all clients at once; a client's IT cannot add
its own knowledge; and there is no way to learn from a training video without
making the video available to brokers.

## Objective

A service that accepts an input (text, file, video or photo) from an authorized
author, at a chosen scope, extracts knowledge with AI, and stores it in the
correct knowledge base — optionally keeping the artifact.

## Scope

- **Scopes:** global (all incorporadoras) and per-incorporadora.
- **Roles:** Truemobile authors global or any specific client; a client's IT
  authors only its own.
- **Modalities:** free text/information, document, video, photo.
- **AI extraction:** reuse the ingestion pipeline (classify → chunk → embeddings)
  to turn the input into searchable knowledge; transcribe/summarize video and
  audio content into knowledge.
- **Retention choice per input:** knowledge-only, or knowledge + artifact. A
  training video kept as knowledge-only is never stashed for delivery.
- **Provenance:** record author, role, scope and retention on each entry.

## Out of Scope

- The consumption side (assistant retrieval) — see EPIC-0006.
- The authoring UI — see EPIC-0007.

## User Flow

1. An authorized author picks a scope (global / a specific client) — Truemobile
   may pick any; a client IT is locked to its own.
2. Provides the input (text, file, video, photo) and a note of intent.
3. Chooses retention: keep knowledge only, or knowledge + artifact.
4. The service extracts knowledge, embeds it, and stores it in the target base;
   the artifact is stashed only if retention says so.
5. The entry is immediately searchable at its scope.

## Target Repository

MinhaIncorporadora

## Dependencies

- The nightly ingestion pipeline (classify/chunk/embeddings) as the extraction
  engine.
- Home of the global base (resolved in INITIATIVE-0003): the `tm-conciencia`
  service — OKF pages (.md in git) as source of truth, pgvector as a
  rebuildable index, immutable acervo for artifacts.

## User Stories

- [ ] As Truemobile, I teach a piece of knowledge to all incorporadoras at once.
- [ ] As Truemobile, I teach a piece of knowledge to a single incorporadora.
- [ ] As a client's IT, I add knowledge only to my own incorporadora.
- [ ] As an author, I submit a training video and keep only its knowledge, not the video.
- [ ] As an author, I submit a photo/file/text and it becomes searchable knowledge.

## Technical Tasks

- [ ] Knowledge-entry model with scope, author/role, retention, provenance.
- [ ] Ingestion endpoint/worker accepting multi-modal input.
- [ ] Video/audio transcription-to-knowledge path (knowledge without delivery).
- [ ] Route extracted knowledge to the global vs per-client base.
- [ ] Enforce role→scope authorization.

## Acceptance Criteria

- [ ] Each modality produces searchable knowledge at the chosen scope.
- [ ] Knowledge-only inputs never become deliverable artifacts.
- [ ] A client IT cannot write outside its own scope.
- [ ] Every entry records author, role, scope and retention.
