# Brittle reporter examples

Runnable example projects for every [Brittle](https://brittle.dev) reporter. Each folder is a self-contained, fork-and-go starter — pick the one that matches your test runner and `cd` into it.

> **Brittle** is open-source test observability for Playwright, WebdriverIO, Jest, and Vitest. Failure triage with AI-grouped errors, strong-flake detection, per-env rollups, video + trace on every session.

## Layout

```
.
├── docker-compose.yml      ← Brittle Hub + Postgres + MinIO in one command
├── playwright/             ← Real Playwright suite against Wikipedia (3 browsers, visual regression, CI workflow)
├── wdio/                   ← WebdriverIO + Mocha, headless Chrome
├── jest/                   ← Jest unit-test example
└── vitest/                 ← Vitest unit-test example
```

Every subdirectory has its own `README.md`, `package.json`, config file, `.env.example`, and tests. Treat each as a standalone project.

---

## Step 1 — start the Brittle stack locally

The repo root ships a `docker-compose.yml` that brings up everything you need:

| Service | Port | Purpose |
|---|---|---|
| `caddy` | http://localhost:3100 | Reverse proxy — single entry point |
| `brittle` | (internal) | Hub API + Dashboard UI (one container) |
| `postgres` | (internal) | Backing database |

Artifacts (videos, traces, screenshots) land on a docker volume — the hub streams them through itself for upload + download. Survives `docker compose down`, dies with `docker compose down -v`.

```bash
docker compose up -d
```

Wait ~15 seconds for the Hub to apply migrations on first start. Then open http://localhost:3100 in a browser.

**First-run wizard.** The first time you open the dashboard, a setup screen prompts you to create:

1. The **initial admin account** (email + password — your choice; pick anything for local testing)
2. Your first **Organization** (e.g. `My Org`)
3. Your first **Project** (e.g. `My App`)

This only runs once. Subsequent visits go straight to the login screen.

To tear down (data volumes preserved):

```bash
docker compose down
```

To nuke everything (drops DB + artifacts):

```bash
docker compose down -v
```

> **Want the public-hosted hub instead?** Skip this section and set `BRITTLE_URL=https://app.brittle.dev` in the example's `.env`. Same flow from Step 2 onward.

---

## Step 2 — create an API token

Reporters authenticate to the Hub with a token scoped to a single Brittle project. You only have to do this once per project.

1. Open http://localhost:3100 and finish the first-run wizard if you haven't (admin account → org → project).
2. From the project home, navigate to **Settings → Tokens** (or **Project Settings → Tokens** in some UI variants).
3. Click **New token**:
   - **Name**: something memorable like `local-dev` or `ci`
   - **Type**:
     - **Service** — long-lived, survives user offboarding. Use for CI.
     - **Personal** — bound to your user account, auto-revoked when you leave the project. Use for laptops.

     For local example runs, either works. Pick `personal`.
   - Click **Create**.
4. **Copy the token immediately** — it's shown once. Format looks like `brt_svc_xxxxxxxxxxxxxxxx` (service) or `brt_pat_xxxxxxxxxxxxxxxx` (personal).

You'll paste this token into the example's `.env` file in the next step.

> **A leaked token's blast radius is one project.** If a token shows up in a public log or commit, revoke it from the same Tokens page and mint a fresh one. The Hub stores tokens hashed (argon2), so even an admin can't recover the original — revoke and re-mint is the only path.

---

## Step 3 — pick an example and run it

Each example folder has identical bootstrap steps:

1. `cd <reporter>/`
2. `cp .env.example .env`
3. Edit `.env` — set `BRITTLE_URL=http://localhost:3100` (or `https://app.brittle.dev`) and paste the token into `BRITTLE_TOKEN`.
4. `pnpm install` (or `npm install` — both work)
5. `pnpm test`
6. Watch the run land on the dashboard at http://localhost:3100

The per-folder README has runner-specific notes (browser installs for Playwright/WDIO, jest-specific config notes, etc.).

| Reporter | Folder | What it demonstrates |
|---|---|---|
| Playwright | [`playwright/`](./playwright/) | Real cross-browser suite against Wikipedia. 3 browsers, visual regression, CI workflow, ~20 tests. The forking template most teams want. |
| WebdriverIO | [`wdio/`](./wdio/) | WDIO 9 + Mocha + Chrome headless. BiDi command log, optional failure screenshots. |
| Jest | [`jest/`](./jest/) | Vanilla Jest unit-test suite. Demonstrates the runner-agnostic flow (no browser involvement). |
| Vitest | [`vitest/`](./vitest/) | Vitest unit-test suite. Same shape as the Jest example but on Vitest's faster runner. |

---

## What lands on the dashboard

Once a run finishes, the dashboard shows:

- **Run** with branch, commit, duration, pass/fail counts
- **Session** per test — with video, screenshot, command log (for browser runners), and full error context
- **AI-grouped failures** — same root cause across browsers/files becomes one triage row (enable in **Org → Settings → AI** with your own OpenAI / Anthropic / Gemini API key)
- **Test history** — per-test pass/fail heatmap going back 30 days
- **Flaky detection** — tests that produced both pass and fail on the same commit, automatically flagged

### Enabling AI failure analysis

The dashboard ships with AI disabled by default — you bring your own provider key. To turn it on:

1. **Org → Settings → AI** → choose provider (OpenAI / Anthropic / Gemini / Ollama)
2. Paste your provider API key + pick a model (e.g. `gpt-4o-mini`, `claude-3-5-sonnet`, `gemini-2.5-flash`)
3. Save. Future runs with failures get auto-analysed.

Your provider API key is stored AES-256-GCM encrypted in the Brittle DB; the master key for that envelope is `BRITTLE_AI_SECRET_KEY` in `docker-compose.yml`. For local demos the bundled random key is fine — generate a fresh one with `openssl rand -hex 32` before exposing the hub to anyone else.

---

## Forking this for your own project

The cleanest path:

1. **Just copy the folder you need** — e.g., `cp -r playwright/ ~/your-suite/`. Each folder is self-contained.
2. Update the `name` in `package.json`, drop tests in, and you're set.
3. The `.env.example` shows every option; `BRITTLE_URL` + `BRITTLE_TOKEN` are the only required ones.

For CI integration patterns, the [`playwright/`](./playwright/) folder has the most complete reference — including a GitHub Actions workflow at `.github/workflows/nightly.yml`.

---

## Production with S3 (R2, AWS S3, MinIO, SeaweedFS)

The bundled docker-compose uses **filesystem storage** for artifacts — the hub writes videos/traces/screenshots to a docker volume mounted at `/var/lib/brittle/artifacts`. That's the right default for one-machine deploys: zero extra services, survives restarts, easy to back up with `docker run --rm -v reporter-examples_brittle-artifacts:/data -v $PWD:/backup alpine tar czf /backup/artifacts.tgz /data`.

You'll want to switch to an S3-compatible object store when:

- You're running **multiple Brittle Hub replicas** behind a load balancer (filesystem doesn't share across pods).
- You want a **CDN in front of artifact downloads** for global teams (presigned URLs let the browser fetch directly from the bucket).
- The artifact volume is growing faster than you want to back up locally.

