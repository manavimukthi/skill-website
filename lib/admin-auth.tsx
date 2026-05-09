"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthState = {
  isAuthenticated: boolean;
  email: string;
};

type AuthContextType = {
  auth: AuthState;
  ready: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  auth: { isAuthenticated: false, email: "" },
  ready: false,
  login: () => false,
  logout: () => {},
});

const STORAGE_KEY = "sf_admin_auth";
const ADMIN_EMAIL = "suport@ceyliz.tech";
const ADMIN_PASSWORD = "indu@#3111";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    email: "",
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState;
        if (parsed.isAuthenticated) setAuth(parsed);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  function login(email: string, password: string): boolean {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const state: AuthState = { isAuthenticated: true, email };
      setAuth(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    }
    return false;
  }

  function logout() {
    setAuth({ isAuthenticated: false, email: "" });
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ auth, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AuthContext);
}
