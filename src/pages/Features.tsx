import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import {
  Target,
  BookOpen,
  Shield,
  Zap,
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Brain,
  Trophy,
} from "lucide-react";

const Features = () => {
  const navigate = useNavigate();

  const coreFeatures = [
    {
      icon: Target,
      emoji: "🎯",
      title: "Pre-Match Prep",
      description:
        "Plan like a pro. Set goals, review opponent notes, step onto court with unshakeable confidence.",
      color: "text-blue-500",
      bg: "bg-blue-50",
      details: [
        "Match goal setting",
        "Opponent scouting reports",
        "Tactical planning tools",
        "Pre-match checklists"
      ]
    },
    {
      icon: BookOpen,
      emoji: "📖",
      title: "Post-Match Journal",
      description:
        "Reflect while fresh. Quick, structured debriefs capture learning moments. Build your personal playbook.",
      color: "text-green-500",
      bg: "bg-green-50",
      details: [
        "Structured reflection prompts",
        "Performance ratings",
        "Key insights capture",
        "Emotional state tracking"
      ]
    },
    {
      icon: Shield,
      emoji: "🛡️",
      title: "Opponent Intel",
      description:
        "Your secret weapon: database of every rival's style, weaknesses, patterns. Know them better than themselves.",
      color: "text-purple-500",
      bg: "bg-purple-50",
      details: [
        "Unlimited opponent profiles",
        "Match history tracking",
        "Pattern recognition",
        "Weakness identification"
      ]
    },
    {
      icon: Zap,
      emoji: "⚡",
      title: "Training Link",
      description:
        "Connect practice to performance. Log sessions and link to match insights for purposeful improvement.",
      color: "text-orange-500",
      bg: "bg-orange-50",
      details: [
        "Training session logging",
        "Practice-to-match correlation",
        "Drill effectiveness tracking",
        "Progress monitoring"
      ]
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Smart Analytics",
      description:
        "Watch hard work pay off with clean graphs, win-rate tracking. Data that motivates, not overwhelms.",
      color: "text-red-500",
      bg: "bg-red-50",
      details: [
        "Win rate trends",
        "Performance metrics",
        "Progress visualization",
        "Statistical insights"
      ]
    },
    {
      icon: Calendar,
      emoji: "📅",
      title: "Tournament Hub",
      description:
        "Never miss a match. Calendar keeps all competition dates organized with entries and countdown timers.",
      color: "text-teal-500",
      bg: "bg-teal-50",
      details: [
        "Tournament scheduling",
        "Match countdowns",
        "Travel planning",
        "Result tracking"
      ]
    }
  ];

  const advancedFeatures = [
    {
      icon: Brain,
      title: "Mental Game Tracking",
      description: "Monitor confidence levels, stress factors, and mental preparation strategies"
    },
    {
      icon: TrendingUp,
      title: "Performance Predictions",
      description: "AI-powered insights based on your historical data and trends"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share insights with coaches, get feedback, and track team progress"
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock badges and celebrate milestones in your athletic journey"
    }
  ];

  return (
    <div className="min-h-full w-full bg-white overflow-y-auto pb-24" pt-16>
      <LandingHeader />

      {/* Hero Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
              Powerful Features for
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                Peak Performance
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to track, analyze, and improve your athletic performance
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Core Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Six essential tools that work together seamlessly
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {coreFeatures.map((feature, idx) => (
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
                  <p className="text-base text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Premium features for serious athletes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {advancedFeatures.map((feature, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-200 bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-base text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
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
            Ready to Transform Your Game?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-95">
            Start using these powerful features today and see the difference in your performance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 group"
            >
              Start Free Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/demo")}
              className="border-2 border-white bg-transparent text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300"
            >
              See Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
