# Referral — Product and Engineering Plan

**Status:** Initial local product slice built; production readiness work remains.  
**Repository reviewed:** 2026-10-13.  
**Decision horizon:** Build a focused, usable individual job-seeker workflow first, while keeping the data model workspace-aware and industry-configurable. Default to free/public sources and preserve replaceable provider seams for low-cost, high-leverage options.

## 1. Repository assessment

At planning baseline, the checkout contained no product source files, package manifest, README, migrations, tests, or commits. The initial implementation now provides a branded Next.js local demo. This plan remains the full target-state specification; items below are not implemented unless listed in the implementation snapshot.

### Implementation snapshot (2026-10-13)

- Built a responsive, industry-aware demo for Technology, Finance, Healthcare, and Public Sector with restrained visual variations and shared navigation. The local workspace switch now loads isolated synthetic data for each industry.
- Added synthetic seeded workspaces, profile/goals, evidence, opportunity scoring, a lightweight pipeline, contacts, URL registry, and local browser persistence.
- **Known workspace gap:** the local demo keeps separate contexts per industry, but it does not yet have account-owned memberships or multiple role lanes within an industry. In particular, Healthcare still needs distinct physician, nurse, and physical therapist workspaces before sign-in is enabled.
- Completed a manual responsive pass at 320 px and 390 px across all five primary sections, including opportunity details, mobile entry forms, and plan dialog; corrected dashboard horizontal overflow and added safe-area/input sizing behavior.
- Aligned synthetic opportunity examples with their industry profile and included relationship access in the weighted score breakdown. Calendar dates now use the user's local day boundary.
- Added Free and Paid demo entitlements and limit states. There is no billing integration and the sample allowances remain provisional.
- Kept login disabled. Data currently lives in browser `localStorage`; the provider seam and production build guard are present, but Supabase Auth, server-side persistence, authorization/RLS, and an enableable login portal are not yet implemented.
- AI drafting, source fetching, automated job ingestion, document upload/export, and third-party integrations remain future work. Research URLs are recorded only; this build does not fetch or verify their contents.
- The running prototype is for local synthetic data only. Do not enter sensitive career information or expose it publicly.

The user-facing product can start as a single-person workspace, but every domain row should have workspace ownership from the first migration. Initial industry presets are **Tech, Finance, Healthcare, and Public Sector**. Workspace configuration describes industry, role focus, seniority and constraints as editable data rather than branching code by industry. The initial audience is inferred to be job seekers managing their own career transitions; an advisor/recruiter workflow remains a later decision.

## 2. Product requirements and first user journey

### Product outcome

Help a professional make a better next-career move by connecting verified career evidence and editable goals to a small set of explainable opportunities, useful relationships, grounded research, and a clear next action.

### MVP user stories and acceptance criteria

0. **Use the app with authentication disabled during early development.** The initial local build opens directly into a synthetic, local-only demo workspace. Identity and workspace authorization remain modeled from the beginning so a login portal can be enabled by configuration without redesigning domain records.
   - Auth-disabled mode is permitted only for local development or a deliberately access-restricted demo environment; production startup/deployment must fail closed if authentication is disabled.
   - No public or shared deployment may expose real user or career data without authentication and server-side authorization.
1. **Enter a professional workspace.** After sign-in, a person lands inside an authorized workspace configured for their industry, profession, specialization, seniority, geography, and work arrangement. The initial profiles cover Technology, Finance, Healthcare, and Public Sector; a user can create or join another workspace without mixing its profile, evidence, opportunities, contacts, or settings with the active one.
   - The account identity and workspace are distinct. A user can belong to one or more workspaces; sign-in opens the last authorized workspace or a workspace chooser if there is more than one. Switching workspace changes the data scope, not merely the theme.
   - The workspace profile includes a profession/role archetype within its industry. Initial examples include software developer/platform engineer; financial analyst/risk professional; physician, nurse, or physical therapist; and public-sector digital services/policy roles. Role-specific fields and workflow prompts are configuration-driven and extensible.
   - The experience changes where the work differs: terminology, evidence categories, credentials and expiry, opportunity fields, comparison dimensions, default next actions, and free/public source suggestions. Preserve shared navigation, visual quality, explainable scoring, user control, and core career records.
   - Example evidence and workflow: developers can foreground shipped systems, stack, reliability and technical scope; finance professionals can foreground modeling, forecasts, controls, deal/risk scope and credentials; clinicians can foreground licensure, specialty, care setting, patient population and care outcomes. Healthcare workspaces must not solicit patient-identifiable information. These are starting assumptions to validate with job seekers.
   - Industry choice must never imply that a clinical, finance, security, or public-sector qualification is verified; credential status and jurisdiction remain explicit evidence.
   - Required focus and geography can be represented as hard constraints or preferences.
   - A seeded demo workspace is available; a new workspace also has a useful empty state. With login off, the local demo uses synthetic workspaces and makes the workspace boundary visible.
2. **Create a grounded career profile.** As a user, I add profile facts, goals, skills, credentials, achievements, and evidence with source and confidence/provenance.
   - Every claim is marked user-provided, document-derived, externally observed, or AI-proposed; AI proposals require review before they become profile facts.
   - A user can edit and delete claims and inspect the source material supporting them.
3. **Add an opportunity.** As a user, I manually capture a role and optional URL, organization, description, location, and compensation. The entry can be edited, archived, and linked to a company and contacts.
   - Duplicate URL or normalized organization/title/source records are flagged for review rather than silently discarded.
4. **Evaluate and compare.** As a user, I see eligibility, a score breakdown, confidence, missing information, evidence, and next action for each opportunity.
   - Hard constraints determine eligibility before ranking; missing data lowers confidence and is not treated as negative evidence.
   - Changing goal weights changes the deterministic score and exposes the changed breakdown.
