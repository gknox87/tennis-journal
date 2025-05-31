
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Share2, 
  Smartphone, 
  ChevronRight, 
  Mail, 
  MessageCircle, 
  Trophy,
  Target,
  TrendingUp,
  Users,
  Calendar,
  BookOpen,
  Zap,
  Star,
  CheckCircle,
  Brain,
  BarChart3,
  MessageSquare
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Pre-Match Preparation",
      description: "Plan each match like a pro. Set your goals, strategies, and focus points before you hit the court.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Post-Match Journaling",
      description: "Reflect and learn from every match. Quick structured debrief that turns every win or loss into valuable insight.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Users,
      title: "Opponent Tracking & Analysis",
      description: "Build a personal playbook on every rival. Know their game as well as you know your own.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Training & Practice Notes",
      description: "Bring match insights to the practice court. Every training session becomes more purposeful.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: BarChart3,
      title: "Stats & Progress Tracking",
      description: "Visualize your progress with charts and see your hard work pay off over weeks and months.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Calendar,
      title: "Tournament Scheduler",
      description: "Never miss an important match. Keep all your competition dates organized in one place.",
      color: "from-emerald-500 to-green-500"
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "Performance + Mindset in One",
      description: "Capture both your match stats and your mental game notes in a single app. Get a complete picture of your game."
    },
    {
      icon: Trophy,
      title: "Built for Competitors",
      description: "Designed for junior champs, weekend warriors, and coaches. A tool that inspires continual improvement."
    },
    {
      icon: TrendingUp,
      title: "Continuous Improvement",
      description: "Spot patterns and track progress over time. Every match and practice becomes a stepping stone toward your goals."
    },
    {
      icon: MessageSquare,
      title: "Coach & Parent Support",
      description: "Easily share your journals and stats at the tap of a button. Direct in-app coach communication coming soon!"
    }
  ];

  const testimonials = [
    {
      quote: "I used to struggle to get my son to reflect on matches. Now he actually enjoys logging into Tennis Pal and comes off the court more confident and focused for the next match.",
      author: "Michael, Tennis Parent",
      role: "Parent"
    },
    {
      quote: "As a coach, I love seeing my players' journal entries. It's like being courtside even when I can't be there, and it helps me tailor our training sessions to what they really need.",
      author: "Coach Maria",
      role: "Professional Coach"
    },
    {
      quote: "I've started winning matches I used to lose. The difference? Better preparation and reflection after every match. This app makes improving feel fun, and the results show on court.",
      author: "David, Adult Competitor",
      role: "Competitive Player"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="gradient-text">Tennis Pal:</span><br />
                  Track Performance, Master Your Mindset
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Track your matches, train your mind, and watch your tennis game reach new heights. Tennis Pal is the journaling and performance tracking app for players who never stop improving.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="btn-primary text-lg px-8 py-4"
                  onClick={() => navigate("/register")}
                >
                  Get Started – It's Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4 border-2"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Start turning every match into a learning opportunity</span>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 z-10"></div>
              <img 
                src="/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png" 
                alt="Tennis player using Tennis Pal app on court" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Tennis Pal Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Tennis Pal?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Combines data-driven stats with personal reflections to help you play smarter and win with confidence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features & Use Cases</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to elevate your tennis game, from preparation to performance tracking
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:bg-gradient-to-br hover:from-white hover:to-gray-50">
                  <div className={`h-16 w-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Share and Collaborate Highlight */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Share2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Share and Collaborate</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Keep your support team in the loop. With one tap, share your match journal or stats via WhatsApp or email – perfect for updating your coach, parent, or training partner.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-lg opacity-90">
                <strong>Coming Soon:</strong> Direct coach-player chat so your coach can message you feedback right in the app! 🚀
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Players and Coaches Are Saying</h2>
            <p className="text-lg text-muted-foreground">Real feedback from our tennis community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <footer>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </footer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Track",
                description: "Quickly record match scores, key stats, and mental game notes in one place.",
                icon: <BarChart3 className="h-8 w-8" />,
                step: "01"
              },
              {
                title: "Analyze",
                description: "Review your performance trends with clear analytics and identify patterns.",
                icon: <TrendingUp className="h-8 w-8" />,
                step: "02"
              },
              {
                title: "Improve",
                description: "Use insights to prepare better and share progress with your support team.",
                icon: <Trophy className="h-8 w-8" />,
                step: "03"
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="relative mb-8">
                  <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Every match is part of your journey – start using Tennis Pal to make each one count. Join a growing community of passionate tennis players who are committed to continual improvement and self-awareness on the court and off.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg px-8 py-4"
                onClick={() => navigate("/register")}
              >
                Start Your Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="text-center text-gray-400">
              🏆🎾 Transform your tennis journey today!
            </div>
            <div className="flex justify-center gap-6 mt-8">
              <MessageCircle className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Mail className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
