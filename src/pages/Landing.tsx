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
  Rocket,
  Globe,
  Clock,
  Award,
  Sparkles,
  Shield,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const sports = [
    { icon: "🎾", name: "Tennis" },
    { icon: "🏓", name: "Table Tennis" },
    { icon: "🥎", name: "Padel" },
    { icon: "🏸", name: "Pickleball" },
    { icon: "🏸", name: "Badminton" },
    { icon: "⚫", name: "Squash" },
  ];

  const valuePillars = [
    {
      icon: Brain,
      title: "Mental Game Mastery",
      description:
        "Track both match stats AND mental insights. Capture what worked, what didn't, and how you felt in pressure moments. Your performance diary meets analytics dashboard.",
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-500/10",
      border: "border-blue-200",
    },
    {
      icon: Trophy,
      title: "Built for Champions",
      description:
        "From junior prospects to elite competitors – Sports Journal makes improvement engaging. No boring spreadsheets. Just intelligent tracking that inspires action.",
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-500/10",
      border: "border-purple-200",
    },
    {
      icon: TrendingUp,
      title: "Progress Visualization",
      description:
        "Sport-aware analytics reveal trends over time. Identify what's working, celebrate wins with visual tracking. Every match becomes a stepping stone to greatness.",
      gradient: "from-green-500 to-emerald-500",
      iconBg: "bg-green-500/10",
      border: "border-green-200",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "One-tap sharing with coaches, parents, or training partners. Get feedback fast. Direct in-app coaching chat coming soon!",
      gradient: "from-orange-500 to-red-500",
      iconBg: "bg-orange-500/10",
      border: "border-orange-200",
    },
  ];

  const features = [
    {
      icon: Target,
      emoji: "🎯",
      title: "Pre-Match Prep",
      description:
        "Plan like a pro. Set goals, review opponent notes, step onto court with unshakeable confidence.",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: BookOpen,
      emoji: "📖",
      title: "Post-Match Journal",
      description:
        "Reflect while fresh. Quick, structured debriefs capture learning moments. Build your personal playbook.",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: Shield,
      emoji: "🛡️",
      title: "Opponent Intel",
      description:
        "Your secret weapon: database of every rival's style, weaknesses, patterns. Know them better than themselves.",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: Zap,
      emoji: "⚡",
      title: "Training Link",
      description:
        "Connect practice to performance. Log sessions and link to match insights for purposeful improvement.",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Smart Analytics",
      description:
        "Watch hard work pay off with clean graphs, win-rate tracking. Data that motivates, not overwhelms.",
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      icon: Calendar,
      emoji: "📅",
      title: "Tournament Hub",
      description:
        "Never miss a match. Calendar keeps all competition dates organized with entries and countdown timers.",
      color: "text-teal-500",
      bg: "bg-teal-50",
    },
  ];

  const testimonials = [
    {
      quote:
        "Sports Journal transformed how my son approaches tennis. He actually enjoys logging matches now and plays with more focus. Game-changer!",
      author: "Michael R.",
      role: "Performance Parent",
      avatar: "🎾",
      rating: 5,
    },
    {
      quote:
        "As a coach, seeing players' journal entries is like being courtside. It helps me tailor training to what they really need. Invaluable tool!",
      author: "Coach Maria L.",
      role: "National Squad Coach",
      avatar: "🏆",
      rating: 5,
    },
    {
      quote:
        "I'm winning matches I used to lose. Better prep, smarter reflection, tracking what matters. Sports Journal makes improving fun!",
      author: "David T.",
      role: "Adult Competitor",
      avatar: "⭐",
      rating: 5,
    },
  ];

  const benefits = [
    { icon: Rocket, text: "Get started in under 60 seconds" },
    { icon: Globe, text: "Works offline, syncs online" },
    { icon: Users, text: "500+ athletes already improving" },
    { icon: Shield, text: "Your data stays private & secure" },
    { icon: Sparkles, text: "Free forever core features" },
    { icon: Clock, text: "24/7 support when you need it" },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Hero Section - Completely Redesigned */}
      <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full relative z-10 py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left - Hero Content */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left animate-fade-in">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full border border-blue-200">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    #1 Performance Journal for Individual Sports
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-gray-900 tracking-tight">
                  Your Journey to
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                    Sporting Excellence
                  </span>
                  Starts Here
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  The intelligent performance companion for ambitious athletes. Track matches, master your mindset, and dominate your sport.
                </p>

                {/* Sport badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {sports.map((sport, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {sport.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {sport.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Button
                    size="lg"
                    onClick={() => navigate("/register")}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transform hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto group"
                  >
                    Start Free Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="border-2 border-gray-300 hover:border-blue-500 px-8 py-6 text-lg font-semibold rounded-2xl hover:bg-blue-50 transition-all duration-300 w-full sm:w-auto"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    See Demo
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['🎾', '🏓', '🏸'].map((emoji, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm border-2 border-white"
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      <strong className="text-gray-900">500+</strong> athletes
                    </span>
                  </div>
                </div>
              </div>

              {/* Right - Hero Image with Enhanced Design */}
              <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png"
                    alt="Sports Journal App Interface"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent" />
                </div>

                {/* Floating elements */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Match Won!</div>
                      <div className="text-xs text-gray-600">6-4, 6-2</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Win Rate</div>
                      <div className="text-xs text-gray-600">+15% ↗</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="w-full py-8 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center gap-2 opacity-90 hover:opacity-100 transition-opacity group"
              >
                <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm leading-tight">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Pillars - New Design */}
      <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Why Athletes Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              Four Pillars of Peak Performance
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              The complete system for high-performing athletes serious about improvement
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {valuePillars.map((pillar, idx) => (
              <Card
                key={idx}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border-2 ${pillar.border} bg-white overflow-hidden`}
              >
                <CardContent className="p-8 relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${pillar.gradient} opacity-5 rounded-bl-full`} />
                  <div className={`h-16 w-16 rounded-2xl ${pillar.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <pillar.icon className={`h-8 w-8 bg-gradient-to-br ${pillar.gradient} bg-clip-text text-transparent`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {pillar.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Enhanced */}
      <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              Everything You Need to Excel
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Six powerful tools working together seamlessly
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white"
              >
                <CardContent className="p-8">
                  <div className={`h-16 w-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{feature.emoji}</span>
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Streamlined */}
      <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              Start Winning in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Sign Up Free", desc: "Create account in 60 seconds. No credit card required.", icon: Rocket },
              { num: "02", title: "Track Matches", desc: "Log matches, training, and insights with smart templates.", icon: Activity },
              { num: "03", title: "See Growth", desc: "Analyze patterns, share with coaches, dominate your sport.", icon: TrendingUp },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform opacity-20" />
                  <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 w-full h-full rounded-2xl flex items-center justify-center shadow-xl">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-200 mb-2">{step.num}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-base text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Modern Cards */}
      <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full mb-6">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              <span className="text-sm font-semibold text-yellow-900">Rated 4.9/5</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              Athletes Love Sports Journal
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real athletes seeing real results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <div className="text-4xl">{testimonial.avatar}</div>
                  </div>
                  <blockquote className="text-base text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner - Bold & Modern */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            Ready to Transform Your Game?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-95 max-w-3xl mx-auto">
            Join 500+ athletes who are already tracking, improving, and winning more matches than ever before.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 group"
          >
            Start Your Free Journey Now
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>
          <p className="text-sm mt-6 opacity-80">No credit card required • Free forever core features</p>
        </div>
      </section>

      {/* FAQ - Cleaner Design */}
      <section className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">FAQs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Got Questions? We've Got Answers.
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "Is Sports Journal really free?", a: "Yes! Core features free forever. Premium coming soon with additional features for competitive athletes." },
              { q: "Can I track multiple sports?", a: "Absolutely! Switch between sports seamlessly. Your data travels with you across all racket sports." },
              { q: "How do I share with my coach?", a: "One-tap sharing via WhatsApp, email, or link. Direct coach-player chat coming soon!" },
              { q: "Does it work offline?", a: "Match logging works offline, syncs when you're back online. Perfect for tournaments!" },
              { q: "What devices are supported?", a: "Mobile, tablet, and web. Works everywhere you do." },
              { q: "Can I import past match data?", a: "Yes! Contact support for bulk import help." },
            ].map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-white border-0 rounded-2xl shadow-sm hover:shadow-md transition-shadow px-6"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6 hover:text-blue-600 transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-600 pb-6 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA - Immersive */}
      <section className="w-full py-20 sm:py-24 md:py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-6 border-4 border-white/20">
              <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            Your Championship Journey Starts Now
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Every champion started where you are. What separates them? Consistent, intelligent tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 group"
            >
              Get Started Free
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-10 py-7 text-xl font-semibold rounded-2xl transition-all duration-300"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16 opacity-90">
            {[
              { icon: Users, label: "500+ Athletes" },
              { icon: Globe, label: "25+ Countries" },
              { icon: Activity, label: "10K+ Matches" },
              { icon: Star, label: "4.9★ Rating" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <item.icon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="w-full py-12 bg-gray-900 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sports Journal
              </h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed max-w-md">
                The intelligent performance companion for ambitious athletes across tennis, table tennis, padel, pickleball, badminton, and squash.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="mailto:support@sportsjournal.com"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2025 Sports Journal. Built with ❤️ for athletes who refuse to settle.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
