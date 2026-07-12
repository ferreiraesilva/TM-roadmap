# TrueMobile Portfolio

## Vision

TrueMobile coordinates a portfolio of technology products ranging from standalone vertical SaaS applications (like MinhaIncorporadora) to shared operational infrastructure (tm-infra) and modular agent platforms (Hermes).

---

## Projects & Initiatives

### 1. Standalone Products & Operations
These projects run as independent codebases and services, completely separated from the base Hermes Agent core.

*   **MinhaIncorporadora:** A dedicated virtual assistant for real estate developers (incorporadoras) and partner brokers.
    *   **Architecture:** Standalone Python app, PostgreSQL database-per-tenant, independent storage, automated nightly RAG ingestion.
    *   **Status:** Shipped (EBM and City clients live in separate stacks).
*   **tm-infra:** Production infrastructure configuration and deployment playbooks.
    *   **Architecture:** Docker compose blueprints, Caddy edge router config, system backup/restore scripts, pgvector database clustering.
    *   **Status:** Active.

---

### 2. Hermes Platform & Dependents
**Hermes** is an agentic platform initiative within TrueMobile. It provides the base conversational agent, and the following projects depend directly on it or run as its plugins:

*   **Hermes Core (hermes-agent):** The immutable conversational agent platform.
*   **TaskMe (hermes-taskme):** A multi-channel task assignment, reminder, and follow-up application built on top of Hermes Core.
    *   **Status:** Shipped (in homologation).
*   **SemControle (Backend Plugin):** A personal expense categorization and query assistant.
    *   **Status:** Shipped (embedded as an auto-loaded plugin in `hermes-agent`).
*   **WhatsApp Group Personality (hermes-multgrupo):** A plugin that allows each WhatsApp group to configure its own behavior, rules, and assistant persona.
    *   **Status:** Planned.

---

## Portfolio Principles

1.  **Strict Boundaries:** Keep standalone products isolated from the Hermes platform codebase so they can evolve independently without technical debt.
2.  **Infrastructure as Code:** Manage database instances, reverse proxies, and system secrets through `tm-infra` rather than hardcoding configuration in application repos.
3.  **Traceable Roadmap:** Document all architectural decisions (ADRs) and feature proposals (RFCs) centrally in this repository (`TM-roadmap`).
