# Initiative: MinhaIncorporadora Standalone Atomic Platform

## Status

Active

## Product

MinhaIncorporadora

## Summary

Move MinhaIncorporadora off the shared Hermes-based legacy system onto a
standalone product built as **atomic per-client stacks**: one application
deployment (api + worker + scheduler) per real estate company, each connected to
its **own isolated database** on an external, infra-managed Postgres cluster, with
its own media storage and Telegram bot. Clients share only the Postgres artifact
and a thin edge ingress. This gives contractual data isolation between competing
clients, blast-radius isolation, per-client scaling and safe offboarding, and
removes the multi-tenant cognitive tax from the code.

See decision record `/decisions/2026-07-10-minhaincorporadora-atomic-per-client-stack.md`.

## Problem

The first implementation shared one database (row-level `incorporadora_id`) and
guessed the tenant from the caller's phone. This created a cross-tenant leak
class, a single blast radius (one flood/migration/bug hits everyone), and unsafe
offboarding. Production Postgres is a separate DBA-managed cluster (one database
per client+project), and competing clients contractually must not see each
other's data.

## Objective

Every client runs fully isolated ("this container is EBM's, that database is
City's"), onboarding a new client is a scripted, low-risk operation, and the
nightly content ingestion that feeds the assistant runs reliably per client.

## Target Users

Real estate companies (incorporadoras) and their partner agencies' brokers;
internally, the operator who onboards clients and rotates credentials.

## Scope

- Atomic per-client application stack (generic image, per-client project/env).
- External Postgres with database-per-client, least-privilege roles, pg_hba
  database-to-login pairing, isolation verification.
- Per-client media storage (local volume now, object storage later).
- Shared edge ingress routing each client's webhook to its own stack.
- Legacy-to-standalone data migration per client.
- Nightly ingestion & content treatment per client.
- Operational tooling: provisioning, deploy/migrate runner, credential rotation.

## Out of Scope

- Changes to the Hermes Agent core.
- Multi-tenant shared-database mode (explicitly rejected).

## Success Criteria

- Two or more clients run in production, each on its own database, provably
  unable to read another client's data.
- A new client is onboarded with a documented, scripted procedure.
- Nightly ingestion runs per client and reports completion with cost.
- Credentials for any client can be located and rotated from a single reference.

## Related Epics

Done:

- [x] Atomic per-client app stack + external Postgres (compose.app.yml, compose.database.yml)
- [x] Tenant isolation: database-per-client, least-privilege roles, pg_hba pairing, isolation verifier
- [x] Remove multi-tenant guessing (tenant = the database's single incorporadora)
- [x] Media stash / convert / native delivery (EBM): download, image resize, video transcode <15MB
- [x] Shared nginx edge ingress (one ngrok, path-routed per client)
- [x] EBM migrated to atomic model and live
- [x] City migrated to atomic model and live (data imported from legacy)
- [x] Nightly ingestion routine per tenant with scheduler, diagnostics and cost report

Pending (backlog):

- [ ] **IAM and organizational hierarchy (EPIC-0008)** - implementation published;
      configure and homologate City/EBM independently.
- [ ] **Commercial and marketing analytics (EPIC-0009)** - event taxonomy and
      nightly curated aggregates after IAM stabilization.
- [ ] City media stash (bring bytes from the legacy City container into city storage)
- [ ] Per-tenant rate limiting at the edge (protect a client from its own flood)
- [ ] Configuration & credentials management front-end (register/rotate per-client keys: DB URL, bot token, OpenRouter keys)
- [ ] Rotate all hml secrets (bot tokens, DB passwords, OpenRouter keys) before production
- [ ] Decommission legacy Hermes-minhaincorporadora stacks after parity confirmed
- [ ] Media storage S3/GCS backend (pluggable, per-client bucket)
- [ ] Name resolution + numbered media-menu selection (broker replies "5" -> Plantas)

## Dependencies

- `hermes-infra` for the production Postgres cluster and ops.
- OpenRouter API keys (shared across clients today) for classification.
- Legacy `hermes-minhaincorporadora` databases as the migration source.

## Risks

- Deploy/migration fan-out across N clients requires discipline (mitigated by the
  deploy/migrate runner).
- Media source availability (the legacy file host has been intermittent);
  mitigated by holding bytes in own storage.
- Credential sprawl until the config front-end exists; mitigated by the secrets
  registry (`/config/minhaincorporadora-secrets-registry.md`).

## Open Questions

- Should per-client OpenRouter keys replace the shared keys for cost attribution?
- Second edge tunnel per client vs. the shared ingress in production.

## Target Repositories

- MinhaIncorporadora (application, deploy compose, provisioning)
- hermes-infra (production database cluster, ops)
