import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import { CheckCircle, ArrowRight, Trophy } from "lucide-react";

const features = [
  "Unlimited match & session logging",
  "Full advanced analytics",
  "Unlimited AI match analysis",
  "Unlimited video analysis",
  "Unlimited key opponents",
  "Coach sharing & collaboration",
  "Data export (CSV + PDF)",
  "Custom reflection prompts",
  "Full training load tools",
  "Wellness correlation insights",
  "Pattern detection & insights",
  "Badges & gamification",
  "Calendar view",
  "Injury tracker",
  "Offline / PWA access",
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full w-full bg-white overflow-y-auto pb-24">
      <LandingHeader />

      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
            Everything's
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
              Included Free
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Every feature, unlocked for everyone. No subscriptions, no paywalls, no hidden fees.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </section>

      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10 text-gray-900">
            All Features Included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
