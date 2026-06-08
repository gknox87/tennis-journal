import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { Header } from "@/components/Header";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Loader2,
  CheckCircle,
  Calendar,
  Table,
  BarChart3,
  Shield,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Lock
} from "lucide-react";
import { format } from "date-fns";

interface ExportProgress {
  status: string;
  progress: number;
  currentFile?: string;
}

interface ExportStats {
  matchesCount: number;
  opponentsCount: number;
  trainingSessionsCount: number;
  notesCount: number;
}

const DataExport = () => {
  const { sport } = useSport();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({ status: '', progress: 0 });
  const [exportComplete, setExportComplete] = useState(false);
  const [exportStats, setExportStats] = useState<ExportStats | null>(null);

  // Google Sheets connection state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleSheets, setGoogleSheets] = useState<{ id: string; name: string }[]>([]);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // PDF Report generation
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfDateRange, setPdfDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchExportStats();
    checkGoogleSheetsConnection();
  }, []);

  const fetchExportStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [matches, opponents, training, notes] = await Promise.all([
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('opponents').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('training_notes').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('player_notes').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id)
      ]);

      setExportStats({
        matchesCount: matches.count || 0,
        opponentsCount: opponents.count || 0,
        trainingSessionsCount: training.count || 0,
        notesCount: notes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkGoogleSheetsConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: links } = await supabase
        .from('google_sheet_links')
        .select('*')
        .eq('user_id', session.user.id);

      if (links && links.length > 0) {
        setIsGoogleConnected(true);
        setGoogleSheets(links.map(l => ({ id: l.sheet_id, name: l.sheet_name })));
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const generateCSV = (data: Record<string, unknown>[], filename: string): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h];
          const str = val === null || val === undefined ? '' : String(val);
          // Escape quotes and wrap in quotes if contains comma/quote/newline
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

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setExportProgress({ status: 'Preparing export...', progress: 10 });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
        return;
      }

      // Fetch all user data
      setExportProgress({ status: 'Fetching matches...', progress: 20 });
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      setExportProgress({ status: 'Fetching opponents...', progress: 35 });
      const { data: opponents } = await supabase
        .from('opponents')
        .select('*')
        .eq('user_id', session.user.id);

      setExportProgress({ status: 'Fetching training sessions...', progress: 50 });
      const { data: trainingSessions } = await supabase
        .from('training_notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('training_date', { ascending: false });

      setExportProgress({ status: 'Fetching journal entries...', progress: 65 });
      const { data: playerNotes } = await supabase
        .from('player_notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setExportProgress({ status: 'Generating profile data...', progress: 75 });
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setExportProgress({ status: 'Creating download files...', progress: 85 });

      // Generate CSV files
      const matchesCSV = generateCSV(matches || [], 'matches.csv');
      const opponentsCSV = generateCSV(opponents || [], 'opponents.csv');
      const trainingCSV = generateCSV(trainingSessions || [], 'training_sessions.csv');
      const notesCSV = generateCSV(playerNotes || [], 'player_notes.csv');

      // Generate profile JSON
      const profileJSON = JSON.stringify({
        ...profile,
        exported_at: new Date().toISOString()
      }, null, 2);

      // Create ZIP file manually (using JSZip-like approach with individual downloads)
      // For simplicity, download as separate files
      downloadFile(matchesCSV, 'matches.csv', 'text/csv');
      await new Promise(r => setTimeout(r, 200));
      downloadFile(opponentsCSV, 'opponents.csv', 'text/csv');
      await new Promise(r => setTimeout(r, 200));
      downloadFile(trainingCSV, 'training_sessions.csv', 'text/csv');
      await new Promise(r => setTimeout(r, 200));
      downloadFile(notesCSV, 'player_notes.csv', 'text/csv');
      await new Promise(r => setTimeout(r, 200));
      downloadFile(profileJSON, 'profile.json', 'application/json');

      setExportProgress({ status: 'Export complete!', progress: 100 });
      setExportComplete(true);

      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded as CSV and JSON files."
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Export Failed", description: "An error occurred during export", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGeneratePDFReport = async () => {
    try {
      setIsGeneratingPDF(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
        return;
      }

      // Fetch data for the report period
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', pdfDateRange.start)
        .lte('date', pdfDateRange.end)
        .order('date', { ascending: false });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Calculate stats
      const totalMatches = matches?.length || 0;
      const wins = matches?.filter(m => m.is_win).length || 0;
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

      // Group by surface
      const surfaceStats: Record<string, { played: number; won: number }> = {};
      matches?.forEach(m => {
        const surface = m.surface || 'Unknown';
        if (!surfaceStats[surface]) surfaceStats[surface] = { played: 0, won: 0 };
        surfaceStats[surface].played++;
        if (m.is_win) surfaceStats[surface].won++;
      });

      // Find best surface
      let bestSurface = 'N/A';
      let bestWinRate = 0;
      Object.entries(surfaceStats).forEach(([surface, stats]) => {
        const rate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
        if (rate > bestWinRate) {
          bestWinRate = rate;
          bestSurface = surface;
        }
      });

      // Build HTML for printing
      const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Athlete Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #1a56db; border-bottom: 3px solid #1a56db; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
    .stat-card h3 { font-size: 2.5em; margin: 0; }
    .stat-card p { margin: 5px 0 0 0; opacity: 0.9; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    th { background: #f3f4f6; }
    tr:nth-child(even) { background: #f9fafb; }
    .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🏆 Athlete Performance Report</h1>
      <p><strong>Player:</strong> ${profile?.full_name || 'N/A'}</p>
      <p><strong>Period:</strong> ${format(new Date(pdfDateRange.start), 'MMM d, yyyy')} - ${format(new Date(pdfDateRange.end), 'MMM d, yyyy')}</p>
      <p><strong>Generated:</strong> ${format(new Date(), 'MMM d, yyyy h:mm a')}</p>
    </div>
  </div>

  <h2>📊 Performance Summary</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <h3>${totalMatches}</h3>
      <p>Matches Played</p>
    </div>
    <div class="stat-card">
      <h3>${wins}</h3>
      <p>Wins</p>
    </div>
    <div class="stat-card">
      <h3>${winRate}%</h3>
      <p>Win Rate</p>
    </div>
    <div class="stat-card">
      <h3>${bestSurface}</h3>
      <p>Best Surface</p>
    </div>
  </div>

  <h2>🎾 Match Details</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Opponent</th>
        <th>Surface</th>
        <th>Score</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      ${(matches || []).map(m => `
        <tr>
          <td>${format(new Date(m.date), 'MMM d, yyyy')}</td>
          <td>${m.opponent_name || 'N/A'}</td>
          <td>${m.surface || 'N/A'}</td>
          <td>${m.score || 'N/A'}</td>
          <td>${m.is_win ? '✅ Won' : '❌ Lost'}</td>
        </tr>
      `).join('')}
      ${totalMatches === 0 ? '<tr><td colspan="5" style="text-align:center;">No matches in this period</td></tr>' : ''}
    </tbody>
  </table>

  <h2>📈 Surface Performance</h2>
  <table>
    <thead>
      <tr>
        <th>Surface</th>
        <th>Played</th>
        <th>Won</th>
        <th>Win Rate</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(surfaceStats).map(([surface, stats]) => `
        <tr>
          <td>${surface}</td>
          <td>${stats.played}</td>
          <td>${stats.won}</td>
          <td>${stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by SportsJournal.app | sportsjournal.app</p>
  </div>
</body>
</html>`;

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast({
        title: "Report Generated",
        description: "Print dialog opened. Save as PDF from your browser."
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "Report Failed", description: "An error occurred", variant: "destructive" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleConnectGoogle = async () => {
    // Stub: OAuth flow would go here
    // For now, show coming soon toast
    toast({
      title: "Coming Soon",
      description: "Google Sheets integration is in development."
    });
    setIsConnectingGoogle(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete your account?\n\n" +
      "This will permanently delete:\n" +
      "- All your match data\n" +
      "- Training records\n" +
      "- Journal entries\n" +
      "- Opponent information\n\n" +
      "This action CANNOT be undone."
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "🚨 FINAL WARNING: This will delete ALL data and cannot be recovered.\n\nClick OK to permanently delete your account."
    );

    if (!doubleConfirm) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Delete user data (would need server-side handling for full account deletion)
      await supabase.auth.deleteUser(session.user.id);

      toast({
        title: "Account Deletion Requested",
        description: "Please contact support@sportsjournal.com to complete account deletion."
      });

      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast({ title: "Error", description: "Failed to process deletion request", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-y-auto pb-24 pt-16">
<div className="container mx-auto px-4 py-6 sm:py-8 pb-24 sm:pb-28 max-w-4xl pt-16">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Data Export & Privacy
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg font-medium">
              Download your data, generate reports, and manage privacy settings
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* GDPR Compliance Notice */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">GDPR Compliance</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your data export includes all personal data stored by SportsJournal.app, including matches,
                  training sessions, journal entries, and profile information. You have the right to access,
                  rectify, and delete your personal data.
                </p>
              </div>
            </div>
          </Card>

          {/* Download My Data */}
          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Download My Data</h3>
                <p className="text-sm text-gray-600">Export all your data as CSV and JSON files</p>
              </div>
            </div>

            {exportStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{exportStats.matchesCount}</p>
                  <p className="text-xs text-gray-600">Matches</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{exportStats.opponentsCount}</p>
                  <p className="text-xs text-gray-600">Opponents</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{exportStats.trainingSessionsCount}</p>
                  <p className="text-xs text-gray-600">Training</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{exportStats.notesCount}</p>
                  <p className="text-xs text-gray-600">Notes</p>
                </div>
              </div>
            )}

            {isExporting && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">{exportProgress.status}</span>
                </div>
                <Progress value={exportProgress.progress} className="h-2" />
              </div>
            )}

            {exportComplete && (
              <div className="mb-4 flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Export complete! Check your downloads folder.</span>
              </div>
            )}

            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download All Data (ZIP)
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Includes: matches.csv, opponents.csv, training_sessions.csv, player_notes.csv, profile.json
            </p>
          </Card>

          {/* Generate PDF Report */}
          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Athlete Performance Report (PDF)</h3>
                <p className="text-sm text-gray-600">Generate a printable PDF report for a date range</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={pdfDateRange.start}
                  onChange={(e) => setPdfDateRange({ ...pdfDateRange, start: e.target.value })}
                  className="mt-1 w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={pdfDateRange.end}
                  onChange={(e) => setPdfDateRange({ ...pdfDateRange, end: e.target.value })}
                  className="mt-1 w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                />
              </div>
            </div>

            <Button
              onClick={handleGeneratePDFReport}
              disabled={isGeneratingPDF}
              variant="outline"
              className="w-full border-purple-300 hover:bg-purple-50"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </>
              )}
            </Button>
          </Card>

          {/* Google Sheets Integration */}
          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <Table className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Google Sheets Integration</h3>
                <p className="text-sm text-gray-600">Sync your matches to Google Sheets in real-time</p>
              </div>
            </div>

            {isGoogleConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 mb-3">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Connected to Google Sheets</span>
                </div>
                <div className="space-y-2">
                  {googleSheets.map(sheet => (
                    <div key={sheet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{sheet.name}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Add New Sheet
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Connect your Google account to automatically sync new matches to a Google Sheet.
                </p>
                <Button
                  onClick={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  variant="outline"
                  className="w-full border-green-300 hover:bg-green-50"
                >
                  {isConnectingGoogle ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Connect Google Sheets
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Coming soon - OAuth integration in development
                </p>
              </div>
            )}
          </Card>

          {/* Privacy & GDPR */}
          <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Privacy & Data Rights</h3>
                <p className="text-sm text-gray-600">Manage your GDPR rights and data</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Right to Access */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Download className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Right to Access</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Download all your personal data stored by SportsJournal.app
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleExportData}>
                  Download
                </Button>
              </div>

              {/* Right to Rectification */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <RefreshCw className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Right to Rectification</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Correct inaccurate personal data in your profile settings
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
              </div>

              {/* Right to Deletion */}
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Trash2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Right to Deletion</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>

          {/* Data Retention Policy */}
          <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Data Retention Policy</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Active account data is retained as long as your account is active</p>
              <p>• Match and training data is kept indefinitely for historical tracking</p>
              <p>• After account deletion, data is permanently removed within 30 days</p>
              <p>• Backups are purged within 90 days of deletion</p>
              <p>• Data shared with coaches is removed when you revoke access</p>
            </div>
            <Button
              variant="link"
              className="mt-4 text-blue-600"
              onClick={() => navigate('/privacy')}
            >
              Full Privacy Policy →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
