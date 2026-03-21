// src/Dashboard.js
import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://YOUR_FLASK_RENDER_URL/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setSummary(data);
      }
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pie chart data
  const pieData = summary
    ? {
        labels: Object.keys(summary),
        datasets: [
          {
            label: "Summary",
            data: Object.values(summary),
            backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
          },
        ],
      }
    : null;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Bank Analyzer Dashboard</h1>

      <div style={{ marginTop: "20px" }}>
        <input type="file" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          style={{ marginLeft: "10px", padding: "5px 10px" }}
        >
          Upload & Analyze
        </button>
      </div>

      {loading && <p>Processing file...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {summary && (
        <div style={{ marginTop: "20px" }}>
          <h2>Summary Table</h2>
          <table
            style={{
              borderCollapse: "collapse",
              width: "50%",
            }}
          >
            <tbody>
              {Object.entries(summary).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{key}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: "30px" }}>Summary Pie Chart</h2>
          <div style={{ width: "400px", height: "400px" }}>
            <Pie data={pieData} />
          </div>

          <div style={{ marginTop: "20px" }}>
            <a
              href="https://YOUR_FLASK_RENDER_URL/download"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button style={{ padding: "10px 20px", marginTop: "10px" }}>
                Download Excel
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;