5. **Tailor a resume.** As a user, I paste or enter a job description and request a tailored resume draft using selected evidence.
   - Each generated statement links to one or more evidence items; unsupported claims are blocked or surfaced for resolution.
   - The draft includes requirement coverage, gaps/questions, change summary, version history, and an explicit user review before export.
6. **Manage relationships and pipeline.** As a user, I keep a small contact list, record notes/interactions, connect people to companies and opportunities, and move an opportunity through a configurable pipeline.
   - Contact and interaction data are workspace-owned, provenance-aware, and searchable; no private account discovery or messaging occurs.
7. **Use a useful dashboard.** As a user, I can answer what matters now, why it fits, the most valuable next action, who is relevant, and what needs attention today.
   - Dashboard recommendations link to their supporting score, goal, evidence, contact, research, or due-date records.
8. **Research with sources.** As a user, I save a URL and produce a short organization/opportunity brief from that source.
   - Each factual observation records the source URL and publication/retrieval dates when available, with direct evidence separated from inference.
   - If source retrieval fails or information is stale/uncertain, the UI says so and the brief remains editable.

### Not in the MVP critical path

Automated multi-board sourcing, broad web crawling, LinkedIn or restricted-site scraping, contact graph discovery, bulk outreach, autonomous applications, SMS, provider-driven calendar commitments, networking event attendee claims, offer equity forecasting, full interview simulation, and 30/60/90 workflow automation. Keep domain seams for these; do not build placeholder screens as substitutes for a functioning core loop.

## 3. Proposed MVP and prioritized backlog

### Free and Paid product design

Ship a useful **Free** plan and a **Paid** plan from the first build. Free should prove the career workflow and preserve user agency; Paid should unlock higher-cost assistance, richer research and greater working capacity. Do not make the basic profile, goals, core scoring, data ownership, or export dependent on payment. Paid features must be clearly explained before a user reaches a limit. Pricing is intentionally undecided; first measure actual model and source costs.

| Capability | Free | Paid (proposed) |
|---|---|---|
| Industry profiles | Choose any of Tech, Finance, Healthcare, Public Sector; shared familiar product experience | Same, with expanded role-specific prompts, saved variants and deeper industry briefs |
| Career profile, goals and evidence | One personal profile, goals, constraints, manual evidence and credentials | Same core capabilities; larger document/evidence allowance and multiple saved career scenarios |
| Opportunities and scoring | Manual entry, core deterministic score, dashboard and a modest active-opportunity limit | Higher active-opportunity limit, saved comparisons and richer configurable scoring scenarios |
| Network and pipeline | Small contact list, notes, linked opportunities and basic next actions | Higher contact capacity, relationship timeline summaries and reminder/follow-up planning |
| Research | Save source URLs and notes; basic cited brief workflow with manual completion | More AI-generated cited briefs, refreshes and role/company-specific synthesis |
| Resume and career materials | Evidence library, job description capture, requirement/evidence matching and manual tailoring | Capped monthly evidence-grounded resume drafts, role-specific pitch variants, change summaries and export-ready versions |
| Interview, offers, execution | Basic planning templates/manual notes as these modules arrive | AI-supported interview briefs/practice, offer comparisons and deeper 30/60/90 execution tools in later phases |
| Integrations and data | Free/public sources and manual capture; export/delete always available | Higher refresh/usage allowances; any licensed or paid data provider is added only when its marginal cost and terms are clear |

**Provisional launch guardrails, not final pricing:** Free starts with one workspace/profile, 10 active opportunities, 25 contacts, and a small monthly AI allowance (for example, 3 resume drafts and 3 generated research briefs). Paid raises limits substantially (for example, 100 active opportunities, 250 contacts, 30 resume drafts and 50 briefs per month) and unlocks the additional features above. Validate these numbers against observed use, provider costs, and a simple understandable price before launch. They are configurable entitlements, not constants embedded in UI or domain code. If a user reaches a limit, keep their records readable/exportable, explain the limit and reset date, and offer upgrade or archive actions; never delete data or trigger surprise overage charges.

Free users should still reach a meaningful result through manual workflows. AI limits are explicit and enforced before provider calls. Costs from paid third-party data must not silently be subsidized by an unspecified “unlimited” subscription; disclose any future add-on or plan change clearly.

### P0 — End-to-end workflow

1. App shell, authentication, create/select workspace, workspace focus settings, Free/Paid plan state and server-side entitlement checks.
2. Career profile, editable goals and hard constraints, evidence/credential/achievement library with provenance.
3. Company and opportunity CRUD, URL/source capture, deduplication warnings, application pipeline and next-action dates.
4. Deterministic scoring v1 with explainable normalized dimensions and configurable goal weights.
5. Resume/job-description tailoring draft backed by evidence references and user review; export only after factual checks.
6. Contact CRUD and relationship notes/timeline; explicit contact source and links to company/opportunity.
7. Source registry, saved sources and brief generation with citations or clearly marked manual notes.
8. Dashboard with ranked opportunities and actionable, linked recommendations.
9. Seeded realistic sample workspace plus loading, empty, error, retry and success states.
10. Migrations, authorization/RLS, core workflow and entitlement tests, telemetry, usage metering and data export/delete path.

### P1 — After validating the loop

One vetted free/public job source or ATS feed where access terms permit; scheduled refresh and stale detection; richer role requirements extraction; recurring reminders; import/export for contacts and evidence; human-confirmed resume PDF/DOCX export; lightweight email/calendar integration only after product demand and OAuth review needs are understood. Prefer a free source that serves one selected geography/industry well over a paid broad feed.

### P2 — Evidence of repeat use and outcome value

Additional licensed job data, provider-pluggable research collection, more advanced relationship paths from user-imported/authorized data, configurable multi-user workspace roles, opportunity outcome analytics and score calibration, offer comparison, interview preparation, and onboarding/career execution workflows.

### P3 — Only with explicit product validation

Fast Follow-up automation, external communications, advanced sourcing, events discovery, and specialized autonomous workflows. Every consequential write requires a fresh, scoped approval and provider confirmation.

