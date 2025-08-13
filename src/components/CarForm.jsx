import { useState, useEffect } from "react";

// Tiny JSONP helper: jsonp("https://...&cmd=getMakes").then(data => { ... })
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = "cb_" + Math.random().toString(36).slice(2);
    const sep = url.includes("?") ? "&" : "?";
    const script = document.createElement("script");
    script.src = `${url}${sep}callback=${cb}`;
    script.async = true;

    // Define the callback globally (JSONP requirement)
    window[cb] = (data) => {
      resolve(data);
      cleanup();
    };

    script.onerror = (e) => {
      reject(new Error("JSONP request failed"));
      cleanup();
    };

    function cleanup() {
      try { delete window[cb]; } catch {}
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }

    document.body.appendChild(script);
  });
}

export default function CarForm({ onSearch, loading }) {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const [err, setErr] = useState("");

  // Load all makes once
  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await jsonp("https://www.carqueryapi.com/api/0.3/?cmd=getMakes");
        const list = (data?.Makes || []).sort((a, b) =>
          a.make_display.localeCompare(b.make_display)
        );
        setMakes(list);
      } catch (e) {
        console.error(e);
        setErr("Couldn’t load car makes. Check your internet connection or try again.");
      }
    })();
  }, []);

  // Load models when make changes
  useEffect(() => {
    (async () => {
      setModels([]);
      setYears([]);
      setModel("");
      setYear("");

      if (!make) return;

      try {
        setErr("");
        const data = await jsonp(
          `https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${encodeURIComponent(make)}`
        );
        const list = (data?.Models || []).sort((a, b) =>
          a.model_name.localeCompare(b.model_name)
        );
        setModels(list);
      } catch (e) {
        console.error(e);
        setErr("Couldn’t load models for that make.");
      }
    })();
  }, [make]);

  // Load years when model changes
  useEffect(() => {
    (async () => {
      setYears([]);
      setYear("");
      if (!make || !model) return;

      try {
        setErr("");
        const data = await jsonp(
          `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${encodeURIComponent(
            make
          )}&model=${encodeURIComponent(model)}`
        );
        const trims = data?.Trims || [];
        const yearSet = new Set(
          trims
            .map((t) => parseInt(t.model_year, 10))
            .filter((n) => Number.isFinite(n))
        );
        const list = Array.from(yearSet).sort((a, b) => b - a); // newest → oldest
        setYears(list);
      } catch (e) {
        console.error(e);
        setErr("Couldn’t load years for that model.");
      }
    })();
  }, [make, model]);

  function submit(e) {
    e.preventDefault();
    onSearch({ make, model, year });
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      {/* Make */}
      <select
        value={make}
        onChange={(e) => setMake(e.target.value)}
        required
      >
        <option value="">Select Make</option>
        {makes.map((m) => (
          <option key={m.make_id} value={m.make_id}>
            {m.make_display}
          </option>
        ))}
      </select>

      {/* Model */}
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        required
        disabled={!make || models.length === 0}
      >
        <option value="">{make ? "Select Model" : "Select Make first"}</option>
        {models.map((mod) => (
          <option key={mod.model_id} value={mod.model_name}>
            {mod.model_name}
          </option>
        ))}
      </select>

      {/* Year */}
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        required
        disabled={!model || years.length === 0}
      >
        <option value="">{model ? "Select Year" : "Select Model first"}</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button type="submit" disabled={loading || !make || !model || !year}>
        {loading ? "Loading..." : "Get Overview"}
      </button>

      {err && <small style={{ color: "#b91c1c" }}>{err}</small>}
    </form>
  );
}
