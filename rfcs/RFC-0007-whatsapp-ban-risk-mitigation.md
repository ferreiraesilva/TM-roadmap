# RFC-0007: WhatsApp Ban-Risk Mitigation and Outbound Messaging Safety

- **Status:** Draft
- **Product:** Hermes Core
- **Owners:** TBD
- **Created:** 2026-07-03
- **Last updated:** 2026-07-03

## Summary

Introduce a phased safety architecture for WhatsApp messaging through the Hermes Baileys gateway, with special attention to TaskMe's proactive notifications. The proposal preserves the protections already deployed, then adds a first-contact requirement, centralized outbound policy enforcement, serialized delivery, quotas, deduplication, circuit breaking, observability, and a feasibility study for the official WhatsApp Business Cloud API.

This work reduces avoidable ban risk but cannot eliminate it while Hermes uses Baileys, an unofficial WhatsApp client.

## Motivation

The WhatsApp number used by Hermes has experienced Meta enforcement and bans. The current gateway already simulates natural interaction timing and protects reconnection behavior, but those controls do not address the largest identified risk: proactive automated contact with recipients who have not initiated a conversation or explicitly opted in.

TaskMe sends WhatsApp messages for task assignments and recurring reminders. For the unofficial Baileys channel, the intended eligibility rule is not the formal consent model required by the official API: Hermes must have persistent evidence that the recipient initiated a conversation with that specific bot before any outbound message is allowed. First-contact enforcement, a global outbound queue, persistent TaskMe idempotency, and cooldown circuit breakers are implemented and awaiting HML validation. Per-recipient and new-contact quotas remain future work.

## Current Baseline and Avoiding Duplicate Work

The existing implementation must be extended rather than duplicated.

Already implemented in `hermes-infra/scripts/patch_bridge_anti_ban.py` and applied by `hermes-infra/scripts/deploy-instance.sh`:

- variable typing delay and `composing` presence for text;
- recording presence and delay for voice messages;
- composing/upload delay for media;
- cleanup of old sockets and listeners;
- exponential reconnect backoff with jitter;
- one bounded global outbound queue with a configurable minimum gap;
- automatic cooldown after repeated send or reconnect failures;
- persistent TaskMe idempotency keys and delivery outcomes;
- compatibility tests for the versioned bridge overlay;
- persistent WhatsApp session data under `/opt/data/whatsapp/session`;
- managed bot persona through SOUL configuration;
- pinned Baileys revision rather than an uncontrolled rolling dependency.

Known gaps:

- no per-recipient or new-recipient quotas;
- no operational Telegram alert when the circuit opens;
- no consolidated messaging-risk metrics;
- no documented decision on migration to the official API.

Typing delays and presence simulation are heuristics, not compliance controls. Configuration examples such as `messaging.whatsapp.send_delay_ms` and `messaging.whatsapp.active_hours` from the referenced tutorial do not exist in the current Hermes source and must not be copied literally.

## Scope

- Record whether each WhatsApp account is dedicated or personal, its number, purpose, and permitted products.
- Persist first-contact eligibility per TaskMe bot and WhatsApp recipient.
- Add a recipient-initiated activation flow using a forwarded `wa.me` link.
- Centralize outbound policy decisions before messages reach the gateway.
- Serialize all gateway sends through one queue with configurable pacing and priority.
- Add per-recipient quotas, new-recipient quotas, deduplication, and idempotency.
- Add reconnect circuit breaking, alerts, structured logs, and metrics.
- Add automated tests for the versioned anti-ban bridge overlay.
- Evaluate the official WhatsApp Business Cloud API and record a migration decision.

## Out of Scope

- Techniques intended to evade platform enforcement, such as randomized message content designed to defeat detection.
- Bulk marketing or unsolicited campaigns.
- Automatic replacement of banned numbers or repeated automatic re-pairing.
- Blind Baileys upgrades without compatibility and canary testing.
- Immediate production migration to the Cloud API before policy, cost, and operational fit are validated.

## Proposed User Flow

1. An assigner tries to create a TaskMe task for a recipient who has not previously messaged that bot.
2. Task creation is blocked before any outbound message is attempted.
3. The assigner receives a recipient-specific `wa.me` link and forwards it personally.
4. The recipient opens the link and sends the prefilled activation message to the bot.
5. The inbound event consumes a temporary single-use token and records the recipient in that bot's general inbound-contact list. The token also resolves new contacts received as WhatsApp `@lid` identifiers.
6. The assigner requests the task again; creation and delivery are now eligible.
7. Replies to active inbound conversations take priority over confirmations and scheduled reminders.

