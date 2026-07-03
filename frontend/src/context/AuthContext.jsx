import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedCompany = localStorage.getItem("company");

    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("company");
        } else {
          setToken(savedToken);
          setUser({
            id: decoded.id,
            role: decoded.role,
            name: decoded.name,
            companyId: decoded.companyId,
          });

          // Restore company info
          if (savedCompany) {
            try {
              setCompany(JSON.parse(savedCompany));
            } catch {
              localStorage.removeItem("company");
            }
          }
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("company");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });

    const { token: newToken, user: userData, company: companyData } = res.data;

    localStorage.setItem("token", newToken);
    if (companyData) {
      localStorage.setItem("company", JSON.stringify(companyData));
      setCompany(companyData);
    }
    setToken(newToken);

    const decoded = jwtDecode(newToken);
    setUser({
      id: decoded.id,
      role: decoded.role,
      name: userData.name,
      companyId: decoded.companyId,
    });

    return decoded.role;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("company");
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ user, company, setCompany, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
