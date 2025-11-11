import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Sparkles, Crown, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { tier, isPro, isCoach } = useSubscription();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const plans = [
    {
      name: "Free",
      price: "£0",
      period: "month",
      description: "Perfect for casual athletes getting started",
      icon: Sparkles,
      features: [
        "Track up to 10 matches per month",
        "Basic match statistics",
        "Training notes (up to 5 per month)",
        "Improvement notes (up to 5 per month)",
        "Calendar view",
        "Basic opponent tracking (up to 5)",
        "Single sport support",
        "Basic match history (last 3 months)",
      ],
      limitations: [
        "No video analysis",
        "No advanced analytics",
        "No export functionality",
        "Limited storage",
      ],
      cta: user ? (tier === 'free' ? "Current Plan" : "Downgrade") : "Get Started",
      highlight: false,
      popular: false,
    },
    {
      name: "Pro",
      price: "£9.99",
      period: "month",
      description: "For serious athletes and regular players",
      icon: Crown,
      features: [
        "Unlimited matches",
        "Unlimited training notes",
        "Unlimited improvement notes",
        "Unlimited opponent tracking",
        "Multi-sport support (all 18+ sports)",
        "Full match history (unlimited)",
        "Advanced statistics & analytics",
        "Video analysis (pose/racket/ball detection)",
        "Match export (CSV, PDF)",
        "Custom match notes",
        "Priority support",
        "Ad-free experience",
      ],
      limitations: [],
      cta: user ? (isPro ? "Current Plan" : "Upgrade to Pro") : "Start Free Trial",
      highlight: true,
      popular: true,
    },
    {
      name: "Coach",
      price: "£29.99",
      period: "month",
      description: "For coaches, clubs, and academies",
      icon: Users,
      features: [
        "Everything in Pro",
        "Manage multiple athletes (up to 10)",
        "Athlete performance comparison",
        "Team/group statistics",
        "Coach notes & feedback system",
        "Athlete progress reports",
        "Bulk match import",
        "API access (coming soon)",
        "White-label options (coming soon)",
        "Dedicated account manager",
      ],
      limitations: [],
      cta: user ? (isCoach ? "Current Plan" : "Upgrade to Coach") : "Contact Sales",
      highlight: false,
      popular: false,
    },
  ];

  const handleCtaClick = (planName: string) => {
    if (!user) {
      navigate("/register");
      return;
    }

    if (planName === "Free" && tier !== 'free') {
      // Handle downgrade
      navigate("/profile/subscription");
      return;
    }

    if (planName === "Pro" && !isPro) {
      // Handle upgrade to Pro
      // TODO: Integrate with Stripe checkout
      navigate("/profile/subscription");
      return;
    }

    if (planName === "Coach" && !isCoach) {
      // Handle upgrade to Coach
      // TODO: Integrate with Stripe checkout
      navigate("/profile/subscription");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your sports journey. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative p-8 flex flex-col ${
                  plan.highlight
                    ? "border-2 border-purple-500 shadow-2xl scale-105"
                    : "border border-gray-200 shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      plan.highlight
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        plan.highlight ? "text-white" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.name !== "Free" && (
                    <p className="text-sm text-gray-500 mt-1">
                      Save 17% with annual billing
                    </p>
                  )}
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <Button
                  onClick={() => handleCtaClick(plan.name)}
                  className={`w-full mb-6 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      : plan.name === "Free"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  variant={plan.name === "Free" ? "outline" : "default"}
                  disabled={
                    (plan.name === "Free" && tier === "free") ||
                    (plan.name === "Pro" && isPro) ||
                    (plan.name === "Coach" && isCoach)
                  }
                >
                  {plan.cta}
                  {!plan.cta.includes("Current") && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-4">Features:</h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Limitations:</h3>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-gray-500 text-sm">• {limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your data is always safe. When downgrading, you'll retain access to your historical data,
                but new features will be limited based on your new plan tier.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! New users can try Pro features free for 14 days. No credit card required.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;
