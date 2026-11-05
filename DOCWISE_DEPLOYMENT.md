# DocWise Deployment

The deployment guide lives in [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

That guide is checked against the code: env vars, health routes, the cookie and
domain requirement, the launch-day smoke test, and rollback steps. This file
previously duplicated it with several inaccuracies (a nonexistent `DocWise-main/`
root directory, `ANTHROPIC_CHAT_MODEL` instead of `ANTHROPIC_MODEL`, and the
claim that no health route exists), so it now just points there.
