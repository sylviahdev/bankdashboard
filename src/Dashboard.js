import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

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
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) setError(data.error);
      else {
        setSuccess("Registration successful! Please login.");
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
        headers: {"Content-Type": "application/json"},
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

  // -------- LOGIN SCREEN --------
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={registerMode ? handleRegister : handleLogin}
          className="bg-white p-6 rounded-xl shadow-lg w-80 space-y-3"
        >
          <h2 className="text-xl font-bold text-center">
            {registerMode ? "Register" : "Login"}
          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Processing..." : registerMode ? "Register" : "Login"}
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}

          <p
            onClick={() => {
              setRegisterMode(!registerMode);
              setError("");
            }}
            className="text-center text-blue-600 cursor-pointer text-sm"
          >
            {registerMode ? "Login instead" : "Create account"}
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

  const chartData = summary
    ? Object.entries(summary).map(([name, value]) => ({
        name,
        value: Math.abs(value),
      }))
    : [];

  const savingsRate =
    income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  // -------- DASHBOARD --------
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">

      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-xl">

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">💳 Bank Analyzer</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* Upload */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleUpload}
          className="w-full mt-3 bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>

        {/* Alerts */}
        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        {success && <p className="text-green-600 mt-3 text-center">{success}</p>}

        {/* Cards */}
        {summary && (
          <>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p>Income</p>
                <h2>{formatCurrency(income)}</h2>
              </div>

              <div className="bg-red-100 p-4 rounded-lg text-center">
                <p>Expenses</p>
                <h2>{formatCurrency(expenses)}</h2>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <p>Balance</p>
                <h2>{formatCurrency(balance)}</h2>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-6 h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="value" label>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Insights</h3>
              <p>💰 Savings Rate: {savingsRate}%</p>
              <p>📊 Total Categories: {chartData.length}</p>
              <p>
                🧠 You spent{" "}
                {income !== 0
                  ? Math.abs((expenses / income) * 100).toFixed(1)
                  : 0}
                % of your income
              </p>
            </div>

            {/* Download */}
            <a
              href={`${BACKEND}/download`}
              target="_blank"
              rel="noreferrer"
            >
              <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded">
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