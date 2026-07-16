import { Link } from "react-router-dom";
import {
  Trophy,
  Zap,
  Target,
  Lock,
  Brain,
  RefreshCw,
  PenLine,
  TrendingDown,
  ClipboardList,
  BarChart2,
  BookOpen,
  Flame,
  Heart,
  Calendar,
  CheckCircle,
  Star,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { appUrl, isMarketingHost } from "@/lib/hostMode";
import heroAthlete from "@/assets/landing/hero-athlete.jpg";
import sportsCollage from "@/assets/landing/sports-collage.jpg";
import featureJournal from "@/assets/landing/feature-journal.jpg";
import featureInsights from "@/assets/landing/feature-insights.jpg";
import featureCoach from "@/assets/landing/feature-coach.jpg";
import ctaCelebration from "@/assets/landing/cta-celebration.jpg";

/**
 * Public marketing landing page for sportsjournal.app.
 * CTAs link to the app subdomain (hub.sportsjournal.app) when on the marketing host;
 * on preview/localhost they stay in-app so dev flow works.
 */
const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // On marketing host, link to hub.sportsjournal.app. Otherwise stay in-app.
  const marketing = isMarketingHost();
  const signupHref = marketing ? appUrl("/register") : "/register";
  const loginHref = marketing ? appUrl("/login") : "/login";

  const SignupLink = ({ children, className }: { children: React.ReactNode; className?: string }) =>
    marketing ? (
      <a href={signupHref} className={className}>
        {children}
      </a>
    ) : (
      <Link to="/register" className={className}>
        {children}
      </Link>
    );

  const LoginLink = ({ children, className }: { children: React.ReactNode; className?: string }) =>
    marketing ? (
      <a href={loginHref} className={className}>
        {children}
      </a>
    ) : (
      <Link to="/login" className={className}>
        {children}
      </Link>
    );

  return (
    <div id="top" className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      {/* ============ SECTION 1 — NAV ============ */}
      <nav className="sticky top-0 z-50 bg-violet-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-bold text-lg">
            <Trophy className="w-6 h-6" />
            <span>Sports Journal</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#how-it-works" className="hover:text-white/80">How It Works</a>
            <a href="#features" className="hover:text-white/80">Features</a>
            <a href="#sports" className="hover:text-white/80">Sports</a>
            <a href="/blog" className="hover:text-white/80">Blog</a>
          </div>

          <div className="flex items-center gap-3">
            <LoginLink className="hidden sm:inline-flex items-center px-4 py-2 border border-white/60 rounded-full text-sm font-semibold hover:bg-white/10 transition">
              Sign in
            </LoginLink>
            <SignupLink className="inline-flex items-center px-4 py-2 bg-white text-violet-700 rounded-full text-sm font-bold hover:bg-violet-50 transition">
              Start free →
            </SignupLink>
            <button
              className="md:hidden ml-1 p-1"
              aria-label="Open menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-3 text-sm font-medium">
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#sports" onClick={() => setMenuOpen(false)}>Sports</a>
            <a href="/blog" onClick={() => setMenuOpen(false)}>Blog</a>
          </div>
        )}
      </nav>

      {/* ============ SECTION 2 — HERO (split, image right) ============ */}
      <section className="bg-white px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-violet-700 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-8">
              <Zap className="w-3.5 h-3.5" />
              Free to start — no credit card needed
            </div>

            <h1 className="font-black tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-8">
              Stop losing the
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                same matches
              </span>{" "}
              twice.
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed max-w-[520px] mx-auto lg:mx-0 mb-10">
              Most athletes train hard. Few know why they keep making the same mistakes. Sports Journal captures your matches, spots your patterns, and tells you exactly what to fix — in under 3 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-4">
              <SignupLink className="inline-flex items-center justify-center px-7 py-4 bg-violet-700 text-white rounded-xl font-bold text-base hover:bg-violet-800 transition">
                Start journaling free →
              </SignupLink>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-7 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-base hover:bg-gray-50 transition"
              >
                See how it works
              </a>
            </div>

            <p className="text-gray-400 text-sm">
              Free forever · Works for any sport · No writing experience needed
            </p>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-violet-600/30 via-orange-400/20 to-red-500/30 rounded-[2rem] blur-2xl" aria-hidden />
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-violet-900/20 aspect-square">
              <img
                src={heroAthlete}
                alt="Padel player mid-smash in dramatic purple and orange light"
                width={1280}
                height={1280}
                className="w-full h-full object-cover"
              />
              {/* Floating stat card */}
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Streak</div>
                  <div className="text-lg font-black text-gray-900 leading-none">9 days 🔥</div>
                </div>
              </div>
              <div className="absolute top-5 right-5 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Win rate</div>
                <div className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent leading-none">67%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="max-w-5xl mx-auto mt-14 flex flex-col sm:flex-row gap-6 sm:gap-10 justify-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-violet-600" />
            Instant setup — be logging in 60 seconds
          </div>
          <div className="flex items-center justify-center gap-2">
            <Target className="w-4 h-4 text-violet-600" />
            13 sports — tennis, padel, boxing & more
          </div>
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-violet-600" />
            Private by default — your data, your insights
          </div>
        </div>
      </section>

      {/* ============ SECTION 2b — SPORTS COLLAGE STRIP ============ */}
      <section className="relative bg-gray-900 overflow-hidden">
        <img
          src={sportsCollage}
          alt="13 sports in action: tennis, padel, table tennis, squash, badminton, pickleball, boxing, MMA, judo, cycling, swimming, athletics, gymnastics"
          width={1920}
          height={1080}
          loading="lazy"
          className="w-full h-[280px] sm:h-[360px] object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/30 to-gray-900/80" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-orange-400 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm mb-3">
              One journal
            </p>
            <h2 className="font-black text-white text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-none">
              13 sports.
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Zero excuses.
              </span>
            </h2>
          </div>
        </div>
      </section>


      {/* ============ SECTION 3 — APP MOCKUP ============ */}
      <section className="bg-slate-50 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-3 flex-1 max-w-md mx-auto bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                hub.sportsjournal.app/dashboard
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-slate-50/60">
              {/* Streak card */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-6 text-white flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider opacity-90">Current Streak</div>
                  <div className="text-4xl font-black mt-1">🔥 9 Days</div>
                </div>
                <div className="text-right text-sm opacity-90">
                  <div className="font-bold">Best: 14 days</div>
                  <div className="text-xs">Keep it going!</div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100">
                  <Target className="w-5 h-5 text-orange-500 mb-2" />
                  <div className="text-2xl sm:text-3xl font-black text-gray-900">67%</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Win Rate</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100">
                  <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
                  <div className="text-2xl sm:text-3xl font-black text-gray-900">12</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Total Matches</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100">
                  <Flame className="w-5 h-5 text-red-500 mb-2" />
                  <div className="text-2xl sm:text-3xl font-black text-gray-900">🔥 9</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Streak</div>
                </div>
              </div>

              {/* Match list */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">vs. James Mitchell</div>
                    <div className="text-sm text-gray-500">6-3, 6-4</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">WIN</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">vs. Rafael Torres</div>
                    <div className="text-sm text-gray-500">4-6, 6-3, 3-6</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">LOSS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 4 — PROBLEM ============ */}
      <section className="bg-slate-50 px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-bold uppercase tracking-wider text-sm mb-4">
              Sound familiar?
            </p>
            <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
              You train hard.
              <br />
              But are you actually improving?
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-[560px] mx-auto">
              You put in the hours. You show up. But without capturing what's working and what isn't, most athletes repeat the same mistakes for months — sometimes years.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: Brain, title: "The insights vanish after every match", body: "Right after you play, you know exactly what went wrong. 24 hours later? Gone. Sports Journal captures it while it's fresh." },
              { icon: RefreshCw, title: "You're repeating the same mistakes", body: "Without a record, you can't spot patterns. Crumble in the third set? Double fault under pressure? The data reveals what your memory won't." },
              { icon: PenLine, title: "I don't know what to write", body: "Most athletes never journal because they don't know how. We give you the right questions — so you just answer, not write an essay." },
              { icon: TrendingDown, title: "You're training, but not learning", body: "Physical training makes you fitter. Mental review makes you sharper. The best athletes do both. Now you can too." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-violet-700" />
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECTION 5 — HOW IT WORKS ============ */}
      <section id="how-it-works" className="bg-white px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-bold uppercase tracking-wider text-sm mb-4">How it works</p>
            <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
              Three minutes after you play.
              <br />
              That's all it takes.
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-[600px] mx-auto">
              We designed Sports Journal so it feels like a quick debrief — not homework. Answer a few focused questions and we handle the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: ClipboardList, title: "Log your match or session", body: "Answer 4–5 guided questions about what happened — score, key moments, what worked, what didn't. No blank page staring back at you.", pill: "⏱ 2–3 minutes" },
              { n: "02", icon: BarChart2, title: "Your patterns emerge", body: "Sports Journal builds your performance picture over time. Start seeing where you consistently win — and where you consistently give it away.", pill: "📊 After 5+ entries" },
              { n: "03", icon: Trophy, title: "Walk into your next match sharper", body: "Set goals, review your last few performances, and go in with a clear game plan. Your past insights become your competitive edge.", pill: "🏆 Every match" },
            ].map(({ n, icon: Icon, title, body, pill }) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 relative overflow-hidden">
                <div className="text-8xl font-black text-violet-100 leading-none mb-2 select-none">{n}</div>
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-violet-700" />
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed mb-5">{body}</p>
                <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                  {pill}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECTION 6 — FEATURES ============ */}
      <section id="features" className="bg-slate-50 px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-bold uppercase tracking-wider text-sm mb-4">Features</p>
            <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
              Everything your performance journal needs to be.
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-[640px] mx-auto">
              Built for serious athletes who want to compete smarter — not spend hours writing about their feelings.
            </p>
          </div>

          {/* Hero feature row with images — zigzag */}
          <div className="space-y-12 mb-16">
            {[
              {
                img: featureJournal,
                alt: "Athlete's journal and phone on a clay tennis court at sunset",
                eyebrow: "Match Journal",
                title: "Capture it while it's still fresh.",
                body: "Right after you walk off court, answer 4–5 focused prompts. Score, key moments, what worked, what didn't. No blank page — just a structured 3-minute debrief.",
                reverse: false,
              },
              {
                img: featureInsights,
                alt: "Glowing tennis court heatmap of shot patterns with AI data nodes",
                eyebrow: "AI Insights",
                title: "Patterns your memory can't hold.",
                body: "After a handful of entries, Sports Journal surfaces the trends — where you crumble, where you dominate, which opponents trip you up. Real intelligence on your real game.",
                reverse: true,
              },
              {
                img: featureCoach,
                alt: "Coach showing tablet to a junior player on court at golden hour",
                eyebrow: "Coach Mode",
                title: "Your coach in the loop, without the chase.",
                body: "Share sessions and goals with your coach. They see the patterns, leave notes, and shape your training plan around what's actually happening — not what you half-remember.",
                reverse: false,
              },
            ].map(({ img, alt, eyebrow, title, body, reverse }) => (
              <div
                key={title}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? "lg:[&>div:first-child]:order-2" : ""}`}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200 aspect-[4/3]">
                  <img
                    src={img}
                    alt={alt}
                    width={1280}
                    height={896}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-violet-600 font-bold uppercase tracking-wider text-xs mb-3">{eyebrow}</p>
                  <h3 className="font-extrabold text-3xl sm:text-4xl tracking-tight text-gray-900 mb-4 leading-tight">{title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-center font-extrabold text-2xl sm:text-3xl text-gray-900 mb-8">
            Plus everything else a serious athlete needs.
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: BookOpen, title: "Match Journal", body: "Log every match with guided prompts — opponent notes, key moments, tactical insights. Your competitive memory, always captured." },
              { icon: BarChart2, title: "Performance Stats", body: "Win rate, match history, and scoring trends — all calculated automatically as you log. Know your numbers like a pro." },
              { icon: Target, title: "Goals & Milestones", body: "Set monthly, seasonal, or long-term goals. Track them automatically as you log matches. Stay focused on what matters." },
              { icon: Flame, title: "Streak & Badges", body: "Daily logging streaks and 55+ achievement badges keep you consistent. The athlete who shows up every day wins." },
              { icon: Heart, title: "Body & Wellness", body: "Track training load, recovery, and wellness. Monitor your ACWR and flag injuries before they become problems." },
              { icon: Calendar, title: "Training Planner", body: "Plan your training week, schedule sessions, and review your load balance. Structure your prep like a professional programme." },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-violet-700" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECTION 7 — SPORTS ============ */}
      <section id="sports" className="bg-white px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-[1000px] mx-auto text-center">
          <p className="text-violet-600 font-bold uppercase tracking-wider text-sm mb-4">Built for all sports</p>
          <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            Whatever your sport,
            <br />
            you deserve to compete smarter.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-[540px] mx-auto mb-12">
            Sports Journal works for any competitive athlete. Start with your sport today.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              { label: "🎾 Tennis", active: true },
              { label: "🏸 Padel", highlight: true },
              { label: "🏓 Table Tennis" },
              { label: "🏸 Badminton" },
              { label: "⚽ Football" },
              { label: "🏐 Volleyball" },
              { label: "🥊 Boxing" },
              { label: "🏊 Swimming" },
              { label: "🚴 Cycling" },
              { label: "🏋️ Weightlifting" },
              { label: "🏃 Athletics" },
              { label: "+ More sports coming" },
            ].map(({ label, active, highlight }) => (
              <span
                key={label}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm border ${
                  highlight
                    ? "bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-400"
                    : active
                    ? "bg-violet-100 text-violet-700 border-violet-200"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Don't see your sport? Sign up anyway — tell us what you play and we'll build for it.
          </p>
        </div>
      </section>

      {/* ============ SECTION 8 — TESTIMONIALS ============ */}
      <section className="bg-slate-50 px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-center font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl mb-14">
            Athletes who track, improve.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "I used to walk off court and within an hour I'd forgotten half of what happened. Now I log straight after and I can literally see the patterns in my game. My coach is impressed.", name: "Mark K.", role: "Club tennis player, 5 years competing", initials: "MK", avatar: "bg-violet-600" },
              { quote: "I was sceptical — I'm not the type to write about my feelings. But it's not like that at all. It's more like a quick debrief with yourself. 3 minutes and done.", name: "Sarah A.", role: "Table tennis league player", initials: "SA", avatar: "bg-blue-500" },
              { quote: "The streak feature got me. I logged every day for 3 weeks and by week 2 I could see exactly where my third-set game falls apart. Now I actually have something to train for.", name: "Jamie T.", role: "Amateur footballer", initials: "JT", avatar: "bg-orange-500" },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-700 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.avatar} text-white flex items-center justify-center font-bold text-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECTION 9 — ALL FEATURES FREE ============ */}
      <section id="pricing" className="bg-white px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-violet-600 font-bold uppercase tracking-wider text-sm mb-4">Pricing</p>
          <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            Everything's included. Free.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            No subscriptions, no paywalls, no hidden fees. Every feature is available to every user, forever.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-10">
            {[
              "Unlimited match & session logging",
              "AI-powered pattern analysis",
              "Opponent intelligence database",
              "Advanced training load analytics",
              "Coach sharing & collaboration",
              "All 55+ badges unlocked",
              "Data export (CSV + PDF)",
              "Wellness & injury tracking",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <SignupLink className="inline-block px-8 py-3 bg-violet-700 text-white rounded-xl font-bold hover:bg-violet-800 transition">
            Get started free →
          </SignupLink>
        </div>
      </section>

      {/* ============ SECTION 10 — FINAL CTA ============ */}
      <section className="relative text-white px-4 sm:px-6 py-24 sm:py-32 overflow-hidden">
        <img
          src={ctaCelebration}
          alt="Silhouette of athlete celebrating victory at sunset"
          width={1920}
          height={1088}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/85 via-red-600/75 to-violet-900/85" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-black tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6 drop-shadow-lg">
            Your next match starts
            <br />
            after this one ends.
          </h2>
          <p className="text-white/95 text-lg leading-relaxed mb-10 max-w-[600px] mx-auto drop-shadow">
            The athletes who improve fastest aren't just the ones who train hardest. They're the ones who learn from every single session. Start today — it takes 60 seconds.
          </p>
          <SignupLink className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-700 rounded-xl font-bold text-lg hover:bg-violet-50 transition shadow-2xl">
            Start your free journal →
          </SignupLink>
          <p className="text-white/85 text-sm mt-5 drop-shadow">
            Free forever · No card needed · Works on any device
          </p>
        </div>
      </section>


      {/* ============ SECTION 11 — FOOTER ============ */}
      <footer className="bg-white border-t border-gray-100 px-4 sm:px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <Trophy className="w-5 h-5 text-violet-700" />
            <span>Sports Journal</span>
          </div>
          <p className="text-gray-500 text-center">
            © 2026 Sports Journal App. Built for athletes who compete seriously.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <a href="/blog" className="hover:text-gray-700">Blog</a>
            <span>·</span>
            <a href="/privacy" className="hover:text-gray-700">Privacy</a>
            <span>·</span>
            <a href="/contact" className="hover:text-gray-700">Contact</a>
            <span>·</span>
            <Link to="/help" className="hover:text-gray-700">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
