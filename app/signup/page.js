"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false); // State to track if the sign-up process is in progress
  const [error, setError] = useState(""); // State to hold any error messages that occur during sign-up
  const [success, setSuccess] = useState(false); // State to indicate if sign-up was successful (used to show a confirmation message instead of the form)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) // Runs when user clicks “Sign Up”
  {
    e.preventDefault(); // Stop the form from refreshing the page when submitted
    setLoading(true); // Set loading to true to disable the button and show a loading state
    setError(""); // Clear any previous error messages

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone,
          role: form.role,
        },
      }, // account is created in SPB auth system, and the additional user data is stored
    });

    if (signUpError) // If there's an error during sign-up, show the error message and stop loading
    {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true); // If sign-up is successful, set success to true to show the confirmation message
    setLoading(false); // Stop loading since the process is complete
  }

  if (success) // If sign-up was successful, show a confirmation message instead of the form
  {
    return (
      <main style={styles.page}>
        <style>{globalCSS}</style>
        <div style={styles.card}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#E1F5EE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 style={styles.title}>Check your email</h1>
            <p style={styles.subtitle}>We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.</p>
            <a href="/login" style={styles.linkBtn}>Go to Login</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{globalCSS}</style>

      <div style={styles.card}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px", textDecoration: "none" }}>
          <img src="/logo.png" alt="BioConnect" style={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1a1a2e" }}>BioConnect</span>
        </a>

        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Join India's biotech community</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          <div>
            <label style={styles.label}>Full Name</label>
            <input name="fullName" type="text" placeholder="John Doe" required value={form.fullName} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Email Address</label>
            <input name="email" type="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Phone Number <span style={{ color: "#999", fontWeight: 400 }}>(Optional)</span></label>
            <input name="phone" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input name="password" type="password" placeholder="••••••••" required minLength={8} value={form.password} onChange={handleChange} style={styles.input} />
            <span style={{ fontSize: "12px", color: "#888", marginTop: "4px", display: "block" }}>Minimum 8 characters</span>
          </div>

          <div>
            <label style={styles.label}>I am a...</label>
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="student">Student</option>
              <option value="educator">Educator</option>
              <option value="researcher">Researcher</option>
              <option value="industry">Industry Professional</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#666", marginTop: "20px" }}>
          Already have an account? <a href="/login" style={{ color: "#5B4FD8", fontWeight: 500 }}>Sign in</a>
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
  linkBtn: {
    display: "inline-block",
    marginTop: "16px",
    color: "#5B4FD8",
    fontWeight: 500,
    fontSize: "14px",
    textDecoration: "none",
  },
};