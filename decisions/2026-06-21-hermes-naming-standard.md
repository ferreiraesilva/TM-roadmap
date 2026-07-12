# Decision: Hermes ecosystem naming standard

## Status

Accepted — 2026-06-21

## Context

The ecosystem grew to multiple products (TaskMe, MinhaIncorporadora) plus planned
ones (Investimentos, Governança, WhatsApp Group Personality). Repository names and
deployment resource names were inconsistent, making it hard to tell at a glance
what belongs to Hermes.

## Decision

Every system that runs on Hermes follows one naming standard.

### Repositories

All Hermes repositories use the `hermes-<name>` prefix and belong to the
**Hermes Ecosystem** GitHub Project.

| Before | After |
|---|---|
| `TaskMe` | `hermes-taskme` |
| `MinhaIncorporadora` | `hermes-minhaincorporadora` |
| `Hermes_MultGrupo` | `hermes-multgrupo` |
| (already) | `hermes-infra`, `TM-roadmap` |
| future | `hermes-investimentos`, `hermes-governanca` |

### Deployment resources (defined in `hermes-infra`)

- Telegram bots: `TMHA_<Client>_<Profile>_<Env>_bot` (TrueMobile Hermes Agent).
- Container: `hermes-<client>-<profile>-<env>` (1 profile = 1 container = 1 bot).
- Database / role: `db_<product>_<client>` / `role_<product>_<client>`.

## Consequences

- Renamed GitHub repos keep redirects, so existing clones keep working.
- `hermes-infra` is the single source of truth for deployment resource names; its
  validator rejects bot usernames outside the `TMHA` pattern.
- Local source directories on the homologation host are renamed only after the
  legacy single-profile container is decommissioned (it still depends on the old
  paths via plugin symlinks).

## Related

- `config/product-catalog.md` — official product names.
- `hermes-infra` — environments, inventory, Postgres and deployment scripts.
