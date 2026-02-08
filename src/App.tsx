
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Landing from "@/pages/Landing";
import AddMatch from "@/pages/AddMatch";
import EditMatch from "@/pages/EditMatch";
import MatchDetail from "@/pages/MatchDetail";
import ViewAllMatches from "@/pages/ViewAllMatches";
import KeyOpponents from "@/pages/KeyOpponents";
import ImprovementNotes from "@/pages/ImprovementNotes";
import Calendar from "@/pages/Calendar";
import TrainingNotes from "@/pages/TrainingNotes";
import TrainingLoad from "@/pages/TrainingLoad";
import Wellness from "@/pages/Wellness";
import Profile from "@/pages/Profile";
import CoachDashboard from "@/pages/CoachDashboard";
import TeamDetail from "@/pages/TeamDetail";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Demo from "@/pages/Demo";
import HelpCenter from "@/pages/HelpCenter";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import InjuryTracker from "@/pages/InjuryTracker";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminTeams from "@/pages/AdminTeams";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "./App.css";
import { SportProvider } from "@/context/SportContext";
import { BottomNavigationWrapper } from "@/components/BottomNavigationWrapper";

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
          <Route
            path="/features"
            element={<Features />}
          />
          <Route
            path="/pricing"
            element={<Pricing />}
          />
          <Route
            path="/demo"
            element={<Demo />}
          />
          <Route
            path="/help"
            element={<HelpCenter />}
          />
          <Route
            path="/contact"
            element={<Contact />}
          />
          <Route
            path="/privacy"
            element={<Privacy />}
          />

          {/* Protected routes - redirect to login if not authenticated */}
          <Route
            path="/dashboard"
            element={session ? <Index /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/add-match"
            element={session ? <AddMatch /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/edit-match/:id"
            element={session ? <EditMatch /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/match/:id"
            element={session ? <MatchDetail /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/matches"
            element={session ? <ViewAllMatches /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/key-opponents"
            element={session ? <KeyOpponents /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/improvement-notes"
            element={session ? <ImprovementNotes /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/calendar"
            element={session ? <Calendar /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/training-notes"
            element={session ? <TrainingNotes /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/training-load"
            element={session ? <TrainingLoad /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/wellness"
            element={session ? <Wellness /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={session ? <Profile /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/coach"
            element={session ? <CoachDashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/team/:id"
            element={session ? <TeamDetail /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/injury-tracker"
            element={session ? <InjuryTracker /> : <Navigate to="/login" replace />}
          />
          {/* Admin routes - require admin role */}
          <Route
            path="/admin"
            element={session ? <AdminRoute><AdminDashboard /></AdminRoute> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/users"
            element={session ? <AdminRoute><AdminUsers /></AdminRoute> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/teams"
            element={session ? <AdminRoute><AdminTeams /></AdminRoute> : <Navigate to="/login" replace />}
          />
          {/* Catch all - redirect to dashboard if authenticated, otherwise to landing */}
          <Route
            path="*"
            element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />}
          />
          </Routes>
          <BottomNavigationWrapper />
          <Toaster />
        </div>
      </Router>
    </SportProvider>
  );
}

export default App;
