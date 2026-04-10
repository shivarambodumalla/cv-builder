"use client";

import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";

/* ─── Inline social SVG icons (lucide-react doesn't ship brand icons) ──── */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* ─── Data ─── */
const socialLinks = [
  { Icon: XIcon, href: "https://x.com/thecvedge", label: "X (Twitter)" },
  { Icon: LinkedInIcon, href: "https://linkedin.com/company/thecvedge", label: "LinkedIn" },
  { Icon: InstagramIcon, href: "https://instagram.com/thecvedge", label: "Instagram" },
  { Icon: YouTubeIcon, href: "https://youtube.com/@thecvedge", label: "YouTube" },
];

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Upload Resume", href: "/upload-resume" },
  { label: "Blog", href: "https://blog.thecvedge.com", external: true },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

/* ─── Component ─── */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1a2e1e] text-[#c7d8ca] dark:bg-[#0c1612] dark:text-[#8fa89a]">
      {/* Top gradient accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#1a7a6d] to-transparent" />

      <div className="container mx-auto px-6 pt-14 pb-8">
        {/* Main grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-flex items-center">
              <img src="/img/cvEdge_logo_dark.svg" alt="CVEdge" className="h-7 opacity-90 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#8fa89a] dark:text-[#6a8575] max-w-xs">
              Your CV, your edge. Craft beautiful, ATS-optimised resumes that
              land interviews.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[#8fa89a] transition-all duration-300 hover:bg-[#1a7a6d] hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(26,122,109,0.3)]"
                >
                  <social.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product column */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#4a9e8e]">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-sm text-[#8fa89a] transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[#8fa89a] transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#4a9e8e]">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#8fa89a] transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / CTA column */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#4a9e8e]">
              Get in Touch
            </h4>
            <a
              href="mailto:hello@thecvedge.com"
              className="group inline-flex items-center gap-2 text-sm text-[#8fa89a] transition-colors duration-200 hover:text-white"
            >
              <Mail className="h-4 w-4 text-[#1a7a6d]" />
              hello@thecvedge.com
            </a>
            <div className="mt-6">
              <Link
                href="/upload-resume"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1a7a6d] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#1f8f80] hover:shadow-[0_0_24px_rgba(26,122,109,0.35)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Upload Resume
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom divider + bar */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Copyright */}
            <p className="text-xs text-[#6a8575] dark:text-[#4a6555]">
              &copy; {new Date().getFullYear()} CVEdge. All rights reserved.
            </p>

            {/* Powered by badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="text-[11px] text-[#4a6555]">Powered by</span>
              {["Supabase", "Vercel"].map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-[#6a8575] transition-colors duration-200 hover:border-[#1a7a6d]/40 hover:text-[#8fa89a]"
                >
                  {t}
                </span>
              ))}
              <span className="text-[11px] text-[#4a6555]">Payments by</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-[#6a8575] transition-colors duration-200 hover:border-[#1a7a6d]/40 hover:text-[#8fa89a]">
                Lemon Squeezy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#1a7a6d]/10 blur-[100px]" />
    </footer>
  );
}
