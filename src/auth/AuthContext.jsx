import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("mock_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = ({ email }) => {
    const u = { email, name: email.split("@")[0] };
    setUser(u);
    localStorage.setItem("mock_user", JSON.stringify(u));
  };

  const register = ({ name, email }) => {
    // เก็บบัญชีแบบ mock
    const accounts = JSON.parse(localStorage.getItem("mock_accounts") || "[]");
    const exists = accounts.some((a) => a.email === email);
    if (exists) throw new Error("Email already exists");

    accounts.push({ name, email }); // ไม่เก็บ password ในเดโม่
    localStorage.setItem("mock_accounts", JSON.stringify(accounts));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}