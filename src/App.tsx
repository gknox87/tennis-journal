
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "./App.css";
import { SportProvider } from "@/context/SportContext";
import { BottomNavigationWrapper } from "@/components/BottomNavigationWrapper";
import React from "react";

// Eagerly load landing/auth pages for instant first paint
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Lazy-load all other pages to reduce initial bundle size
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

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SportProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <React.Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes - redirect to dashboard if authenticated */}
              <Route
                path="/"
                element={session ? <Navigate to="/dashboard" replace /> : <Landing />}
              />
              <Route
                path="/login"
                element={session ? <Navigate to="/dashboard" replace /> : <Login />}
              />
              <Route
                path="/register"
                element={session ? <Navigate to="/dashboard" replace /> : <Register />}
              />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Protected routes - redirect to login if not authenticated */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-match"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <AddMatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-match/:id"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <EditMatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match/:id"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <MatchDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <ViewAllMatches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/key-opponents"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <KeyOpponents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opponent/:id"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <OpponentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/improvement-notes"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <ImprovementNotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training-notes"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <TrainingNotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training-load"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <TrainingLoad />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wellness"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <Wellness />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <Goals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <CoachDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team/:id"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <TeamDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/injury-tracker"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <InjuryTracker />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes - require admin role */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teams"
                element={
                  <ProtectedRoute session={session} isLoading={loading}>
                    <AdminRoute>
                      <AdminTeams />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to dashboard if authenticated, otherwise to landing */}
              <Route
                path="*"
                element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />}
              />
            </Routes>
          </React.Suspense>
          <BottomNavigationWrapper />
          <Toaster />
        </div>
      </Router>
    </SportProvider>
  );
}

export default App;
