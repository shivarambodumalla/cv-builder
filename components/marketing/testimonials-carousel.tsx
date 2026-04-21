"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  gradient: string;
  avatar_bg: string;
}

const FALLBACK: Testimonial[] = [
  {
    id: "1",
    quote: "My ATS score went from 58 to 92 in under 10 minutes. I got 3 interview callbacks within a week of updating my CV. It's a tool I rely on every day.",
    name: "Priya Sharma",
    role: "Senior Software Engineer",
    company: "Google",
    gradient: "from-pink-500 to-yellow-400",
    avatar_bg: "bg-rose-100",
  },
  {
    id: "2",
    quote: "Most of my interviews I get now, I get thanks to CVEdge. Out of 10 applications, 7 are landing callbacks with CVEdge, which is highly accurate so I don't need anything else.",
    name: "James Chen",
    role: "Product Manager",
    company: "Meta",
    gradient: "from-fuchsia-500 to-cyan-400",
    avatar_bg: "bg-fuchsia-100",
  },
  {
    id: "3",
    quote: "Before CVEdge we were not able to get past ATS filters. With CVEdge we now pass 40-50% of automated screens. We chose CVEdge because we could easily fix the issues.",
    name: "Sarah Mitchell",
    role: "Data Scientist",
    company: "Amazon",
    gradient: "from-yellow-400 to-lime-400",
    avatar_bg: "bg-amber-100",
  },
  {
    id: "4",
    quote: "The hardest part of job hunting is tailoring your CV for each role. Now with CVEdge, my match rate is up 4X from 5% to 20%. It completely changed my approach.",
    name: "Marcus Johnson",
    role: "DevOps Engineer",
    company: "Netflix",
    gradient: "from-pink-500 to-violet-500",
    avatar_bg: "bg-violet-100",
  },
  {
    id: "5",
    quote: "The AI rewrite feature is incredible. It turned my vague bullet points into measurable achievements without making anything up. Best CV tool I've ever used.",
    name: "Emily Rodriguez",
    role: "UX Designer",
    company: "Apple",
    gradient: "from-cyan-400 to-blue-500",
    avatar_bg: "bg-cyan-100",
  },
  {
    id: "6",
    quote: "As a career changer, I had no idea what keywords to use. CVEdge mapped my transferable skills perfectly to tech roles and I landed my dream job in 3 weeks.",
    name: "Daniel Kim",
    role: "Frontend Developer",
    company: "Stripe",
    gradient: "from-lime-400 to-emerald-500",
    avatar_bg: "bg-emerald-100",
  },
  {
    id: "7",
    quote: "I've been in recruiting for 12 years. CVEdge catches the same things our ATS filters for. I now recommend it to every candidate I work with.",
    name: "Rachel Foster",
    role: "Senior Recruiter",
    company: "Microsoft",
    gradient: "from-orange-400 to-pink-500",
    avatar_bg: "bg-orange-100",
  },
  {
    id: "8",
    quote: "The Fix All feature rewrote my entire CV in one click and my score jumped 25 points. I was speechless. Went from zero callbacks to 4 interviews in a week.",
    name: "Nina Patel",
    role: "Marketing Manager",
    company: "Salesforce",
    gradient: "from-violet-500 to-fuchsia-400",
    avatar_bg: "bg-purple-100",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ── Card width + gap must stay in sync with JS offset calc ── */
const CARD_W = 340; // sm:w-[340px]
const CARD_W_MOBILE = 300; // w-[300px]
const GAP = 24; // gap-6 = 24px
const PAUSE_MS = 7000; // 7s pause between slides


function TestimonialCard({
  testimonial,
  isCenter,
}: {
  testimonial: Testimonial;
  isCenter: boolean;
}) {
  return (
    <div
      className={`flex w-[300px] sm:w-[340px] shrink-0 flex-col justify-between rounded-2xl border bg-white dark:bg-card p-7 sm:p-8 min-h-[320px] transition-all duration-700 ease-out origin-center ${
        isCenter
          ? "scale-105 sm:scale-110 shadow-2xl border-gray-300 dark:border-border z-10 relative"
          : "scale-100 shadow-sm border-gray-200 dark:border-border/50 opacity-60"
      }`}
    >
      {/* Quote */}
      <p
        className={`text-[15px] leading-[1.7] transition-colors duration-700 ${
          isCenter
            ? "text-gray-800 dark:text-foreground"
            : "text-gray-500 dark:text-muted-foreground"
        }`}
      >
        {testimonial.quote}
      </p>

      {/* Author */}
      <div className="mt-6 flex items-center gap-3.5 pt-5 border-t border-gray-100 dark:border-border/30">
        <div
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} p-[2.5px]`}
        >
          <div
            className={`flex h-full w-full items-center justify-center rounded-full ${testimonial.avatar_bg} text-[11px] font-bold text-gray-600`}
          >
            {getInitials(testimonial.name)}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold tracking-wide text-gray-900 dark:text-foreground uppercase">
            {testimonial.name}
          </p>
          <p className="text-[11px] font-medium tracking-wider text-gray-400 dark:text-muted-foreground uppercase">
            {testimonial.role} @ {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTestimonials(data);
      })
      .catch(() => {});
  }, []);

  const count = testimonials.length;

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  // Auto-advance timer
  useEffect(() => {
    if (paused || count === 0) return;
    timerRef.current = setInterval(advance, PAUSE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, advance, count]);

  // Scroll the track so activeIndex is centered
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const isMobile = window.innerWidth < 640;
    const cardW = isMobile ? CARD_W_MOBILE : CARD_W;
    const step = cardW + GAP;

    // We want activeIndex card centered in the viewport
    const viewportW = track.parentElement?.clientWidth ?? 0;
    const offset = activeIndex * step - (viewportW / 2 - cardW / 2);

    track.style.transform = `translateX(${-offset}px)`;
  }, [activeIndex]);

  return (
    <section className="py-20 md:py-28 overflow-hidden bg-[#fafafa] dark:bg-background">
      {/* Heading */}
      <div className="container mx-auto px-4 mb-12 md:mb-14">
        <h2 className="text-center text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
          What customers say about us
        </h2>
      </div>

      {/* Step-based carousel */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 sm:w-32 bg-gradient-to-r from-[#fafafa] dark:from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 sm:w-32 bg-gradient-to-l from-[#fafafa] dark:from-background to-transparent" />

        <div className="overflow-hidden px-4">
          <div
            ref={trackRef}
            className="flex gap-6 transition-transform duration-700 ease-in-out py-6"
          >
            {testimonials.map((t, i) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                isCenter={i === activeIndex}
              />
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? "w-8 h-2 bg-gray-800 dark:bg-foreground"
                  : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
