import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const KEY_STORE = "vanalume_admin_key";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORE) || "");
  const [state, setState] = useState(key ? "checking" : "anon"); // anon | checking | authed | invalid
  const [error, setError] = useState("");

  const verify = useCallback(async (k) => {
    setError("");
    setState("checking");
    try {
      await axios.post(`${API}/admin/verify`, { key: k });
      localStorage.setItem(KEY_STORE, k);
      setKey(k);
      setState("authed");
      return true;
    } catch {
      setError("Incorrect access key.");
      setState("invalid");
      return false;
    }
  }, []);

  useEffect(() => {
    if (key && state === "checking") verify(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY_STORE);
    setKey("");
    setState("anon");
    setError("");
  }, []);

  const authHeaders = key ? { "X-Admin-Key": key } : {};

  return (
    <AdminAuthContext.Provider value={{ key, state, error, verify, logout, authHeaders }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const c = useContext(AdminAuthContext);
  if (!c) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return c;
};
