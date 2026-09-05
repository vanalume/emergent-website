import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import { CartProvider } from "@/context/CartContext";
import { AdminAuthProvider } from "@/admin/AdminAuth";
import AdminGuard from "@/admin/AdminGuard";
import AdminShell from "@/admin/AdminShell";
import AdminOverview from "@/admin/pages/Overview";
import Submissions from "@/admin/pages/Submissions";
import KitchenSink from "@/admin/pages/KitchenSink";
import ComingSoon from "@/admin/pages/ComingSoon";

function App() {
  return (
    <div className="App">
      <CartProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>
              <Route path="/admin" element={<AdminGuard><AdminShell /></AdminGuard>}>
                <Route index element={<AdminOverview />} />
                <Route path="products" element={<ComingSoon kicker="Catalogue" title="Products" description="Full CRUD with variants, sizes, images and ritual editing. Ships in Phase 4." />} />
                <Route path="categories" element={<ComingSoon kicker="Catalogue" title="Categories" description="Add, rename, retire categories and sub-categories. Ships in Phase 3." />} />
                <Route path="offers" element={<ComingSoon kicker="Merchandising" title="Seasonal Offers" description="Category-wide percentage discounts you can flip on and off. Ships in Phase 5." />} />
                <Route path="sales" element={<ComingSoon kicker="Analytics" title="Sales" description="Revenue, orders, top products, top categories — with presets and custom date ranges. Ships in Phase 6." />} />
                <Route path="content" element={<ComingSoon kicker="Website" title="Content" description="Edit Home, About, Contact intro, Footer and Navbar labels. Ships in Phase 7." />} />
                <Route path="submissions" element={<Submissions />} />
                <Route path="kitchensink" element={<KitchenSink />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="bottom-right" theme="light" toastOptions={{ style: { fontFamily: "Jost, sans-serif" } }} />
        </AdminAuthProvider>
      </CartProvider>
    </div>
  );
}

export default App;
