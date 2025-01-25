import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import AddMatch from "@/pages/AddMatch";
import Login from "@/pages/Login";
import MatchDetail from "@/pages/MatchDetail";
import EditMatch from "@/pages/EditMatch";
import ViewAllMatches from "@/pages/ViewAllMatches";
import KeyOpponents from "@/pages/KeyOpponents";
import ImprovementNotes from "@/pages/ImprovementNotes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing while checking auth status
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Index /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-match"
          element={isAuthenticated ? <AddMatch /> : <Navigate to="/login" />}
        />
        <Route
          path="/match/:id"
          element={isAuthenticated ? <MatchDetail /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-match/:id"
          element={isAuthenticated ? <EditMatch /> : <Navigate to="/login" />}
        />
        <Route
          path="/matches"
          element={isAuthenticated ? <ViewAllMatches /> : <Navigate to="/login" />}
        />
        <Route
          path="/key-opponents"
          element={isAuthenticated ? <KeyOpponents /> : <Navigate to="/login" />}
        />
        <Route
          path="/improvement-notes"
          element={isAuthenticated ? <ImprovementNotes /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;