# Decision: Manage EBM Telegram access through the bot

## Status

Accepted — 2026-07-02

## Context

The EBM MinhaIncorporadora HML bot initially relied only on
`TELEGRAM_ALLOWED_USERS`. That static allowlist contained the bootstrap
administrator but silently rejected every other Telegram user. Adding a broker
required editing deployment secrets and recreating the container.

This behavior was unsuitable for an EBM-owned customer bot. Unknown users must
receive a clear ownership and onboarding message, while an authorized manager
must be able to grant or revoke access from Telegram without editing files or
running host commands.

The solution must preserve access grants when the Hermes container is recreated
and must not expose operational Hermes onboarding such as `/sethome` to brokers.

## Decision

EBM Telegram access will use the Hermes pairing store as the runtime source of
approved users, with EBM-specific administration commands exposed by the
MinhaIncorporadora plugin.

- The deployment allowlist retains only the bootstrap administrator identity.
- An unknown user always receives an EBM ownership message containing their
  stable numeric Telegram user ID as the authorization code.
- An administrator grants access with `/autorizar <code>`.
- An administrator removes access with `/revogar <code>`.
- The commands are protected by Hermes slash-command administrator gating.
- No `/autorizados` command is provided because the user population may become
  large and bulk identity disclosure is unnecessary.
- Approved identities are stored in the native Hermes pairing store under the
  profile home mounted at `/opt/data`. The host volume survives container
  recreation.
- The EBM Telegram home channel is the administrator chat. Operational cron and
  cross-platform deliveries go there, and brokers do not receive the generic
  Hermes `/sethome` onboarding prompt.

PostgreSQL is not used for this authorization state. Copying access records from
PostgreSQL into Hermes during startup would create two sources of truth, make
revocations dependent on synchronization or restart, and make gateway access
dependent on the product database. A shared database-backed authorization layer
may be reconsidered if multiple gateway hosts must share grants.

## Consequences

- Managers can onboard and revoke brokers without a deployment.
- Every unauthorized direct message receives an actionable response instead of
  being silently dropped.
- Grants survive restarts and container recreation on MAC02.
- A complete loss of the profile home still requires restoration from host
  backup; the Postgres database is not a secondary authorization copy.
- The stable Telegram ID is not treated as a secret. Authorization remains safe
  because only the configured administrator can execute the management commands.
- The current Hermes image requires a versioned `hermes-infra` overlay for the
  configurable unauthorized-message behavior and direct pairing-store approval.
  Image upgrades must continue to validate that patch before deployment.

## Implementation and Validation

Related repositories and published commits:

- `hermes-minhaincorporadora` — `b8bc5da` (`feat-telegram-access`)
- `hermes-infra` — functionality consolidated in `00dc5ab`

The change was deployed to `hermes-ebm-corretores-hml` on MAC02. Validation
included:

- 82 affected Hermes gateway tests passing through the official WSL test runner;
- a runtime smoke test that authorized a synthetic user, restarted the container,
  confirmed persistence, and revoked the synthetic user;
- live onboarding and authorization with an EBM user;
- confirmation that access survived redeployment and that the `/sethome` notice
  was suppressed after configuring the administrative home channel.

## Related Repositories

- `hermes-minhaincorporadora` — administrative Telegram commands.
- `hermes-infra` — inventory, persistent runtime overlay and EBM deployment
  configuration.
- `hermes-agent` — upstream source used to understand and test gateway,
  authorization, pairing and home-channel behavior.
