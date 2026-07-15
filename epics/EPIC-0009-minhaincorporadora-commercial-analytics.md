# [EPIC] MinhaIncorporadora commercial and marketing analytics

## Status

Discovery - starts after EPIC-0008 homologation.

## Product

MinhaIncorporadora

## Parent Initiative

INITIATIVE-0002 - MinhaIncorporadora Standalone Atomic Platform

## Problem

Directors, marketing and managers cannot ask the assistant which developments,
materials, agencies, brokers, unit types or price bands are most demanded. Reading
raw conversations at query time is slow, inconsistent and changes historical meaning
when hierarchy or classifications change.

## Objective

Capture lightweight online events and build a separate nightly analytical pipeline so
authorized leaders can converse with stable, scoped commercial and marketing metrics.

## Scope

- Append-only interaction events with tenant, user, role and hierarchy snapshots.
- Intent and entity classification for development, availability, price, floor plan,
  photos, campaign/material, unit type, bedrooms/suites and price band.
- Raw, curated and aggregate layers processed after content ingestion overnight.
- Metrics by total requests and unique conversations/users.
- Backend queries constrained by the same IAM scope as operational actions.
- Data-quality report for unclassified/ambiguous interactions and model versions.

## Out of Scope

- Reusing raw message text as the primary analytical query store.
- Cross-client analytics.
- Management UI before metric definitions and access policies stabilize.

## Target Repository

`MinhaIncorporadora`, with possible curated-knowledge integration in `tm-conciencia`.

## Dependencies

- EPIC-0008 IAM and temporal hierarchy in production.
- Stable conversation/message persistence.
- Nightly scheduler running after content ingestion.

## User Stories

- [ ] Director compares most accessed developments month by month for 90 days.
- [ ] Marketing sees which materials and campaigns are most requested.
- [ ] Manager sees demand by agency and broker inside their scope.
- [ ] Leadership sees unit type and price-band demand, including two-bedroom searches.
- [ ] Analyst inspects unclassified events, parser/model version and final status.

## Technical Tasks

- [ ] Define event taxonomy, snapshots, retention and privacy rules.
- [ ] Add online event capture without increasing bot latency materially.
- [ ] Implement nightly classification with idempotent checkpoints.
- [ ] Build curated facts, aggregates and reconciliation report.
- [ ] Add authorized analytical tools to the bot.
- [ ] Validate three months of synthetic/history backfill before production.

## Acceptance Criteria

- [ ] Historical metrics do not change after hierarchy transfers.
- [ ] Every answer states period, filters, metric definition and scope.
- [ ] Totals reconcile from aggregate to curated and raw layers.
- [ ] Unclassified rate and model/parser versions are visible.
- [ ] No role can query outside its IAM scope or tenant.
