/*
  REVIEW REQUIRED: have an actual lawyer review before relying on this
  in a jurisdiction with specific requirements (e.g. GDPR/DPDP).
*/

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "DocWise Terms of Service — the rules governing your use of our platform.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <strong>Reviewer note:</strong> Have an actual lawyer review this document before
        relying on it in a jurisdiction with specific requirements (e.g.&nbsp;GDPR/DPDP).
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-[var(--ink-muted)]">Last updated: July 22, 2026</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using DocWise (&quot;the Service&quot;), you agree to be bound by these
          Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service. These
          Terms form a legally binding agreement between you (or the entity you represent) and
          DocWise.
        </p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>
          DocWise is an AI-powered document question-and-answer platform. You upload documents
          (PDF, DOCX, TXT), and the Service uses retrieval-augmented generation (RAG) to
          provide cited answers to your questions. The Service includes document management,
          chat sessions, team collaboration features, and subscription billing.
        </p>
      </section>

      <section>
        <h2>3. Account Registration</h2>
        <p>
          You must provide accurate, complete information when creating an account. You are
          responsible for maintaining the confidentiality of your credentials and for all
          activity that occurs under your account. You must be at least 18 years old (or the
          age of majority in your jurisdiction) to use the Service.
        </p>
      </section>

      <section>
        <h2>4. Your Documents and Data</h2>
        <p>
          <strong>Ownership.</strong> You retain full ownership of all documents you upload to
          DocWise. We do not claim any intellectual property rights over your content.
        </p>
        <p>
          <strong>Processing.</strong> When you upload a document, DocWise extracts text,
          splits it into chunks, generates vector embeddings (via OpenAI or Voyage AI), and
          stores them in a vector database (Pinecone) for retrieval. Your documents are also
          stored in encrypted cloud storage (Cloudflare R2 / S3-compatible) so you can view
          them later. When you ask a question, relevant chunks are retrieved and sent to
          Anthropic&apos;s Claude along with your question to generate a cited answer.
        </p>
        <p>
          <strong>No training on your data.</strong> Your documents and their embeddings are
          used solely to answer your questions. We do not use your content to train or
          fine-tune AI models.
        </p>
      </section>

      <section>
        <h2>5. Subscriptions and Billing</h2>
        <p>
          DocWise offers free and paid subscription plans. Paid plans are billed in advance on
          a monthly basis through our payment processor, NMI (Network Merchants, Inc.).
        </p>
        <ul>
          <li>You authorize recurring charges to your payment method until you cancel.</li>
          <li>You may cancel at any time from your Billing settings. Cancellation takes effect
            at the end of the current billing period; no partial refunds are issued for
            unused time.</li>
          <li>We reserve the right to change pricing with 30 days&apos; advance notice.</li>
          <li>Failed payments will result in a grace period before downgrade or suspension of
            paid features.</li>
        </ul>
      </section>

      <section>
        <h2>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
          <li>Upload malware, files designed to exploit the processing pipeline, or content
            that infringes third-party intellectual property rights.</li>
          <li>Attempt to reverse-engineer, extract, or circumvent security controls,
            rate limits, or access controls.</li>
          <li>Resell, sublicense, or redistribute the Service without written authorization.</li>
          <li>Use automated scripts or bots to interact with the Service in ways not intended
            by the normal user interface.</li>
        </ul>
      </section>

      <section>
        <h2>7. Intellectual Property</h2>
        <p>
          DocWise and its underlying technology, including the user interface, algorithms,
          branding, and documentation, are owned by DocWise and protected by applicable
          intellectual property laws. Nothing in these Terms transfers ownership of our IP
          to you.
        </p>
      </section>

      <section>
        <h2>8. Third-Party Services</h2>
        <p>
          DocWise integrates with third-party providers to deliver its functionality,
          including Anthropic (Claude LLM), OpenAI and Voyage AI (embeddings), Pinecone
          (vector search), Cloudflare R2 (storage), and NMI (payment processing). Your use
          of DocWise may be subject to the terms of service of these providers. We are not
          responsible for the acts or omissions of third-party providers.
        </p>
      </section>

      <section>
        <h2>9. Data Retention and Deletion</h2>
        <p>
          We retain your account information and documents for as long as your account is
          active. You may delete your account at any time from the Settings page. Account
          deletion permanently removes your profile, documents, chat history, and
          associated embeddings from our systems. Subscription data required for financial
          record-keeping may be retained as required by law.
        </p>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, DOCWISE SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
          BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING
          OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
        </p>
        <p>
          Our total aggregate liability for any claim arising from or relating to the
          Service shall not exceed the amount you paid to DocWise in the twelve (12)
          months preceding the claim.
        </p>
      </section>

      <section>
        <h2>11. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
          WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT. We do not warrant that the Service will be uninterrupted,
          error-free, or free of harmful components.
        </p>
      </section>

      <section>
        <h2>12. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated via email or a prominent notice in the Service at least 30 days
          before they take effect. Continued use of the Service after the effective date
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:support@docwise.ai">support@docwise.ai</a>.
        </p>
      </section>
    </article>
  );
}
