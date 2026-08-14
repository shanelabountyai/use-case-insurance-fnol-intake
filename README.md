# Insurance FNOL intake extraction

BUILD · 70/100 · audit: SHIP WITH FIXES

## Start here

1. Open this folder in Claude Code.
2. Paste **Step 0** from [docs/prd-pack.md](docs/prd-pack.md) to load the shared context.
3. Work through the 7 milestone prompts, saving each PRD to `docs/prd/`.

`CLAUDE.md` carries the case, plan, audit findings, and the rules for this project — it loads automatically.

## What this is

FNOL intake extraction is a Quick win (composite 70) and is cleared to build as an orchestrated multi-step workflow: deterministic ingestion, normalisation and validation steps, with LLM calls confined to the interpretive extraction of policy number, loss date, loss type and estimated severity from mixed-channel inputs (phone transcripts, email bodies, PDF forms). Every field carries a confidence score; anything below threshold — plus any policy number that fails validation against the policy master — is routed to a claims-intake review queue. The review queue is a launch condition, not a phase-two nicety, because oversight is stated as required and the data is regulated. The spine of the programme is the acceptance bar: ≥97% field accuracy on a 400-claim labeled set with sub-threshold routing and policy-master validation. Every milestone below ladders toward that bar, and the bar is re-measured on live traffic before any rollout widening. The largest cost line is integration with the claims system and the policy master, not model work, so the plan front-loads connectivity and audit-trail proof rather than model experimentation.