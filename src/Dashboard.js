import React, { useState } from "react";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const BACKEND = "http://localhost:10000";

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

  // -------- REGISTER --------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${BACKEND}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) setError(data.error);
      else {
        setSuccess("Account created successfully ✅");
        setRegisterMode(false);
      }
    } catch {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // -------- LOGIN --------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) setError(data.error);
      else {
        localStorage.setItem("token", data.token);
        setLoggedIn(true);
      }
    } catch {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // -------- LOGOUT --------
  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setSummary(null);
  };

  // -------- UPLOAD --------
  const handleUpload = async () => {
    if (!file) return setError("Select a file");

    setLoading(true);
    setError("");
    setSuccess("");
    setSummary(null);

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND}/api/analyze`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) setError(data.error);
      else {
        setSummary(data);
        setSuccess("Analysis complete ✅");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // -------- LOGIN / REGISTER SCREEN --------
  if (!loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f7fb",
        }}
      >
        <form
          onSubmit={registerMode ? handleRegister : handleLogin}
          style={{
            width: "320px",
            padding: "25px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
            {registerMode ? "Create Account" : "Login"}
          </h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <button
            style={{
              width: "100%",
              padding: "10px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            {loading
              ? "Processing..."
              : registerMode
              ? "Register"
              : "Login"}
          </button>

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
          {success && (
            <p style={{ color: "green", textAlign: "center" }}>{success}</p>
          )}

          <p
            onClick={() => {
              setRegisterMode(!registerMode);
              setError("");
            }}
            style={{
              textAlign: "center",
              marginTop: "10px",
              cursor: "pointer",
              color: "#2563eb",
            }}
          >
            {registerMode
              ? "Already have an account? Login"
              : "Create account"}
          </p>
        </form>
      </div>
    );
  }

  // -------- CALCULATIONS --------
  let income = 0;
  let expenses = 0;

  if (summary) {
    Object.values(summary).forEach((val) => {
      if (val > 0) income += val;
      else expenses += val;
    });
  }

  const balance = income + expenses;
  const savingsRate =
    income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  // -------- DASHBOARD --------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h1>💳 Bank Analyzer</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* UPLOAD */}
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>

        {/* ALERTS */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        {/* CARDS */}
        {summary && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              <div style={{ background: "#ecfdf5", padding: "15px" }}>
                <p>Income</p>
                <h2 style={{ color: "green" }}>
                  {formatCurrency(income)}
                </h2>
              </div>

              <div style={{ background: "#fef2f2", padding: "15px" }}>
                <p>Expenses</p>
                <h2 style={{ color: "red" }}>
                  {formatCurrency(expenses)}
                </h2>
              </div>

              <div style={{ background: "#eff6ff", padding: "15px" }}>
                <p>Balance</p>
                <h2 style={{ color: "blue" }}>
                  {formatCurrency(balance)}
                </h2>
              </div>
            </div>

            {/* INSIGHTS */}
            <div style={{ marginTop: "20px" }}>
              <h3>Insights</h3>
              <p>💰 Savings Rate: {savingsRate}%</p>
              <p>📊 Categories: {Object.keys(summary).length}</p>
            </div>

            {/* DOWNLOAD */}
            <a
              href={`${BACKEND}/download`}
              target="_blank"
              rel="noreferrer"
            >
              <button style={{ marginTop: "20px" }}>
                Download Excel
              </button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;