import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blogs from "@/pages/Blogs";
import BlogDetail from "@/pages/BlogDetail";
import { CartProvider } from "@/context/CartContext";
import { AdminAuthProvider } from "@/admin/AdminAuth";
import AdminGuard from "@/admin/AdminGuard";
import AdminShell from "@/admin/AdminShell";
import AdminOverview from "@/admin/pages/Overview";
import Submissions from "@/admin/pages/Submissions";
import Categories from "@/admin/pages/Categories";
import Products from "@/admin/pages/Products";
import Offers from "@/admin/pages/Offers";
import Sales from "@/admin/pages/Sales";
import Content from "@/admin/pages/Content";
import AdminBlogs from "@/admin/pages/Blogs";
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
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
              </Route>
              <Route path="/admin" element={<AdminGuard><AdminShell /></AdminGuard>}>
                <Route index element={<AdminOverview />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="offers" element={<Offers />} />
                <Route path="sales" element={<Sales />} />
                <Route path="content" element={<Content />} />
                <Route path="blogs" element={<AdminBlogs />} />
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
