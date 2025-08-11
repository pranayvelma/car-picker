import { useState } from "react";

export default function CarForm({ onSearch, loading }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  function submit(e) {
    e.preventDefault();
    onSearch({ make, model, year });
  }

  return (
    <form className="car-form" onSubmit={submit}>
      <div className="row">
        <label>
          Make
          <input
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="e.g. Toyota"
            required
          />
        </label>

        <label>
          Model
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Corolla"
            required
          />
        </label>

        <label>
          Year (optional)
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2020"
            inputMode="numeric"
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Get Overview"}
        </button>
      </div>
    </form>
  );
}
