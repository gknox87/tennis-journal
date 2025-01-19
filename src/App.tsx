import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import AddMatch from "@/pages/AddMatch";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/add-match" element={<AddMatch />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;