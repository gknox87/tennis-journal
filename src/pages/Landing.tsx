import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Share2, Smartphone, ChevronRight, Mail, MessageCircle, Target, Brain, TrendingUp, Users, Calendar, BarChart3, BookOpen, Trophy, Zap, CheckCircle, Star, Play, Award, Activity } from "lucide-react";
const Landing = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-700 mb-4">
                  <Trophy className="w-4 h-4 mr-2" />
                  #1 Tennis Performance Tracker
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Tennis Pal: Track Performance, Master Your Mindset
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Track your matches, train your mind, and watch your tennis game reach new heights. Tennis Pal is the journaling and performance tracking app for players who never stop improving.
                </p>
                <p className="text-base md:text-lg text-gray-500">
                  Whether you're a junior chasing trophies, a competitive adult, or a coach helping others succeed, Tennis Pal makes improvement feel exciting – not like homework.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/register")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started – It's Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg rounded-2xl transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  <span className="ml-2 text-sm text-gray-600">4.9/5 from 500+ players</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src="/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png" alt="Tennis player using Tennis Pal app on court" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="text-sm font-semibold">Match Won!</div>
                    <div className="text-xs text-gray-500">6-4, 6-2</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="text-sm font-semibold">Win Rate</div>
                    <div className="text-xs text-gray-500">+15% this month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Tennis Pal Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Why Choose Tennis Pal?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The complete solution for tennis players who are serious about improvement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Performance &amp; Mindset </h3>
                <p className="text-gray-600 leading-relaxed">
                  Capture both your match stats and your mental game notes in a single app. Get a complete picture of your game, from first-serve percentage to how you felt in the tiebreaker.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Built for Competitors</h3>
                <p className="text-gray-600 leading-relaxed">
                  Designed for junior champs, weekend warriors, and coaches. Motivating and player-friendly – it inspires continual improvement without feeling like a chore.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Continuous Improvement</h3>
                <p className="text-gray-600 leading-relaxed">
                  Spot patterns and track progress over time. Every match and practice becomes a stepping stone toward your goals with detailed analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Coach & Parent Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Easily share journals and stats with coaches or parents. Get feedback via WhatsApp/email, with direct in-app communication coming soon.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Key Features & Use Cases
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to elevate your tennis game
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            icon: Target,
            title: "Pre-Match Preparation",
            description: "Plan each match like a pro. Set your goals, strategies, and focus points before you hit the court. Review past notes on upcoming opponents and walk on with a clear game plan and confident mindset.",
            color: "from-blue-500 to-blue-600"
          }, {
            icon: BookOpen,
            title: "Post-Match Journaling",
            description: "Reflect and learn from every match. Quickly log the outcome, key stats, and your thoughts on what went well or where you struggled. A fast, structured post-match debrief while the memory is fresh.",
            color: "from-green-500 to-green-600"
          }, {
            icon: Users,
            title: "Opponent Tracking & Analysis",
            description: "Build a personal playbook on every rival. Record each opponent's playing style, strengths, weaknesses, and patterns. It's like having a secret weapon for your next match.",
            color: "from-purple-500 to-purple-600"
          }, {
            icon: Zap,
            title: "Training & Practice Notes",
            description: "Bring match insights to the practice court. Keep a log of your training sessions and tie your practice goals to your match feedback for more purposeful training.",
            color: "from-orange-500 to-orange-600"
          }, {
            icon: BarChart3,
            title: "Stats & Progress Tracking",
            description: "Stay on top of your performance numbers. Track your wins and losses and visualize your progress with simple graphs and charts. See your hard work pay off over time.",
            color: "from-red-500 to-red-600"
          }, {
            icon: Calendar,
            title: "Tournament Scheduler",
            description: "Never miss an important match. Use the built-in calendar to schedule upcoming tournaments and keep all your competition dates in one place with linked journal entries.",
            color: "from-teal-500 to-teal-600"
          }].map((feature, index) => <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white">
                <CardContent className="p-8">
                  <div className={`h-16 w-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Share and Collaborate Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-20 w-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Share2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Share and Collaborate</h2>
            <p className="text-xl mb-8 leading-relaxed opacity-90">
              Keep your support team in the loop. With one tap, share your match journal or stats via WhatsApp or email – perfect for updating your coach, parent, or training partner.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-lg italic">
                💡 Coming soon: Direct coach-player chat right in the app for instant feedback!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              What Players and Coaches Are Saying
            </h2>
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            quote: "I used to struggle to get my son to reflect on matches. Now he actually enjoys logging into Tennis Pal and comes off the court more confident and focused for the next match.",
            author: "Michael, Tennis Parent",
            avatar: "🎾"
          }, {
            quote: "As a coach, I love seeing my players' journal entries. It's like being courtside even when I can't be there, and it helps me tailor our training sessions to what they really need.",
            author: "Coach Maria",
            avatar: "🏆"
          }, {
            quote: "I've started winning matches I used to lose. The difference? Better preparation and reflection after every match. This app makes improving feel fun, and the results show on court.",
            author: "David, Adult Competitor",
            avatar: "⭐"
          }].map((testimonial, index) => <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <blockquote className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Elevate Your Game?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
            Every match is part of your journey – start using Tennis Pal to make each one count. Join a growing community of passionate tennis players committed to continual improvement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Button size="lg" onClick={() => navigate("/register")} className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-4 text-xl font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl">
              Start Your Free Trial
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2 text-2xl">
              <Trophy className="w-8 h-8" />
              <span>🎾</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[{
            number: "500+",
            label: "Happy Players"
          }, {
            number: "10k+",
            label: "Matches Tracked"
          }, {
            number: "4.9",
            label: "App Rating"
          }, {
            number: "25+",
            label: "Countries"
          }].map((stat, index) => <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Transform Your Tennis Journey Today!
            </h3>
            <div className="flex justify-center gap-6">
              <MessageCircle className="h-8 w-8 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors transform hover:scale-110" />
              <Mail className="h-8 w-8 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors transform hover:scale-110" />
            </div>
            <p className="text-sm text-gray-400">© 2024 Tennis Pal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;