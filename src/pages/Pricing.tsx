import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import {
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Crown,
  Building,
} from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Free",
      price: 0,
      period: "/month",
      description: "Perfect for getting started",
      icon: Sparkles,
      gradient: "from-gray-600 to-gray-800",
      borderColor: "border-gray-200",
      popular: false,
      features: [
        "10 matches per month",
        "3 key opponent profiles",
        "Basic analytics dashboard",
        "Training load (view only)",
        "Basic wellness tracking",
        "Mobile app access",
        "Offline tracking",
        "Basic reflection prompts"
      ],
      limitations: [
        "No coach sharing",
        "No AI analysis",
        "No data export"
      ]
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? 9 : 7,
      period: billingCycle === "monthly" ? "/month" : "/month (billed annually)",
      description: "For serious athletes",
      icon: Crown,
      gradient: "from-blue-600 to-purple-600",
      borderColor: "border-blue-500",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited match logging",
        "Unlimited key opponents",
        "Advanced analytics & insights",
        "Full training load access",
        "Full wellness tracking",
        "Coach sharing & collaboration",
        "AI match analysis",
        "Export data & reports",
        "Custom reflection prompts",
        "Priority support"
      ],
      limitations: []
    },
    {
      name: "Team",
      price: billingCycle === "monthly" ? 29 : 25,
      period: billingCycle === "monthly" ? "/month" : "/month (billed annually)",
      description: "For coaches & teams",
      icon: Building,
      gradient: "from-purple-600 to-pink-600",
      borderColor: "border-purple-500",
      popular: false,
      features: [
        "Everything in Pro",
        "Unlimited players & coaches",
        "Team analytics dashboard",
        "Bulk data management",
        "Custom training templates",
        "API access",
        "Dedicated support",
        "White-label options",
        "Advanced reporting",
        "Team communication tools"
      ],
      limitations: []
    }
  ];

  const savings = billingCycle === "annual" ? "Save 20% with annual billing" : "";

  return (
    <div className="min-h-screen w-full bg-white">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
              Simple, Transparent
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                Pricing
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Start free, upgrade when you need more power. No hidden fees.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === "annual"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {savings && (
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                <Zap className="w-4 h-4" />
                {savings}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 ${plan.borderColor} bg-white relative overflow-hidden ${
                  plan.popular ? "scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.gradient}`} />
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className={`h-16 w-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                    <div className="text-4xl font-black text-gray-900 mb-2">
                      ${plan.price}<span className="text-lg font-normal text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitIdx) => (
                      <li key={limitIdx} className="flex items-center gap-3 opacity-60">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => navigate("/register")}
                    className={`w-full font-medium py-3 transition-all duration-300 ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.gradient} hover:shadow-lg transform hover:scale-105 text-white`
                        : plan.name === "Free"
                        ? "bg-gray-900 hover:bg-gray-800 text-white"
                        : `bg-gradient-to-r ${plan.gradient} hover:shadow-lg text-white`
                    }`}
                  >
                    {plan.name === "Free" ? "Start Free" : plan.name === "Team" ? "Contact Sales" : "Start Pro Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
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

      {/* Feature Comparison */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Compare Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See exactly what you get with each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="font-semibold text-gray-900">Feature</div>
              <div className="text-center font-semibold text-gray-900">Free</div>
              <div className="text-center font-semibold text-gray-900">Pro</div>
              <div className="text-center font-semibold text-gray-900">Team</div>
            </div>
            
            {[
              { feature: "Match Logging", free: "10/month", pro: "Unlimited", team: "Unlimited" },
              { feature: "Key Opponents", free: "3", pro: "Unlimited", team: "Unlimited" },
              { feature: "Basic Analytics", free: true, pro: true, team: true },
              { feature: "Training Load", free: "View only", pro: "Full", team: "Full" },
              { feature: "Wellness Tracking", free: "Basic", pro: "Full", team: "Full" },
              { feature: "Coach Sharing", free: false, pro: true, team: true },
              { feature: "AI Match Analysis", free: false, pro: true, team: true },
              { feature: "Export Data", free: false, pro: true, team: true },
              { feature: "Team Management", free: false, pro: false, team: true },
              { feature: "API Access", free: false, pro: false, team: true },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4 p-6 border-b border-gray-100 last:border-b-0">
                <div className="font-medium text-gray-900">{row.feature}</div>
                {[row.free, row.pro, row.team].map((val, colIdx) => (
                  <div key={colIdx} className="text-center">
                    {val === true ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : val === false ? (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 mx-auto" />
                    ) : (
                      <span className="text-gray-700">{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 md:px-12 lg:px-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-95">
            Join thousands of athletes who are already tracking their way to victory
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 group"
          >
            Start Your Free Journey
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>
          <p className="text-sm mt-6 opacity-80">No credit card required • Free forever core features</p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