## Functional Requirements

### Phase 0 — Immediate Containment

- Add a feature flag that prevents proactive WhatsApp delivery to contacts without recorded first-contact evidence.
- Disable group processing for instances that do not have an approved group use case.
- Add `account_phone`, account classification (`dedicated` or `personal`), purpose, and owner to the instance inventory.
- Preserve the existing session and prohibit re-pairing while it remains valid.
- Confirm whether the currently affected number is dedicated. A personal number must not be used for automated proactive delivery.

### Phase 1 — First Contact and Delivery Policy

- Use the bot-local `taskme_channels` records as the persistent list of recipients who initiated a conversation with that bot.
- Keep the assigner's private contact book separate; adding a phone to `contacts` must never grant outbound eligibility.
- For an unknown recipient, block task creation and generate a `wa.me` link for the assigner to forward.
- Include a random, temporary, single-use activation token in the prefilled message so an inbound `@lid` address can be linked to the intended normalized phone number.
- Grant eligibility only after Hermes receives the inbound message from the recipient.
- Enforce the first-contact rule centrally for every TaskMe WhatsApp send, including assignments, retries, charges, digests, acknowledgements, and scheduled jobs.
- Route every proactive send through one policy decision that records the allow/deny reason.

### Phase 1 — Serialized Outbound Queue

- Route text, voice, and media through a single serialized gateway queue.
- Configure a minimum inter-message gap plus bounded jitter globally, rather than only delaying individual calls.
- Support configurable limits for:
  - proactive messages per recipient in 24 hours;
  - new unique recipients in 24 hours;
  - total proactive messages in 24 hours;
  - duplicate-message detection window.
- Require an idempotency key for TaskMe notifications and persist delivery outcomes.
- Apply delivery priority in this order:
  1. response to a recent inbound message;
  2. requested confirmation;
  3. scheduled proactive notification.
- Fail closed for proactive traffic if first-contact or policy state cannot be read. Reactive replies may continue only when the recent inbound event can be verified.

### Phase 2 — Resilience and Observability

- Add a reconnect failure threshold and cooldown circuit breaker.
- Stop repeated reconnect attempts when the circuit opens and alert the operational Telegram channel.
- Emit structured events for send requests, policy decisions, queue latency, delivery results, disconnect reasons, reconnect attempts, first-contact registrations, quota denials, and duplicate suppression.
- Provide daily metrics segmented by reactive and proactive traffic, including unique recipients, new recipients, failures, disconnects, and first-contact activations.
- Add fixture-based compatibility tests that apply the bridge overlay to the pinned Hermes/Baileys bridge version.
- Add a runtime smoke test confirming queue serialization, presence behavior, listener cleanup, and reconnect backoff before deployment.
- Treat a Baileys upgrade as a controlled dependency change with tests, staging, canary validation, and rollback.

### Phase 3 — Official Cloud API Feasibility Study

- Validate Meta business verification and account prerequisites.
- Prototype inbound webhooks and outbound template delivery.
- Document the 24-hour customer-service window, template requirements, expected costs, and operational ownership.
- Validate that the domain-specific TaskMe and Minha Incorporadora use cases comply with the current rules for AI functionality on the WhatsApp Business Platform.
- Define a parallel-number canary and migration strategy that does not jeopardize the current production identity.
- Produce a decision record comparing continued Baileys operation, hybrid routing, and full Cloud API migration.

## Non-Functional Requirements

- A notification must not be delivered more than once for the same idempotency key.
- First-contact and policy decisions must be auditable.
- Missing or unavailable first-contact state must block proactive delivery.
- Queue state must have defined restart semantics and must not silently duplicate messages after a process restart.
- Configuration must be inventory-driven and contain no secrets in Git.
- Existing reactive response behavior must remain available within the approved policy boundaries.
- Bridge patch compatibility must be verified before every affected deployment.

## Repository Ownership

- `hermes-taskme`: first-contact list, activation flow, outbound eligibility enforcement, notification idempotency, and PostgreSQL migrations.
- `hermes-infra`: account inventory, gateway queue overlay, pacing configuration, circuit breaker, alerts, deployment tests, and canary procedure.
- `hermes-roadmap`: RFC, implementation sequencing, acceptance evidence, and the Cloud API decision record.
- Upstream Hermes Agent: monitored dependency; upstream changes should be adopted only after local compatibility validation.

