import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
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
import DemoModal from "@/components/DemoModal";

const PadelIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 36 36"
    className={`h-8 w-8 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="padelHead" x1="10" y1="6" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="padelHandle" x1="26" y1="25" x2="30" y2="33" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <path
      d="M18 4.5c-6.351 0-11.5 5.149-11.5 11.5S11.649 27.5 18 27.5c3.866 0 7-3.134 7-7 0-7.384-4.485-16-7-16Z"
      fill="url(#padelHead)"
      stroke="#1E40AF"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <rect
      x="24"
      y="23"
      width="4.5"
      height="9.5"
      rx="2.25"
      fill="url(#padelHandle)"
      transform="rotate(35 24 23)"
      stroke="#1E3A8A"
      strokeWidth="0.8"
    />
    <circle cx="24.9" cy="30.8" r="1.2" fill="#BFDBFE" opacity="0.8" />
    {[ 
      [14.5, 13.5],
      [18, 13.5],
      [21.5, 13.5],
      [16.25, 17.25],
      [19.75, 17.25],
      [18, 21],
    ].map(([cx, cy], idx) => (
      <circle key={idx} cx={cx} cy={cy} r={1.15} fill="#E0F2FE" opacity="0.9" />
    ))}
    <path
      d="M12.2 9.8c1.3-2.1 3.6-3.5 6.2-3.5"
      stroke="#BAE6FD"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

const PickleballIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 36 36"
    className={`h-8 w-8 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="pickleballPaddle" x1="8" y1="8" x2="24" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="pickleballHandle" x1="22" y1="20" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#92400E" />
        <stop offset="1" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="pickleballBall" x1="26" y1="10" x2="32" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#FDE68A" />
      </linearGradient>
    </defs>
    {/* Paddle head - wider and more rounded than tennis */}
    <ellipse
      cx="16"
      cy="14"
      rx="8"
      ry="6.5"
      fill="url(#pickleballPaddle)"
      stroke="#B45309"
      strokeWidth="1.2"
      transform="rotate(-15 16 14)"
    />
    {/* Paddle handle */}
    <rect
      x="21.5"
      y="19"
      width="3.5"
      height="8"
      rx="1.75"
      fill="url(#pickleballHandle)"
      transform="rotate(25 21.5 19)"
      stroke="#78350F"
      strokeWidth="0.8"
    />
    {/* Paddle surface holes pattern */}
    {[
      [13, 12],
      [16.5, 11.5],
      [20, 12],
      [14.5, 14.5],
      [18, 14.5],
      [16, 16.5],
    ].map(([cx, cy], idx) => (
      <circle key={idx} cx={cx} cy={cy} r="0.9" fill="#FCD34D" opacity="0.6" />
    ))}
    {/* Pickleball - perforated wiffle ball */}
    <circle
      cx="28"
      cy="12"
      r="3.5"
      fill="url(#pickleballBall)"
      stroke="#F59E0B"
      strokeWidth="0.8"
    />
    {/* Ball holes - characteristic pickleball perforations */}
    {[
      [26.5, 11],
      [28, 10.5],
      [29.5, 11],
      [27, 12.5],
      [29, 12.5],
      [26.5, 13.5],
      [28, 13.8],
      [29.5, 13.5],
    ].map(([cx, cy], idx) => (
      <circle key={idx} cx={cx} cy={cy} r="0.35" fill="#F59E0B" opacity="0.8" />
    ))}
  </svg>
);

