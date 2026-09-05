import { Package, Tag, FileText, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/admin/primitives/StatCard";

export default function AdminOverview() {
  return (
    <div>
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Overview</p>
      <h1 className="font-display text-5xl md:text-6xl mt-2 leading-none">Welcome back</h1>
      <p className="text-[#5c3e2b]/80 mt-4 max-w-xl">
        The pieces are being built out phase by phase. Live numbers land in the Sales section soon.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        <StatCard kicker="Revenue · this month" value="—" sub="Wiring up in Phase 6" icon={IndianRupee} accent="#d4a574" />
        <StatCard kicker="Products live" value="—" sub="Managed from Products" icon={Package} accent="#395439" />
        <StatCard kicker="Active offers" value="—" sub="Managed from Offers" icon={Tag} accent="#9a3b2e" />
        <StatCard kicker="Page updates" value="—" sub="Managed from Content" icon={FileText} accent="#5c3e2b" />
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/products" className="group block bg-[#faf7f1] border border-[#2b2320]/10 rounded-sm p-6 hover:border-[#2b2320]/40 transition-colors">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b]">Coming next</p>
          <p className="font-display text-2xl mt-2">Products &amp; Categories</p>
          <p className="text-sm text-[#2b2320]/70 mt-2">Add products, edit variants, upload images — no code required.</p>
        </Link>
        <Link to="/admin/offers" className="group block bg-[#faf7f1] border border-[#2b2320]/10 rounded-sm p-6 hover:border-[#2b2320]/40 transition-colors">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b]">Coming next</p>
          <p className="font-display text-2xl mt-2">Seasonal Offers</p>
          <p className="text-sm text-[#2b2320]/70 mt-2">Turn a category-wide discount on or off in a click.</p>
        </Link>
      </div>
    </div>
  );
}
