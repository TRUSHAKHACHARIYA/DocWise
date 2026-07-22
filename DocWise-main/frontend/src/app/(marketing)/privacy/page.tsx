/*
  REVIEW REQUIRED: have an actual lawyer review before relying on this
  in a jurisdiction with specific requirements (e.g. GDPR/DPDP).
*/

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DocWise Privacy Policy — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <strong>Reviewer note:</strong> Have an actual lawyer review this document before
        relying on it in a jurisdiction with specific requirements (e.g.&nbsp;GDPR/DPDP).
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-[var(--ink-muted)]">Last updated: July 22, 2026</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy describes how DocWise (&quot;we,&quot; &quot;our,&quot; or
          &quot;us&quot;) collects, uses, and shares information when you use our website
          and AI-powered document question-and-answer platform (collectively, the
          &quot;Service&quot;). We are committed to protecting your privacy and being
          transparent about our practices.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>2.1 Account Information</h3>
        <p>
          When you create an account, we collect your full name, email address, and a
          securely hashed password. If you belong to an organization, we also store your
          role membership and organization association.
        </p>
        <h3>2.2 Uploaded Documents</h3>
        <p>
          We store the documents you upload (PDF, DOCX, TXT) in encrypted cloud storage
          so you can view and manage them. We extract text from these documents to
          generate searchable chunks and vector embeddings for our retrieval system.
        </p>
        <h3>2.3 Chat History</h3>
        <p>
          We store the conversations you have with DocWise, including your questions, the
          AI-generated answers, and the source citations returned with each answer.
        </p>
        <h3>2.4 Usage Data</h3>
        <p>
          We automatically collect usage data such as the number of documents uploaded,
          questions asked, features used, and general interaction patterns. This data is
          used in aggregate for product analytics and is not linked to specific content in
          your documents.
        </p>
        <h3>2.5 Payment Information</h3>
        <p>
          Payment processing is handled entirely by NMI (Network Merchants, Inc.). We do
          not store your full credit card number or CVV on our servers. We store only a
          payment token and transaction reference needed to manage your subscription.
        </p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li><strong>Provide the Service:</strong> Process your documents, run retrieval-augmented
            generation (RAG), and return cited answers to your questions.</li>
          <li><strong>AI Processing:</strong> Your document text is chunked and converted to vector
            embeddings via OpenAI or Voyage AI. When you ask a question, relevant chunks are
            sent to Anthropic&apos;s Claude to generate an answer. This processing is performed
            solely to deliver results to you.</li>
          <li><strong>Account Management:</strong> Authenticate you, manage your subscription,
            and handle billing through NMI.</li>
          <li><strong>Security:</strong> Detect and prevent abuse, fraud, and unauthorized access.
            We maintain audit logs of account and document actions.</li>
          <li><strong>Product Improvement:</strong> Analyze aggregate usage patterns to improve
            the Service. We do not use your document content or individual queries for
            this purpose.</li>
        </ul>
      </section>

      <section>
        <h2>4. AI and Sub-Processors</h2>
        <p>
          To deliver the Service, we share limited data with the following third-party
          sub-processors:
        </p>
        <ul>
          <li><strong>Anthropic</strong> (Claude LLM) — receives retrieved document chunks and
            your question to generate answers.</li>
          <li><strong>OpenAI / Voyage AI</strong> — used to generate vector embeddings of your
            document chunks for semantic search.</li>
          <li><strong>Pinecone</strong> — stores vector embeddings for fast similarity search.</li>
          <li><strong>Cloudflare R2 / S3-compatible storage</strong> — stores your uploaded
            documents at rest with encryption.</li>
          <li><strong>NMI (Network Merchants, Inc.)</strong> — processes subscription payments.</li>
          <li><strong>Resend</strong> — sends transactional emails (verification, password
            reset).</li>
          <li><strong>Redis / BullMQ</strong> — manages background document ingestion jobs.</li>
        </ul>
        <p>
          We contractually require each sub-processor to protect your data and to not use
          it for purposes other than providing services to us.
        </p>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. When you delete your
          account, we permanently remove:
        </p>
        <ul>
          <li>Your account profile and credentials</li>
          <li>All uploaded documents and their stored text</li>
          <li>Vector embeddings in Pinecone</li>
          <li>Chat sessions and message history</li>
          <li>Audit logs associated with your account</li>
        </ul>
        <p>
          Financial transaction records required for tax and accounting compliance may be
          retained for the period required by applicable law.
        </p>
      </section>

      <section>
        <h2>6. Account and Document Deletion</h2>
        <p>
          You may delete your account at any time from the Settings page in the DocWise
          dashboard. This triggers a permanent, irreversible deletion of all data
          associated with your account, as described above. Organization owners should note
          that deleting their account will transfer ownership of their organization to
          another member, or delete the organization if they are the sole member.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We implement industry-standard security measures to protect your data:
        </p>
        <ul>
          <li>All data is encrypted in transit (TLS 1.2+) and at rest.</li>
          <li>Authentication tokens are stored in httpOnly, sameSite cookies — never in
            localStorage.</li>
          <li>Access tokens are held in memory only and expire after 15 minutes.</li>
          <li>We enforce rate limiting on authentication endpoints.</li>
          <li>Document and API access is validated against ownership on every request.</li>
        </ul>
        <p>
          No system is perfectly secure. If you discover a security vulnerability, please
          report it to <a href="mailto:security@docwise.ai">security@docwise.ai</a>.
        </p>
      </section>

      <section>
        <h2>8. Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have the right to:
        </p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Correct inaccurate personal information.</li>
          <li>Request deletion of your personal information.</li>
          <li>Object to or restrict certain processing of your data.</li>
          <li>Data portability — receive your data in a structured, machine-readable format.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@docwise.ai">privacy@docwise.ai</a>. We will respond to
          verified requests within 30 days.
        </p>
      </section>

      <section>
        <h2>9. International Transfers</h2>
        <p>
          Your data may be processed in countries other than your own. By using the
          Service, you consent to the transfer of your information to jurisdictions that
          may have different data protection laws than your country of residence. We ensure
          that appropriate safeguards are in place for such transfers.
        </p>
      </section>

      <section>
        <h2>10. Children&apos;s Privacy</h2>
        <p>
          The Service is not directed to individuals under 18 years of age. We do not
          knowingly collect personal information from children. If we become aware that we
          have collected data from a child, we will delete it promptly.
        </p>
      </section>

      <section>
        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          communicated via email or a prominent notice in the Service at least 30 days
          before they take effect. We encourage you to review this page periodically.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          For privacy-related questions or requests, contact us at{" "}
          <a href="mailto:privacy@docwise.ai">privacy@docwise.ai</a>.
        </p>
      </section>
    </article>
  );
}