## Dependencies

- Hermes Agent WhatsApp adapter and bridge.
- Baileys and the currently pinned revision.
- TaskMe notification and recurring-charge services.
- TaskMe PostgreSQL database.
- Telegram operational alert channel.
- Current Meta WhatsApp Business terms and platform policies.

## Risks and Trade-offs

- Baileys remains an unofficial client, so enforcement risk remains even after all controls are implemented.
- Recipient-initiated activation introduces friction before the first task can be created.
- Quotas that are too conservative can delay valid operational reminders; quotas that are too permissive provide little protection.
- A durable serialized queue adds delivery-state and restart complexity.
- A shared or personal number is incompatible with the proposed proactive automation posture.
- The official API may introduce template costs, verification work, and product-policy constraints.
- A Cloud API migration reduces unofficial-client risk but does not remove consent, spam, quality, or policy obligations.

## Open Questions

- Is the current Leonardo WhatsApp number dedicated exclusively to Hermes?
- What pilot limits should apply to new recipients, proactive messages per recipient, and total proactive volume?
- How long should a generated `wa.me` activation token remain valid after the initial 14-day implementation?
- How long should an inbound conversation be considered recent for reactive priority and policy purposes?
- Should TaskMe retain daily reminders, reduce their cadence, or require per-task reminder preferences?
- Should the durable gateway queue use PostgreSQL or a local durable store, and how will failover ownership be controlled?
- Do TaskMe and Minha Incorporadora satisfy Meta's current policy boundaries for domain-specific AI assistants?

## Acceptance Criteria

- A contact without recorded first-contact evidence receives no automated TaskMe WhatsApp message and no task is created for delivery.
- The assigner receives a working `wa.me` link to forward to an unknown recipient.
- Sending the prefilled message records the recipient for that bot, including when the inbound identity is an `@lid` address.
- A recipient who has initiated contact can subsequently receive an eligible task notification.
- Concurrent send requests are serialized and honor the configured global pacing.
- Per-recipient, new-recipient, and total quotas are enforced and tested.
- Duplicate notifications are suppressed across retries and process restarts.
- Repeated reconnect failures open a circuit, stop reconnect hammering, and generate an alert.
- The existing anti-ban overlay has automated compatibility and runtime smoke coverage.
- Operators can distinguish reactive and proactive traffic and inspect policy denials, delivery failures, and reconnect reasons.
- No implementation depends on unsupported configuration keys copied from the tutorial.
- A canary on a dedicated number is validated before broader rollout.
- The Cloud API feasibility study results in a documented architecture decision.

## Implementation Sequence

1. Confirm account ownership and dedicated-number status; enable the proactive-send containment flag.
2. Implement first-contact registration, `wa.me` activation, central send blocking, and idempotency in TaskMe.
3. Implement the centralized outbound policy and global serialized queue.
4. Add quotas, deduplication, circuit breaker, alerts, and operational metrics.
5. Add bridge-overlay compatibility tests and deployment smoke tests.
6. Run a dedicated-number canary with documented rollback triggers.
7. Complete the Cloud API feasibility study and record the migration decision.

## Validation Plan

- Unit-test first-contact registration, activation-token redemption, send blocking, quota windows, policy decisions, and idempotency.
- Integration-test TaskMe notification creation through gateway delivery and persisted outcome.
- Run concurrent-send tests proving global serialization for text, voice, and media.
- Restart the queue during pending and in-flight deliveries and verify defined no-duplicate behavior.
- Simulate repeated disconnects and verify circuit opening, cooldown, and Telegram alerting.
- Apply the anti-ban overlay to the pinned upstream bridge in CI and run the runtime smoke suite.
- Run a controlled canary with a dedicated test number and participants who initiate the conversation themselves.
- Review daily metrics and disconnect reasons before increasing any quota.

## References

- [LumaDock: Hermes WhatsApp Baileys Gateway](https://lumadock.com/tutorials/hermes-whatsapp-baileys-gateway)
- [WhatsApp Business Terms of Service](https://www.whatsapp.com/legal/business-terms)
- [Hermes Agent WhatsApp documentation](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- [Baileys repository](https://github.com/WhiskeySockets/Baileys)
