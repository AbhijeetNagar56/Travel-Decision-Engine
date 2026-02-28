import { useState } from "react";
import axios from "axios";
import { Globe, Search, Loader2, MapPin, AlertTriangle, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [countries, setCountries] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!countries.trim()) {
      toast.error("Please enter at least one country");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/analyze", {
        countries: countries.split(",").map((c) => c.trim()),
        riskTolerance: "Low",
        duration: "Short-term",
      });
      setResults(res.data);
      toast.success("Analysis complete");
    } catch (err) {
      toast.error("Failed to fetch analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") analyze();
  };

  const countryTags = countries
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#080C14] text-white font-mono">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0F1623",
            color: "#E2E8F0",
            border: "1px solid #1E2D45",
            fontFamily: "monospace",
            fontSize: "13px",
          },
        }}
      />

      {/* Ambient grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,45,69,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,69,0.25) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[#3B82F6] to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Globe className="w-7 h-7 text-[#3B82F6]" strokeWidth={1.5} />
              <div className="absolute inset-0 blur-md bg-[#3B82F6] opacity-30 rounded-full" />
            </div>
            <span className="text-xs tracking-[0.3em] text-[#3B82F6] uppercase">
              Intelligence Platform
            </span>
          </div>

          <h1
            className="text-5xl font-bold tracking-tight leading-none mb-4"
            style={{ fontFamily: "'Courier New', monospace", letterSpacing: "-0.02em" }}
          >
            GLOBAL
            <br />
            <span className="text-[#3B82F6]">RELOCATION</span>
            <br />
            INTELLIGENCE
          </h1>

          <p className="text-[#4A5568] text-sm tracking-widest uppercase">
            Risk · Opportunity · Analysis
          </p>
        </header>

        {/* Input Section */}
        <section className="mb-12">
          <div className="border border-[#1E2D45] bg-[#0A1020] rounded-lg p-6">
            <label className="block text-xs text-[#4A5568] tracking-[0.2em] uppercase mb-4">
              Target Territories
            </label>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3F5A]"
                  strokeWidth={1.5}
                />
                <input
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Germany, Canada, Singapore..."
                  className="w-full bg-[#060B14] border border-[#1E2D45] rounded pl-11 pr-4 py-3.5 text-sm text-[#CBD5E0] placeholder-[#2D3F5A] outline-none focus:border-[#3B82F6] transition-colors duration-200"
                  style={{ fontFamily: "monospace" }}
                />
              </div>

              <button
                onClick={analyze}
                disabled={loading}
                className="flex items-center gap-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1E2D45] disabled:text-[#4A5568] text-white px-6 py-3.5 rounded text-sm font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                style={{ letterSpacing: "0.15em" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scanning</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>

            {/* Country tags preview */}
            {countryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {countryTags.map((c, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-xs bg-[#0F1A2E] border border-[#1E2D45] text-[#7090B0] px-3 py-1.5 rounded"
                  >
                    <ChevronRight className="w-3 h-3 text-[#3B82F6]" />
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="border border-[#1E2D45] bg-[#0A1020] rounded-lg p-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#1E2D45] border-t-[#3B82F6] animate-spin" />
              <Globe
                className="absolute inset-0 m-auto w-5 h-5 text-[#3B82F6]"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-[#4A5568] text-xs tracking-[0.25em] uppercase">
              Processing intelligence data...
            </p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[#1E2D45]" />
              <span className="text-xs text-[#4A5568] tracking-[0.25em] uppercase">
                Analysis Output
              </span>
              <div className="h-px flex-1 bg-[#1E2D45]" />
            </div>

            {/* If results is array of countries, render cards; otherwise raw */}
            {Array.isArray(results) ? (
              <div className="grid gap-4">
                {results.map((item: any, i: number) => (
                  <CountryCard key={i} data={item} />
                ))}
              </div>
            ) : typeof results === "object" && results !== null ? (
              <div className="grid gap-4">
                {Object.entries(results).map(([key, value]: any, i) => (
                  <div
                    key={i}
                    className="border border-[#1E2D45] bg-[#0A1020] rounded-lg p-6"
                  >
                    <div className="text-xs text-[#3B82F6] tracking-[0.2em] uppercase mb-3">
                      {key}
                    </div>
                    <pre className="text-[#8BA0B8] text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[#1E2D45] bg-[#0A1020] rounded-lg p-6">
                <pre className="text-[#8BA0B8] text-xs leading-relaxed overflow-x-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-20 flex items-center justify-between text-[#2D3F5A] text-xs tracking-widest uppercase">
          <span>Risk Tolerance: Low</span>
          <span className="text-[#1E2D45]">///</span>
          <span>Duration: Short-Term</span>
        </footer>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const l = level?.toLowerCase();
  if (l?.includes("low") || l?.includes("safe"))
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded">
        <CheckCircle className="w-3 h-3" /> {level}
      </span>
    );
  if (l?.includes("high") || l?.includes("danger"))
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded">
        <XCircle className="w-3 h-3" /> {level}
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded">
      <AlertTriangle className="w-3 h-3" /> {level}
    </span>
  );
}

function CountryCard({ data }: { data: any }) {
  const name = data.country || data.name || "Unknown";
  const risk = data.riskLevel || data.risk;
  const entries = Object.entries(data).filter(
    ([k]) => k !== "country" && k !== "name" && k !== "riskLevel" && k !== "risk"
  );

  return (
    <div className="border border-[#1E2D45] bg-[#0A1020] rounded-lg p-6 hover:border-[#3B82F6]/30 transition-colors duration-200">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs text-[#4A5568] tracking-[0.2em] uppercase mb-1">
            Territory
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">{name}</h2>
        </div>
        {risk && <RiskBadge level={String(risk)} />}
      </div>

      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {entries.map(([key, value]: any) => (
            <div key={key} className="bg-[#060B14] border border-[#1A2535] rounded p-3">
              <div className="text-[10px] text-[#4A5568] tracking-[0.2em] uppercase mb-1.5">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </div>
              <div className="text-sm text-[#8BA0B8]">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;