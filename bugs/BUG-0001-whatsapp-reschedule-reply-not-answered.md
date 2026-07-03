# Bug: WhatsApp reply asking for more time is not answered

## Status

Testing — fix deployed to `hermes-leonardo-pessoal-hml` on 2026-07-02 (`hermes-taskme` commit `5f63d72`); awaiting live confirmation.

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

Confirmed against the live HML database (2026-07-02). Task TM-1002 ("Lave o
carro do Leonardo") had an OPEN charge for the assignee on the WhatsApp channel:

```text
TASK  TM-1002 status=pendente channel=whatsapp due=2026-07-05
QUEUE TM-1002 qstatus=aguardando_resposta qchannel=whatsapp phone=556299299266
EVENTS TM-1002:
  criada  | assignante | Lave o carro do Leonardo | 07-02 16:01
  enviada | sistema    | tarefa enviada ao assignado
  enviada | sistema    | tarefa reenviada ao assignado | 07-02 23:36
```

There is no `cobranca` / `reprogramada` event — the assignee's "needs more time"
reply was never turned into a reschedule. Because an open charge existed,
`route_inbound` returned `skip` and the hook processed the message, classified it
as `reprogram`, found no parseable date, and returned `None` (silent fall-through
to the agent), which did not reliably respond.

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

## Confirmed Cause

`hook._parse_outcome` classifies a "needs more time" message as `reprogram`, but
`dates.resolve_due` returns `None` when the reply carries no parseable date, so
`handle_gateway` returned `None` and fell through to the agent. The agent did not
reliably ask for the new date, so the assignee received nothing. The reschedule
reply flow had no deterministic prompt for the missing date.

Ruled out: channel scoping (commit `72cdf49`) was not the cause — the queue row's
channel matches the inbound WhatsApp channel, so the open charge is found
correctly.

## Applied Fix

`hermes-taskme` commit `5f63d72`:

- `charges.request_new_due(phone, channel)`: when there is an open charge, sends
  a deterministic prompt (`templates.ask_new_due`) asking for the new date, on
  the charge's channel, and records a state marker event (`nota`). Anti-loop
  guard: if the last interaction was already this prompt, it returns `defer` and
  lets the agent take over instead of re-asking.
- `hook.handle_gateway`: on a `reprogram` intent with no parseable date, calls
  `request_new_due`; if it asked, returns `skip` (so the agent does not also
  respond); otherwise falls through.
- Regression tests added for "asks once", "does not repeat", and "no open charge".

## Regression Risk

Medium — touches the deterministic charge-reply routing shared by the "done" and "reprogram" paths. Mitigated by the anti-loop guard and 3 new tests (full suite: 53 passing).

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