const Landing = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState("Tennis");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sports = [
    { icon: "🎾", name: "Tennis" },
    { icon: "🏓", name: "Table Tennis" },
    { icon: "padel", name: "Padel" },
    { icon: "pickleball", name: "Pickleball" },
    { icon: "🏸", name: "Badminton" },
    { icon: "⚫", name: "Squash" },
  ];

  const sportHeroData: Record<string, { tagline: string; gradient: string; accentGradient: string; emoji: string; scoreExample: string; scoreLabel: string; statLabel: string; statValue: string }> = {
    "Tennis": {
      tagline: "Track every serve, rally, and match point",
      gradient: "from-green-500 to-emerald-600",
      accentGradient: "from-green-400/20 to-emerald-400/20",
      emoji: "🎾",
      scoreExample: "6-4, 6-2",
      scoreLabel: "Match Won!",
      statLabel: "Win Rate",
      statValue: "+15% ↗",
    },
    "Table Tennis": {
      tagline: "Master your spin, speed, and strategy",
      gradient: "from-orange-500 to-red-600",
      accentGradient: "from-orange-400/20 to-red-400/20",
      emoji: "🏓",
      scoreExample: "11-8, 11-6, 9-11, 11-7",
      scoreLabel: "Match Won!",
      statLabel: "Rally Win %",
      statValue: "+22% ↗",
    },
    "Padel": {
      tagline: "Dominate the glass court with your partner",
      gradient: "from-blue-600 to-indigo-700",
      accentGradient: "from-blue-400/20 to-indigo-400/20",
      emoji: "🎾",
      scoreExample: "6-3, 7-5",
      scoreLabel: "Match Won!",
      statLabel: "Net Points",
      statValue: "+18% ↗",
    },
    "Pickleball": {
      tagline: "Sharpen your dinks, drives, and court IQ",
      gradient: "from-yellow-500 to-amber-600",
      accentGradient: "from-yellow-400/20 to-amber-400/20",
      emoji: "🥒",
      scoreExample: "11-7, 11-9",
      scoreLabel: "Game Won!",
      statLabel: "3rd Shot %",
      statValue: "+20% ↗",
    },
    "Badminton": {
      tagline: "Elevate your smashes and court coverage",
      gradient: "from-sky-500 to-blue-600",
      accentGradient: "from-sky-400/20 to-blue-400/20",
      emoji: "🏸",
      scoreExample: "21-18, 21-15",
      scoreLabel: "Match Won!",
      statLabel: "Smash Acc.",
      statValue: "+12% ↗",
    },
    "Squash": {
      tagline: "Control the T and outlast every opponent",
      gradient: "from-gray-700 to-gray-900",
      accentGradient: "from-gray-400/20 to-gray-600/20",
      emoji: "⚫",
      scoreExample: "11-8, 11-6, 11-9",
      scoreLabel: "Match Won!",
      statLabel: "Fitness Score",
      statValue: "+25% ↗",
    },
  };

  const handleSportSelect = (sportName: string) => {
    if (sportName === selectedSport) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedSport(sportName);
      setIsTransitioning(false);
    }, 200);
  };

  const currentHero = sportHeroData[selectedSport];

  // Auto-rotate sports every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedSport(prev => {
          const currentIdx = sports.findIndex(s => s.name === prev);
          const nextIdx = (currentIdx + 1) % sports.length;
          return sports[nextIdx].name;
        });
        setIsTransitioning(false);
      }, 200);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedSport]);

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
      role: "Tennis Parent",
      avatar: "🎾",
      rating: 5,
      sport: "Tennis",
    },
    {
      quote:
        "As a tennis coach, seeing players' journal entries is like being courtside. It helps me tailor training to what they really need.",
      author: "Coach Maria L.",
      role: "National Tennis Coach",
      avatar: "🏆",
      rating: 5,
      sport: "Tennis",
    },
    {
      quote:
        "I'm winning tennis matches I used to lose. Better prep, smarter reflection, tracking what matters. Sports Journal makes improving fun!",
      author: "David T.",
      role: "Adult Tennis Competitor",
      avatar: "⭐",
      rating: 5,
      sport: "Tennis",
    },
    {
      quote:
        "Tracking my table tennis matches has completely changed my training focus. I can see exactly where I'm losing points and fix it.",
      author: "Wei L.",
      role: "Club Table Tennis Player",
      avatar: "🏓",
      rating: 5,
      sport: "Table Tennis",
    },
    {
      quote:
        "My third-ball attack improved 30% after I started journaling patterns. The analytics are incredibly insightful for table tennis.",
      author: "Coach Henrik S.",
      role: "Table Tennis Academy Coach",
      avatar: "🏆",
      rating: 5,
      sport: "Table Tennis",
    },
    {
      quote:
        "Finally an app that understands table tennis scoring and strategy. The post-match reflections help me prepare for rematches.",
      author: "Priya K.",
      role: "Regional TT Champion",
      avatar: "⭐",
      rating: 5,
      sport: "Table Tennis",
    },
    {
      quote:
        "Padel is all about partnerships and Sports Journal helps us track what works as a team. Our communication on court has never been better.",
      author: "Carlos M.",
      role: "Padel Doubles Player",
      avatar: "🎾",
      rating: 5,
      sport: "Padel",
    },
    {
      quote:
        "I coach 12 padel pairs and this tool lets me see each team's progress at a glance. The sharing feature is a lifesaver.",
      author: "Coach Ana R.",
      role: "Padel Academy Director",
      avatar: "🏆",
      rating: 5,
      sport: "Padel",
    },
    {
      quote:
        "Tracking net approaches and lob patterns in padel has given us a real tactical edge. We've climbed two league positions!",
      author: "James & Tom W.",
      role: "Competitive Padel Pair",
      avatar: "⭐",
      rating: 5,
      sport: "Padel",
    },
    {
      quote:
        "Pickleball is growing so fast and Sports Journal is the only app that truly gets our sport. Love the dink tracking insights!",
      author: "Sarah B.",
      role: "Senior Pickleball Pro",
      avatar: "🥒",
      rating: 5,
      sport: "Pickleball",
    },
    {
      quote:
        "My kitchen game improved dramatically once I started logging what works. The pattern recognition is spot on for pickleball.",
      author: "Coach Rick D.",
      role: "Pickleball Instructor",
      avatar: "🏆",
      rating: 5,
      sport: "Pickleball",
    },
    {
      quote:
        "From rec play to tournament wins — Sports Journal helped me take my pickleball seriously. The mental game tracking is key.",
      author: "Linda P.",
      role: "Tournament Pickleball Player",
      avatar: "⭐",
      rating: 5,
      sport: "Pickleball",
    },
    {
      quote:
        "Badminton requires such fast reflexes — reviewing my journal entries helps me spot patterns I'd never notice in real-time.",
      author: "Anika S.",
      role: "National Badminton Squad",
      avatar: "🏸",
      rating: 5,
      sport: "Badminton",
    },
    {
      quote:
        "The smash and drop shot analytics are perfect for badminton. My players love seeing their improvement visualized.",
      author: "Coach Tan W.",
      role: "Badminton Performance Coach",
      avatar: "🏆",
      rating: 5,
      sport: "Badminton",
    },
    {
      quote:
        "I've been playing badminton for 15 years and wish I'd had this tool from the start. The opponent profiling is brilliant.",
      author: "Raj M.",
      role: "Veteran Badminton Player",
      avatar: "⭐",
      rating: 5,
      sport: "Badminton",
    },
    {
      quote:
        "Squash is so mentally demanding. The pre-match prep and post-match reflection tools have transformed my approach to big matches.",
      author: "Oliver H.",
      role: "County Squash Player",
      avatar: "⚫",
      rating: 5,
      sport: "Squash",
    },
    {
      quote:
        "Tracking fitness alongside match performance is crucial in squash. Sports Journal connects the dots beautifully.",
      author: "Coach Fatima A.",
      role: "Squash Academy Coach",
      avatar: "🏆",
      rating: 5,
      sport: "Squash",
    },
    {
      quote:
        "The T-position analytics and movement tracking insights have made me a much more efficient squash player. Highly recommend!",
      author: "Nathan C.",
      role: "Competitive Squash Player",
      avatar: "⭐",
      rating: 5,
      sport: "Squash",
    },
  ];

  const filteredTestimonials = testimonials.filter(t => t.sport === selectedSport);

  const benefits = [
    { icon: Rocket, text: "Get started in under 60 seconds" },
    { icon: Globe, text: "Works offline, syncs online" },
    { icon: Users, text: "100s athletes already improving" },
    { icon: Shield, text: "Your data stays private & secure" },
    { icon: Sparkles, text: "Free forever core features" },
    { icon: Clock, text: "email support provided" },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      <LandingHeader />
      
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

                {/* Sport badges - Interactive */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {sports.map((sport, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSportSelect(sport.name)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
                        selectedSport === sport.name
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent shadow-lg scale-105 text-white"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md text-gray-700"
                      }`}
                    >
                  <div className="flex h-9 w-9 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {sport.icon === "padel" ? (
                      <PadelIcon />
                    ) : sport.icon === "pickleball" ? (
                      <PickleballIcon />
                    ) : (
                      <span className="text-2xl">{sport.icon}</span>
                    )}
                  </div>
                      <span className={`text-sm font-medium ${
                        selectedSport === sport.name ? "text-white" : "text-gray-700"
                      }`}>
                        {sport.name}
                      </span>
                    </button>
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
                    onClick={() => setDemoOpen(true)}
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
                      <strong className="text-gray-900">100s</strong> athletes
                    </span>
                  </div>
                </div>
              </div>

              {/* Right - Dynamic Sport-Specific Hero Visual */}
              <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className={`relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  {/* Sport-themed gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentHero.gradient} transition-all duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />
                  
                  {/* Large sport emoji */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[120px] sm:text-[160px] lg:text-[200px] opacity-20 select-none">
                      {currentHero.emoji}
                    </span>
                  </div>

                  {/* Sport name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="text-white">
                      <div className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">Now Viewing</div>
                      <div className="text-4xl sm:text-5xl font-extrabold mb-2">{selectedSport}</div>
                      <div className="text-lg opacity-90 max-w-sm">{currentHero.tagline}</div>
                    </div>
                  </div>

                  {/* Decorative circles */}
                  <div className="absolute top-8 right-8 w-24 h-24 border-2 border-white/20 rounded-full" />
                  <div className="absolute top-12 right-12 w-16 h-16 border-2 border-white/10 rounded-full" />
                </div>

                {/* Floating elements - dynamic per sport */}
                <div className={`absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float transition-all duration-500 ${isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center`}>
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{currentHero.scoreLabel}</div>
                      <div className="text-xs text-gray-600">{currentHero.scoreExample}</div>
                    </div>
                  </div>
                </div>

                <div className={`absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`} style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{currentHero.statLabel}</div>
                      <div className="text-xs text-gray-600">{currentHero.statValue}</div>
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
      <section id="features" className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
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
      <section id="how-it-works" className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
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

      {/* Testimonials - Sport-Filtered */}
      <section id="testimonials" className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              Athletes Love Sports Journal
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real athletes seeing real results
            </p>

            {/* Sport filter pills for testimonials */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {sports.map((sport, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSportSelect(sport.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedSport === sport.name
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <span className="text-base">
                    {sport.icon === "padel" ? "🎾" : sport.icon === "pickleball" ? "🥒" : sport.icon}
                  </span>
                  {sport.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {filteredTestimonials.map((testimonial, idx) => (
              <Card
                key={`${selectedSport}-${idx}`}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white relative overflow-hidden animate-fade-in"
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

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Simple Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              Start Free, Grow Forever
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Powerful features that grow with your athletic journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600" />
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Free</h3>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    $0<span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600">Perfect for getting started</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited match logging",
                    "Basic analytics dashboard", 
                    "5 opponent profiles",
                    "Mobile app access",
                    "Offline tracking"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => navigate("/register")}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3"
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-blue-500 bg-white relative overflow-hidden scale-105">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
              <div className="absolute top-4 right-4">
                <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Pro</h3>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    $9<span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600">For serious athletes</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Free",
                    "Advanced analytics & insights",
                    "Unlimited opponent profiles", 
                    "Video analysis tools",
                    "Coach sharing & collaboration",
                    "Priority support",
                    "Export data & reports"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => navigate("/register")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 shadow-lg"
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {/* Team Plan */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Team</h3>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    $29<span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600">For coaches & teams</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Pro",
                    "Up to 20 athletes",
                    "Team analytics dashboard",
                    "Bulk data management",
                    "Custom training templates",
                    "API access",
                    "Dedicated support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => navigate("/register")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              <strong className="text-gray-900">30-day money-back guarantee</strong> on all paid plans
            </p>
            <p className="text-sm text-gray-500">
              No hidden fees • Cancel anytime • All plans include core features
            </p>
          </div>
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
              { q: "Is Sports Journal really free?", a: "Yes! Core features are free forever — including unlimited match logging, basic analytics, up to 5 opponent profiles, and full mobile access. Our Pro and Team plans offer advanced features like AI-powered coaching insights, detailed video analysis, and team management tools for competitive athletes. See our pricing page for a full comparison. You'll never lose access to the features you already use.", link: "/pricing" },
              { q: "Can I track multiple sports?", a: "Absolutely! Sports Journal supports tennis, padel, pickleball, table tennis, badminton, and squash. You can switch between sports seamlessly from your dashboard, and each sport has its own tailored scoring system, analytics, and performance metrics. All your data travels with you — no need for separate apps." },
              { q: "How do I share with my coach?", a: "Sharing is built right in. From any match or analytics page, tap the Share button to send a detailed summary via WhatsApp, email, or a shareable link. Your coach gets a clean, readable view of your scores, notes, and performance trends — no account required on their end. Direct coach-player messaging is coming soon!" },
              { q: "Does it work offline?", a: "Yes — Sports Journal is designed for real-world conditions, including venues with spotty Wi-Fi. You can log full match details, scores, and notes while completely offline. Once you reconnect, everything syncs automatically to your account in the background. No data is ever lost, making it perfect for tournaments and away matches." },
              { q: "What devices are supported?", a: "Sports Journal works on any device with a modern web browser — phones, tablets, laptops, and desktops. The interface adapts to your screen size so you get a great experience whether you're courtside on your phone or reviewing analytics on your laptop at home. No app download required." },
              { q: "Can I import past match data?", a: "Yes! If you have historical match data in spreadsheets or other formats, our support team can help you bulk-import it so your full playing history is in one place from day one. Just reach out to support@sportsjournal.com with your data and we'll handle the rest — typically within 48 hours." },
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
                  {faq.link && (
                    <button
                      onClick={() => navigate(faq.link!)}
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 transition-colors"
                    >
                      View Pricing →
                    </button>
                  )}
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
              className="border-2 border-white bg-transparent text-white hover:bg-white/10 px-10 py-7 text-xl font-semibold rounded-2xl transition-all duration-300"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>

          {/* Trust indicators - Hidden for now */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16 opacity-90">
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
          </div> */}
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
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="text-gray-400 hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2026 Sports Journal. Built with ❤️ for athletes who refuse to settle.
            </p>
          </div>
        </div>
      </footer>

      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
};

export default Landing;
