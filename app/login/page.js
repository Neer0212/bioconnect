"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  } // Simple form state management: when an input changes, update the corresponding field in the form state

  async function handleSubmit(e) {
    e.preventDefault(); // Stops page refresh
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    }); // Attempt to sign in with SPB using the email and password from the form. If there's an error, it will be stored in signInError

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return; // If there's an error during sign-in, show the error message and stop loading
    }

    router.push("/dashboard"); // If sign-in is successful, redirect to the dashboard page
  }

  return (
    <main style={styles.page}>
      <style>{globalCSS}</style>

      <div style={styles.card}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px", textDecoration: "none" }}>
          <img src="/logo.jpg" alt="BioConnect" style={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e" }}>BioConnect</span>
        </a>

        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to continue your biotech journey</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          <div>
            <label style={styles.label}>Email or Phone</label>
            <input name="email" type="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input name="password" type="password" placeholder="••••••••" required value={form.password} onChange={handleChange} style={styles.input} />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#666", marginTop: "20px" }}>
          Don't have an account? <a href="/signup" style={{ color: "#5B4FD8", fontWeight: 500 }}>Sign up</a>
        </p>
      </div>
    </main>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { background: #F5F4FB; margin: 0; }
`;

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#F5F4FB",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #E8E6F8",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "440px",
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "26px",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginBottom: "28px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    color: "#1a1a2e",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #E8E6F8",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#fff",
    color: "#1a1a2e",
  },
  btn: {
    background: "#5B4FD8",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "4px",
  },
  error: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "12px",
  },
};