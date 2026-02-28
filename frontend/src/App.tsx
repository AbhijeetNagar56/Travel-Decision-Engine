import { useState } from "react";
import axios from "axios";

function App() {
  const [countries, setCountries] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);

    const res = await axios.post(
      "http://localhost:5000/api/analyze",
      {
        countries: countries.split(",").map(c => c.trim()),
        riskTolerance: "Low",
        duration: "Short-term"
      }
    );

    setResults(res.data);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Global Relocation Intelligence</h1>

      <input
        value={countries}
        onChange={(e) => setCountries(e.target.value)}
        placeholder="Enter countries separated by comma"
      />

      <button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {results && (
        <pre>{JSON.stringify(results, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;