
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import AddMatch from "@/pages/AddMatch";
import EditMatch from "@/pages/EditMatch";
import MatchDetail from "@/pages/MatchDetail";
import ViewAllMatches from "@/pages/ViewAllMatches";
import KeyOpponents from "@/pages/KeyOpponents";
import ImprovementNotes from "@/pages/ImprovementNotes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes - redirect to dashboard if authenticated */}
          <Route
            path="/"
            element={session ? <Navigate to="/dashboard" /> : <Landing />}
          />
          <Route
            path="/login"
            element={session ? <Navigate to="/dashboard" /> : <Login />}
          />

          {/* Protected routes - redirect to login if not authenticated */}
          <Route
            path="/dashboard"
            element={session ? <Index /> : <Navigate to="/login" />}
          />
          <Route
            path="/add-match"
            element={session ? <AddMatch /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-match/:id"
            element={session ? <EditMatch /> : <Navigate to="/login" />}
          />
          <Route
            path="/match/:id"
            element={session ? <MatchDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/matches"
            element={session ? <ViewAllMatches /> : <Navigate to="/login" />}
          />
          <Route
            path="/key-opponents"
            element={session ? <KeyOpponents /> : <Navigate to="/login" />}
          />
          <Route
            path="/improvement-notes"
            element={session ? <ImprovementNotes /> : <Navigate to="/login" />}
          />

          {/* Catch all - redirect to dashboard if authenticated, otherwise to landing */}
          <Route
            path="*"
            element={session ? <Navigate to="/dashboard" /> : <Navigate to="/" />}
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
