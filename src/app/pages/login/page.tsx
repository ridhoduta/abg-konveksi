"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/service/authService";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login({ username, password });
      if (result.success && result.data) {
        const role = result.data.role;
        if (role === "ADMIN") router.push("/pages/admin");
        else if (role === "KASIR") router.push("/pages/kasir");
        else router.push("/");
      } else {
        setError(result.message || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim p-md relative overflow-hidden">
      {/* Brand card background / minimal branding */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-xl -right-xl w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute -bottom-xl -left-xl w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[400px] bg-surface-container-lowest border border-outline-variant rounded-md p-xl relative z-10 shadow-lg">
        <div className="text-center mb-xl">
          <div className="w-12 h-12 bg-primary text-on-primary rounded-sm inline-flex items-center justify-center mb-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1 className="headline-md text-on-surface mb-xs">ABG Konveksi</h1>
          <p className="body-sm text-on-surface-variant">Garment Operations Management</p>
        </div>

        {error && (
          <div className="flex items-center gap-sm p-md bg-error-container border border-error rounded-sm text-on-error-container body-sm mb-lg animate-in fade-in slide-in-from-top-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <label htmlFor="username" className="label-sm text-on-surface-variant uppercase tracking-wider">Username</label>
            <div className="relative flex items-center">
              <svg className="absolute left-md text-outline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input 
                id="username" 
                type="text" 
                placeholder="Masukkan username" 
                className="input-field w-full pl-xl"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                autoComplete="username" 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="password" className="label-sm text-on-surface-variant uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <svg className="absolute left-md text-outline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Masukkan password" 
                className="input-field w-full pl-xl pr-xl"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password" 
                disabled={loading} 
              />
              <button 
                type="button" 
                className="absolute right-md text-outline hover:text-on-surface transition-colors" 
                onClick={() => setShowPassword(!showPassword)} 
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-sm flex items-center justify-center gap-sm disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? <div className="spinner !w-5 !h-5 border-white"></div> : (
              <>
                <span>MASUK KE SISTEM</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-xl pt-lg border-t border-outline-variant">
          <p className="label-sm text-on-surface-variant opacity-60">© 2026 ABG Konveksi. Terminal Aman.</p>
        </div>
      </div>
    </div>
  );
}