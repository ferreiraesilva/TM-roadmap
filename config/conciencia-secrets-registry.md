# ConcienciaTM — Secrets & Config Registry

Single reference for **where each credential lives and how to rotate it**.
This file records **locations and procedures only — never secret values**.

Model: one standalone service (not per-client). Consumers (EBM, City, future
agents) each hold their own API credential to ConcienciaTM — see
`tm-conciencia/docs/06-controle-de-acesso.md` for that model. This registry
covers ConcienciaTM's OWN credentials (its database, its OpenRouter key).

## Where each credential lives

| Credential | Location | Notes |
|---|---|---|
| `role_conciencia` DB password | MAC02 host: `/home/leonardo/.conciencia_db_password.txt` (chmod 600) + `.env.conciencia` (gitignored) at `/home/leonardo/projects/tm-conciencia/` | generated 2026-07-10 (F1.2); **live in `.env.conciencia` since F1.10 deploy (2026-07-11)** |
| Postgres admin password (tm-postgres-hml) | `tm-infra/environments/hml/.env` (`POSTGRES_PASSWORD`) on MAC02 | shared cluster admin; consumed by `database/provision/001_conciencia_database.sql` via `scripts/database/provision.sh` |
| OpenRouter API key (ConcienciaTM's own) | MAC02 host: `/home/leonardo/.conciencia_openrouter_key.txt` (chmod 600) + `.env.conciencia` at `/home/leonardo/projects/tm-conciencia/` | **must be its own key, never EBM's or City's** — issued by Leo 2026-07-11, marked temporary, **rotation planned by Leo**. **Live and in active use since F1.10** (real embeddings running). |
| Consumer API keys (`tmc_ebm_...`, `tmc_city_...`) | `db_conciencia` → `consumidores` table (hash only) + this registry once emitted | mechanism ready since F1.4/F1.5; none issued to a real consumer yet — first one is F1.11 (MinhaIncorporadora tool) |
| Bootstrap/ops admin key | Emitted on demand via `docker exec conciencia-api-1 python scripts/admin_consumidor.py emitir --escopo admin`, used once, revoked immediately after | not a standing credential — see F1.10 log entry in `tm-conciencia/progresso.md` for the pattern |

## Rotation procedures

### `role_conciencia` DB password
1. Generate a new password.
2. Re-run `scripts/database/provision.sh` with `CONCIENCIA_DB_PASSWORD` set to
   the new value (it reapplies via `ALTER ROLE ... PASSWORD`).
3. Update `DATABASE_URL` in `.env.conciencia` and redeploy.

### Consumer API key (e.g. EBM's)
1. `POST /v1/admin/consumidores/{id}/revogar` (marks the old hash revoked).
2. `POST /v1/admin/consumidores` to issue a new one (see docs/06).
3. Update `CONCIENCIA_API_KEY` in the consumer's env and redeploy it.

## Pending rotations (hml)

- [ ] `role_conciencia` password: currently a freshly-generated hml value, not
      yet rotated to a production-grade secret; fine for alfa, must rotate
      before any real client-visible data flows through it.
- [ ] ConcienciaTM's own OpenRouter key: issued as a **temporary** key
      (2026-07-11) to unblock F1.10 — Leo will rotate it; when he does,
      update `/home/leonardo/.conciencia_openrouter_key.txt` on MAC02 and
      `.env.conciencia` on the deploy host.
