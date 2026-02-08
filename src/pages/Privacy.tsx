import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import {
  Shield,
  ArrowRight,
  Mail,
  Users,
  Eye,
  Lock,
  Database,
  Cookie,
  CheckCircle,
  Calendar,
  Download,
  Trash2,
} from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const privacySections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: "We collect information you provide directly to us, such as when you create an account, log matches, or contact us for support.",
      details: [
        {
          category: "Account Information",
          items: [
            "Name and email address",
            "Password (encrypted)",
            "Sport preferences",
            "Profile information"
          ]
        },
        {
          category: "Performance Data",
          items: [
            "Match results and scores",
            "Training session logs",
            "Performance analytics",
            "Progress tracking data"
          ]
        },
        {
          category: "Usage Data",
          items: [
            "App usage patterns",
            "Feature interactions",
            "Device information",
            "IP address and location data"
          ]
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Eye,
      content: "We use your information to provide, maintain, and improve our services, and to communicate with you.",
      details: [
        {
          category: "Service Provision",
          items: [
            "Track and analyze your performance",
            "Provide personalized insights",
            "Enable opponent tracking",
            "Generate analytics reports"
          ]
        },
        {
          category: "Communication",
          items: [
            "Send account notifications",
            "Provide customer support",
            "Share product updates",
            "Respond to your inquiries"
          ]
        },
        {
          category: "Improvement",
          items: [
            "Analyze usage patterns",
            "Develop new features",
            "Improve user experience",
            "Ensure service reliability"
          ]
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Users,
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties, except as described in this policy.",
      details: [
        {
          category: "When We Share",
          items: [
            "With coaches you explicitly authorize",
            "For service providers (e.g., hosting)",
            "For legal compliance requirements",
            "In connection with business transfers"
          ]
        },
        {
          category: "What We Never Share",
          items: [
            "Your personal data to advertisers",
            "Performance data without consent",
            "Email addresses to third parties",
            "Individual match details publicly"
          ]
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
      details: [
        {
          category: "Technical Measures",
          items: [
            "SSL/TLS encryption for data transmission",
            "Encrypted database storage",
            "Regular security audits",
            "Secure authentication systems"
          ]
        },
        {
          category: "Organizational Measures",
          items: [
            "Employee access restrictions",
            "Privacy training programs",
            "Data handling protocols",
            "Incident response procedures"
          ]
        }
      ]
    },
    {
      id: "cookies-tracking",
      title: "Cookies and Tracking",
      icon: Cookie,
      content: "We use cookies and similar tracking technologies to track activity on our service and hold certain information.",
      details: [
        {
          category: "Types of Cookies",
          items: [
            "Essential cookies for basic functionality",
            "Performance cookies for analytics",
            "Preference cookies for personalization",
            "Security cookies for protection"
          ]
        },
        {
          category: "Your Choices",
          items: [
            "Accept or reject non-essential cookies",
            "Clear browser cookies anytime",
            "Adjust cookie preferences in settings",
            "Use service without accepting optional cookies"
          ]
        }
      ]
    },
    {
      id: "data-rights",
      title: "Your Data Rights",
      icon: Download,
      content: "You have rights regarding your personal information, including access, correction, and deletion.",
      details: [
        {
          category: "Available Rights",
          items: [
            "Access your personal data",
            "Correct inaccurate information",
            "Request data deletion",
            "Export your data",
            "Opt-out of communications"
          ]
        },
        {
          category: "How to Exercise Rights",
          items: [
            "Contact privacy@sportsjournal.com",
            "Use account settings",
            "Submit data requests through support",
            "Expect response within 30 days"
          ]
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Privacy Policy</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
              Your Privacy Matters
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              We're committed to protecting your personal information and being transparent about how we use it.
            </p>
          </div>

          {/* Key Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Lock,
                title: "Secure by Design",
                description: "Privacy and security built into every feature"
              },
              {
                icon: Eye,
                title: "Transparent",
                description: "Clear explanation of data practices"
              },
              {
                icon: Users,
                title: "User Control",
                description: "You control your data and preferences"
              }
            ].map((principle, idx) => (
              <div key={idx} className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <principle.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{principle.title}</h3>
                <p className="text-sm text-gray-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-gray-600 leading-relaxed">
                This Privacy Policy describes how Sports Journal ("we," "us," or "our") collects, uses, and shares your personal information when you use our service. By using Sports Journal, you agree to the collection and use of information in accordance with this policy.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                <strong>Last updated:</strong> January 8, 2025
              </p>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-6">
              {privacySections.map((section) => (
                <Card key={section.id} className="border border-gray-200 bg-white">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <section.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{section.content}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {expandedSection === section.id ? "−" : "+"}
                      </div>
                    </button>
                    
                    {expandedSection === section.id && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-4 space-y-6">
                          {section.details.map((detail, idx) => (
                            <div key={idx}>
                              <h4 className="font-semibold text-gray-900 mb-3">{detail.category}</h4>
                              <ul className="space-y-2">
                                {detail.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="flex items-start gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Sections */}
            <div className="mt-12 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your personal information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h3>
                <p className="text-gray-600 leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@sportsjournal.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> 123 Madison Avenue, Suite 1000, New York, NY 10016
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900">
              Manage Your Privacy
            </h2>
            <p className="text-lg text-gray-600">
              Take control of your data and privacy settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Download,
                title: "Download Your Data",
                description: "Request a copy of all your personal information",
                action: "Request Data Export"
              },
              {
                icon: Trash2,
                title: "Delete Account",
                description: "Permanently delete your account and all associated data",
                action: "Request Deletion"
              },
              {
                icon: Mail,
                title: "Privacy Questions",
                description: "Contact our privacy team with any concerns",
                action: "Contact Privacy Team"
              }
            ].map((action, idx) => (
              <Card key={idx} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{action.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{action.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("mailto:privacy@sportsjournal.com", "_blank")}
                    className="border-gray-300 hover:border-blue-500"
                  >
                    {action.action}
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
            Trust in Your Journey
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-95">
            Your data is secure and your privacy is respected as you pursue athletic excellence
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 group"
          >
            Start Your Secure Journey
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
