import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import {
  MessageCircle,
  Search,
  BookOpen,
  Mail,
  Phone,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  BarChart3,
  Calendar,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Target,
      description: "Learn the basics and set up your account",
      articles: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Sign Up Free' button on our homepage or landing page. Enter your email address, create a secure password, and you're in — the whole process takes under 60 seconds. Once signed up, you'll be guided through a quick onboarding flow where you can select your primary sport, set your skill level, and customize your dashboard. No credit card required, and you can start logging matches immediately."
        },
        {
          question: "What sports are supported?",
          answer: "We currently support 13 competitive sports: tennis, padel, table tennis, squash, badminton, pickleball, boxing, MMA, judo, cycling, swimming, athletics (track & field), and gymnastics. Each sport has its own tailored scoring system, analytics dashboards, and performance metrics designed specifically for that discipline. You can track matches across multiple sports from a single account and switch between them seamlessly from your dashboard — all your data stays organized and separate per sport."
        },
        {
          question: "How do I log my first match?",
          answer: "After signing in, tap the 'Add Match' button on your dashboard. You'll be prompted to enter key details like the date, opponent name, match format (singles or doubles), and set-by-set scores. You can also add personal notes about what went well, areas to improve, and tactical observations. The whole process is designed to be quick — most users log a match in under two minutes, even courtside."
        },
        {
          question: "Can I use Sports Journal on mobile?",
          answer: "Yes! Sports Journal is fully responsive and works beautifully on mobile devices. Simply visit our website in your phone's browser (Safari, Chrome, Firefox, etc.) for the full experience — no app download needed. The mobile interface is optimized for courtside use with large tap targets and a streamlined layout. You can even add Sports Journal to your home screen for instant access, just like a native app."
        }
      ]
    },
    {
      id: "features",
      title: "Features & Tools",
      icon: Zap,
      description: "Master all the powerful features available",
      articles: [
        {
          question: "How does match analytics work?",
          answer: "Our analytics engine automatically processes every match you log to surface meaningful insights. You'll see your overall win rate, performance trends over time, head-to-head records against specific opponents, and breakdowns by match format and surface type. The dashboard visualizes your progress with interactive charts, and you can filter by date range, sport, or opponent to drill into specific patterns. It's designed to help you spot strengths to build on and weaknesses to address in practice."
        },
        {
          question: "What is opponent tracking?",
          answer: "Opponent tracking lets you build detailed profiles for every player you compete against. For each opponent, you can record their playing style (aggressive baseliner, serve-and-volley, etc.), note specific strengths and weaknesses, and view your complete head-to-head match history. Before a rematch, review your opponent's profile to refresh your tactical game plan. Free accounts include up to 5 opponent profiles, while Pro accounts offer unlimited profiles with additional scouting fields."
        },
        {
          question: "How do I share data with my coach?",
          answer: "From any match detail or analytics page, tap the 'Share' button to send a clean, formatted summary to your coach. You can share via email, WhatsApp, or generate a shareable link. Your coach receives a readable view of your scores, match notes, and performance trends — no Sports Journal account required on their end. This makes it easy to keep your coach in the loop between sessions and have more productive training conversations."
        },
        {
          question: "Can I export my data?",
          answer: "Pro users can export their complete match history, analytics, and performance insights in CSV or PDF format. Navigate to Settings > Export Data to choose your format and date range. CSV exports are great for custom analysis in spreadsheets, while PDF exports produce polished reports perfect for sharing with coaches or keeping as personal records. Your data always belongs to you, and exports include all match details, scores, notes, and calculated metrics."
        }
      ]
    },
    {
      id: "account",
      title: "Account & Settings",
      icon: Shield,
      description: "Manage your profile and preferences",
      articles: [
        {
          question: "How do I change my password?",
          answer: "Navigate to Settings > Security > Change Password. You'll need to enter your current password for verification, then type your new password twice to confirm. We recommend using a strong, unique password with a mix of letters, numbers, and symbols. If you've forgotten your current password, use the 'Forgot Password' link on the login page instead — we'll send a secure reset link to your registered email address."
        },
        {
          question: "Can I change my sport preference?",
          answer: "Yes! Go to Settings > Profile > Primary Sport to update your main sport at any time. Your primary sport determines which dashboard and analytics view loads by default, but you can always track matches and view stats for all six supported sports. Changing your primary sport doesn't affect any existing match data — everything you've logged stays intact and accessible."
        },
        {
          question: "How do I delete my account?",
          answer: "We're sorry to see you go! To delete your account, navigate to Settings > Account > Delete Account. You'll be asked to confirm your decision, as this action is permanent and cannot be undone — all your match data, analytics, opponent profiles, and account information will be permanently removed from our servers. We recommend exporting your data first (Settings > Export Data) if you'd like to keep a personal copy of your match history."
        },
        {
          question: "Is my data secure?",
          answer: "Absolutely. We take data security seriously. All data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption. Our infrastructure is hosted on enterprise-grade cloud servers with automatic backups and redundancy. We never sell, share, or provide access to your personal data without your explicit consent. You can review our full privacy policy for complete details on how your information is stored and protected."
        }
      ]
    },
    {
      id: "billing",
      title: "Billing & Pricing",
      icon: BarChart3,
      description: "Understand pricing and subscription options",
      articles: [
        {
          question: "What's included in the Free plan?",
          answer: "The Free plan gives you everything you need to get started: unlimited match logging across all six supported sports, basic analytics with win rate and trend tracking, up to 5 opponent profiles, full mobile access, and offline match logging that syncs when you reconnect. There are no time limits or trial periods — free means free, forever. You'll only need to upgrade if you want advanced features like AI coaching insights, unlimited opponent profiles, or detailed export options."
        },
        {
          question: "How do I upgrade to Pro?",
          answer: "Click the 'Upgrade' button in your dashboard sidebar or visit the Pricing page from the main menu. Select the plan that fits your needs, enter your payment details, and all Pro features unlock instantly — no waiting, no restart required. Your existing data and settings carry over seamlessly. We accept all major credit cards and offer both monthly and annual billing, with a discount for annual subscriptions."
        },
        {
          question: "Can I cancel my subscription?",
          answer: "Yes, you can cancel anytime with no penalties or hidden fees. Go to Settings > Billing > Cancel Subscription to initiate the process. You'll continue to have full access to all Pro features until the end of your current billing period. After that, your account automatically reverts to the Free plan — you keep all your match data and can still log matches, but advanced features like AI insights and unlimited exports will be locked."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 30-day money-back guarantee on all paid plans, no questions asked. If you're not satisfied for any reason, simply email support@sportsjournal.com within 30 days of your purchase and we'll process a full refund, typically within 3–5 business days. We want you to feel confident trying Pro features risk-free."
        }
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: Calendar,
      description: "Solve common issues and problems",
      articles: [
        {
          question: "Why isn't my match saving?",
          answer: "First, check your internet connection — if you're offline, don't worry, matches are saved locally and will sync automatically when you reconnect. If you are online and the issue persists, try clearing your browser cache (Settings > Clear Browsing Data), refreshing the page, or switching to a different browser. Make sure all required fields (date, opponent, scores) are filled in. If the problem continues, email support@sportsjournal.com with a screenshot and we'll investigate promptly."
        },
        {
          question: "I forgot my password. How do I reset it?",
          answer: "Click the 'Forgot Password' link on the login page and enter the email address associated with your account. You'll receive a secure password reset link within a few minutes — check your spam or junk folder if you don't see it in your inbox. The reset link expires after 24 hours for security. Click the link, set a new password, and you'll be back in your account right away."
        },
        {
          question: "The app seems slow. What can I do?",
          answer: "Start by clearing your browser cache and closing any unnecessary tabs, as these are the most common causes of slowness. Check your internet connection speed — Sports Journal works best with a stable connection, though basic features work offline too. If you have a large match history (hundreds of matches), the initial dashboard load may take a moment as analytics are calculated. Try using Chrome or Edge for the best performance. If slowness persists, let us know at support@sportsjournal.com so we can investigate."
        },
        {
          question: "My data isn't syncing across devices.",
          answer: "First, confirm you're logged into the same account on all devices — it's easy to accidentally use different email addresses. Then check that each device has an active internet connection, as syncing requires connectivity. Try manually refreshing the page or pulling down to refresh on mobile. Data typically syncs within seconds, but if you recently logged a match offline, it will sync the next time that device connects to the internet. If the issue persists after these steps, contact support@sportsjournal.com with details about which devices are affected."
        }
      ]
    }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.length > 0
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
              Help Center
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Find answers, learn tips, and get the most out of Sports Journal
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="w-full py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: "User Guide", action: () => navigate("/features") },
              { icon: MessageCircle, label: "Contact Support", action: () => navigate("/contact") },
              { icon: Users, label: "Community", action: () => window.open("https://wa.me/", "_blank") },
              { icon: Mail, label: "Email Us", action: () => window.open("mailto:support@sportsjournal.com", "_blank") }
            ].map((link, idx) => (
              <button
                key={idx}
                onClick={link.action}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <link.icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="border border-gray-200 bg-white">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    {expandedCategory === category.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedCategory === category.id && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        {category.articles.map((article, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{article.question}</h4>
                            <p className="text-gray-600 leading-relaxed">{article.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">Try searching with different keywords or browse our categories above.</p>
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="border-gray-300 hover:border-blue-500"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600">
              Our support team is here to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: "Email Support",
                description: "Get help via email",
                action: "support@sportsjournal.com",
                href: "mailto:support@sportsjournal.com"
              },
              {
                icon: MessageCircle,
                title: "Live Chat",
                description: "Chat with our team",
                action: "Start conversation",
                href: "https://wa.me/"
              },
              {
                icon: BookOpen,
                title: "User Guide",
                description: "Browse documentation",
                action: "Read guide",
                href: "/features"
              }
            ].map((method, idx) => (
              <Card key={idx} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => method.href.startsWith("http") ? window.open(method.href, "_blank") : navigate(method.href)}
                    className="border-gray-300 hover:border-blue-500"
                  >
                    {method.action}
                  </Button>
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
            Ready to Master Your Sport?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-95">
            Start tracking your journey to athletic excellence today
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 group"
          >
            Start Free Journey
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
