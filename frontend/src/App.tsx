import { useState } from "react";
import axios from "axios";
import {
  Globe,
  Search,
  Loader2,
  Clock,
  Database,
  Zap,
  Code2,
  ChevronDown,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ── Country Data ────────────────────────────────────────────────────────────
const COUNTRIES = [
  { name: "Canada",        flag: "🇨🇦", region: "Americas" },
  { name: "Brazil",        flag: "🇧🇷", region: "Americas" },
  { name: "Mexico",        flag: "🇲🇽", region: "Americas" },
  { name: "Argentina",     flag: "🇦🇷", region: "Americas" },
  { name: "Germany",       flag: "🇩🇪", region: "Europe"   },
  { name: "France",        flag: "🇫🇷", region: "Europe"   },
  { name: "Netherlands",   flag: "🇳🇱", region: "Europe"   },
  { name: "Sweden",        flag: "🇸🇪", region: "Europe"   },
  { name: "Switzerland",   flag: "🇨🇭", region: "Europe"   },
  { name: "Portugal",      flag: "🇵🇹", region: "Europe"   },
  { name: "Spain",         flag: "🇪🇸", region: "Europe"   },
  { name: "Norway",        flag: "🇳🇴", region: "Europe"   },
  { name: "Denmark",       flag: "🇩🇰", region: "Europe"   },
  { name: "Japan",         flag: "🇯🇵", region: "Asia"     },
  { name: "Singapore",     flag: "🇸🇬", region: "Asia"     },
  { name: "India",         flag: "🇮🇳", region: "Asia"     },
  { name: "Thailand",      flag: "🇹🇭", region: "Asia"     },
  { name: "Malaysia",      flag: "🇲🇾", region: "Asia"     },
  { name: "Vietnam",       flag: "🇻🇳", region: "Asia"     },
  { name: "Australia",     flag: "🇦🇺", region: "Oceania"  },
  { name: "Nigeria",       flag: "🇳🇬", region: "Africa"   },
  { name: "Kenya",         flag: "🇰🇪", region: "Africa"   },
];

const REGIONS = ["All", "Americas", "Europe", "Asia", "Oceania", "Africa"];

// ── Types ──────────────────────────────────────────────────────────────────
interface Scores {
  travelRisk: number;
  healthInfrastructure: number;
  environmentalStability: number;
  overall: number;
}
interface CountryResult {
  country: string;
  scores: Scores;
  fromCache: boolean;
}
interface Metadata {
  requestId: string;
  riskTolerance: string;
  duration: string;
  totalCountriesRequested: number;
  cacheHits: number;
  newComputations: number;
  currentCacheSize: number;
  executionTimeMs: number;
}
interface ApiResponse {
  metadata: Metadata;
  ranking: CountryResult[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const scoreColor = (v: number) => {
  if (v >= 78) return { bar: "#22C55E", text: "text-emerald-400", label: "STRONG" };
  if (v >= 68) return { bar: "#3B82F6", text: "text-blue-400",    label: "GOOD"   };
  if (v >= 55) return { bar: "#F59E0B", text: "text-amber-400",   label: "FAIR"   };
  return        { bar: "#EF4444", text: "text-red-400",     label: "WEAK"   };
};

const SCORE_KEYS: { key: keyof Omit<Scores, "overall">; label: string }[] = [
  { key: "travelRisk",             label: "Travel Risk"           },
  { key: "healthInfrastructure",   label: "Health Infrastructure" },
  { key: "environmentalStability", label: "Env. Stability"        },
];

// ── ScoreBar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, value }: { label: string; value: number }) {
  const { bar, text } = scoreColor(value);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-[#4A5568] tracking-[0.15em] uppercase">{label}</span>
        <span className={`text-xs font-bold ${text}`}>{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-[#0D1829] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: bar, transition: "width 0.7s ease" }}
        />
      </div>
    </div>
  );
}

// ── CountryCard (result) ──────────────────────────────────────────────────────
function CountryCard({ data, rank }: { data: CountryResult; rank: number }) {
  const { bar, text, label } = scoreColor(data.scores.overall);
  const meta = COUNTRIES.find((c) => c.name === data.country);
  return (
    <div className="border border-[#1E2D45] bg-[#0A1020] rounded-xl p-6 hover:border-[#3B82F6]/40 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-[#060B14] border border-[#1E2D45] flex items-center justify-center text-xs text-[#3B82F6] font-bold">
            #{rank}
          </div>
          <div>
            <div className="text-[10px] text-[#4A5568] tracking-[0.2em] uppercase mb-0.5">Territory</div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              {meta?.flag && <span className="text-xl">{meta.flag}</span>}
              {data.country}
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: bar + "40", background: bar + "12" }}
          >
            <span className="text-xl font-bold" style={{ color: bar }}>
              {data.scores.overall.toFixed(1)}
            </span>
            <div>
              <div className="text-[8px] text-[#4A5568] tracking-widest uppercase leading-none mb-0.5">Score</div>
              <div className={`text-[10px] font-bold tracking-widest ${text}`}>{label}</div>
            </div>
          </div>
          {data.fromCache ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">
              <Database className="w-2.5 h-2.5" /> CACHE HIT
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-0.5 rounded">
              <Zap className="w-2.5 h-2.5" /> COMPUTED
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {SCORE_KEYS.map(({ key, label }) => (
          <ScoreBar key={key} label={label} value={data.scores[key]} />
        ))}
      </div>
    </div>
  );
}

// ── MetaBar ──────────────────────────────────────────────────────────────────
function MetaBar({ meta }: { meta: Metadata }) {
  const secs = (meta.executionTimeMs / 1000).toFixed(2);
  return (
    <div className="fixed top-4 right-6 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-[#0A1020] border border-[#1E2D45] rounded-lg px-3.5 py-2">
        <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
        <span className="text-xs font-mono">
          <span className="text-[#3B82F6] font-bold">{secs}s</span>
        </span>
      </div>
      <div className="flex items-center gap-2 bg-[#0A1020] border border-[#1E2D45] rounded-lg px-3.5 py-2">
        <Database className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-mono">
          <span className="text-emerald-400 font-bold">{meta.cacheHits}</span>
          <span className="text-[#4A5568]"> / {meta.totalCountriesRequested} hits</span>
        </span>
      </div>
    </div>
  );
}

// ── RawOutput ────────────────────────────────────────────────────────────────
function RawOutput({ data }: { data: ApiResponse }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#1E2D45] bg-[#0A1020] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#0D1829] transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Code2 className="w-4 h-4 text-[#3B82F6]" />
          <span className="text-xs text-[#4A5568] tracking-[0.2em] uppercase">Raw API Output</span>
        </div>
        <ChevronDown
          className="w-4 h-4 text-[#4A5568] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="border-t border-[#1E2D45] px-6 py-5">
          <div className="mb-4">
            <div className="text-[10px] text-[#3B82F6] tracking-[0.2em] uppercase mb-2">metadata</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.metadata).map(([k, v]) => (
                <div key={k} className="flex items-start gap-2">
                  <span className="text-[11px] text-[#4A5568] min-w-0 break-all">
                    {k.replace(/([A-Z])/g, " $1").trim().toLowerCase()}:
                  </span>
                  <span className="text-[11px] text-[#7090B0] font-bold break-all">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[#1E2D45] pt-4">
            <div className="text-[10px] text-[#3B82F6] tracking-[0.2em] uppercase mb-2">ranking</div>
            <pre className="text-[11px] text-[#8BA0B8] leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(data.ranking, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CountrySelector ───────────────────────────────────────────────────────────
function CountrySelector({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  const [activeRegion, setActiveRegion] = useState("All");

  const filtered =
    activeRegion === "All"
      ? COUNTRIES
      : COUNTRIES.filter((c) => c.region === activeRegion);

  return (
    <div className="border border-[#1E2D45] bg-[#0A1020] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <label className="text-xs text-[#4A5568] tracking-[0.2em] uppercase">
          Select Territories
        </label>
        {selected.size > 0 && (
          <span className="text-xs text-[#3B82F6] font-bold font-mono">
            {selected.size} selected
          </span>
        )}
      </div>

      {/* Region filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
              activeRegion === r
                ? "bg-[#3B82F6] border-[#3B82F6] text-white font-bold"
                : "bg-transparent border-[#1E2D45] text-[#4A5568] hover:border-[#3B82F6]/40 hover:text-[#7090B0]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Country grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filtered.map((country) => {
          const isSelected = selected.has(country.name);
          return (
            <button
              key={country.name}
              onClick={() => onToggle(country.name)}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-[#3B82F6]/15 border-[#3B82F6] text-white"
                  : "bg-[#060B14] border-[#1A2535] text-[#7090B0] hover:border-[#3B82F6]/40 hover:text-[#A0B4C8]"
              }`}
            >
              <span className="text-base leading-none">{country.flag}</span>
              <span className="text-[11px] font-mono leading-tight truncate">{country.name}</span>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected chips strip */}
      {selected.size > 0 && (
        <div className="mt-5 pt-5 border-t border-[#1E2D45]">
          <div className="text-[10px] text-[#4A5568] tracking-[0.2em] uppercase mb-3">Selected</div>
          <div className="flex flex-wrap gap-2">
            {Array.from(selected).map((name) => {
              const c = COUNTRIES.find((c) => c.name === name);
              return (
                <span
                  key={name}
                  className="flex items-center gap-1.5 text-xs bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#93C5FD] px-2.5 py-1.5 rounded-lg"
                >
                  {c?.flag} {name}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggle(name); }}
                    className="text-[#4A5568] hover:text-[#EF4444] transition-colors ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleCountry = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const analyze = async () => {
    if (selected.size === 0) {
      toast.error("Please select at least one country");
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const res = await axios.post("http://localhost:5000/api/analyze", {
        countries: Array.from(selected),
        riskTolerance: "Low",
        duration: "Short-term",
      });
      setResponse(res.data as ApiResponse);
      toast.success("Analysis complete");
    } catch {
      toast.error("Failed to fetch analysis");
    } finally {
      setLoading(false);
    }
  };

  const ranked = response?.ranking ?? [];

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
            marginTop: "56px",
          },
        }}
      />

      {/* Grid BG */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,45,69,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,69,0.22) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[#3B82F6] to-transparent" />

      {response?.metadata && <MetaBar meta={response.metadata} />}

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <header className="mb-14">
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
            className="text-5xl font-bold leading-none mb-4"
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

        {/* Selector */}
        <section className="mb-4">
          <CountrySelector selected={selected} onToggle={toggleCountry} />
        </section>

        {/* Analyze Button */}
        <div className="mb-12">
          <button
            onClick={analyze}
            disabled={loading || selected.size === 0}
            className="w-full flex items-center justify-center gap-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1E2D45] disabled:text-[#4A5568] text-white py-4 rounded-xl text-sm font-bold uppercase transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            style={{ letterSpacing: "0.2em" }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Scanning {selected.size} Territories...</span></>
            ) : (
              <><Search className="w-4 h-4" /><span>Analyze{selected.size > 0 ? ` ${selected.size}` : ""} Territories</span></>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="border border-[#1E2D45] bg-[#0A1020] rounded-xl p-10 flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#1E2D45] border-t-[#3B82F6] animate-spin" />
              <Globe className="absolute inset-0 m-auto w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
            </div>
            <p className="text-[#4A5568] text-xs tracking-[0.25em] uppercase">
              Processing intelligence data...
            </p>
          </div>
        )}

        {/* Results */}
        {ranked.length > 0 && !loading && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-[#1E2D45]" />
              <span className="text-xs text-[#4A5568] tracking-[0.25em] uppercase">
                {ranked.length} Territories Ranked
              </span>
              <div className="h-px flex-1 bg-[#1E2D45]" />
            </div>
            <div className="grid gap-4 mb-6">
              {ranked.map((item, i) => (
                <CountryCard key={item.country} data={item} rank={i + 1} />
              ))}
            </div>
            <RawOutput data={response!} />
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