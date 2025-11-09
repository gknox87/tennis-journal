import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  Trophy,
  TrendingUp,
  Users,
  Target,
  BookOpen,
  Zap,
  BarChart3,
  Calendar,
  Share2,
  Play,
  ArrowRight,
  Star,
  Activity,
  Mail,
  MessageCircle,
  CheckCircle,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const sports = [
    { icon: "🎾", name: "Tennis" },
    { icon: "🏓", name: "Table Tennis" },
    { icon: "🏸", name: "Padel" },
    { icon: "🏸", name: "Pickleball" },
    { icon: "🏸", name: "Badminton" },
    { icon: "⚫", name: "Squash" },
  ];

  const valuePillars = [
    {
      icon: Brain,
      title: "Beyond Stats – Track Your Mental Game",
      description:
        "Capture both match statistics AND mental insights. See exactly what worked, what didn't, and how you felt in pressure moments. It's your performance diary meets analytics dashboard.",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      icon: Trophy,
      title: "Designed for Winners at Every Level",
      description:
        "From junior prospects to elite squads to club champions – Sports Journal makes improvement engaging and motivating. No boring spreadsheets. Just intelligent tracking that inspires action.",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
    },
    {
      icon: TrendingUp,
      title: "See Your Progress, Spot Your Patterns",
      description:
        "Sport-aware analytics reveal trends over time. Identify what's working, what needs attention, and celebrate your wins with visual progress tracking. Every match becomes a stepping stone.",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
    },
    {
      icon: Users,
      title: "Keep Your Support Team in the Loop",
      description:
        "One-tap sharing with coaches, parents, or training partners via WhatsApp or email. Get feedback fast. (Direct in-app coaching chat coming soon!)",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
    },
  ];

  const features = [
    {
      icon: Target,
      emoji: "🎯",
      title: "Pre-Match Preparation",
      description:
        "Plan each match like a pro. Set goals, review opponent notes, and step onto the court with a clear game plan and unshakeable confidence.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: BookOpen,
      emoji: "📖",
      title: "Post-Match Journaling",
      description:
        "Reflect while it's fresh. Quick, structured debriefs capture what worked, what didn't, and key learning moments. Build your personal playbook match by match.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      emoji: "👥",
      title: "Opponent Intelligence",
      description:
        "Your secret weapon: a database of every rival's style, weaknesses, and patterns. Know your opponent better than they know themselves.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Zap,
      emoji: "⚡",
      title: "Training Integration",
      description:
        "Connect practice to performance. Log training sessions and link them to match insights for purposeful, progressive improvement.",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Progress Analytics",
      description:
        "Watch your hard work pay off with clean graphs, win-rate tracking, and performance trends. Data that motivates, not overwhelms.",
      gradient: "from-red-500 to-red-600",
    },
    {
      icon: Calendar,
      emoji: "📅",
      title: "Tournament Scheduler",
      description:
        "Never miss a match. Calendar integration keeps all your competition dates organised with linked journal entries and countdown timers.",
      gradient: "from-teal-500 to-teal-600",
    },
  ];

  const testimonials = [
    {
      quote:
        "I used to struggle to get my son to reflect on matches. Now he actually enjoys logging into Sports Journal and walks onto court with more confidence and focus. It's been a game-changer for our family.",
      author: "Michael R., Performance Parent",
      avatar: "🎾",
    },
    {
      quote:
        "As a coach, I love seeing my players' journal entries. It's like being courtside even when I can't be there. It helps me tailor training sessions to what they really need, not just what I think they need.",
      author: "Coach Maria L., National Squad Coach",
      avatar: "🏆",
    },
    {
      quote:
        "I've started winning matches I used to lose. The difference? Better prep, smarter reflection, and tracking what actually moves the needle. Sports Journal makes improving feel fun – and the results show on court.",
      author: "David T., Adult Competitor",
      avatar: "⭐",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Set Up Once",
      description:
        "Create your profile, choose your sport(s), and you're ready. Takes less than 60 seconds. No complex setup. No learning curve.",
      icon: CheckCircle,
    },
    {
      number: "2",
      title: "Capture As You Go",
      description:
        "Log matches in seconds with smart templates. Add training notes. Track opponents. It's so simple, you'll actually use it consistently.",
      icon: Activity,
    },
    {
      number: "3",
      title: "Improve & Dominate",
      description:
        "Review insights, spot patterns, share with your coach, and watch your performance soar. Sports Journal turns reflection into results.",
      icon: TrendingUp,
    },
  ];

  const faqs = [
    {
      question: "Is Sports Journal really free?",
      answer:
        "Yes! Core features free forever. Premium coming soon with additional features for competitive athletes.",
    },
    {
      question: "Can I track multiple sports?",
      answer:
        "Absolutely! Switch between sports seamlessly. Your data travels with you across all racket sports.",
    },
    {
      question: "How do I share with my coach?",
      answer:
        "One-tap sharing via WhatsApp, email, or link. Direct coach-player chat coming soon!",
    },
    {
      question: "Does it work offline?",
      answer:
        "Match logging works offline, syncs when you're back online. Perfect for tournaments!",
    },
    {
      question: "What devices are supported?",
      answer: "Mobile, tablet, and web. Works everywhere you do.",
    },
    {
      question: "Can I import past match data?",
      answer: "Yes! Contact support for bulk import help.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        {/* Background blur circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/30 to-blue-600/30 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left content - 60% */}
            <div className="lg:col-span-3 space-y-8 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
                Track Performance. Master Your Mindset. Dominate Your Sport.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto lg:mx-0">
                Sports Journal is the digital performance companion for
                ambitious athletes across tennis, table tennis, padel,
                pickleball, badminton, and squash. Capture every match, training
                insight, and breakthrough moment in one beautiful, easy-to-use
                app.
              </p>

              {/* Sport icons trust badge */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm text-muted-foreground">
                {sports.map((sport, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-card rounded-full border border-border"
                  >
                    <span className="text-lg">{sport.icon}</span>
                    {sport.name}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-[2rem] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Free – Unlock Your Potential
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-2 px-8 py-6 text-lg rounded-[2rem] hover:bg-accent transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
                </Button>
              </div>

              {/* Social proof strip */}
              <p className="text-sm text-muted-foreground flex items-center justify-center lg:justify-start gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                Trusted by 500+ competitive athletes • 10,000+ matches tracked •
                4.9★ rating
              </p>
            </div>

            {/* Right hero image - 40% */}
            <div className="lg:col-span-2 relative">
              <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png"
                  alt="Athlete reviewing Sports Journal insights"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating stat cards */}
              <div className="absolute -top-4 -left-4 bg-card rounded-2xl p-4 shadow-lg border border-border animate-float">
                <div className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="text-sm font-semibold">Match Won</div>
                    <div className="text-xs text-muted-foreground">
                      6-4, 6-2
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-card rounded-2xl p-4 shadow-lg border border-border animate-float">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="text-sm font-semibold">Win Rate</div>
                    <div className="text-xs text-muted-foreground">
                      +15% this month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              Why 500+ Athletes Choose Sports Journal
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The Complete System for High-Performing Athletes Who Are Serious
              About Improvement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valuePillars.map((pillar, idx) => (
              <Card
                key={idx}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br ${pillar.bgGradient}`}
              >
                <CardContent className="p-8">
                  <div
                    className={`h-16 w-16 bg-gradient-to-br ${pillar.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                  >
                    <pillar.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              Six Powerful Tools. One Seamless Experience.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're preparing for nationals or mastering your local
              league, these features give you the competitive edge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-card"
              >
                <CardContent className="p-8">
                  <div
                    className={`h-16 w-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                    <span>{feature.emoji}</span>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground">
              Real Athletes. Real Results. Real Transformation.
            </h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-8 h-8 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-gray-50 to-white"
              >
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              From Court to Insights in 3 Simple Steps
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative flex items-start gap-6 group"
              >
                {/* Connecting line (not on last item) */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
                )}

                {/* Number circle */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>

                {/* Content */}
                <Card className="flex-1 border-0 bg-card shadow-lg group-hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <step.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Sport Showcase */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            One App. Every Racket Sport.
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Whatever Your Court, We've Got You Covered
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {sports.map((sport, idx) => (
              <div
                key={idx}
                className="px-6 py-4 bg-card rounded-full border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="text-2xl mr-2">{sport.icon}</span>
                <span className="text-lg font-semibold text-foreground">
                  {sport.name}
                </span>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sport-specific terminology, scoring formats, and analytics.
            Switching sports? No problem – your data travels with you.
          </p>
        </div>
      </section>

      {/* Share & Collaborate Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto text-center relative z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30">
            <Share2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Share Insights. Get Feedback. Grow Faster.
          </h2>
          <p className="text-xl mb-8 leading-relaxed opacity-90 max-w-3xl mx-auto">
            One tap to share your match journal or stats via WhatsApp or email.
            Perfect for updating coaches, parents, or training partners. Direct
            coach-player chat coming soon!
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
            <p className="text-lg italic">
              💡 Coming soon: Direct in-app coaching chat for instant feedback!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              Your Questions, Answered
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(0, 3).map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="bg-card border border-border rounded-2xl px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(3).map((faq, idx) => (
                <AccordionItem
                  key={idx + 3}
                  value={`item-${idx + 3}`}
                  className="bg-card border border-border rounded-2xl px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white relative overflow-hidden">
        {/* Animated blur circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />

        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <span className="text-6xl">🏆</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Dominate Your Sport?
          </h2>
          <p className="text-xl mb-4 leading-relaxed opacity-90 max-w-3xl mx-auto">
            Every Match is Part of Your Journey. Make Each One Count.
          </p>
          <p className="text-lg mb-10 opacity-80 max-w-2xl mx-auto">
            Join a growing community of 500+ passionate athletes committed to
            continual improvement. Start tracking today, see results tomorrow.
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-6 text-xl rounded-[2rem] transform hover:scale-105 transition-all duration-300 shadow-2xl font-bold"
          >
            Start Your Free Journey
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { label: "Happy Players", value: "500+" },
              { label: "Matches Tracked", value: "10,000+" },
              { label: "App Rating", value: "4.9★" },
              { label: "Countries", value: "25+" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#1E293B] text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Transform Your Sporting Journey Today!
          </h3>
          <div className="flex justify-center gap-6 mb-8">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
            <a
              href="mailto:support@sportsjournal.com"
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
          <p className="text-sm opacity-70">
            © 2025 Sports Journal. Built for athletes who refuse to settle.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