## 4. Architecture recommendation

### Application stack

- **Web:** TypeScript, Next.js App Router, React, server components/actions for server-owned operations, responsive desktop-first UI. Use a small component system (Tailwind plus accessible primitives such as Radix/shadcn where appropriate) and schema validation (Zod). Avoid client-side trust for authorization or scoring.
- **Login (prepared, initially off):** define an `AuthProvider` and route guard now. Local development defaults to a synthetic development identity and seeded demo workspace with `AUTH_MODE=disabled`; it is never accepted in production. When enabled, use Supabase Auth email magic links/OTP first, with verified email, secure HTTP-only session cookies, CSRF protections, session revocation, and rate limits. After authentication resolve the user's memberships, open their last authorized workspace or show a chooser, and derive all queries and writes from that active server-validated workspace context. Add password/OAuth options only if user research requires them. Keep membership checks and RLS active in both modes; the development identity is server-created and cannot be selected through request parameters.
- **Data:** Supabase-hosted PostgreSQL is a sensible initial fit because the product needs relational data, auth, private file storage, and row-level controls in one managed platform. Use SQL migrations as source of truth and a typed query layer (Drizzle or generated Supabase types; choose one, not both). Keep important operations behind server-side service functions. Postgres and standard SQL keep exit options open.
- **Plans and entitlements:** represent plan, feature and quota access as server-checked entitlements, not scattered UI conditionals. Persist plan/subscription state, usage counters or ledger events, reset windows, and override reason. In development and early validation, plans can be seeded/admin-assigned without connecting payment processing; add a billing adapter after price, tax, refunds, and subscription operations are decided. No provider call occurs if the workspace has exhausted its allowance.
- **Isolation:** Every tenant-owned record carries `workspace_id`; verify membership in server code and enforce Postgres RLS. Never rely on an untrusted client-provided workspace ID. Use a privileged service key only in server runtime, never browser code. Add cross-tenant negative tests before real user data.
- **Files:** Private object-storage bucket for originals and generated documents; short-lived signed URLs; file metadata and provenance in Postgres; file type/size validation and malware scanning before processing. Keep original upload immutable and retain derived text separately with deletion linkage.
- **Jobs:** No separate queue service at day one. Define a `JobRunner` interface and use a small Postgres-backed jobs table/worker for retries, status and idempotency. Move to a managed queue only when throughput or delivery requirements justify it. Do not execute long LLM/network tasks in a user-facing request.
- **AI:** `ModelProvider` abstraction with typed request/response schemas, timeouts, retries, prompt/version IDs, token/cost/latency accounting, and deterministic fallback/error state. The LLM extracts or drafts; deterministic code enforces score math, access, evidence links, approval state and business rules. Keep provider selection and retention policy configurable; avoid sending an entire profile when a selected evidence subset suffices.
- **Search:** Start with Postgres full-text/trigram search across opportunities, organizations, contacts and evidence. Add vector search only after a measured retrieval gap. Use explicit filters and workspace scope before any ranking.
- **Observability:** Structured server logs with request/job IDs and workspace IDs that are pseudonymous in analytics; error tracking with PII scrubbing; job status/retry UI for admins; AI provider usage ledger. Never log resume or message bodies by default.
- **Environments:** Local, staging and production; separate database projects/keys; secrets via environment or managed secret storage; migrations run in CI/deploy process. Seed data must be synthetic.

### Trade-offs

Supabase reduces initial operations and gives the project managed Postgres/Auth/Storage, but RLS must be designed and tested carefully, and billing/features can change. Next.js and Supabase are not required to become tightly coupled: domain logic, provider adapters, and persistence contracts should live outside page components. A queue table is economical but has throughput/operational limits; preserve an adapter so a managed worker can replace it. Starting without embeddings/agents reduces cost and prompt-injection surface while the product’s value proposition is still being tested.

### Professional workspaces without four separate products

The authenticated account is the door; a professional workspace is the place the person works after sign-in. Keep account identity, workspace membership, and active workspace distinct. A user's active workspace determines data access and sets the professional context. The workspace switcher changes workspaces (and their scoped records), not merely industry color. Never infer workspace authorization from a client-supplied ID.

Keep navigation, core career records, interaction patterns, type scale, and accessibility shared. A data-driven `WorkspaceProfile` configures industry, profession/role archetype, specialization, credentials/jurisdiction, terminology, evidence prompts, opportunity fields, comparison dimensions, next-action templates, free/public source suggestions, and restrained visual tokens. Tailor dashboard emphasis and forms where the work differs, while preserving the same familiar shell and user-controlled scoring. Avoid separate codebases, radically different layouts, or hardcoded credential assumptions. Validate each profile with representative job seekers before deep specialization.

| Initial workspace profile | Useful starting role lanes | Workspace experience should foreground |
|---|---|---|
| Technology | Software developer, platform engineer | Shipped systems, stack, reliability, scope, architecture, collaboration |
| Finance | Financial analyst, risk/controls professional | Modeling, forecast/variance work, reporting, controls, products, credentials |
| Healthcare | Physician, nurse, physical therapist | Specialty, care setting, license and jurisdiction, populations served, outcomes, schedule; never collect patient-identifiable details |
| Public Sector | Digital services, policy, government IT | Mission/agency fit, public impact, procurement/security context, clearance and eligibility where applicable |

Start with one role lane per industry and a compact healthcare lane selector for physician, nurse, and physical therapist. Store role lanes as versioned configuration and typed profile attributes so new professions can be added without schema forks. Label credentials as user-provided, unverified, verified, or expired; selecting a clinical or regulated role never itself verifies licensure.

## 5. Canonical data model

