# MinhaIncorporadora — Secrets & Config Registry

Single reference for **where each credential lives and how to rotate it**, per
client. This file records **locations and procedures only — never secret values**.

A configuration & credentials management front-end is planned (see
`/initiatives/INITIATIVE-0002-minhaincorporadora-atomic-platform.md`); until it
exists, this is the source of truth for rotation.

Model: one atomic stack per client. Each client has its own database, database
role, media storage and Telegram bot. Clients share only the Postgres cluster and
the edge ingress.

## Where each credential lives (per client)

| Credential | Location | Notes |
|---|---|---|
| Database URL + role password | `.env.<client>` on the deploy host (`DATABASE_URL`) | e.g. `.env.ebm`, `.env.city`; role `role_mi_<client>` reaches only `db_mi_<client>` |
| Postgres admin + per-client role passwords | `.env.database` on the deploy host | consumed by `compose.database.yml` provisioning |
| Telegram bot token | client database → `minhaincorp.configuracoes_canal` (`canal='telegram'`, `config->>'token'`) | not stored in env or git |
| Telegram webhook secret | same row, `config->>'secret_token'` | validated by the api on every inbound |
| Telegram webhook URL | same row, `config->>'webhook_url'` | edge ingress path `/webhooks/<client>/telegram` |
| OpenRouter API key | `.env.<client>` (`OPENROUTER_API_KEY`) | shared across clients today |
| Escalation alert webhook | `.env.<client>` (`ALERT_WEBHOOK_URL`) | routes to the client's Sales Manager |

Env files (`.env.*`) are gitignored and live only on the deploy host. Bot
credentials live inside each client's isolated database, so they are naturally
scoped to that client.

## Rotation procedures

### Telegram bot token
1. BotFather → `/revoke` for the client bot → obtain a new token.
2. Update the client database:
   `UPDATE minhaincorp.configuracoes_canal SET config = jsonb_set(config,'{token}', to_jsonb('<new>'::text)) WHERE canal='telegram';`
3. Re-register the webhook with the stored secret (setWebhook) if needed.

### Telegram webhook secret
1. Generate a new secret; update `config->>'secret_token'` in the client DB.
2. Re-run setWebhook with the new `secret_token`.

### Database role password
1. Rotate in `.env.database` and re-run the `provision` profile of
   `compose.database.yml` (it re-applies the role password).
2. Update `DATABASE_URL` in `.env.<client>` and redeploy that client's stack.

### OpenRouter API key
1. Rotate the key at OpenRouter.
2. Update `OPENROUTER_API_KEY` in each `.env.<client>` and redeploy.

## Pending rotations (hml)

The hml passwords/tokens were set to fixed values to bring the environment up
quickly and MUST be rotated before production:

- [ ] EBM Telegram bot token
- [ ] City Telegram bot token (was exposed in chat during setup)
- [ ] Postgres role passwords (`role_mi_ebm`, `role_mi_city`) and admin password
- [ ] OpenRouter API keys (EBM and City, reused from the legacy project)
