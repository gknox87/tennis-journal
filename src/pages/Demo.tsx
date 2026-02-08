import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import {
  Play,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Trophy,
  Smartphone,
  BarChart3,
  Target,
  BookOpen,
  Calendar,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const Demo = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);

  const demoScreens = [
    {
      title: "Match Logging",
      description: "Quickly log your matches with smart templates",
      image: "/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png",
      features: [
        "Intuitive match entry",
        "Score tracking",
        "Performance ratings",
        "Instant insights"
      ]
    },
    {
      title: "Analytics Dashboard",
      description: "Visualize your progress with powerful analytics",
      image: "/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png",
      features: [
        "Win rate trends",
        "Performance metrics",
        "Progress charts",
        "Statistical insights"
      ]
    },
    {
      title: "Opponent Tracking",
      description: "Build detailed profiles of your competitors",
      image: "/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png",
      features: [
        "Match history",
        "Playing style notes",
        "Weakness tracking",
        "Strategic insights"
      ]
    },
    {
      title: "Training Journal",
      description: "Connect practice sessions to match performance",
      image: "/lovable-uploads/008aa3aa-1776-43dd-9916-f0b8fd2a8faa.png",
      features: [
        "Session logging",
        "Drill effectiveness",
        "Progress correlation",
        "Improvement tracking"
      ]
    }
  ];

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % demoScreens.length);
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + demoScreens.length) % demoScreens.length);
  };

  const goToScreen = (index: number) => {
    setCurrentScreen(index);
  };

  const currentDemoScreen = demoScreens[currentScreen];

  return (
    <div className="min-h-screen w-full bg-white">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
              See Sports Journal
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                In Action
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Take an interactive tour of the features that will transform your athletic performance
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Demo Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                  {currentDemoScreen.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {currentDemoScreen.description}
                </p>
              </div>

              <div className="space-y-4">
                {currentDemoScreen.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevScreen}
                  className="border-2 border-gray-300 hover:border-blue-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex gap-2">
                  {demoScreens.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToScreen(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        idx === currentScreen
                          ? "bg-blue-600 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextScreen}
                  className="border-2 border-gray-300 hover:border-blue-500"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Right - Demo Image */}
            <div className="relative">
              <div className="aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-900 relative">
                <img
                  src={currentDemoScreen.image}
                  alt={currentDemoScreen.title}
                  className="w-full h-full object-cover"
                />
                {/* Phone Frame Overlay */}
                <div className="absolute inset-0 border-8 border-gray-900 rounded-3xl pointer-events-none" />
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl" />
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Match Complete!</div>
                    <div className="text-xs text-gray-600">Stats saved</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Insights Ready</div>
                    <div className="text-xs text-gray-600">View analysis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for serious athletes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Target,
                title: "Smart Match Logging",
                description: "Quick, intuitive entry with intelligent prompts and auto-completion"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep insights into your performance trends and patterns"
              },
              {
                icon: BookOpen,
                title: "Performance Journal",
                description: "Structured reflection to capture learning moments"
              },
              {
                icon: Calendar,
                title: "Tournament Planning",
                description: "Never miss a match with smart scheduling and reminders"
              },
              {
                icon: Users,
                title: "Coach Collaboration",
                description: "Share insights and get feedback from your coaching team"
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                description: "Works seamlessly on your phone, tablet, and desktop"
              }
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white"
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
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

      {/* Testimonials */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Loved by Athletes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "Sports Journal transformed how I approach tennis. The analytics help me identify patterns I never noticed before.",
                author: "Sarah M.",
                role: "College Tennis Player",
                rating: 5,
                avatar: "🎾"
              },
              {
                quote: "As a coach, this tool is invaluable. I can see my players' progress and provide targeted feedback.",
                author: "Coach David L.",
                role: "High School Coach",
                rating: 5,
                avatar: "🏆"
              },
              {
                quote: "The opponent tracking feature is my secret weapon. I go into matches knowing exactly what to expect.",
                author: "Mike R.",
                role: "Competitive Player",
                rating: 5,
                avatar: "⭐"
              }
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <div className="text-3xl">{testimonial.avatar}</div>
                  </div>
                  <blockquote className="text-sm text-gray-700 mb-4 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="font-bold text-gray-900 text-sm">{testimonial.author}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 md:px-12 lg:px-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-95">
            Join thousands of athletes who are already tracking their way to victory
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 group"
            >
              Start Free Journey
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="border-2 border-white text-white hover:bg-white/10 px-10 py-7 text-xl font-semibold rounded-2xl transition-all duration-300"
            >
              View Pricing
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-80">No credit card required • Free forever core features</p>
        </div>
      </section>
    </div>
  );
};

export default Demo;
