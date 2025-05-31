
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Share2, 
  Smartphone, 
  ChevronRight, 
  Mail, 
  MessageCircle, 
  Target, 
  Brain, 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3,
  BookOpen,
  Trophy,
  Zap,
  CheckCircle
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Tennis Pal: Track Performance, Master Your Mindset
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Track your matches, train your mind, and watch your tennis game reach new heights. Tennis Pal is the journaling and performance tracking app for players who never stop improving. It combines data-driven stats with personal reflections to help you play smarter and win with confidence.
              </p>
              <p className="text-base md:text-lg text-muted-foreground">
                Whether you're a junior chasing trophies, a competitive adult, or a coach helping others succeed, Tennis Pal makes improvement feel exciting – not like homework. Start turning every match into a learning opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/register")} className="btn-primary">
                  Get Started – It's Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Tennis Pal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance + Mindset in One</h3>
              <p className="text-muted-foreground">
                Capture both your match stats and your mental game notes in a single app. Tennis Pal gives you a complete picture of your game, from your first-serve percentage to how you felt in the tiebreaker.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Built for Competitors</h3>
              <p className="text-muted-foreground">
                Designed for junior champs, weekend warriors, and even coaches. The tone is motivating and player-friendly – it's a tool that inspires you to improve continually without ever feeling like a chore.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Continuous Improvement</h3>
              <p className="text-muted-foreground">
                Spot patterns and track progress over time. Identify what's working, fix what's not, and see your evolution through charts and journals. Every match and practice becomes a stepping stone toward your goals.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Coach & Parent Support</h3>
              <p className="text-muted-foreground">
                Easily share your journals and stats with coaches or parents at the tap of a button. Get the feedback you need now via WhatsApp/email, and stay tuned – direct in-app coach communication is coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Key Features & Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pre-Match Preparation</h3>
              <p className="text-muted-foreground">
                Plan each match like a pro. Set your goals, strategies, and focus points before you hit the court. Review past notes on upcoming opponents and walk on with a clear game plan and confident mindset.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Post-Match Journaling</h3>
              <p className="text-muted-foreground">
                Reflect and learn from every match. Quickly log the outcome, key stats, and your thoughts on what went well or where you struggled. It's a fast, structured post-match debrief that takes just a few minutes.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Opponent Tracking & Analysis</h3>
              <p className="text-muted-foreground">
                Build a personal playbook on every rival. Record each opponent's playing style, strengths, weaknesses, and patterns. It's like having a secret weapon for your next match.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Training & Practice Notes</h3>
              <p className="text-muted-foreground">
                Bring match insights to the practice court. Keep a log of your training sessions and tie your practice goals to your match feedback for more purposeful training.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Stats & Progress Tracking</h3>
              <p className="text-muted-foreground">
                Stay on top of your performance numbers. Track your wins and losses and visualize your progress with simple graphs and charts. See your hard work pay off over time.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tournament Scheduler</h3>
              <p className="text-muted-foreground">
                Never miss an important match. Use the built-in calendar to schedule upcoming tournaments and keep all your competition dates in one place with linked journal entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Share and Collaborate Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Share2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Share and Collaborate</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Keep your support team in the loop. With one tap, share your match journal or stats via WhatsApp or email – perfect for updating your coach, parent, or even a training partner. They can see what happened and help you plan what's next. Tennis Pal makes it easy to celebrate wins and analyze losses together.
            </p>
            <p className="text-base text-muted-foreground italic">
              Psst… direct coach-player chat is coming soon, so your coach can message you feedback right in the app!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Players and Coaches Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-lg shadow-sm border">
              <blockquote className="text-muted-foreground italic mb-4">
                "I used to struggle to get my son to reflect on matches. Now he actually enjoys logging into Tennis Pal and comes off the court more confident and focused for the next match."
              </blockquote>
              <footer className="font-semibold">– Michael, Tennis Parent</footer>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm border">
              <blockquote className="text-muted-foreground italic mb-4">
                "As a coach, I love seeing my players' journal entries. It's like being courtside even when I can't be there, and it helps me tailor our training sessions to what they really need."
              </blockquote>
              <footer className="font-semibold">– Coach Maria</footer>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm border">
              <blockquote className="text-muted-foreground italic mb-4">
                "I've started winning matches I used to lose. The difference? Better preparation and reflection after every match. This app makes improving feel fun, and the results show on court."
              </blockquote>
              <footer className="font-semibold">– David, Adult Competitor</footer>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Elevate Your Game?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Every match is part of your journey – start using Tennis Pal to make each one count. Join a growing community of passionate tennis players who are committed to continual improvement and self-awareness on the court and off.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => navigate("/register")} className="btn-primary text-lg px-8 py-4">
              Start Your Free Trial
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <span className="text-2xl">🏆🎾</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">Transform Your Tennis Journey Today!</h3>
            <div className="flex justify-center gap-4">
              <MessageCircle className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Mail className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Tennis Pal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
