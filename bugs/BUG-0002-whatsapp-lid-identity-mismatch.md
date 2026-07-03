# Bug: WhatsApp LID resolved as phone number breaks identity matching

## Status

Confirmed — root cause identified in the bridge (2026-07-02); fix designed (bridge LID→PN resolution). Implementation pending; live validation requires WhatsApp re-pairing.

## Product

TaskMe

## Severity

High

## Priority

P1 - High

## Related Area

WhatsApp inbound identity resolution — `taskme/identity.py` (`resolve`, WhatsApp branch), `gateway.whatsapp_identity.normalize_whatsapp_identifier`, and the `taskme_channels` mapping. Affects every phone-scoped flow (charges, queries, digests) because tasks and contacts are keyed by canonical phone.

## Environment

Production (homologation) — `hermes-leonardo-pessoal-hml`, WhatsApp channel (Baileys bot mode).

## Summary

Some WhatsApp messages arrive identified by a LID (`<digits>@lid`, WhatsApp's privacy/linked identifier) instead of the phone JID (`<phone>@s.whatsapp.net`). TaskMe resolves that LID to a "phone" equal to the LID digits, which never matches the real contact phone. As a result the sender is treated as an unknown/wrong identity and phone-scoped matching (open charge, task lookup) fails.

## Current Behavior

`identity.resolve("whatsapp", "<digits>@lid")` returns the LID digits as the phone and links them in `taskme_channels` as a WhatsApp address whose `phone` is the LID, not the real number.

## Expected Behavior

A WhatsApp message from a given person should resolve to that person's canonical phone number, regardless of whether WhatsApp delivered a `@s.whatsapp.net` phone JID or a `@lid` identifier, so that charges, task lookups, digests and queries match the stored contact.

## Steps to Reproduce

1. Have a WhatsApp user whose messages arrive as a `@lid` identifier.
2. Assign them a task (contact stored with the real phone) and open a charge.
3. As that user, reply on WhatsApp.
4. Observe that `identity.resolve` returns the LID (not the phone), so `has_open_charge`/task matching by phone fails and the reply is not associated with the task.

## Evidence

```text
taskme_channels rows (HML, 2026-07-02):
  whatsapp addr=236657060135090@lid -> phone=236657060135090
  whatsapp addr=71709243744259@lid  -> phone=71709243744259
contacts:
  Livinha Do Papai = 556299299266   (real phone)
  Julia            = 556293444942
The @lid "phones" do not match any real contact phone.
```

## Impact

- WhatsApp senders identified by LID are not matched to their contact/tasks.
- Breaks charge replies, task queries, and digests for those users (phone-scoped).
- Compounds BUG-0001: even with the deterministic reschedule prompt, the reply is not tied to the open charge when the sender resolves to a LID.

## Workaround

```text
No reliable workaround. Users whose WhatsApp delivers a phone JID
(<phone>@s.whatsapp.net) are unaffected.
```

## Confirmed Cause

Investigated in the `hermes-leonardo-pessoal-hml` container (2026-07-02). The
WhatsApp bridge (`runtime/whatsapp-bridge/bridge.js`, Baileys 7.0.0-rc.9) never
resolves a LID to a phone number:

- `normalizeWhatsAppId(value)` is trivial — `String(value).replace(':', '@')`. It
  does not consult any LID map.
- The sender is derived as `senderId = msg.key.participant || chatId; senderNumber
  = senderId.replace(/@.*/, '')`. For a `@lid` sender this yields the LID digits.
- `buildLidMap()` reads `lid-mapping-{phone}.json` files, but nothing ever writes
  those files, so `lidToPhone` is always empty (dead code).

So every non-contact (addressed by LID) is identified by LID digits, which never
match a real contact phone. The Python side (`gateway.whatsapp_identity.
normalize_whatsapp_identifier`) only strips a JID to its numeric core; it cannot
recover the phone. The fix must happen in the bridge.

Baileys 7.x already carries the phone: the decoded message key exposes
`remoteJidAlt` / `participantAlt` (the phone JID when addressing mode is `lid`),
and `sock.signalRepository.lidMapping.getPNForLID(lid)` returns the phone JID
(Baileys learns and stores LID↔PN mappings on incoming messages —
`messages-recv.js` `storeLIDPNMappings`).

## Proposed Fix

Patch the WhatsApp bridge to resolve the sender's LID to a phone before emitting
the event:

1. When `senderId` ends with `@lid`, prefer `msg.key.participantAlt` /
   `msg.key.remoteJidAlt` (already a `@s.whatsapp.net` phone JID).
2. Fallback to `await sock.signalRepository.lidMapping.getPNForLID(senderJid)`.
3. If still unresolved, keep the LID (degraded, no worse than today) — candidate
   for a self-onboarding prompt (ask the sender to share contact / phone), reusing
   the existing vCard onboarding path.

Placement: a new cross-product bridge patch in `hermes-infra/scripts/` (identity
is Hermes-core, shared by all products), wired into `deploy-instance.sh` next to
`patch_bridge_caption.py`, and rolled out first to `leonardo-pessoal-hml`. No
change needed in TaskMe or the Python identity layer — the bridge starts emitting
the real phone.

Validation requires a live WhatsApp session (currently unpaired) and a real
non-contact message, because LID↔PN resolution depends on runtime data.

## Regression Risk

Medium — changes how WhatsApp senders are identified for every inbound message;
must not break senders already addressed by phone JID (guard: only rewrite when
the sender is `@lid`) and must be syntax-checked (node --check) during deploy.

## Acceptance Criteria

- [ ] Given a WhatsApp message delivered with a `@lid` identifier, when identity is resolved, then it maps to the sender's canonical phone number.
- [ ] Given such a sender with an open charge, when they reply, then the reply matches the open charge and is processed.
- [ ] Existing senders that already arrive as `<phone>@s.whatsapp.net` keep resolving correctly.
- [ ] Relevant tests are added.

## Related Issues

- BUG-0001 (reschedule reply not answered) — same follow-up flow.
- Channel scoping: `hermes-taskme` commit `72cdf49`.
- TaskMe MVP identity model: `/rfcs/RFC-0001-taskme-mvp.md`.

## Notes

Discovered on 2026-07-02 while diagnosing BUG-0001, when the bot's WhatsApp session
was also found logged out (separate operational issue — re-pair required). Register
now; investigate after WhatsApp connectivity is restored.
