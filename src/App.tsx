
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import AddMatch from "@/pages/AddMatch";
import EditMatch from "@/pages/EditMatch";
import MatchDetail from "@/pages/MatchDetail";
import ViewAllMatches from "@/pages/ViewAllMatches";
import KeyOpponents from "@/pages/KeyOpponents";
import ImprovementNotes from "@/pages/ImprovementNotes";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-match" element={<AddMatch />} />
          <Route path="/edit-match/:id" element={<EditMatch />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/matches" element={<ViewAllMatches />} />
          <Route path="/key-opponents" element={<KeyOpponents />} />
          <Route path="/improvement-notes" element={<ImprovementNotes />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
