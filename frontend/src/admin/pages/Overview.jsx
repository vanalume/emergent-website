import { useEffect, useState } from "react";
import axios from "axios";
import { Package, Tag, FileText, IndianRupee, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/admin/primitives/StatCard";
import { useAdminAuth } from "@/admin/AdminAuth";
import { formatINR } from "@/context/CartContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_LINKS = [
  { to: "/admin/products", kicker: "Catalogue", title: "Products & Categories", desc: "Add products, edit variants and images." },
  { to: "/admin/offers", kicker: "Promotions", title: "Seasonal Offers", desc: "Turn a category-wide discount on or off." },
  { to: "/admin/blogs", kicker: "Journal", title: "Blogs", desc: "Write and publish stories to the site." },
  { to: "/admin/sales", kicker: "Analytics", title: "Sales", desc: "Revenue, orders and top products." },
];

export default function AdminOverview() {
  const { authHeaders } = useAdminAuth();
  const [stats, setStats] = useState({
    revenue: null, orders: null, live: null, total: null, offers: null, pages: null, blogs: null,
  });

  useEffect(() => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    Promise.all([
      axios.get(`${API}/admin/sales/summary`, { headers: authHeaders, params: { from: monthStart } }),
      axios.get(`${API}/admin/products`, { headers: authHeaders }),
      axios.get(`${API}/admin/offers`, { headers: authHeaders }),
      axios.get(`${API}/admin/content/pages`, { headers: authHeaders }),
      axios.get(`${API}/admin/blogs`, { headers: authHeaders }),
    ])
      .then(([s, p, o, c, b]) => {
        const products = p.data || [];
        const offers = o.data || [];
        const pages = c.data || [];
        const blogs = b.data || [];
        setStats({
          revenue: s.data?.revenue ?? 0,
          orders: s.data?.orders ?? 0,
          live: products.filter((x) => !x.draft).length,
          total: products.length,
          offers: offers.filter((x) => x.active).length,
          pages: pages.length,
          blogs: blogs.filter((x) => x.published).length,
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaded = stats.revenue !== null;

  return (
    <div>
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Overview</p>
      <h1 className="font-display text-5xl md:text-6xl mt-2 leading-none">Welcome back</h1>
      <p className="text-[#5c3e2b]/80 mt-4 max-w-xl">
        A quick snapshot of the store — this month's revenue, catalogue, offers and content.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-10">
        <StatCard
          kicker="Revenue · this month"
          value={loaded ? formatINR(stats.revenue) : "—"}
          sub={loaded ? `${stats.orders} paid order${stats.orders === 1 ? "" : "s"}` : undefined}
          icon={IndianRupee}
          accent="#d4a574"
        />
        <StatCard
          kicker="Products live"
          value={loaded ? String(stats.live) : "—"}
          sub={loaded ? `of ${stats.total} products` : undefined}
          icon={Package}
          accent="#395439"
        />
        <StatCard
          kicker="Active offers"
          value={loaded ? String(stats.offers) : "—"}
          sub={loaded ? "running now" : undefined}
          icon={Tag}
          accent="#9a3b2e"
        />
        <StatCard
          kicker="Blogs"
          value={loaded ? String(stats.blogs) : "—"}
          sub={loaded ? "published" : undefined}
          icon={BookOpen}
          accent="#8a6d3b"
        />
        <StatCard
          kicker="Content pages"
          value={loaded ? String(stats.pages) : "—"}
          sub={loaded ? "editable from Content" : undefined}
          icon={FileText}
          accent="#5c3e2b"
        />
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="group block bg-[#faf7f1] border border-[#2b2320]/10 rounded-sm p-6 hover:border-[#2b2320]/40 transition-colors"
          >
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b]">{q.kicker}</p>
            <p className="font-display text-2xl mt-2">{q.title}</p>
            <p className="text-sm text-[#2b2320]/70 mt-2">{q.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
