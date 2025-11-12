// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "./api.js";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      const res = await checkAuth();
      if (res.status !== "ok") {
        navigate("/login");
      }
      setLoading(false);
    }
    verify();
  }, []);

  if (loading) return <div className="p-6 text-center">Vérification de session...</div>;

  return children;
}
