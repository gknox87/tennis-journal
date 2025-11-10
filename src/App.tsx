
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
import Profile from "@/pages/Profile";
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
            path="/profile"
            element={session ? <Profile /> : <Navigate to="/login" replace />}
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
