# Insurance FNOL intake extraction

Build project scoped by the AI Use-Case Studio. The decision is made and
independently audited — this repo executes it. Do not re-scope or re-score
the case here; if the premise looks wrong, say so rather than quietly
redesigning around it.

## The case

- **Verdict:** BUILD — composite 70/100 (Quick win)
- **Problem:** First-notice-of-loss claims arrive by phone, email, and PDF form. Intake staff rekey them into the claims system, and the resulting typos surface days later as mis-triaged claims.
- **Users:** Claims intake coordinators; adjusters inherit whatever the intake produced.
- **Acceptance bar:** ≥97% field accuracy on a 400-claim labeled set, with every sub-threshold field routed to review; policy numbers validated against the policy master before acceptance.
- **Data:** 18 months of FNOL submissions with their keyed-in system records as ground truth. — mixed, large, sensitivity **regulated**, realtime
- **Constraints:** latency interactive · oversight **required** · Regulated insurance data with state-level retention rules; every automated extraction must be auditable back to its source document.

## The plan

**Architecture:** Orchestrated multi-step workflow (deterministic pipeline with LLM steps where judgment is needed) (task shape: process)

FNOL intake extraction is a Quick win (composite 70) and is cleared to build as an orchestrated multi-step workflow: deterministic ingestion, normalisation and validation steps, with LLM calls confined to the interpretive extraction of policy number, loss date, loss type and estimated severity from mixed-channel inputs (phone transcripts, email bodies, PDF forms). Every field carries a confidence score; anything below threshold — plus any policy number that fails validation against the policy master — is routed to a claims-intake review queue. The review queue is a launch condition, not a phase-two nicety, because oversight is stated as required and the data is regulated. The spine of the programme is the acceptance bar: ≥97% field accuracy on a 400-claim labeled set with sub-threshold routing and policy-master validation. Every milestone below ladders toward that bar, and the bar is re-measured on live traffic before any rollout widening. The largest cost line is integration with the claims system and the policy master, not model work, so the plan front-loads connectivity and audit-trail proof rather than model experimentation.

### Milestones

- **Phase 0 — Bar lock, access and label adjudication** — Lock the acceptance bar with the business owner, secure read-only policy-master access and a claims-system write path in a non-production environment, and adjudicate the historical keyed records to establish trustworthy labels.  
  _Exit:_ Signed acceptance bar restating ≥97% field accuracy with sub-threshold routing and policy-master validation; access provisioned and a test lookup plus a test write-back demonstrated; measured disagreement rate between keyed records and source documents documented, with a corrected labeling protocol agreed.
- **Phase 1 — Golden set and audit record** — Build the stratified 400-claim labeled set with per-field labels and source spans, and specify plus implement the extraction audit record schema.  
  _Exit:_ 400-claim golden set complete, stratified across channel, form version, line of business and named hard-case categories, with independent per-field labels and source spans; audit record schema reviewed and accepted by compliance as satisfying source-document traceability.
- **Phase 2 — Thin end-to-end pipeline** — Stand up the thinnest complete workflow — intake, normalisation, redaction, schema-bound LLM extraction, deterministic validation, confidence gate, audit record — scored end to end rather than optimised in parts.  
  _Exit:_ Every golden-set claim runs end to end producing a schema-valid extraction, a policy-master validation result, a routing decision and a complete audit record; first per-field accuracy baseline published against the bar with failures categorised.
- **Phase 3 — Accuracy, calibration and red-team** — Close the gap to the bar, calibrate per-field confidence thresholds so that above-threshold fields are genuinely reliable, and harden against injection via source documents.  
  _Exit:_ Golden set meets ≥97% per-field accuracy; documented threshold calibration showing above- versus below-threshold accuracy and the residual silent-error rate; red-team findings on sensitive-record extraction attempts closed or accepted in writing, with cases added to the golden set.
- **Phase 4 — Shadow mode** — Run the pipeline on live intake while coordinators continue rekeying, comparing outputs without affecting any claim.  
  _Exit:_ Live-traffic per-field accuracy versus coordinator-keyed values meets the bar on a sampled audit; routing volume shown to be within coordinator capacity; review queue UI validated with coordinators; rollback trigger, its metric, threshold and named owner recorded before any write path is enabled.
