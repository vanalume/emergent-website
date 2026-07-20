import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Collections from "@/pages/Collections";
import Philosophy from "@/pages/Philosophy";
import Founders from "@/pages/Founders";
import Contact from "@/pages/Contact";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/philosophy" element={<Philosophy />} />
            <Route path="/founders" element={<Founders />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" theme="light" toastOptions={{ style: { fontFamily: "Manrope, sans-serif" } }} />
    </div>
  );
}

export default App;
