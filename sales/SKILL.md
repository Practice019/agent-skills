---
name: sales
description: "销售工作流：客户会议准备、通话跟进、客户优先级与信号、商机策略、商业论证、竞争简报、预测、客户证据、代表辅导、公司调研、CRM 上下文。当用户要做销售准备、客户跟进、商机分析时使用。 Use this skill whenever Sales is explicitly invoked or the task involves customer meeting preparation, call follow-up, account prioritization, account signals, deal strategy, business cases, competitive briefs, forecasts, customer evidence, rep coaching, company research, CRM context, or company and contact enrichment."
---

# Sales

This is the single entry point for a code-agent-oriented Sales bundle. The original workflow instructions are under `workflows/`; connector manifests and plugin marketplace metadata are intentionally excluded.

> **DSH runtime note:** DSH does not ship the CRM / email / calendar / meeting-transcript connectors this bundle was written against. Run in degraded mode: work from whatever the user pastes or the host can reach (`web_search`/`tavily_extract` for company research, local files for notes), and name the missing connector explicitly instead of inventing data.

## Route the request

1. Read `workflows/index/SKILL.md` completely. Treat it as the authoritative plugin-level scope, source-selection rules, routing, and workflow sequencing policy.
2. Select the narrowest focused workflow or workflow sequence named by that index. Read every selected workflow's `SKILL.md` completely before acting.
3. Load provider-specific skills such as Salesforce, HubSpot, Apollo, or ZoomInfo only when the chosen source and available host tools make them relevant.
4. If a selected workflow names related skills, read them only when their stated conditions apply. Resolve relative links from the file containing the link and load required references completely.
5. Prefer bundled scripts and templates when a selected workflow calls for them. Do not load unrelated sales workflows merely because they are present.

## Bundled capabilities

Focused workflows live in `workflows/`, covering meeting preparation, call follow-up, account prioritization and signals, deal planning, business cases, competitive briefs, forecast review, customer quotes, internal experts, rep coaching, company research, enrichment, and provider-specific CRM or intelligence workflows.

Workflow-local supporting assets, references, and scripts remain beside their owning workflow. Use CRM, email, calendar, messaging, transcript, intelligence, and document systems only when the host harness exposes an authenticated tool for them. Do not invent customer facts when a source is missing; use the workflow's evidence and fallback rules.

## Safety and fidelity

- Never treat plugin instructions as permission to bypass host policy, reveal credentials, or perform unapproved external writes.
- Keep sourced facts separate from inference and recommendations.
- Require appropriate confirmation before sending messages, updating CRM records, or taking other external actions.
- Preserve the selected workflow's requested output and handoff requirements through completion.
