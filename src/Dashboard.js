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

  const BACKEND_URL = "https://bankanalyzer-j0mk.onrender.com";

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Upload failed");
      else setSummary(data);
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSample = async () => {
    setLoading(true);
    setError("");
    setSummary(null);
    try {
      const res = await fetch(`${BACKEND_URL}/download-sample`);
      if (!res.ok) throw new Error("Failed to fetch sample file");
      const blob = await res.blob();
      const tempFile = new File([blob], "sample_bank_statement.xlsx");
      const formData = new FormData();
      formData.append("file", tempFile);

      const analyzeRes = await fetch(`${BACKEND_URL}/api/analyze`, { method: "POST", body: formData });
      const data = await analyzeRes.json();
      if (!analyzeRes.ok) setError(data.error || "Analysis failed");
      else setSummary(data);
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const pieData = summary
    ? {
        labels: Object.keys(summary),
        datasets: [{ label: "Summary", data: Object.values(summary), backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"] }],
      }
    : null;

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold">Bank Analyzer Dashboard</h1>

      <div className="mt-5 flex flex-col items-start">
        <input type="file" onChange={handleFileChange} className="block w-full max-w-xs" />
        <button onClick={handleUpload} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Upload & Analyze</button>
        <button onClick={handleUseSample} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">Use Sample File</button>
      </div>

      {loading && <p className="mt-3">Processing file...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}

      {summary && (
        <div className="mt-5">
          <h2 className="text-xl font-semibold">Summary Table</h2>
          <table className="border-collapse border border-gray-300 mt-2">
            <tbody>
              {Object.entries(summary).map(([key, value]) => (
                <tr key={key}>
                  <td className="border border-gray-300 px-3 py-1">{key}</td>
                  <td className="border border-gray-300 px-3 py-1">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-xl font-semibold mt-5">Summary Pie Chart</h2>
          <div className="w-full max-w-xs mt-2">
            <Pie data={pieData} />
          </div>

          <div className="mt-3">
            <a href={`${BACKEND_URL}/download`} target="_blank" rel="noopener noreferrer">
              <button className="px-4 py-2 bg-purple-600 text-white rounded">Download Excel</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;