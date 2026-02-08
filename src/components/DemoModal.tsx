import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Target,
  BookOpen,
  BarChart3,
  Users,
  Shield,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Zap,
  Trophy,
  TrendingUp,
  Brain,
} from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const demoSteps = [
  {
    title: "Log Matches in Seconds",
    description:
      "After every match, quickly capture scores, opponent details, and how you felt. Structured prompts make it effortless — no blank-page syndrome.",
    icon: BookOpen,
    color: "text-green-600",
    bg: "bg-green-50",
    gradient: "from-green-500 to-emerald-500",
    mockup: (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3">
          <p className="text-white font-semibold text-sm">New Match Entry</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Opponent</span>
            <span className="text-sm font-semibold text-gray-800">Alex M.</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Score</span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">6-4</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">3-6</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">7-5</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Result</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">WIN ✓</span>
          </div>
          <div className="border-t pt-3">
            <span className="text-xs text-gray-500 font-medium block mb-1">Key Takeaway</span>
            <p className="text-xs text-gray-600 italic">"Stayed calm in the 3rd set tiebreak. Serve placement was key..."</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Pre-Match Game Plans",
    description:
      "Prepare like a pro before stepping on court. Review opponent tendencies, set tactical goals, and build mental confidence with structured prep notes.",
    icon: Target,
    color: "text-blue-600",
    bg: "bg-blue-50",
    gradient: "from-blue-500 to-cyan-500",
    mockup: (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
          <p className="text-white font-semibold text-sm">Pre-Match Plan</p>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <span className="text-xs text-gray-500 font-medium">vs. Alex M. — Saturday Final</span>
          </div>
          <div className="space-y-2">
            {[
              { text: "Target weak backhand on deuce side", done: true },
              { text: "Stay aggressive on 2nd serve returns", done: true },
              { text: "Use slice approach shots to net", done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${item.done ? "text-blue-500" : "text-gray-300"}`} />
                <span className={`text-xs ${item.done ? "text-gray-800" : "text-gray-500"}`}>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3">
            <span className="text-xs text-gray-500 font-medium block mb-1">Mental Focus</span>
            <p className="text-xs text-gray-600 italic">"One point at a time. Trust my serve."</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Track Your Progress",
    description:
      "Visualize your improvement over time with smart analytics. Win rates, performance trends, and insights that help you see the bigger picture.",
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50",
    gradient: "from-purple-500 to-pink-500",
    mockup: (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3">
          <p className="text-white font-semibold text-sm">Performance Dashboard</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Win Rate", value: "68%", trend: "↑ 12%" },
              { label: "Matches", value: "24", trend: "This month" },
              { label: "Streak", value: "5W", trend: "Personal best" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
                <p className="text-[10px] text-green-600 font-medium">{stat.trend}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-gray-500 font-medium">Recent Form</span>
            <div className="flex gap-1">
              {["W", "W", "L", "W", "W", "W", "L", "W"].map((r, i) => (
                <span
                  key={i}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    r === "W" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Opponent Scouting Database",
    description:
      "Build a personal intel file on every opponent. Track their patterns, weaknesses, and your head-to-head record. Walk on court with a tactical edge.",
    icon: Shield,
    color: "text-orange-600",
    bg: "bg-orange-50",
    gradient: "from-orange-500 to-red-500",
    mockup: (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3">
          <p className="text-white font-semibold text-sm">Opponent Intel</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">🎾</div>
            <div>
              <p className="text-sm font-bold text-gray-900">Alex M.</p>
              <p className="text-xs text-gray-500">H2H: 3-1 (75% win rate)</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-700">Strong forehand, struggles under pressure on backhand side</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-700">Tends to rush net after weak 2nd serves</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-700">Gets frustrated in long rallies — stay patient</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Share with Your Coach",
    description:
      "One-tap sharing lets your coach see match journals, training logs, and progress. Get targeted feedback faster and align on your development plan.",
    icon: Users,
    color: "text-teal-600",
    bg: "bg-teal-50",
    gradient: "from-teal-500 to-cyan-500",
    mockup: (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3">
          <p className="text-white font-semibold text-sm">Coach Dashboard</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm">🏆</div>
            <div>
              <p className="text-sm font-bold text-gray-900">Coach Maria</p>
              <p className="text-[10px] text-green-600 font-medium">● Connected</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Match journal shared", time: "2 min ago", icon: "📖" },
              { label: "Coach left feedback", time: "1 hour ago", icon: "💬" },
              { label: "Training plan updated", time: "Yesterday", icon: "📋" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-sm">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

const DemoModal = ({ open, onOpenChange }: DemoModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const step = demoSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    onOpenChange(false);
    setCurrentStep(0);
    navigate("/register");
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg sm:max-w-xl p-0 overflow-hidden bg-white">
        <div className="sr-only">
          <DialogHeader>
            <DialogTitle>Interactive Demo</DialogTitle>
            <DialogDescription>
              Walk through the key features of Sports Journal
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-6 pt-6">
          {demoSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep
                  ? `bg-gradient-to-r ${step.gradient}`
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <div className="px-6 pt-2">
          <span className="text-xs text-gray-400 font-medium">
            {currentStep + 1} of {demoSteps.length}
          </span>
        </div>

        {/* Content */}
        <div className="px-6 pb-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${step.bg}`}>
              <StepIcon className={`w-5 h-5 ${step.color}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {step.description}
          </p>

          {/* Mockup */}
          <div className="pt-1">{step.mockup}</div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {currentStep < demoSteps.length - 1 ? (
            <Button
              size="sm"
              onClick={handleNext}
              className={`bg-gradient-to-r ${step.gradient} text-white hover:opacity-90`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90"
            >
              Start Free Journey
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;
