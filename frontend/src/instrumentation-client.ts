// Browser error reporting. Loaded only when NEXT_PUBLIC_SENTRY_DSN is set at
// build time, so builds without it ship no Sentry code.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  });
}
