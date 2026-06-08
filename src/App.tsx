
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import "./App.css";
import { SportProvider } from "@/context/SportContext";
import { BottomNavigationWrapper, shouldShowBottomNav } from "@/components/BottomNavigationWrapper";
import { Header } from "@/components/Header";
import { isMarketingHost, appUrl } from "@/lib/hostMode";
import { cn } from "@/lib/utils";
import React from "react";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

const Index = React.lazy(() => import("@/pages/Index"));
const AddMatch = React.lazy(() => import("@/pages/AddMatch"));
const EditMatch = React.lazy(() => import("@/pages/EditMatch"));
const MatchDetail = React.lazy(() => import("@/pages/MatchDetail"));
const ViewAllMatches = React.lazy(() => import("@/pages/ViewAllMatches"));
const KeyOpponents = React.lazy(() => import("@/pages/KeyOpponents"));
const ImprovementNotes = React.lazy(() => import("@/pages/ImprovementNotes"));
const Calendar = React.lazy(() => import("@/pages/Calendar"));
const TrainingNotes = React.lazy(() => import("@/pages/TrainingNotes"));
const TrainingLoad = React.lazy(() => import("@/pages/TrainingLoad"));
const Wellness = React.lazy(() => import("@/pages/Wellness"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const CoachDashboard = React.lazy(() => import("@/pages/CoachDashboard"));
const CoachFeed = React.lazy(() => import("@/pages/CoachFeed"));
const Notifications = React.lazy(() => import("@/pages/Notifications"));
const NotificationSettings = React.lazy(() => import("@/pages/NotificationSettings"));
const OpponentDetail = React.lazy(() => import("@/pages/OpponentDetail"));
const TeamDetail = React.lazy(() => import("@/pages/TeamDetail"));
const Features = React.lazy(() => import("@/pages/Features"));
const Pricing = React.lazy(() => import("@/pages/Pricing"));
const Demo = React.lazy(() => import("@/pages/Demo"));
const HelpCenter = React.lazy(() => import("@/pages/HelpCenter"));
const Contact = React.lazy(() => import("@/pages/Contact"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const InjuryTracker = React.lazy(() => import("@/pages/InjuryTracker"));
const AdminDashboard = React.lazy(() => import("@/pages/AdminDashboard"));
const AdminUsers = React.lazy(() => import("@/pages/AdminUsers"));
const AdminTeams = React.lazy(() => import("@/pages/AdminTeams"));
const Goals = React.lazy(() => import("@/pages/Goals"));
const BlogIndex = React.lazy(() => import("@/pages/BlogIndex"));
const BlogPost = React.lazy(() => import("@/pages/BlogPost"));
const PadelStats = React.lazy(() => import("@/pages/PadelStats"));
const PerformanceDashboard = React.lazy(() => import("@/pages/PerformanceDashboard"));
const Challenges = React.lazy(() => import("@/pages/Challenges"));
const DataExport = React.lazy(() => import("@/pages/DataExport"));
const GDPRPrivacy = React.lazy(() => import("@/pages/GDPRPrivacy"));

const PageLoader = () => (
  <div className="h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

interface AppLayoutProps {
  marketing: boolean;
  session: Session | null;
  loading: boolean;
}

function AppLayout({ marketing, session, loading }: AppLayoutProps) {
  const location = useLocation();
  const showBottomNav = !marketing && shouldShowBottomNav(location.pathname);

  const RedirectToApp = () => {
    if (typeof window !== "undefined") {
      window.location.replace(appUrl(window.location.pathname + window.location.search));
    }
    return null;
  };

  return (
    <div className="app-shell bg-background">
      {!marketing && <Header />}

      <div
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain pt-shell-top",
          showBottomNav && "pb-shell-bottom"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ErrorBoundary>
          <React.Suspense fallback={<PageLoader />}>
            {marketing ? (
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/blog" element={<BlogIndex />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="*" element={<RedirectToApp />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
                <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <Register />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/blog" element={<BlogIndex />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/dashboard" element={<ProtectedRoute session={session} isLoading={loading}><Index /></ProtectedRoute>} />
                <Route path="/add-match" element={<ProtectedRoute session={session} isLoading={loading}><AddMatch /></ProtectedRoute>} />
                <Route path="/edit-match/:id" element={<ProtectedRoute session={session} isLoading={loading}><EditMatch /></ProtectedRoute>} />
                <Route path="/match/:id" element={<ProtectedRoute session={session} isLoading={loading}><MatchDetail /></ProtectedRoute>} />
                <Route path="/matches" element={<ProtectedRoute session={session} isLoading={loading}><ViewAllMatches /></ProtectedRoute>} />
                <Route path="/key-opponents" element={<ProtectedRoute session={session} isLoading={loading}><KeyOpponents /></ProtectedRoute>} />
                <Route path="/opponent/:id" element={<ProtectedRoute session={session} isLoading={loading}><OpponentDetail /></ProtectedRoute>} />
                <Route path="/improvement-notes" element={<ProtectedRoute session={session} isLoading={loading}><ImprovementNotes /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute session={session} isLoading={loading}><Calendar /></ProtectedRoute>} />
                <Route path="/training-notes" element={<ProtectedRoute session={session} isLoading={loading}><TrainingNotes /></ProtectedRoute>} />
                <Route path="/training-load" element={<ProtectedRoute session={session} isLoading={loading}><TrainingLoad /></ProtectedRoute>} />
                <Route path="/wellness" element={<ProtectedRoute session={session} isLoading={loading}><Wellness /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute session={session} isLoading={loading}><Profile /></ProtectedRoute>} />
                <Route path="/data-export" element={<ProtectedRoute session={session} isLoading={loading}><DataExport /></ProtectedRoute>} />
                <Route path="/privacy-gdpr" element={<ProtectedRoute session={session} isLoading={loading}><GDPRPrivacy /></ProtectedRoute>} />
                <Route path="/goals" element={<ProtectedRoute session={session} isLoading={loading}><Goals /></ProtectedRoute>} />
                <Route path="/challenges" element={<ProtectedRoute session={session} isLoading={loading}><Challenges /></ProtectedRoute>} />
                <Route path="/padel-stats" element={<ProtectedRoute session={session} isLoading={loading}><PadelStats /></ProtectedRoute>} />
                <Route path="/performance-dashboard" element={<ProtectedRoute session={session} isLoading={loading}><PerformanceDashboard /></ProtectedRoute>} />
                <Route path="/coach" element={<ProtectedRoute session={session} isLoading={loading}><CoachDashboard /></ProtectedRoute>} />
                <Route path="/coach-feed" element={<ProtectedRoute session={session} isLoading={loading}><CoachFeed /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute session={session} isLoading={loading}><Notifications /></ProtectedRoute>} />
                <Route path="/notification-settings" element={<ProtectedRoute session={session} isLoading={loading}><NotificationSettings /></ProtectedRoute>} />
                <Route path="/team/:id" element={<ProtectedRoute session={session} isLoading={loading}><TeamDetail /></ProtectedRoute>} />
                <Route path="/injury-tracker" element={<ProtectedRoute session={session} isLoading={loading}><InjuryTracker /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute session={session} isLoading={loading}><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute session={session} isLoading={loading}><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/teams" element={<ProtectedRoute session={session} isLoading={loading}><AdminRoute><AdminTeams /></AdminRoute></ProtectedRoute>} />
                <Route path="/notes" element={<Navigate to="/training-notes" replace />} />
                <Route path="/improvement-tips" element={<Navigate to="/improvement-notes" replace />} />
                <Route path="*" element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
              </Routes>
            )}
          </React.Suspense>
        </ErrorBoundary>
      </div>

      {!marketing && <BottomNavigationWrapper />}
      <Toaster />
    </div>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const marketing = isMarketingHost();

  return (
    <SportProvider>
      <Router>
        <AppLayout marketing={marketing} session={session} loading={loading} />
      </Router>
    </SportProvider>
  );
}

export default App;
