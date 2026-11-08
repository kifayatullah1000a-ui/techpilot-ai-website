import React from 'react';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBackToHome: () => void;
}

export const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ onBackToHome }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
          Privacy Policy
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Last updated: November 2026 · TechPilot AI Transparency Commitment
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            1. Zero Third-Party Advertising & Tracking
          </h2>
          <p>
            TechPilot AI does not run third-party advertising networks (e.g. Google AdSense), behavioral trackers, or data-broker pixels. We do not sell, rent, or monetize your personal information or reading habits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            2. Client-Side Tool Processing
          </h2>
          <p>
            All online developer utilities—including the AI Prompt Architect, Code Logic Analyzer, AI Readability Scorer, Jargon Decoder, and OpenGraph Previewer—execute strictly within your client browser session. Source code snippets and prompt text you enter are never transmitted to external databases or stored on remote servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            3. Local Browser Storage
          </h2>
          <p>
            We may store minimal functional preferences (such as your light or dark mode theme selection) in standard browser storage. These values never leave your device.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            4. Editorial Submissions & Communications
          </h2>
          <p>
            If you submit a contact inquiry or an article draft through our editorial interface, that information is used solely by our editorial team to evaluate your submission and correspond with you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            5. Contact for Privacy Inquiries
          </h2>
          <p>
            For questions regarding this privacy policy or data practices, contact us at <strong>privacy@techpilot.ai</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsOfServicePage: React.FC<LegalPageProps> = ({ onBackToHome }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
          Terms of Service
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Last updated: November 2026 · Standard Terms & Conditions
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using TechPilot AI, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the website or its utilities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            2. Permitted Use of Free Online Tools
          </h2>
          <p>
            You are granted a worldwide, royalty-free license to use our free online developer tools (Prompt Architect, Code Analyzer, Jargon Decoder, Readability Estimator, etc.) for personal, educational, or commercial software engineering purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            3. Editorial Integrity & Verification
          </h2>
          <p>
            TechPilot AI publishes independent technical journalism and architecture analysis. While we strive for rigorous accuracy and verify citations, all code examples and technical explanations are provided "as is" for informational purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            4. Human-in-the-Loop Publishing Protocol
          </h2>
          <p>
            Any draft submitted through our Content Studio or Research Workbench enters an air-gapped editorial review queue. TechPilot AI does not publish any material automatically. Our editors reserve full discretion over publication standards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
            5. Intellectual Property
          </h2>
          <p>
            Original articles and editorial commentary published on TechPilot AI are protected under copyright law. Code snippets shared within technical articles are released for educational implementation under the MIT license unless explicitly specified.
          </p>
        </section>
      </div>
    </div>
  );
};
