import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem("cms_token");
    if (token) navigate("/dashboard");
    else navigate("/login");
  }, [navigate]);

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
