import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  const { companyName, contactEmail, governingLaw, effectiveDate } = LEGAL;
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Effective {effectiveDate}</p>

      <p>
        These terms govern your use of DocWise, provided by {companyName} (&quot;we&quot;). By creating an account
        you agree to them. If you use DocWise on behalf of an organisation, you confirm that you can bind it to
        these terms.
      </p>

      <h2>Your account</h2>
      <p>
        You must give accurate information, verify your email, and keep your password secure. You are responsible
        for activity under your account and any API keys you create. Tell us promptly at{" "}
        <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> if you suspect unauthorised access.
      </p>

      <h2>Your content</h2>
      <p>
        You keep all rights to the documents you upload. You give us permission to store, process and transmit
        them only as needed to provide the service to you, including through the providers listed in our{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>. You confirm that you have the right to
        upload your content and that it does not break any law or anyone else&apos;s rights.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>upload malware, or content that is unlawful or that you have no right to share;</li>
        <li>try to access other users&apos; data, or probe, overload or disrupt the service;</li>
        <li>get around plan limits, rate limits or security controls;</li>
        <li>resell or provide the service to third parties without our written permission.</li>
      </ul>

      <h2>AI-generated answers</h2>
      <p>
        DocWise uses AI to answer questions about your documents and shows citations so you can check them. Answers
        can be incomplete or wrong. DocWise does not give legal, financial or other professional advice. Check
        important answers against the source documents and, where appropriate, a qualified professional.
      </p>

      <h2>Plans, billing and cancellation</h2>
      <p>
        Free plans have usage limits. Paid plans are billed in advance through our payment provider and renew
        automatically until cancelled. You can cancel at any time from the Billing page; cancellation takes effect
        immediately and your account moves to the Free plan. Fees already paid are non-refundable except where the
        law requires otherwise. We will give at least 30 days&apos; notice of price changes.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We work to keep DocWise available but do not guarantee uninterrupted service. We may change or discontinue
        features. If we discontinue the service, we will give reasonable notice so you can export your documents.
      </p>

      <h2>Suspension and termination</h2>
      <p>
        You can delete your account at any time from Settings. We may suspend or close accounts that break these
        terms or put the service or other users at risk.
      </p>

      <h2>Disclaimers and liability</h2>
      <p>
        To the extent the law allows, the service is provided &quot;as is&quot; without warranties, and our total
        liability for any claim is limited to the amount you paid us in the 12 months before the claim. We are not
        liable for indirect or consequential losses. Nothing in these terms limits liability that cannot be limited
        by law.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of {governingLaw}.</p>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms materially, we will notify account holders by email at least 14 days before the
        change takes effect. Continuing to use DocWise after that means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p><a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
    </article>
  );
}