Use UUID primary keys, UTC timestamps, `created_at` / `updated_at`, soft archival where a restore/history matters, and explicit hard deletion for privacy deletion. Tenant domain tables include `workspace_id`, creator/actor IDs as appropriate, and indexes beginning with `workspace_id`. Add `source_type`, `source_id`/URL, `provenance`, and evidence references where a claim or recommendation depends on evidence. Avoid polymorphic relationships without database-enforced foreign keys when a join table or typed source columns can do the job. In auth-disabled local mode, the demo identity still maps to a normal internal user record; never use a null/global owner convention that would weaken future RLS policies.

### Initial entities and relationships

- `users` maps authenticated identity to an app profile. `workspaces` hold owner, display name, industry ID, versioned profession/role-archetype ID, specialization, jurisdiction, locale, workspace-specific schema/configuration, and defaults. `workspace_memberships(workspace_id,user_id,role)` is the authorization edge; owner/admin/member roles are enough initially. Persist the last active workspace per user only as a navigation preference; authorize it again on every request.
- `career_profiles(workspace_id,user_id,summary,...)` is the user's profile container. `career_goals` belong to a profile and include scenario, horizon, priority, target values, criterion weights, and hard/preference flag. `goal_criteria` normalize individual weighted dimensions and constraints.
- `evidence_items` belong to a profile and record kind, claim text, normalized value, provenance class, source file/URL, exact source excerpt/page, verification state, confidence, valid dates, sensitivity, and review status. `achievements` reference evidence; `skills` are normalized workspace/profile skills; `evidence_skills` links evidence to skills with strength/recency. `credentials` reference evidence and include issuer/earned/expiry.
- `documents` record private storage object, original filename, checksum, MIME, size, retention/deletion state. `resume_versions` are generated or uploaded documents with parent version, target opportunity, status, and review summary. `resume_claims` link generated sections/statements to evidence IDs and include support status.
- `organizations` are normalized within a workspace; store external IDs only with provider/source. `organization_sources` associate multiple verified URLs/domains. `organization_observations` hold sourced facts or explicitly labeled hypotheses with publication and retrieval dates and confidence. `research_sources` store URL, publisher, title, published/retrieved times, content hash, terms/access classification and retention metadata. `research_briefs` have scope (organization/opportunity/role), status and generated version; `brief_observations` link observations/sources and mark evidence vs inference.
- `opportunities` belong to a workspace and optionally an organization; include normalized title, raw description, source URL/provider, location, arrangement, seniority, compensation range/currency, discovered/closing times, status and stale state. `opportunity_requirements` record requirement text, must-have/preferred, importance and source span. `opportunity_evaluations` record scorer version, eligibility, total, confidence, evaluated time, user override/reason. `score_components` have dimension, normalized score, weight, contribution, evidence/unknowns and rationale.
- `contacts` are workspace-owned records with name, current role, organization, contact details, source, relationship strength, last interaction and access/sensitivity controls. `affiliations` model a contact's former/current organization, community, school or role interval. `relationship_edges` connect two contacts or a contact/user representation with edge type, strength, provenance and dates; only user-provided/imported/authorized edges may state a relationship exists. `contact_opportunities` links contacts to target roles/companies and records why relevant.
- `interactions` are timeline records, created manually in MVP, with participants, date, type, note, linked opportunity/organization, and provenance. `introductions` model requested/offered/accepted/declined states and approvals. `communication_drafts` store recipient, channel, content, evidence/context references and draft/approved/sent/failed status; MVP only drafts. `approvals` bind actor, exact action/content hash, scope, expiry, and decision; no approval can authorize an altered draft.
- `applications` link user/profile to opportunity and keep lifecycle status and next action. `interviews` link application and event timing/format. `offers` contain separately typed guaranteed, variable and speculative compensation terms and assumptions; sensitive access by member. `negotiation_scenarios` reference offer terms and assumptions.
- `execution_plans`, `milestones`, and `tasks` link to an application/offer or post-hire plan; tasks store due date, status, dependencies and evidence of completion. Keep these later-phase tables out of initial migrations unless needed.
- `notifications` reference a task/opportunity/action and delivery state. `audit_events` append actor, action, target, timestamp, approval, and minimal before/after metadata. `ai_runs` record feature, provider/model, prompt/schema version, input references (IDs, not copied PII where possible), output artifact, status, tokens/cost/latency and error class.
- `plans` and `plan_entitlements` define named plan features and quotas with effective dates/version. `workspace_subscriptions` hold plan state, provider customer/subscription references when a billing provider is introduced, and lifecycle timestamps. `usage_events` append metered feature usage, unit count, workspace, time window, idempotency key and measured provider cost when available. Entitlements are evaluated server-side from these records; client UI only reflects the result.

### Data lifecycle and ownership

Workspace membership scopes all records; a user's career profile and personal evidence are not automatically visible to every workspace member. MVP can avoid shared workspaces, but schema and authorization policy should allow profile owner only by default and grant explicit sharing later. Define export as JSON/CSV plus original files and generated documents. Deletion removes object files and derived text/embeddings/research data tied to a user; audit rows retain only the minimum legally/operationally necessary identifiers and action metadata under a documented retention period. Configure retention for source snapshots; prefer URL+metadata and extracted observations over storing whole third-party pages. Never store external credentials unless an integration is deliberately added.

## 6. Module boundaries and data flow

1. **Identity & workspace:** resolves current user and authorized workspace; supplies tenant context to every service.
2. **Career evidence:** ingests manual entries/documents, tracks provenance and review, exposes selected evidence to downstream modules.
3. **Opportunity & organization:** normalizes manual records, extracts requirements into drafts, links records and detects duplicates/staleness.
4. **Goals & scoring:** applies hard filters, deterministic dimension functions and stored score snapshots. Does not invoke an LLM to decide eligibility or arithmetic.
5. **Research:** registers sources and retrieval metadata, extracts observations as candidate facts/inferences, requires citations, and builds briefs.
6. **Resume drafting:** receives a specific role plus user-selected evidence IDs; generates structured claims; validates every claim against the evidence set; creates draft/version only.
7. **Network & pipeline:** records contacts and interaction timeline; creates explicit relationship edges; proposes next actions without contacting anyone.
8. **Dashboard:** queries these domain services and assembles linked summaries; it is not an independent source of truth.
9. **Approval & audit:** later external providers receive an approved immutable action envelope. Provider success/failure is recorded; the UI only shows sent/scheduled after provider confirmation.

