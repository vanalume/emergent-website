import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, Tag, LineChart, FileText, Inbox, Beaker, LogOut, ExternalLink } from "lucide-react";
import { useAdminAuth } from "@/admin/AdminAuth";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/offers", label: "Offers", icon: Tag },
  { to: "/admin/sales", label: "Sales", icon: LineChart },
  { to: "/admin/content", label: "Website content", icon: FileText },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox },
];

export default function AdminShell() {
  const { logout } = useAdminAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#2b2320]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-[#f8f6f2] border-r border-[#2b2320]/10 flex flex-col z-40">
        <div className="px-6 py-6 border-b border-[#2b2320]/10">
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Vanalume</p>
          <p className="font-display text-2xl mt-0.5 leading-none">Admin</p>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                data-testid={`nav-${item.to.replace(/\//g, "-")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-[#2b2320] text-[#f8f6f2]"
                    : "text-[#2b2320]/75 hover:bg-[#2b2320]/5 hover:text-[#2b2320]"
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.6} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <NavLink
          to="/admin/kitchensink"
          className="mx-3 mb-2 flex items-center gap-3 px-3 py-2 rounded-sm text-xs text-[#5c3e2b]/70 hover:bg-[#2b2320]/5"
        >
          <Beaker size={13} /> Kitchen sink
        </NavLink>

        <div className="border-t border-[#2b2320]/10 p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs text-[#5c3e2b]/80 hover:bg-[#2b2320]/5"
          >
            <ExternalLink size={13} /> Open live site
          </a>
          <button
            onClick={logout}
            data-testid="admin-logout-btn"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs text-[#9a3b2e]/85 hover:bg-[#9a3b2e]/10"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="pl-64">
        <div className="px-8 md:px-12 py-10 max-w-[1440px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
