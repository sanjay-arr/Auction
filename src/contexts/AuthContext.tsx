import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AuthState, User } from "@/data/types";
import { mockUsers } from "@/data/mockData";

interface RegisteredUser extends User {
  password?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: User['role']) => boolean;
  register: (name: string, email: string, password: string, role: User['role']) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  // initialize registered users from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bp_registered_users");
      if (raw) setRegisteredUsers(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const persistUsers = (users: RegisteredUser[]) => {
    try {
      localStorage.setItem("bp_registered_users", JSON.stringify(users));
    } catch (e) {
      // ignore
    }
  };

  const login = useCallback((email: string, password: string, role: User['role']) => {
    // check registered users first (requires password)
    const reg = registeredUsers.find((u) => u.email === email && u.role === role && u.password === password);
    if (reg) {
      const user: User = { id: reg.id, name: reg.name, email: reg.email, role: reg.role };
      setAuthState({ user, isAuthenticated: true });
      return true;
    }

    // fallback: allow login for seeded mockUsers by email+role (no password check)
    const seeded = mockUsers.find((u) => u.email === email && u.role === role);
    if (seeded) {
      setAuthState({ user: seeded, isAuthenticated: true });
      return true;
    }

    // otherwise, login fails. Do NOT auto-create demo users.
    return false;
  }, [registeredUsers]);

  const register = useCallback((name: string, email: string, password: string, role: User['role']) => {
    const newUser: RegisteredUser = { id: Date.now().toString(), name, email, role, password };
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    persistUsers(updated);
    setAuthState({ user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, isAuthenticated: true });
    return true;
  }, [registeredUsers]);

  const logout = useCallback(() => {
    setAuthState({ user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