Flow: user entry/import → validated domain record + provenance → deterministic scoring and/or queued AI draft → reviewable artifact with evidence links and uncertainty → user edit/approval → audited action or saved decision → outcomes feed future evaluation and product metrics.

## 7. Opportunity scoring v1

### Order of operations

1. Apply hard constraints: geography/work eligibility, required work arrangement, explicit minimum compensation, role exclusion, and other user-set gates. If required data is absent, mark `unknown/review`, not ineligible. Excluded roles are not ranked as qualified recommendations.
2. For eligible/unknown roles, score dimensions from 0–100 with a written rubric. Calculate weighted average over applicable dimensions, then apply a visible evidence confidence factor for ranking presentation. Store both raw fit score and confidence separately; never imply statistical probability of getting an offer.
3. Show data coverage and missing inputs. No missing dimension receives an assumed zero; excluded dimensions are removed from the denominator and confidence drops. Set `insufficient_evidence` if coverage or confidence is below the minimum threshold.
4. Save scorer version and each dimension’s rubric inputs so the result can be recomputed and evaluated later. An override captures user reason and never rewrites the computed result.

### Initial dimensions and weights (editable defaults)

| Dimension | Default weight | Example evidence |
|---|---:|---|
| Role/capability alignment | 30% | Mapped requirements and reviewed profile evidence |
| Long-term goal alignment | 25% | User's goal criteria and horizon |
| Transferable learning/career capital | 15% | Explicit user-rated skills/experience goals; explain assumptions |
| Compensation/total rewards | 10% | Role range vs user target; distinguish absent from low |
| Organization outlook/role quality | 10% | Sourced recent facts, not generalized reputation |
| Access/path relevance | 5% | Verified warm path or user-entered contact context |
| Time/opportunity cost | 5% | User-estimated effort, deadline and pipeline load |

Weights sum to 100% by default and are configurable. Keep team/manager quality out of default scoring until there is user-provided or reliable role-specific evidence. Avoid double-counting salary as both hard threshold and a preference: hard minimum is an eligibility gate, compensation dimension only ranks qualified preferences.

### Rubric and worked example

For each dimension, derive a bounded score with a deterministic mapping. Example capability alignment: map each requirement to reviewed evidence; a user-configured essential requirement receives greater within-dimension importance; observed evidence coverage produces fit score. An LLM may propose requirement-to-evidence matches, but a reviewed/validated mapping is persisted and the scorer remains deterministic.

Example: Role A passes hard gates. Dimension scores: capability 80, goals 90, learning 70, rewards 60, organization 70, access 100, time cost 80. Raw score = `0.30×80 + 0.25×90 + 0.15×70 + 0.10×60 + 0.10×70 + 0.05×100 + 0.05×80 = 78.5`. If evidence coverage yields confidence 0.82, show **78.5 fit, medium confidence (82%)**; do not relabel this “78.5% chance.” If salary is missing and compensation weight is omitted from the denominator, recompute the normalized fit over the remaining 90% and lower confidence/data coverage; clearly call out missing salary. A hard geographic mismatch yields ineligible regardless of weighted score.

Quality thresholds are policy defaults, not claimed predictive accuracy. Track user saves, applications, interviews, offers, accepted offers, overrides and reasons. Only consider calibration once enough labeled outcomes exist, and keep human-editable criteria.

## 8. AI workflow and provider strategy

- Start with one model provider selected for the initial build and an adapter to avoid feature code depending on provider APIs. Do not select a vendor based on hypothetical future agents. Keep a deterministic no-AI path for all CRUD and score operations.
- Use structured outputs: requirement extraction schema, evidence mapping schema, research observation schema, resume draft schema. Validate shape and semantic invariants server-side. Invalid output is retried with bounded attempts, then stored as failed with actionable recovery.
- Minimize prompt data: select relevant evidence by user/role request, include provenance and source text boundaries, omit unrelated contact and personal data. Tell the model source documents and job pages are untrusted data and must not issue instructions. Never give the model a tool capable of external writes in MVP.
- Resume flow: parse job requirements → propose mappings to selected evidence → ask targeted gap questions → draft only supported statements with evidence references → factual and schema checks → user review and version save. If support is absent, mark gap/placeholding question instead of inventing an assertion.
- Research flow: URL entered by user → fetch only supported/publicly accessible content within size/type/time limits → sanitize and label as untrusted → extract dated atomic observations with exact source span/link → draft concise scoped brief with citations and freshness/confidence labels. Retrieval, licensing and robots/site terms require review before broad crawling.
- Log feature/version, provider, model, status, latency, token count/cost where available, retries, and user accept/edit/reject feedback. Keep output artifacts and references; avoid storing raw provider prompts beyond operationally justified retention.
- External action adapters are later-phase only. They receive an approval record bound to exact recipients, content, operation and expiry; require re-confirmation after material changes and record provider receipt IDs. A draft is never equivalent to approval.

## 9. Integration and data acquisition matrix