To switch, edit `hub.config.yaml`:

```yaml
artifacts:
  store: s3://your-bucket-name
  s3:
    region: us-east-1
    endpoint: https://s3.us-east-1.amazonaws.com  # or R2 / MinIO endpoint
    accessKeyId: ${S3_ACCESS_KEY_ID}
    secretAccessKey: ${S3_SECRET_ACCESS_KEY}
    forcePathStyle: false                         # true for MinIO/SeaweedFS, false for AWS S3/R2
```

…and add the matching env vars in `docker-compose.yml`. Cloud-hosted buckets (AWS S3, Cloudflare R2) work transparently with the hub's presigned-URL flow because they're already publicly addressable. For self-hosted S3 (MinIO / SeaweedFS) fronted by the same proxy as the hub, there's a sigv4-through-reverse-proxy gotcha that needs additional configuration — see the upstream object store's documentation or run the object store on its own subdomain.

---

## Troubleshooting

**`docker compose up` complains about port 3100 already in use** — another service has port 3100 (often a default-installed Java app, or a previous Brittle deploy). Edit `ports:` in `docker-compose.yml` to map a different host port (e.g. `'3200:80'`), then update `BRITTLE_URL` in each reporter's `.env` to match.

**Dashboard shows "no runs yet" after a test finishes** — make sure `BRITTLE_URL` doesn't have a trailing slash, the token is the freshest one (not a stale copy), and the project slug in the dashboard matches what the token was minted under. Each token is scoped to exactly one project.

**Reporter logs `401 Unauthorized`** — token is wrong, expired, or scoped to a different project. Revoke and mint a new one from Project → Settings → Tokens.

**Artifact uploads fail or downloads 404** — check `docker compose logs brittle | tail -50` for the actual error. The filesystem path is inside the container; if you `docker compose down -v` you wipe the artifacts volume. Run `docker volume inspect reporter-examples_brittle-artifacts` to see where it lives on the host.

**Want to debug at HTTP level** — set `LOG_LEVEL=debug` in `docker-compose.yml` and `docker compose restart brittle`. Reporter logs go to `stderr`, set `LOG_LEVEL=debug` in the reporter's `.env` for the same on that side.

---

## License

MIT. Copy, fork, ship.

---

[brittle.dev](https://brittle.dev) · [Brittle on GitHub](https://github.com/brittlehq/brittle) · [npm @brittlehq](https://www.npmjs.com/org/brittlehq) · [Discussions](https://github.com/brittlehq/brittle/discussions)
