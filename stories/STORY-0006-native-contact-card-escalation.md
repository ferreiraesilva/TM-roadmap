# User Story: Cartão de contato nativo no escalonamento para o Gerente de Vendas

## Status

Draft

## Product

MinhaIncorporadora

## Related Epic

(Não associado - Core escalation logic)

## Story

As a broker,
when the conversation is escalated to a Sales Manager,
I want to receive the manager's contact details as a native WhatsApp Contact Message (vCard),
so that I can save the contact and click to chat with them immediately.

## Context

Currently, the escalation returns a plain `wa.me` hyperlink. Providing a native vCard is much more professional and makes saving/contacting the manager seamless. This is specific to WhatsApp.

## Functional Requirements

- Create a tool or adapt `minhaincorp_escalar` to return vCard payload when channel is WhatsApp.
- vCard must contain: Full Name, Phone Number, and Organization ("{{INCORPORADORA}}").
- Fall back to wa.me link for Telegram.

## Acceptance Criteria

- [ ] Given an escalation request on WhatsApp, when processed, then a Contact Message (vCard) is sent to the broker.
- [ ] Given an escalation request on Telegram, when processed, then a standard text message with a wa.me link is sent.