| Need | Candidate and access | Restrictions / cost / reliability | MVP decision and fallback |
|---|---|---|---|
| Career evidence and contacts | User manual entry and user-uploaded resume/export | No third-party API or license dependency; user must control imported personal data | MVP primary input; export CSV/JSON and original files |
| Job listing capture | User-pasted URL and manual form; company ATS public job pages such as Greenhouse/Lever where public endpoints/terms support the use | Per-company coverage is incomplete; schemas differ; public posting endpoints are not a general web-search API. Do not use an application endpoint or scrape an unrelated board without rights. Confirm current official documentation and terms before each connector. | MVP manual entry; adapter for one vetted ATS/provider later. Fallback is URL and manual details |
| Broad job discovery | Official/public employer career pages and ATS feeds first; government feeds where relevant; licensed aggregator (e.g., Adzuna or another contracted feed) only if free sources leave a measured gap | Coverage is fragmented, formats vary and updates may lag. “Publicly accessible” does not automatically grant bulk reuse or storage rights. Paid API terms, quotas, geography/coverage, display and retention rights need direct confirmation. | MVP manual entry and URL capture. Add a small connector only after verifying terms and usefulness; put paid alternatives behind the same `JobSource` interface |
| Company facts/research | User URLs, company career/news pages, official filings/press releases and credible specialist sources | Public reachability does not itself grant rights to republish or crawl. Site restrictions, freshness, paywalls and incompatible formats apply. Research source URLs, access mode and dates. | MVP user-supplied sources and short cited briefs; manual note fallback |
| Industry/role taxonomies | O*NET or official national/regional labor sources; specialist standards bodies | Geography and profession coverage vary; licenses/attribution/API requirements must be checked for target market. O*NET material is largely CC BY 4.0 with exceptions and attribution requirements. | Use a small editable role/skill vocabulary first; add an attributed, versioned taxonomy when target geography is selected |
| Authentication and Postgres | Supabase Auth/Postgres | Current published pricing lists Free and Pro beginning at $25/month plus compute/usage details; re-check before launch. Pro supplies production conveniences, but plan/security requirements may dictate more. Auth vendor coupling and RLS operational risk. | Recommended initial option; local dev can use Supabase CLI or a local Postgres equivalent; keep migrations portable |
| Document storage | Supabase Storage or compatible S3 API | Storage/egress charges, region, backup, deletion, malware scanning and document retention need design. Current Supabase page lists plan quotas/overage; verify costs at launch. | Private storage bucket, strict size/type checks and delete linkage; local emulator/dev storage fallback |
| LLM extraction/drafting | OpenAI, Anthropic or other provider with structured output capability | API usage is metered and changes; data handling, retention, region, model quality, rate limits and terms differ. No cost should be promised until model and workload are selected. | Provider interface, one selected model, low-volume opt-in; manual drafting fallback and per-run usage ledger |
| Email | Gmail/Google Workspace or Microsoft Graph, later | OAuth verification, narrow scope, provider quotas and sender rules. Gmail send scope is sensitive; broader message-reading scopes are restricted and can require verification/security assessment. | Exclude sending/reading email from MVP; save draft text for copy/paste |
| Calendar | Google Calendar or Microsoft Graph, later | User OAuth and carefully scoped read free/busy vs create-event privileges; domain policy and quota/review requirements apply. Calendar API usage may incur future standardized quota charges per current Google notice. | Exclude from MVP; propose times manually; later start with authorized free/busy only and user-confirmed invitation creation |
| SMS / messaging | Twilio or provider-specific channel, later | Paid numbers/messages, consent, carrier policies, regulatory requirements, delivery callbacks and opt-out behavior. | Explicitly out of MVP; no messaging provider requirement |
| Events and professional network | Event organizer APIs or user-provided links/imports, later | Attendee lists often private, restricted, missing or unverified; access terms and attendee consent matter. | Save event URL and user notes; never infer attendee presence |

### Free-first source candidates by starting industry

| Industry profile | Default free/public starting points | MVP use and limits |
|---|---|---|
| **Tech** | User-entered company career pages; public ATS feeds for a known employer where terms permit; O*NET role/task vocabulary where it fits | Do not promise a complete tech-job feed from ATS endpoints. Start with manual opportunity capture and one verified employer source. Public repositories/forums can suggest leads but should not be treated as reliable job inventory without a source check. |
| **Finance** | Employer career pages; SEC EDGAR company submissions and XBRL APIs for sourced public-company signals; official regulator/industry publications for research | EDGAR is free and does not require API keys for public submissions/company facts, but is company-disclosure data, not job postings or a hiring-intent detector. Treat implications as hypotheses and link to filings. |
| **Healthcare** | Provider/employer career pages; official public health datasets and regulator/employer announcements; O*NET where relevant | Public health and provider-quality datasets can enrich organization context, not indicate that a specific employer is hiring. Do not infer clinical qualifications or licensing equivalence from broad taxonomies. |
| **Public Sector** | Official federal, state, local and agency career pages; USAJOBS for federal openings | USAJOBS has a public search API but requires an API key request and terms acceptance; treat it as no-cost access conditional on approval, not anonymous or guaranteed access. Start with official links/manual capture while access is pending. |

