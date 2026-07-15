# [EPIC] MinhaIncorporadora IAM and organizational hierarchy

## Status

In Progress - implementation published; City/EBM homologation pending.

## Product

MinhaIncorporadora

## Parent Initiative

INITIATIVE-0002 - MinhaIncorporadora Standalone Atomic Platform

## Problem

The product treated every privileged person as a fake broker and used environment
variables as a runtime bypass. It could not represent admins, directors, marketing,
managers with multiple directors, revocation, team transfer or scoped analytics.

## Objective

Persist one identity per person, allow accumulated roles, enforce organizational
scope in the backend and provide an auditable lifecycle shared by bot and future UI.

## Scope

- Roles: admin, director, marketing, manager and broker.
- Temporal director-manager and manager-agency relationships.
- Hashed one-use invites, independent approval queue and channel ownership safety.
- Immediate suspension, terminal revocation and last-active-admin protection.
- Transfer preview and idempotent confirmation.
- Signed short sessions whose roles/status are revalidated in PostgreSQL.
- Admin APIs for users, hierarchy, pending requests, audit and transfers.

## Out of Scope

- Management front-end.
- Commercial/marketing analytics pipeline and semantic metrics.

## Target Repository

`MinhaIncorporadora`

## Dependencies

- Atomic City and EBM databases from INITIATIVE-0002.
- Per-tenant admin identity and IAM session secret.

## User Stories

- [x] Admin manages users, roles, invitations and audit.
- [x] Director can approve managers; manager can approve brokers in scope.
- [x] One manager can be linked to multiple directors.
- [x] Admin can preview and transfer a director or manager team.
- [ ] City and EBM are homologated independently with real role accounts.

## Technical Tasks

- [x] Additive migration and legacy backfill.
- [x] Central identity resolver, capabilities and scope.
- [x] Persistent idempotent admin bootstrap.
- [x] Secure invite, approval queue and channel ownership protection.
- [x] Lifecycle, transfer service and administrative API.
- [x] Unit, lint, restored-database and real PostgreSQL concurrency tests.
- [ ] Configure admin identity and distinct token secret per tenant.
- [ ] Roll out write, read and enforcement flags City first, then EBM.

## Acceptance Criteria

- [x] Restart does not duplicate admins or reactivate revoked users.
- [x] Last active admin cannot be removed in a concurrent transaction.
- [x] A Telegram-typed phone cannot take over an existing identity.
- [x] Multiple manager approvals do not overwrite each other.
- [x] Transfers preserve history, agencies and brokers.
- [ ] Real City and EBM smoke tests pass for every role.
