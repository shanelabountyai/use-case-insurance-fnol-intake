# Setup — Insurance FNOL intake & extraction

This project is self-contained. Every resource below belongs to **this build
only** — nothing is shared with the Use Case Studio that scoped it or with the
sibling builds. The repo can be moved anywhere on disk, or handed to someone
else, without breaking a reference.

Sensitivity is **regulated**; oversight is **required**. See "Project boundaries"
in [CLAUDE.md](CLAUDE.md) for why separation is load-bearing rather than tidy.

---

## 1. Source control — done

`shanelabountyai/insurance-fnol-intake`, private. Its own history, issues and
access list.

```bash
git remote -v          # origin → shanelabountyai/insurance-fnol-intake
```

## 2. Database

**Do this per project, and here it is a compliance matter rather than a
preference.** Create a Neon project named `insurance-fnol-intake` for dev and
production. State-level retention rules govern this data; they are enforceable
only if the data sits in one database with one access list. Putting it beside
the PII or internal builds drags those into the same retention and audit
obligations and widens the blast radius of any incident.

```bash
# Local Postgres for tests — never a cloud database, and never real claims.
brew install postgresql@17 && brew services start postgresql@17
createdb fnol_intake_test

# .env.test overrides ONLY the database; everything else comes from .env.local
printf 'DATABASE_URL=postgresql://%s@localhost:5432/fnol_intake_test\nDIRECT_URL=postgresql://%s@localhost:5432/fnol_intake_test\n' \
  "$(whoami)" "$(whoami)" > .env.test
```

Point the test scripts at both files, **first file wins**:

```jsonc
"test":     "dotenv -e .env.test -e .env.local -- vitest run",
"test:e2e": "dotenv -e .env.test -e .env.local -- playwright test",
"dev:test": "dotenv -e .env.test -e .env.local -- npm run dev"
```

Why local: a remote test database turns a 0.75s integration test into ~113s,
and makes infrastructure strain look exactly like flaky tests. It also keeps
real FNOL submissions out of the test path entirely — fixtures are synthetic.

Two traps worth knowing before you hit them:

- **Playwright's `webServer` needs the same env**, or the app under test talks
  to the cloud while the specs talk to localhost.
- **Migrations no longer reach the cloud dev branch as a side effect** of
  running tests. Keep a `db:migrate:all`, or dev drifts silently.

## 3. Environment

```bash
cp .env.example .env.local     # fill in; never commit
```

`.gitignore` already covers `.env` and `.env*.local`. Before any new file's
first push, confirm nothing secret is tracked:

```bash
git ls-files | grep -iE "\.env|secret|credential|\.pem$|\.key$"   # expect no output
```

## 4. Deploy and CI

Its own Vercel project and its own workflow — not a directory inside another
project's deployment. Retention and audit obligations follow the deployment, so
this one cannot ride along on a shared environment.

## 5. Model provider

Its own key, so rotating or revoking one build's credential never touches
another's. Confirm what onward data handling the provider performs before
regulated claims content is processed through it.

---

## Not yet decided

The application stack is an **open question**, deliberately. The plan names
capabilities, not products, and per this project's working rules that makes it
an open question rather than an assumption to fill in. Decide it when the first
build phase needs somewhere to run, and record the decision here.
