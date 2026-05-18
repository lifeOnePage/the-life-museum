// contexts/AuthContext.js
"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { authedFetch } from "@/app/utils/authedFetch";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCredits = useCallback(async () => {
    try {
      const res = await authedFetch(`${BASE_URL}/credit/balance`);
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, credits: data.credits };
          localStorage.setItem("app_user", JSON.stringify(updated));
          return updated;
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("app_token");
    const u = localStorage.getItem("app_user");
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
    setLoading(false);
  }, []);

  // Fetch latest credits when authenticated
  useEffect(() => {
    if (token) refreshCredits();
  }, [token, refreshCredits]);

  // Listen for forced logout from authedFetch
  useEffect(() => {
    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const signinWithToken = async (t, u, refreshToken) => {
    setToken(t);
    setUser(u || null);
    localStorage.setItem("app_token", t);
    localStorage.setItem("app_user", JSON.stringify(u || null));
    if (refreshToken) {
      localStorage.setItem("app_refresh_token", refreshToken);
    }
  };

  const signout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_refresh_token");
    localStorage.removeItem("app_user");
  };

  const value = useMemo(
    () => ({ token, user, setUser, signinWithToken, signout, loading, refreshCredits }),
    [token, user, loading, refreshCredits],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
