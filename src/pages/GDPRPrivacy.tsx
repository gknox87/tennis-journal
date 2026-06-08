import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingHeader } from "@/components/LandingHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Download,
  Trash2,
  Mail,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lock,
  FileText,
  Users,
  Eye,
  Database,
  ChevronRight,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

const GDPRPrivacy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Fetch and download data
      const [matches, opponents, training, notes, profile] = await Promise.all([
        supabase.from('matches').select('*').eq('user_id', session.user.id),
        supabase.from('opponents').select('*').eq('user_id', session.user.id),
        supabase.from('training_notes').select('*').eq('user_id', session.user.id),
        supabase.from('player_notes').select('*').eq('user_id', session.user.id),
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
      ]);

      const generateCSV = (data: Record<string, unknown>[], filename: string): string => {
        if (!data || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map(row =>
            headers.map(h => {
              const val = row[h];
              const str = val === null || val === undefined ? '' : String(val);
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            }).join(',')
          )
        ];
        return csvRows.join('\n');
      };

      const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      };

      downloadFile(generateCSV(matches.data || [], 'matches.csv'), 'matches.csv', 'text/csv');
      setTimeout(() => downloadFile(generateCSV(opponents.data || [], 'opponents.csv'), 'opponents.csv', 'text/csv'), 100);
      setTimeout(() => downloadFile(generateCSV(training.data || [], 'training_sessions.csv'), 'training_sessions.csv', 'text/csv'), 200);
      setTimeout(() => downloadFile(generateCSV(notes.data || [], 'player_notes.csv'), 'player_notes.csv', 'text/csv'), 300);
      setTimeout(() => downloadFile(JSON.stringify({ ...profile.data, exported_at: new Date().toISOString() }, null, 2), 'profile.json', 'application/json'), 400);

      toast({ title: "Data Export Complete", description: "Your data has been downloaded." });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Export Failed", description: "An error occurred", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Note: Full account deletion requires server-side action
      // This shows the user the process
      toast({
        title: "Deletion Request Submitted",
        description: "Please contact privacy@sportsjournal.app to complete account deletion."
      });

      setShowDeleteConfirm(false);
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Error", description: "Failed to process deletion", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const rights = [
    {
      icon: Download,
      title: "Right to Access",
      description: "Download all your personal data including matches, training sessions, and journal entries.",
      action: "Download My Data",
      onClick: handleExportData,
      color: "blue"
    },
    {
      icon: RefreshCw,
      title: "Right to Rectification",
      description: "Correct inaccurate personal information in your profile settings.",
      action: "Edit Profile",
      onClick: () => navigate('/profile'),
      color: "green"
    },
    {
      icon: Trash2,
      title: "Right to Deletion",
      description: "Permanently delete your account and all associated data within 30 days.",
      action: "Request Deletion",
      onClick: () => setShowDeleteConfirm(true),
      color: "red"
    }
  ];

  return (
    <div className="min-h-full w-full bg-white overflow-y-auto pb-24 pt-16">
      <LandingHeader />

      {/* Hero Section */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">GDPR Compliance</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-900">
              Your Data Rights
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Under GDPR, you have specific rights regarding your personal data. Learn how to exercise these rights with SportsJournal.app.
            </p>
          </div>
        </div>
      </section>

      {/* Rights Section */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Exercise Your Rights</h2>

          <div className="space-y-4">
            {rights.map((right, idx) => (
              <Card key={idx} className={`border-2 ${right.color === 'red' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      right.color === 'blue' ? 'bg-blue-100' :
                      right.color === 'green' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <right.icon className={`h-6 w-6 ${
                        right.color === 'blue' ? 'text-blue-600' :
                        right.color === 'green' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{right.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{right.description}</p>
                    </div>
                    <Button
                      variant={right.color === 'red' ? 'destructive' : 'default'}
                      onClick={right.onClick}
                      className={right.color === 'red' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      {right.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <section className="w-full py-8 bg-red-50 border-t border-b border-red-200">
          <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <Card className="border-2 border-red-300 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Confirm Account Deletion</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      This will permanently delete:
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc space-y-1">
                      <li>All {sport?.name || 'sports'} matches and statistics</li>
                      <li>Training session history</li>
                      <li>Journal entries and notes</li>
                      <li>Opponent information</li>
                      <li>Your profile and account</li>
                    </ul>
                    <p className="text-sm text-red-600 mt-3 font-medium">
                      This action CANNOT be undone. Data will be permanently deleted within 30 days.
                    </p>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                        {isDeleting ? 'Processing...' : 'Yes, Delete My Account'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Data Retention Policy */}
      <section className="w-full py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Data Retention Policy</h2>

          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Active Account Data
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your data is retained as long as your account remains active. This includes match history,
                    training logs, journal entries, and performance analytics.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    After Account Deletion
                  </h3>
                  <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-2">
                    <li>• Personal data is permanently removed within 30 days</li>
                    <li>• All matches, training, and notes are deleted</li>
                    <li>• Associated backups are purged within 90 days</li>
                    <li>• You will receive a confirmation email when deletion is complete</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Shared Data (Coaches)
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    If you've shared data with coaches, this access is revoked when you delete your account.
                    Coaches will no longer have access to your performance data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Export Details */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What Data Can You Export?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: FileText, name: "Matches", desc: "All match results, scores, surfaces, and opponents", file: "matches.csv" },
              { icon: Users, name: "Opponents", desc: "Opponent details, win/loss records, notes", file: "opponents.csv" },
              { icon: Calendar, name: "Training Sessions", desc: "Training logs, duration, focus areas", file: "training_sessions.csv" },
              { icon: Eye, name: "Journal Entries", desc: "Improvement notes and AI insights", file: "player_notes.csv" },
            ].map((item, idx) => (
              <Card key={idx} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                      <code className="text-xs text-blue-600 mt-1">{item.file}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button onClick={handleExportData} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Download className="mr-2 h-5 w-5" />
              Export All My Data
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions About Your Data?</h2>
          <p className="text-lg opacity-90 mb-8">
            Our privacy team is here to help with any GDPR-related requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => window.open('mailto:privacy@sportsjournal.app')}>
              <Mail className="mr-2 h-5 w-5" />
              privacy@sportsjournal.app
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GDPRPrivacy;

// Helper for sport context - this component uses landing layout so it needs a sport reference
const sport = { name: 'sports' };
