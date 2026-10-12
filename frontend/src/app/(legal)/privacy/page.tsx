import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const { companyName, contactEmail, effectiveDate } = LEGAL;
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">Effective {effectiveDate}</p>

      <p>
        This policy explains what {companyName} (&quot;we&quot;) collects when you use DocWise, why, and the
        choices you have. Questions: <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your name, email address and a hashed password (we never store the password itself).</li>
        <li><strong>Your content:</strong> documents you upload or import from a URL, the text we extract from them, your questions, and the answers we generate.</li>
        <li><strong>Usage data:</strong> counts of documents and questions per month (used for plan limits), and security events such as logins, uploads and deletions (an audit log).</li>
        <li><strong>Billing data:</strong> if you subscribe, payment is processed by our payment provider (NMI). We store your plan and subscription status, not your card number.</li>
        <li><strong>Technical data:</strong> IP address and browser information in server logs, and error reports used to fix bugs.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To provide the service: storing your documents, indexing them for search, and answering your questions with citations.</li>
        <li>To secure your account: authentication, rate limiting, and audit logging.</li>
        <li>To send service emails such as email verification and password resets.</li>
        <li>To enforce plan limits and process payments.</li>
      </ul>
      <p>We do not sell your data, and we do not use your documents to train AI models.</p>

      <h2>Service providers that process your data</h2>
      <p>To run DocWise we share data with these processors, only as needed to provide the service:</p>
      <ul>
        <li><strong>Anthropic</strong>: generates answers and summaries from relevant excerpts of your documents.</li>
        <li><strong>OpenAI</strong> (or Cohere, depending on configuration): converts document text into embeddings for search.</li>
        <li><strong>Cohere</strong>: re-ranks search results, when enabled.</li>
        <li><strong>Pinecone</strong>: stores the embeddings used for search.</li>
        <li><strong>Cloud object storage</strong> (AWS S3 or Cloudflare R2): stores your uploaded files.</li>
        <li><strong>Our hosting and database providers</strong>: run the application, database and job queue.</li>
        <li><strong>Resend</strong>: delivers service emails.</li>
        <li><strong>NMI</strong>: processes payments.</li>
        <li><strong>Sentry</strong>: receives error reports, when enabled.</li>
      </ul>

      <h2>Retention and deletion</h2>
      <p>
        We keep your data while your account is active. You can delete individual documents at any time, and
        you can permanently delete your account from Settings. Account deletion removes your stored files, search
        index entries and account records. Backups are overwritten on a rolling basis.
      </p>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit (HTTPS). Sessions use short-lived access tokens and httpOnly refresh cookies.
        Access to your documents is restricted to your account. No system is perfectly secure, so please use a
        strong, unique password.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, export or delete your personal
        data, or to object to certain processing. Email <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> and
        we will respond within 30 days.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only cookies that are necessary for sign-in and security (a refresh-token cookie and a CSRF token).
        We do not use advertising cookies.
      </p>

      <h2>Children</h2>
      <p>DocWise is not intended for anyone under 16, and we do not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>If we change this policy materially, we will update the date above and notify account holders by email.</p>
    </article>
  );
}