- **Phase 5 — Limited release behind mandatory review** — Enable write-back for a defined intake subset, with every claim passing through the review queue and full audit records in production.  
  _Exit:_ Bar holds on live traffic for the subset across consecutive review periods; reviewer agreement and override-reason distribution reported; zero unresolved cases of a policy-number mismatch reaching the claims system; audit trail exercised successfully in a compliance walkthrough on real claims.
- **Phase 6 — Widen scope and steady-state operation** — Extend to remaining channels and lines of business, and establish the standing evaluation, triage and threshold-review cadence.  
  _Exit:_ Each newly added channel or line of business independently meets the bar on its own golden-set slice before enablement; weekly golden-set reporting, failure triage and threshold-change review operating with named owners; any proposal to reduce review coverage documented and decided by the business owner on measured silent-error evidence.

## What the audit demanded

Independent critic verdict: **SHIP WITH FIXES**.

Fix these before or during build:
- Fix the evaluation-set integrity: freeze a hold-out partition for bar measurement, keep tuned/red-team/production-failure cases in a separate development partition, and state the size and agreement gate for the Phase 0 label adjudication.
-  Add the missing interactive-latency and dependency-failure design: a per-claim latency budget, policy-master lookup timeout behaviour, and an exit criterion that measures it in Phase 2/4 — instead of the blanket "no latency ... figures are asserted anywhere in this plan".
- Correct attribution and softened absolutes: stop citing "The evaluation flags" (flags are empty — cite the budget field), restate "zero unresolved cases of a policy-number mismatch" as a measured audit result with a sampling method, and downgrade the prompt-injection containment claim to parameter-constrained lookup plus a net-value (handling-time vs. 7-minute baseline) metric in Phases 4–5.

### Known gaps

- **Interactive latency budget is entirely absent** — Grounding sets latency "interactive" and freshness "realtime", and the pipeline stacks OCR, redaction, an LLM call with bounded retry, a live policy-master lookup, and retrieval over a vector index. No phase defines a per-claim latency target or measures it; "the policy master lookup must be live rather than against a stale mirror" adds a synchronous dependency with no timeout/degradation behaviour specified. Add a latency budget and a defined behaviour when the policy-master lookup times out (route to review vs. block intake).
- **No held-out set separate from the tuning set** — Thresholds are tuned in Phase 3 on the same 400-claim golden set that defines the acceptance bar, and production/red-team failures are continuously injected into it. Without a frozen hold-out slice, "golden set meets ≥97%" can be an artefact of calibration on the same data. Define a locked evaluation partition and a separate development partition before Phase 3.
- **Net value is never measured, so the review queue can erase the benefit** — Current cost is "≈7 minutes of rekeying per claim at 400 claims a week", yet every claim passes through a coordinator review queue in shadow and limited release. No milestone measures handling time per claim versus the 7-minute baseline, so the programme could hit the 97% bar and still deliver no time saving. Add a handling-time / over-routing cost metric to Phase 4 and 5 exit criteria.
- **Label adjudication scope is undefined** — Phase 0 promises to "adjudicate the historical keyed records", but there is no stated sample size, adjudicator count, inter-annotator agreement target, or decision rule for what happens if the disagreement rate is high enough that the 400-claim set cannot be trusted. Without a numeric gate, this exit criterion can be signed off with a token sample.

## Working rules

- Every acceptance criterion traces to a milestone exit criterion or the acceptance bar above. Don't invent new bars, don't loosen existing ones.
- Mark every estimate as an estimate. No invented benchmarks, vendor requirements, or ROI figures — a second model audited this plan for exactly that.
- If something isn't in this file or `docs/`, it's an open question, not an assumption to fill in.
- Oversight is **required** and sensitivity is **regulated** — check any design change against both before proposing it.

## Layout

- `docs/prd-pack.md` — session starter + one PRD prompt per milestone. Start here.
- `docs/build-kickoff-package.md` — the full deliverable: rationale, workflow diagrams, evaluation, governance.
- `docs/prd/` — PRDs as they get written, one per milestone.

## Provenance

- Plan model: `claude-opus-5` · prompt roster `bk-2-claude` · plan v2
- Generated from case `97ed34f4-f57d-4dca-9bf9-e5a2d466eebf`, job `e5ffcc4a-e8df-4277-af90-e251009fae06`

> Decision-support, not a guarantee. Every figure in the plan is an estimate unless traced to a source.