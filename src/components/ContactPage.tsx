import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Editorial Feedback',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        category: 'Editorial Feedback',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 8000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Direct Communication</span>
          <span aria-hidden="true">·</span>
          <span>Editorial & Technical Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
          Contact TechPilot AI
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Reach our editorial team for article corrections, technical feedback, tool feature suggestions, or editorial submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading mb-4">
            Send an Editorial Inquiry
          </h2>

          {submitted && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Inquiry received successfully!</span>
                <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">
                  Our editorial desk reviews incoming inquiries in the order received. Expect an email response within 1–2 business days.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Work or Personal Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option>Editorial Feedback</option>
                  <option>Article Pitch / Submission</option>
                  <option>Developer Tool Feedback</option>
                  <option>Correction or Citation Notice</option>
                  <option>General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Detailed Message
              </label>
              <textarea
                rows={5}
                required
                placeholder="Include relevant URLs, technical citations, or specific code snippets..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-cyan-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Message to Editorial Desk</span>
            </button>
          </form>
        </div>

        {/* Sidebar Info & FAQ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              Direct Contact & Timelines
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  <strong>Email:</strong> editorial@techpilot.ai
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  <strong>Turnaround:</strong> 24–48 business hours
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  <strong>Privacy:</strong> We never share or sell contact info.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Common Inquiries</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Are your online developer tools free?
                </p>
                <p className="mt-0.5">
                  Yes, 100% free with no account or API keys required. All execution happens client-side in your browser.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Can I submit an article draft for publication?
                </p>
                <p className="mt-0.5">
                  Yes! Use the Research Lab or Content Studio to draft, then click "Submit for Editorial Approval". Our team reviews each submission manually.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