Across all four profiles, label sources as user supplied, public official, licensed, or other; record source terms/access method, retrieval time and freshness. Prefer source links and extracted facts over copying whole pages. Candidate additions to the integration matrix are grounded in official references: [USAJOBS API authentication](https://developer.usajobs.gov/guides/authentication) and [terms](https://developer.usajobs.gov/apirequest/index), [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces), and [O*NET licensing](https://www.onetonline.org/help/license). Recheck access and terms before connector work.

Current reference checks: Supabase pricing [official page](https://supabase.com/pricing) and [billing docs](https://supabase.com/docs/guides/platform/billing-on-supabase); Lever's published postings API [documentation](https://github.com/lever/postings-api) states it supports listings for an individual company and does not provide full-text search across jobs, so it is not a broad sourcing engine; Google Calendar [free/busy API](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query) supports availability queries, and Google's [Gmail scope guide](https://developers.google.com/workspace/gmail/api/auth/scopes) distinguishes sensitive send from restricted broad access. Recheck terms, prices and verification requirements before implementation because they can change.

## 10. Security, privacy and approvals

- Treat all uploads, job descriptions, websites, model output, URLs, and imported contact rows as untrusted input. Strip active content, constrain fetches against SSRF, block private IPs/metadata addresses and redirects into them, cap bytes/time, validate MIME by content, and prevent prompt-injection instructions from reaching privileged tools.
- Tenant isolation: authorization middleware derives workspace membership from authenticated session; server services require tenant context; RLS policies check membership and profile ownership; storage paths are tenant-prefixed and policy checked. Add tests proving users cannot read/write another workspace's records through direct API, guessed IDs, storage URLs or joins.
- Minimize personal/sensitive fields. Encrypt in transit/at rest through platform defaults; assess whether extra encryption is needed for especially sensitive notes. Redact PII from logs and analytics. Restrict AI context to selected evidence. Disclose provider processing and obtain consent before sending documents to a model.
- Data rights: user can inspect provenance, correct/delete facts, export career data and uploaded originals, disconnect integrations, and delete account/workspace. Deletion propagates to derived text, vectors, generated files and cached jobs; define backup expiry behavior in product policy.
- No autonomous message, application, invite, booking or submission. For future actions, approval shows recipient/target, exact content/terms, provider, scope and consequences; approval expires and is invalidated by edit. Require explicit confirmation for each consequential operation. Store user, timestamp, artifact hash and provider result. Ambiguous replies never authorize a send.
- Distinguish “drafted,” “approved,” “submitted,” “sent,” and “confirmed” states. UI only claims external completion when provider returns a successful receipt; failures/retries are visible and idempotent.

## 11. Testing, acceptance metrics and observability

### Test plan (to implement with product phases; not run as part of this planning task)

- Unit: hard constraints, normalization, weight validation/sum, missing-data behavior, deterministic scoring and versioned worked examples.
- Unit/property tests: evidence mapping validation, provenance propagation, resume claim support and no unsupported claim entering approved export.
- Integration: migrations on clean and upgrade databases; workspace RLS/member roles; storage authorization/deletion; opportunity/contact dedupe; job retries/idempotency; source fetch bounds.
- Adversarial: prompt-injection text in resumes/job pages; malicious filenames and HTML/PDF; SSRF/redirect/private IP; cross-tenant ID substitution; untrusted model output schema escape.
- Workflow: setup → evidence/goals → opportunity → evaluation → resume draft/review → contact/timeline → dashboard next action; provider outage; user export/delete; external-action approval state machine when integrations arrive.
- UI: empty/loading/error/retry/success, keyboard access, responsive mobile approval and accessible form errors.

### Product success metrics

- Activation: percent of new users with at least one reviewed evidence item, one goal and one evaluated opportunity.
- Core value: time from setup to first useful, evidence-backed opportunity/action; user-rated usefulness and explanation clarity; share of recommendations accepted/overridden with reason.
- Execution: opportunity actions completed on time; quality of resume claim coverage and edits; response/interview/offer progression from tracked opportunities.
- Retention/outcomes: weekly return for meaningful career actions, interviews/offers/accepted transitions, and user-reported goal alignment. Do not optimize raw jobs imported, messages drafted, or contacts stored.
- Quality guardrails: unsupported resume claim rate (target zero at approved export), citation coverage, stale-source rate, false duplicate rate, cross-workspace access failures (target zero), AI failure/retry/cost/latency, and user deletion completion.

## 12. Phased roadmap and definition of done

Estimates are relative and assume one small product/engineering team; confirm after implementation environment and design choices. Each phase is independently reviewable. “Tests” lists planned automated checks, not tests performed here.

### Phase 0 — Product and technical foundation

- **Objective:** runnable skeleton with secure workspace context.
- **Deliverables/subsystems:** Next.js/TypeScript shell, design tokens/navigation, Supabase/local DB configuration, migrations, `AuthProvider` abstraction, local-only auth-disabled demo mode, ready-to-enable Supabase email OTP/magic-link portal, production fail-closed guard, workspace setup, membership/RLS, Free/Paid entitlement resolver, usage meter and plan-aware empty/limit states, CI formatting/type/lint/build, synthetic seed workspace, basic logging. Seed both plans without payment processing.
- **Dependencies:** approve first build slice and choose initial niche example, hosting/provider account access.
- **Tests:** auth-disabled local access and production rejection, enabled sign-in/session expiry/revocation, auth/workspace journey, direct cross-workspace RLS negatives in both modes, plan/feature/usage limit enforcement, reset-window handling, migration up/down or clean deploy, keyboard/mobile shell.
- **Risks:** service configuration and RLS can consume more time than screens; constrain roles to owner/member.
- **Done when:** local developer can open the synthetic demo without signing in; deployment rejects auth-disabled mode outside approved local/demo contexts; enabling Supabase Auth exposes secure email sign-in and scopes the user to authorized workspace data; seeded demo works without production credentials.

### Phase 1 — Career evidence and goals

- **Objective:** create a trustworthy profile for matching.
- **Deliverables/subsystems:** profile/goals UI, criteria weights/constraints, evidence/skills/credentials/achievement records, manual entry, private upload and provenance/verification workflow.
- **Dependencies:** Phase 0 schema/auth/storage.
- **Tests:** CRUD/access ownership, upload limits, provenance retention, export/delete behavior, goal validation.
- **Risks:** overbuilding resume ingestion before evidence UX is validated; begin with structured manual entry and plain-text resume import, then improve.
- **Done when:** user can add/edit/review sourced facts and goals and understands which claims are verified or user-provided.

### Phase 2 — Opportunities, scoring and pipeline

- **Objective:** demonstrate the opportunity decision loop without external feeds.
- **Deliverables/subsystems:** company/opportunity forms, job URL capture, requirement draft/edit, duplicate warnings, pipeline statuses, next-action tasks, scoring service and explanation UI, dashboard opportunity cards.
- **Dependencies:** Phase 1 goals/evidence; scoring rubric.
- **Tests:** deterministic golden scoring examples, hard gates, missing data/confidence, dedupe, linked dashboard state, workspace access.
- **Risks:** false precision; display rubric, fit and confidence separately, let user override.
- **Done when:** manually entered opportunity yields repeatable breakdown, evidence links, missing inputs and actionable next step.

### Phase 3 — Evidence-backed resume tailoring

- **Objective:** convert one opportunity into a factual reviewable application artifact.
- **Deliverables/subsystems:** provider adapter, structured requirements/evidence mapping, gap questions, draft versions, claim-to-evidence links, review diff and export.
- **Dependencies:** reliable evidence/requirements records; selected model/provider and privacy decision.
- **Tests:** schema/retry/failure, unsupported claim rejection, evidence selection scope, prompt injection, human review gates.
- **Risks:** hallucinated facts, provider outage/cost, document layout; prefer structured content and truthful quality over polished but unsupported formatting.
- **Done when:** user can produce an editable draft with traceable claims and explicit gap report, then export only after review.

### Phase 4 — Contacts, sourced briefs and integrated dashboard

- **Objective:** connect opportunities to relationships and evidence-grounded context.
- **Deliverables/subsystems:** Rolodex/timeline, organization source registry, manually supplied source retrieval/briefs with citations, recommendation/next-action dashboard, reminders.
- **Dependencies:** organization/opportunity and privacy/retention rules.
- **Tests:** dedupe, interaction linking, citation references, source freshness, unsafe URL bounds, dashboard recommendation provenance.
- **Risks:** incomplete or restricted source content; gracefully support notes and partial briefs.
- **Done when:** each priority action can be followed to the goal, source/evidence, company/contact and opportunity that justify it.

### Phase 5 — Narrow source integration and product validation

- **Objective:** reduce manual entry only after core workflow shows repeat value.
- **Deliverables/subsystems:** choose one lawful and reliable feed for selected niche/region; importer, normalization, freshness/deduplication; analytics for user value and outcomes.
- **Dependencies:** chosen target niche/geography, provider access, terms and costs.
- **Tests:** connector contract fixtures, rate limits, retries, stale/closed records, opt-out/provider outage.
- **Risks:** source terms, coverage and ongoing normalization burden.
- **Done when:** verified source adds useful opportunities with visible source/freshness, correct deduplication and no loss of user-entered data.

### Later phases — Interview, offer and career execution

- Add interview briefs/story bank after evidence and research quality; add offer comparison after compensation data/assumptions are explicit; add 30/60/90 execution after the user has an accepted role. Each phase needs its own requirements and approval review. Communications/calendar require a separate integration and consent milestone before any external write is enabled.

## 13. Recommended initial structure and interfaces

```text
src/
  app/                         # routes/layouts; thin UI composition
  components/                  # accessible reusable components
  features/
    workspace/ career/ evidence/ opportunities/ organizations/
    scoring/ resumes/ network/ research/ dashboard/
  domain/
    identity/ goals/ evidence/ opportunity/ organization/ contact/
    scoring/ research/ approval/
  server/
    auth/ db/ storage/ jobs/ observability/
    providers/llm/ sources/      # adapters, no provider code in domain
  schemas/                     # shared validated inputs/outputs
  styles/
db/
  migrations/
  seed/
tests/
  unit/ integration/ e2e/ fixtures/
docs/
  architecture/ product/
```

Suggested interfaces:

```ts
interface WorkspaceContext { workspaceId: string; userId: string; role: "owner" | "member" }
interface OpportunityRepository { get(ctx: WorkspaceContext, id: string): Promise<Opportunity | null> }
interface Scorer { evaluate(input: EvaluationInput): EvaluationResult } // pure, versioned, deterministic
interface ModelProvider { generate<T>(request: StructuredRequest<T>): Promise<ProviderResult<T>> }
interface SourceAdapter { fetch(url: URL, policy: FetchPolicy): Promise<RetrievedSource> }
interface JobRunner { enqueue(ctx: WorkspaceContext, job: JobInput): Promise<JobId> }
interface ApprovalService { approve(ctx: WorkspaceContext, actionId: string, contentHash: string): Promise<Approval> }
```

Every repository/service operation receives workspace context; API handlers derive that context from session membership and never accept authorization from a request body. Domain objects should not depend on React, Supabase clients, or an LLM SDK.

## 14. Unresolved decisions that need user input

The first build can proceed with reasonable defaults, but these choices affect demo data, evaluation and provider policy:

1. **Initial geography:** should the demo and first free-source connector target the United States? The source examples currently lean on US public datasets; the domain model and workspace settings should stay region-configurable.
2. **First validation slice across four industries:** should seed data include one representative persona/opportunity in each of Tech, Finance, Healthcare and Public Sector, while the first connector targets only one industry? Recommendation: yes, keep the product feel selectable across all four, but avoid building four separate source integrations before validating one.
3. **AI data policy/provider:** may resumes and career evidence be sent to a selected hosted LLM provider for draft generation? This requires provider/retention terms review and explicit product disclosure. Recommendation: opt-in per feature, send only selected evidence, and make manual workflow viable.
4. **Paid-plan price and billing provider:** no price, billing provider or tax/refund policy has been selected. Recommendation: ship plan entitlements and usage limits first; choose a billing provider and price after measuring AI cost and willingness to pay.
5. **Operating budget and hosting preference:** Supabase Pro is a plausible production starting point, but hosting, LLM and source-provider monthly ceilings are not specified. Recommendation: keep the baseline free where practical, avoid paid sourcing feeds until core value is measured, and set a hard model usage budget before live usage.

## Immediate buildable vertical slice

After the plan is accepted, build **workspace setup with four industry profiles → one profile with goals/evidence → manual opportunity entry → deterministic score explanation → dashboard next action**. Seed realistic examples across the four profiles, but keep the source adapter work out of this first slice. This proves the core loop without a paid integration or LLM. Add evidence-backed resume drafting next, after the user and provider data policy are chosen. The repository is currently untouched apart from this planning document.
