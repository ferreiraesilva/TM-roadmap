# Initiative: ConcienciaTM — Truemobile shared knowledge service

## Status

Draft (evolved from "MinhaIncorporadora Knowledge Platform" — now a standalone
Truemobile product serving every project, not a MinhaIncorporadora feature)

## Product

ConcienciaTM (Truemobile — cross-project)

## Summary

A standalone knowledge service — the Truemobile "brain" — that every Truemobile
agent (MinhaIncorporadora/EBM, MinhaIncorporadora/City, investment agents,
future projects) can **consult on demand, never copy**. The teacher/student
model: the EBM agent doesn't know about FIIs, but it knows ConcienciaTM does,
and knows how to ask.

Three knowledge levels:

1. **Global (ConcienciaTM)** — Truemobile's own transversal knowledge: sales
   training, performance training, stock market, FIIs, agribusiness, etc.
2. **Project** — each product's domain (MinhaIncorporadora, Taskme, ...).
3. **Implementation/client** — private, contractually isolated data (EBM,
   City) that never leaves the client's stack.

Core design decisions:

- **Consult, never copy.** No ConcienciaTM chunk/embedding ever enters a
  client's RAG. Agents ask, use the answer, discard.
- **File ≠ knowledge.** Originals (PDF, PPT, video, YouTube link, book) live
  immutable in the **acervo** (own storage; local in alpha, GCS/S3 later,
  behind a storage-backend abstraction from day 1). Knowledge is distilled
  into **OKF pages** — one living `.md` per topic, in git (`tm-conciencia`).
- **OKF-first, pgvector as disposable index.** The source of truth is the
  `.md` in git; the vector DB only indexes it for retrieval and can be rebuilt
  from the repo at any time.
- **Monotonic curation.** New source versions are re-distilled and merged into
  the topic page; contributions accumulate, conflicts are flagged for human
  curation (the operator is editor-in-chief), and git history records the
  knowledge's evolution (revertable).
- **Artifact delivery.** A consulting agent may receive not just text but the
  artifact itself (book, deck, video, PDF, YouTube link) and decide whether to
  hand it to its user — used and discarded, never stored client-side.
- **Per-consumer credentials** for tracing and rotation (ties into the
  secrets registry, INITIATIVE-0002).

## Problem

Today knowledge exists only as a side effect of ingesting a client's marketing
content, is per-client only, and can only be authored by running pipelines.
There is no way for Truemobile to teach all agents at once, no notion of
"learn from this but do not expose the artifact", no shared cross-project
brain, and all knowledge entry is manual command-line work.

## Objective

A managed, standalone knowledge service where the right people teach at the
right scope, from any modality, with artifact-retention choice — and where
every Truemobile agent answers from its own base plus ConcienciaTM as a
complementary, consult-only teacher.

## Target Users

- Truemobile operators — author/curate global knowledge and the acervo.
- Client IT / content owners — author their own client's knowledge (own scope).
- Every Truemobile agent — consults ConcienciaTM at runtime.
- Brokers/end users — benefit indirectly through better answers and delivered
  artifacts.

## Scope

- The `tm-conciencia` service: acervo (immutable originals) + OKF pages (.md
  in git) + distillation/merge pipeline + conflict queue for human curation.
- Consultation API: query → OKF knowledge and/or acervo artifacts; per-consumer
  credentials.
- pgvector index over OKF pages + acervo metadata (own DB in the shared
  Postgres, isolated role — atomic-platform pattern).
- Multi-modal ingestion (text/file/video/photo/link) with AI extraction.
- Per-input retention choice: knowledge-only vs knowledge + deliverable artifact.
- Front-end for authoring and curation (EPIC-0007) — no more CLI knowledge entry.

## Out of Scope

- Cross-client data leakage: a client never sees another client's private
  knowledge; ConcienciaTM is a third actor, not a bridge between clients.
- ConcienciaTM learning *from* client data (would be an explicit future
  decision with its own retention policy).
- Changes to the Hermes Agent core (agents consume via official
  tool/API extension points only).

## Success Criteria

- Truemobile publishes one piece of knowledge once and every agent can use it,
  without duplication into client RAGs.
- An agent can receive and optionally deliver an artifact (PDF, video, link)
  that it uses and discards — nothing persisted client-side.
- A new version of an already-ingested source improves the topic's OKF page
  without losing other contributors' content; conflicts wait for the curator.
- Losing the vector DB costs only a re-index from git, no knowledge.
- All authoring/curation happens through the front-end, not the command line.

## Related Epics

- [ ] EPIC-0005 — Knowledge ingestion service (multi-scope, multi-role, multi-modal, retention choice)
- [ ] EPIC-0006 — Assistant retrieval over own + complementary ConcienciaTM base
- [ ] EPIC-0007 — ConcienciaTM curation front-end (design via claude-design)

## Dependencies

- INITIATIVE-0002 (atomic per-client platform): ConcienciaTM follows the same
  atomic pattern — own stack, own DB (`db_conciencia`) in the shared Postgres,
  isolated role, identifiable containers, behind the tm-infra ingress.
- The nightly ingestion pipeline (classify/chunk/embeddings) is reusable as
  the extraction engine.
- Secrets registry (per-consumer credential rotation).

## Risks

- Distillation/merge quality: bad merges could degrade a topic page — mitigated
  by git history (revert) and the human-curation conflict queue.
- Consultation latency: synchronous API call adds ~1-3s when an agent
  escalates to the teacher.
- Storage migration (local → GCS/S3) — mitigated by the backend abstraction.

## Resolved Questions (were open)

- **Where does global knowledge live?** In ConcienciaTM itself — a shared
  service consulted at runtime. Never replicated into client DBs.
- **Is the knowledge front-end the same surface as the config/credentials
  front-end?** Separate product surface (EPIC-0007), designed with
  claude-design; may share auth/infra.

## Target Repositories

- `tm-conciencia` (https://github.com/ferreiraesilva/tm-conciencia.git) —
  service, OKF pages, acervo pipeline, consultation API.
- MinhaIncorporadora — consumer-side tool ("ask the teacher").
- Front-end surface (EPIC-0007).
