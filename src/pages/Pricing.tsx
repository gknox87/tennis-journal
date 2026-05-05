import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, Sparkles, Crown, Zap } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const { isTrial, startTrial, isProPlan, isFreePlan } = useSubscription();

  const handleStartTrial = async () => {
    try {
      await startTrial();
      toast({
        title: "Trial started! 🎉",
        description: "You have 14 days of Pro access. No credit card needed.",
      });
    } catch {
      toast({ title: "Error", description: "Failed to start trial. Try again.", variant: "destructive" });
    }
  };

  const plans = [
    {
      name: "Starter",
      price: 0,
      period: "/month forever",
      description: "Get hooked. Track every match. Build the habit.",
      icon: Sparkles,
      gradient: "from-gray-600 to-gray-800",
      borderColor: "border-gray-200",
      popular: false,
      features: [
        "Unlimited match & session logging",
        "Basic stats dashboard",
        "3 key opponent profiles",
        "Journaling streaks & badges",
        "Basic reflection prompts",
        "Training load (view)",
        "Wellness check-ins",
        "Injury tracker",
        "Calendar view",
        "Offline / PWA access",
      ],
      limitations: [
        "AI analysis: 3/month",
        "Video analysis: 2/month",
        "Coach sharing: unavailable",
        "Data export: unavailable",
        "Advanced analytics: locked",
      ],
      cta: isFreePlan ? "You're on Starter" : isTrial ? "On Trial" : isProPlan ? "Downgrade" : "Start Free",
      ctaAction: () => navigate("/register"),
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? 7.99 : 5.75,
      period: billingCycle === "monthly" ? "/month" : "/month (billed £69/year)",
      description: "Unlock the full power. AI insights, video, and more.",
      icon: Crown,
      gradient: "from-blue-600 to-purple-600",
      borderColor: "border-blue-500",
      popular: true,
      features: [
        "Everything in Starter",
        "Unlimited AI match analysis",
        "Unlimited video analysis",
        "Full advanced analytics",
        "Unlimited key opponents",
        "Coach sharing & collaboration",
        "Data export (CSV + PDF)",
        "Custom reflection prompts",
        "Full training load tools",
        "Wellness correlation insights",
        "Priority support",
        "Early access to new features",
      ],
      limitations: [],
      cta: isTrial
        ? `${billingCycle === "annual" ? "£69/year" : "£7.99/mo"} — Subscribe`
        : isProPlan
        ? "You're Pro"
        : "Start 14-Day Free Trial",
      ctaAction: isProPlan ? () => {} : isTrial ? () => {} : handleStartTrial,
    },
  ];

  const savings = billingCycle === "annual" ? (
    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
      <Zap className="w-4 h-4" />
      Save 28% with annual — £69/yr
    </span>
  ) : null;

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
              One generous free plan. One clear paid plan. No hidden fees.
            </p>
          </div>

          {/* Trial banner */}
          {isFreePlan && (
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">
                  Try Pro free for 14 days — no credit card required
                </span>
              </div>
            </div>
          )}

          {isTrial && (
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
                <Crown className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">
                  Trial active — {useSubscription().trialDaysLeft} days remaining
                </span>
              </div>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
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

          {savings && <div className="text-center mb-8">{savings}</div>}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 ${plan.borderColor} bg-white relative overflow-hidden ${
                  plan.popular ? "scale-105 lg:scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      BEST VALUE
                    </div>
                  </div>
                )}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.gradient}`} />
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className={`h-16 w-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                    <div className="text-4xl font-black text-gray-900 mb-2">
                      £{plan.price}<span className="text-lg font-normal text-gray-600">{plan.period}</span>
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
                    onClick={plan.ctaAction}
                    className={`w-full font-medium py-3 transition-all duration-300 ${
                      isProPlan && idx === 1
                        ? "bg-green-500 hover:bg-green-600 text-white cursor-default"
                        : plan.popular
                        ? `bg-gradient-to-r ${plan.gradient} hover:shadow-lg transform hover:scale-105 text-white`
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                    disabled={isProPlan && idx === 1}
                  >
                    {plan.cta}
                    {isFreePlan && idx === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-gray-500">
              No credit card required for trial · Cancel anytime · All plan features include core app
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2 text-gray-900">Compare Features</h2>
            <p className="text-lg text-gray-600">See exactly what you get with each plan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
              <div>Feature</div>
              <div className="text-center">Starter</div>
              <div className="text-center">Pro</div>
            </div>

            {[
              { feature: "Match Logging", free: "Unlimited", pro: "Unlimited" },
              { feature: "Key Opponents", free: "3", pro: "Unlimited" },
              { feature: "Basic Analytics", free: true, pro: true },
              { feature: "Training Load", free: "View", pro: "Full" },
              { feature: "Wellness Tracking", free: "Basic", pro: "Full + insights" },
              { feature: "AI Match Analysis", free: "3/month", pro: "Unlimited" },
              { feature: "Video Analysis", free: "2/month", pro: "Unlimited" },
              { feature: "Coach Sharing", free: false, pro: true },
              { feature: "Export Data (CSV/PDF)", free: false, pro: true },
              { feature: "Custom Reflection Prompts", free: false, pro: true },
              { feature: "Advanced Analytics", free: false, pro: true },
              { feature: "Badges & Gamification", free: true, pro: true },
              { feature: "Offline / PWA", free: true, pro: true },
              { feature: "Priority Support", free: false, pro: true },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100 last:border-b-0">
                <div className="font-medium text-gray-900 text-sm">{row.feature}</div>
                {[row.free, row.pro].map((val, colIdx) => (
                  <div key={colIdx} className="text-center">
                    {val === true ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : val === false ? (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 mx-auto" />
                    ) : (
                      <span className="text-sm text-gray-700">{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Go Pro?</h2>
          <p className="text-lg opacity-95 mb-8">
            Start your 14-day free trial. No credit card. Full access. Cancel anytime.
          </p>
          <Button
            size="lg"
            onClick={isFreePlan ? handleStartTrial : () => navigate("/dashboard")}
            className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300"
          >
            {isFreePlan ? "Start Free 14-Day Pro Trial" : "Go to Dashboard"}
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          <p className="text-sm mt-4 opacity-80">Free forever core features · No credit card required</p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
