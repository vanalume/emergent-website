import { useState } from "react";
import { Lock } from "lucide-react";
import { useAdminAuth } from "@/admin/AdminAuth";

export default function AdminLogin() {
  const { verify, state, error } = useAdminAuth();
  const [input, setInput] = useState("");
  const busy = state === "checking";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ea] px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 text-[#5c3e2b] mb-6">
          <Lock size={16} />
          <span className="text-xs tracking-[0.24em] uppercase">Vanalume Admin</span>
        </div>
        <h1 className="font-display text-5xl mb-8 leading-none">Welcome back</h1>
        <form onSubmit={(e) => { e.preventDefault(); verify(input); }} className="space-y-5">
          <input
            data-testid="admin-key-input"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Access key"
            autoFocus
            className="w-full bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-3 text-lg placeholder:text-[#2b2320]/25"
          />
          {error && <p className="text-sm text-[#9a3b2e]">{error}</p>}
          <button
            data-testid="admin-login-btn"
            type="submit"
            disabled={busy || !input.trim()}
            className="w-full bg-[#2b2320] text-[#f8f6f2] rounded-full py-3.5 text-sm tracking-wide hover:bg-[#395439] transition-colors disabled:opacity-50"
          >
            {busy ? "Checking…" : "Enter"}
          </button>
        </form>
        <p className="text-[11px] text-[#5c3e2b]/60 mt-6">Access is granted with an admin key. Do not share.</p>
      </div>
    </div>
  );
}
