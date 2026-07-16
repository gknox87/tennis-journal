import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  AlertTriangle,
  Scale,
  RefreshCw,
  Ban,
  Mail,
} from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>("acceptance");

  const termsSections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: FileText,
      content:
        "By creating an account or using Sports Journal (the \"Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, you may not access or use the Service.",
      details: [
        "You must be at least 13 years old to use the Service",
        "If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf",
        "By registering, you confirm that the information you provide is accurate and complete",
        "You are responsible for maintaining the security of your account and password",
      ],
    },
    {
      id: "description",
      title: "2. Description of Service",
      icon: Shield,
      content:
        "Sports Journal is a sports performance tracking platform that allows athletes and coaches to log matches, training sessions, wellness data, and performance analytics.",
      details: [
        "The Service includes match logging, training load monitoring, wellness tracking, and injury tracking",
        "We offer tools for coaches to monitor and provide feedback to linked athletes",
        "Analytics and pattern detection features provide insights based on your logged data",
        "We may modify, suspend, or discontinue any part of the Service at any time",
      ],
    },
    {
      id: "accounts",
      title: "3. User Accounts and Responsibilities",
      icon: Users,
      content:
        "You are responsible for all activity that occurs under your account. You agree to provide accurate information and keep your credentials secure.",
      details: [
        "You must not share your account credentials with others",
        "You are responsible for all content you log or upload to the Service",
        "You must not impersonate another person or misrepresent your affiliation",
        "You must not create multiple accounts to circumvent any Service limitations",
        "You agree to notify us immediately of any unauthorized use of your account",
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable Use",
      icon: Ban,
      content:
        "You agree not to use the Service for any unlawful purpose or in a way that could harm the Service or other users.",
      details: [
        "Do not harass, abuse, threaten, or impersonate other users",
        "Do not upload viruses, malware, or any malicious code",
        "Do not attempt to gain unauthorized access to any part of the Service",
        "Do not use automated scripts or bots to access the Service without our permission",
        "Do not use the Service to store any data that violates applicable laws",
      ],
    },
    {
      id: "data-and-privacy",
      title: "5. Data and Privacy",
      icon: Shield,
      content:
        "Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information.",
      details: [
        "By using the Service, you consent to the data practices described in our Privacy Policy",
        "You retain ownership of all match, training, and wellness data you log",
        "You can export your data at any time from the Data Export page",
        "You can delete your account and all associated data from your Profile settings",
        "Coach-athlete data sharing requires explicit consent from both parties",
      ],
    },
    {
      id: "coach-features",
      title: "6. Coach Features and Player Data",
      icon: Users,
      content:
        "Coaches who use the Service to monitor athletes must have the athlete's explicit consent to access their performance data.",
      details: [
        "Coaches must only link with athletes who have agreed to be monitored",
        "Athletes may revoke coach access at any time from their account settings",
        "Coaches must not share athlete data with third parties without the athlete's consent",
        "We reserve the right to revoke coach access if misuse is reported",
      ],
    },
    {
      id: "intellectual-property",
      title: "7. Intellectual Property",
      icon: FileText,
      content:
        "The Service, including its design, features, and underlying technology, is owned by Sports Journal and is protected by intellectual property laws.",
      details: [
        "You may not copy, modify, distribute, or reverse-engineer any part of the Service",
        "We grant you a limited, non-exclusive, non-transferable license to use the Service",
        "All trademarks, logos, and brand names are the property of their respective owners",
        "User-generated content remains the property of the user, subject to our license to display it within the Service",
      ],
    },
    {
      id: "disclaimers",
      title: "8. Disclaimers and Limitation of Liability",
      icon: AlertTriangle,
      content:
        "The Service is provided \"as is\" and \"as available\" without warranties of any kind. Sports Journal is a tracking and analytics tool, not a substitute for professional medical or coaching advice.",
      details: [
        "We do not guarantee that the Service will be uninterrupted, secure, or error-free",
        "Wellness and injury tracking features are for informational purposes only and do not constitute medical advice",
        "Always consult a qualified healthcare professional for injury diagnosis and treatment",
        "Training load metrics (ACWR, monotony, strain) are indicators, not guarantees of injury prevention",
        "We are not liable for any decisions made based on data from the Service",
        "To the maximum extent permitted by law, our total liability shall not exceed the amount you paid us in the 12 months preceding the claim",
      ],
    },
    {
      id: "termination",
      title: "9. Account Termination",
      icon: RefreshCw,
      content:
        "You may delete your account at any time from your Profile settings. We may suspend or terminate accounts that violate these Terms.",
      details: [
        "Account deletion is permanent and cannot be undone",
        "All match, training, wellness, and journal data is permanently removed upon deletion",
        "We may suspend or terminate accounts for violations of these Terms or applicable law",
        "Upon termination, your right to use the Service immediately ceases",
        "Provisions that by their nature should survive termination shall remain in effect",
      ],
    },
    {
      id: "changes",
      title: "10. Changes to Terms",
      icon: RefreshCw,
      content:
        "We may update these Terms from time to time. We will notify users of significant changes via email or in-app notification.",
      details: [
        "Material changes will be communicated at least 30 days before taking effect",
        "Continued use of the Service after changes constitutes acceptance of the new Terms",
        "You can review the current Terms at any time on this page",
        "The \"Last updated\" date below reflects the most recent revision",
      ],
    },
    {
      id: "governing-law",
      title: "11. Governing Law and Disputes",
      icon: Scale,
      content:
        "These Terms are governed by applicable law. Any disputes shall be resolved through the process described below.",
      details: [
        "These Terms shall be governed by the laws of the jurisdiction in which Sports Journal operates",
        "We will attempt to resolve disputes informally before any legal action",
        "You agree to bring any claim within one year of the event giving rise to the claim",
        "If a dispute cannot be resolved informally, it shall be resolved through binding arbitration",
      ],
    },
    {
      id: "contact",
      title: "12. Contact Information",
      icon: Mail,
      content:
        "If you have any questions about these Terms, please contact us using the information below.",
      details: [
        "Email: support@sportsjournal.app",
        "Privacy inquiries: privacy@sportsjournal.app",
        "You can also contact us through the Help Center or Contact page within the app",
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-full w-full bg-white overflow-y-auto pb-24" pt-16>
      <LandingHeader />

      {/* Hero Section */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-6">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900">Terms of Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
              Terms of Service
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              The terms and conditions that govern your use of Sports Journal.
            </p>
            <p className="text-sm text-gray-500 mt-6">
              <strong>Last updated:</strong> July 16, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-gray-600 leading-relaxed">
                Welcome to Sports Journal. These Terms of Service ("Terms") govern your access to and use
                of the Sports Journal application, website, and services (collectively, the "Service").
                By accessing or using the Service, you agree to be bound by these Terms. If you do not
                agree to these Terms, please do not use the Service.
              </p>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-6">
              {termsSections.map((section) => (
                <Card key={section.id} className="border border-gray-200 bg-white">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                          <section.icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                      </div>
                      {expandedSection === section.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {expandedSection === section.id && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed mb-4">{section.content}</p>
                        <ul className="space-y-2">
                          {section.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-indigo-400 mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-lg opacity-90 mb-8">
            Our team is here to help with any questions about these Terms of Service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.open("mailto:support@sportsjournal.app")}
            >
              <Mail className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate("/privacy")}
            >
              <Shield className="mr-2 h-5 w-5" />
              View Privacy Policy
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
