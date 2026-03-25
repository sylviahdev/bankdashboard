import React, { useState } from "react";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const BACKEND = "http://localhost:10000";

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setSummary(null);
  };

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

  if (!loggedIn) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={handleLogin}>
          {loading ? "Processing..." : "Login"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  // Calculate totals
  let income = 0;
  let expenses = 0;
  if (summary) {
    Object.values(summary).forEach((val) => {
      if (val > 0) income += val;
      else expenses += val;
    });
  }
  const balance = income + expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>💳 Bank Analyzer</h1>
      <button onClick={handleLogout}>Logout</button>
      <br />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>
        {loading ? "Processing..." : "Upload & Analyze"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {summary && (
        <div>
          <h3>Income</h3>
          <strong style={{ color: "green" }}>{formatCurrency(income)}</strong>

          <h3>Expenses</h3>
          <strong style={{ color: "red" }}>{formatCurrency(expenses)}</strong>

          <h3>Balance</h3>
          <strong style={{ color: "blue" }}>{formatCurrency(balance)}</strong>

          <h3>Insights</h3>
          <p>💰 Savings Rate: {savingsRate}%</p>
          <p>📊 Total Categories: {Object.keys(summary).length}</p>
          <p>
            🧠 You spent{" "}
            {income !== 0
              ? Math.abs((expenses / income) * 100).toFixed(1)
              : 0}
            % of your income
          </p>

          <a href={`${BACKEND}/download`} target="_blank" rel="noreferrer">
            <button>Download Excel</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default Dashboard;