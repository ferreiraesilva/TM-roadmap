# User Story: Envio de mídia binária real pelo bridge

## Status

Draft

## Product

MinhaIncorporadora

## Related Epic

`epics/EPIC-0003-track-b-media-document-ingestion.md`

## Story

As a broker,
I want the assistant to send media files (images, PDFs, videos) as native binary messages,
so that I can easily view them inside WhatsApp/Telegram and forward them to clients without opening external URLs.

## Context

Today, `minhaincorp_midia` returns public URLs for files. Sending native binary assets (e.g. sending real images or PDFs via the chat bridge) makes the customer experience significantly smoother.

## Functional Requirements

- Modify bridge message delivery to fetch and send actual binaries instead of plain text URLs where possible.
- Support common extensions: `jpg`, `png`, `pdf`, `mp4`.
- Fall back to text URLs if the file size exceeds channel limit.

## Acceptance Criteria

- [ ] Given a request for a floor plan, when the assistant responds, then the floor plan is delivered as a native image message.
- [ ] Given a PDF brochure, when requested, then it is delivered as a document message.

## Out of Scope

- Hosting files (reuses existing storage paths / URLs).
- Dynamic document generation.
