# Product Catalog

This file is the single source of truth for product names used across the TrueMobile portfolio.

AI agents must use the product names defined here when filling the `Product` field in initiatives, epics, user stories, technical tasks, spikes, bugs, RFCs and decision records.

Do not create product name variations inside records.

If a new product, module or experiment is needed, the AI agent must propose an update to this catalog before using the new product name as an official value.

## Product Hierarchy & Values

The TrueMobile portfolio is organized into independent domains and the base agent platform (Hermes):

### 1. Standalone Products & Infrastructure

These projects have their own lifecycle, repositories, and do not depend on the Hermes Agent core, though they may share operational infrastructure.

#### MinhaIncorporadora
Use for the Sales Manager's Assistant product. The assistant serves the brokers of partner agencies on behalf of a real estate company's Sales Manager (Gerente de Vendas); it does not impersonate a broker.
- **Scope:** Independent application, deploy compose, provisioning, and database-per-client postgres cluster.
- **Examples:** Real-time unit search, pricing, photo/video/floor-plan delivery, and nightly ingestion/RAG pipeline.

#### tm-infra
Use for the TrueMobile production infrastructure cluster, global configurations, routing, and operations.
- **Scope:** Base servers, pgvector-enabled Postgres cluster configuration, Caddy/Nginx reverse proxy, edge routing, and global deployment playbooks/scripts.

---

### 2. Hermes Platform & Dependents
**Hermes Platform** is the base agent runtime/core. The following products and modules run on top of Hermes or are direct plugins of it:

#### Hermes Core
Use for changes that belong directly to the Hermes base platform.
- **Scope:** Core agent behavior, message processing lifecycle, base integrations, and shared capabilities.

#### TaskMe
Use for the Hermes-based task control and reminder product.
- **Scope:** Task creation, multi-user assignment, daily reminders, and due date rescheduling via chat.
- **Dependency:** Dependent on `Hermes Core`.

#### SemControle
Use for the personal expense tracking and categorization tool.
- **Scope:** Log expenses via text or voice, auto-categorization, deterministic summaries/sums, and multi-user privacy isolation.
- **Dependency:** Shipped as an auto-loaded backend plugin in `hermes-agent`.

#### WhatsApp Group Personality
Use for the module that allows each WhatsApp group to have its own behavior, tone, rules and contextual instructions.
- **Dependency:** Dependent on `Hermes Core`.

#### Hermes Benchmark
Use for the LLM benchmarking tool. Analyzes and compares performance, latency, and cost of different LLMs for various tasks.
- **Dependency:** Dependent on `Hermes Core`.

#### Hermes Experiments
Use for early-stage prototypes, spikes, or validations not yet mature enough to become official products or modules.
- **Dependency:** Dependent on `Hermes Core`.
