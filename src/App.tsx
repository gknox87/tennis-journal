import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@/pages/Dashboard";
import Matches from "@/pages/Matches";
import AddMatch from "@/pages/AddMatch";
import EditMatch from "@/pages/EditMatch";
import MatchDetail from "@/pages/MatchDetail";
import KeyOpponents from "@/pages/KeyOpponents";
import OpponentDetail from "@/pages/OpponentDetail";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/add-match" element={<AddMatch />} />
            <Route path="/edit-match/:id" element={<EditMatch />} />
            <Route path="/match/:id" element={<MatchDetail />} />
            <Route path="/key-opponents" element={<KeyOpponents />} />
            <Route path="/opponent/:id" element={<OpponentDetail />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;