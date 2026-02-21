import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting login with:", { email });

      // Using configured API instance
      const response = await api.post("/auth/login", { email, password });

      console.log("Login response status:", response.status);

      const data = response.data;
      console.log("Login response data:", data);

      // Extract token from response
      let token = null;

      // Enhanced token extraction with detailed logging
      console.log("Response data structure:", JSON.stringify(data, null, 2));

      try {
        // Check standard location first
        if (data?.data?.token) {
          token = data.data.token;
          console.log("Found token in data.data.token");
        }
        // Try other possible locations
        else if (data?.token) {
          token = data.token;
          console.log("Found token in data.token");
        }
        // Check if data itself is the token (string)
        else if (typeof data.data === "string") {
          token = data.data;
          console.log("Using data.data string as token");
        }

        console.log("Found token in response:", !!token);

        if (!token) throw new Error("Token missing in server response");

        // Clean the token - remove quotes and whitespace
        if (typeof token === "string") {
          token = token.trim().replace(/(^["']|["']$)/g, "");
          console.log("Cleaned token length:", token.length);
        }
      } catch (tokenError) {
        console.error("Error extracting token:", tokenError);
        throw new Error("Could not extract authentication token from response");
      }

      // Store token with console logs for debugging
      console.log(`Storing token in localStorage (length: ${token.length}, preview: ${token.substring(0, 10)}...)`);
      localStorage.setItem("cms_token", token);

      // Verify token was stored
      const storedToken = localStorage.getItem("cms_token");
      console.log(`Stored token verified (length: ${storedToken?.length || 0})`);

      // Clear any old auth-related storage that might be causing conflicts
      sessionStorage.removeItem("cms_token");

      nav("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 text-slate-100">
      <form onSubmit={submit} className="bg-slate-800 p-8 rounded-xl w-full max-w-md shadow-xl">
        <h1 className="mt-0 mb-6 text-2xl font-semibold">CMS Login</h1>
        <label htmlFor="email" className="block mb-1 text-sm">
          Email
        </label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <label htmlFor="password" className="block mt-4 mb-1 text-sm">
          Password
        </label>
        <input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <div className="text-red-400 mt-2 text-sm">{error}</div>}
        <button disabled={loading} className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 font-semibold">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
