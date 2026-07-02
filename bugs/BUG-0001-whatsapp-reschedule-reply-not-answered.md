# Bug: WhatsApp reply asking for more time is not answered

## Status

Draft

## Product

TaskMe

## Severity

High

## Priority

P1 - High

## Related Area

Charge-reply routing and due-date rescheduling — deterministic hook (`hook.py` `_parse_outcome` / `handle_gateway`), `charges.handle_reply`, and the agent fallback (`taskme_responder`).

## Environment

Production (homologation) — `hermes-leonardo-pessoal-hml`, WhatsApp channel.

## Summary

An assignee replied on WhatsApp saying she needs more time to deliver the task, and the system did not respond at all.

## Current Behavior

The assignee sent a free-text WhatsApp reply indicating she needs more time (e.g. "preciso de mais prazo"), without stating a specific new date. The system produced no acknowledgement and no follow-up question. The interaction was silently dropped from the user's perspective.

## Expected Behavior

The system should recognize the intent to renegotiate the deadline and, because no new date was provided, reply asking for the new due date. Once the assignee provides a date, the task should be rescheduled (via `taskme_responder` / the `reprogram` flow) and both sides acknowledged.

## Steps to Reproduce

1. Create a task for an assignee via WhatsApp (so an open charge/queue entry exists for that assignee on the WhatsApp channel).
2. As the assignee, reply on WhatsApp with a reschedule intent but no explicit date, e.g. "preciso de mais prazo".
3. Observe that no response is sent back to the assignee.

## Evidence

```text
To be collected. Container logs for hermes-leonardo-pessoal-hml at the time of
the interaction were not captured. Reproduce with logging enabled and attach the
pre_gateway_dispatch / pre_llm_call trace and the assignee's exact message.
```

## Impact

- Breaks the due-date rescheduling flow for the assignee.
- The assignee cannot negotiate a new deadline through the normal reply path.
- Erodes trust in TaskMe follow-up (a message to the bot appears to be ignored).

## Workaround

```text
The assignee can send a reply that already includes an explicit date
(e.g. "consigo entregar sexta"), which the deterministic hook can parse directly.
No workaround for the "needs more time, no date" case.
```

## Suspected Cause

Hypotheses to be confirmed during investigation:

- `hook._parse_outcome` classifies "preciso de mais prazo" as `reprogram`, but `dates.resolve_due` returns `None` (no parseable date), so `handle_gateway` returns `None` and falls through to the agent. The agent is expected to ask for the new date via `taskme_responder`, but may not have prompted — the deterministic path gives up without a deterministic "what is the new date?" reply.
- Channel scoping (introduced 2026-07-02, commit `72cdf49`): `route_inbound`/`has_open_charge` now filter the open charge by `(phone, channel)`. If the queue row's channel did not match the inbound channel, `route_inbound` would return `allow` and the pending-charge hint would not be injected, lowering the chance the agent prompts for a date. Verify whether the report predates this change.
- The reply may have arrived as audio, requiring transcription before `taskme_responder`; confirm the message type.

## Proposed Fix

```text
To be defined after investigation. Likely direction: when the hook detects a
reschedule intent with no parseable date AND there is an open charge, send a
deterministic reply asking for the new date (instead of silently falling
through), and/or ensure the agent path reliably calls taskme_responder and
prompts for the date. Add a regression test for "reschedule intent without a
date".
```

## Regression Risk

Medium — touches the deterministic charge-reply routing shared by the "done" and "reprogram" paths.

## Acceptance Criteria

- [ ] Given an assignee with an open charge, when they reply with a reschedule intent but no date, then the system asks them for the new due date.
- [ ] Given the assignee then provides a date, when it is processed, then the task is rescheduled and both the assignee and the assigner are acknowledged.
- [ ] The bug is no longer reproducible using the documented steps.
- [ ] Existing related flows (deterministic "done" and dated "reprogram") continue to work.
- [ ] Relevant tests are added or updated.

## Related Issues

- Channel scoping change: `hermes-taskme` commit `72cdf49`.
- TaskMe MVP reschedule flow: `/rfcs/RFC-0001-taskme-mvp.md`.

## Notes

Reported by the product owner on 2026-07-02. Deferred for investigation; not yet reproduced with logs.
