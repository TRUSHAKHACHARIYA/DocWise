# Release Checklist

## Pre-merge
- Ensure `npm run validate` passes from repository root.
- Ensure `npm run eval:gate` and `npm run perf:budget` pass for the latest eval run.
- Confirm all required production secrets are configured.

## Pre-deploy
- Confirm database migration plan and backup snapshot are ready.
- Verify rollback command path and previous release artifact are available.
- Confirm health endpoints (`/healthz`, `/readyz`) are healthy in staging.

## Deploy
- Deploy backend and frontend from the same commit SHA.
- Run smoke checks with `npm run smoke:e2e` against deployed environment.
- Monitor error rate and latency dashboards for at least 15 minutes.

## Rollback
- Trigger platform rollback to previous healthy release.
- Run smoke checks on rolled-back version.
- Record incident summary and root cause in `docs/NOTES.md`.

