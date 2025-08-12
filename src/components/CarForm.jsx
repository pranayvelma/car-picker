import { useState } from "react";

const carData = {
  Toyota: ["Corolla", "Camry", "RAV4", "Yaris", "Supra"],
  Honda: ["Civic", "Accord", "CR-V", "Fit", "Pilot"],
  Ford: ["F-150", "Mustang", "Escape", "Explorer", "Bronco"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "M4"],
  Tesla: ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck"],
};

export default function CarForm({ onSearch, loading }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  function getRandomModel(make) {
    const models = carData[make];
    return models[Math.floor(Math.random() * models.length)];
  }

  function handleMakeChange(e) {
    const selectedMake = e.target.value;
    setMake(selectedMake);

    if (selectedMake) {
      setModel(getRandomModel(selectedMake));
    } else {
      setModel("");
    }
  }

  // Allows refreshing model without changing make
  function refreshModel() {
    if (make) {
      setModel(getRandomModel(make));
    }
  }

  function submit(e) {
    e.preventDefault();
    onSearch({ make, model, year });
  }

  return (
    <form onSubmit={submit}>
      {/* Make dropdown */}
      <select value={make} onChange={handleMakeChange} required>
        <option value="">Select Make</option>
        {Object.keys(carData).map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      {/* Model with refresh button */}
      <div style={{ display: "flex", gap: "5px" }}>
        <input
          placeholder="Model"
          value={model}
          readOnly
          required
        />
        <button type="button" onClick={refreshModel}>
          🎲
        </button>
      </div>

      {/* Year */}
      <input
        placeholder="Year (optional)"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Get Overview"}
      </button>
    </form>
  );
}
