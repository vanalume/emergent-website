import AdminLogin from "@/admin/AdminLogin";
import { useAdminAuth } from "@/admin/AdminAuth";

/**
 * AdminGuard — wraps the entire /admin subtree. Shows the login screen
 * until the shared ADMIN_KEY has been verified, then renders children.
 */
export default function AdminGuard({ children }) {
  const { state } = useAdminAuth();
  if (state !== "authed") return <AdminLogin />;
  return children;
}
