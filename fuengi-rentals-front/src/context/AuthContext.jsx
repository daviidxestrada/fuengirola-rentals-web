import { useEffect, useState } from "react";

import { getCurrentUser } from "../services";
import { AuthContext } from "./authContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthReady(true);
      return;
    }

    const syncSession = async () => {
      try {
        const data = await getCurrentUser();
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    syncSession();
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
