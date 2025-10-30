// contexts/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("app_token");
    const u = localStorage.getItem("app_user");
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
    setLoading(false);
  }, []);

  const signinWithToken = async (t, u) => {
    setToken(t);
    setUser(u || null);
    localStorage.setItem("app_token", t);
    localStorage.setItem("app_user", JSON.stringify(u || null));
  };

  const signout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_user");
  };

  const value = useMemo(
    () => ({ token, user, setUser, signinWithToken, signout, loading }),
    [token, user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
