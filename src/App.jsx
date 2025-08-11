import { useState } from "react";
import CarForm from "./components/CarForm";
import Result from "./components/Result";

export default function App() {
  const [result, setResult] = useState(null); // { make, model, year, title, extract, pageUrl }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch({ make, model, year }) {
    setError("");
    setResult(null);

    const trimmedMake = (make || "").trim();
    const trimmedModel = (model || "").trim();
    if (!trimmedMake || !trimmedModel) {
      setError("Please enter both make and model.");
      return;
    }

    setLoading(true);
    try {
      const baseQuery = `${trimmedMake} ${trimmedModel}`.trim();
      // 1) Try Wikipedia opensearch to get a likely page title
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&origin=*&search=${encodeURIComponent(baseQuery)}`;
      const searchResp = await fetch(searchUrl);
      if (!searchResp.ok) throw new Error("Search request failed");
      const searchData = await searchResp.json(); // [query, [titles], [descriptions], [links]]
      let title = (searchData[1] && searchData[1][0]) || null;

      // If nothing found, try including the year
      if (!title && year) {
        const searchUrl2 = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&origin=*&search=${encodeURIComponent(baseQuery + " " + year)}`;
        const resp2 = await fetch(searchUrl2);
        const data2 = await resp2.json();
        title = (data2[1] && data2[1][0]) || null;
      }

      if (!title) {
        setError("No matching Wikipedia page found for that make/model.");
        setLoading(false);
        return;
      }

      // 2) Get summary using Wikipedia REST summary endpoint
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryResp = await fetch(summaryUrl);
      if (!summaryResp.ok) throw new Error("Failed to fetch page summary");
      const summaryData = await summaryResp.json();

      const pageUrl = summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
      const extract = summaryData.extract || "No summary available.";

      setResult({
        make: trimmedMake,
        model: trimmedModel,
        year: year ? year.trim() : "",
        title,
        extract,
        pageUrl,
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong fetching info. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Car Picker — Overview + YouTube Links</h1>
        <p className="subtitle">Type make, model and optionally year. We'll fetch an overview and useful video links.</p>
      </header>

      <main>
        <CarForm onSearch={handleSearch} loading={loading} />
        {error && <p className="error">{error}</p>}
        <Result result={result} />
      </main>

      <footer>
        <small>Data comes from Wikipedia (overview) and YouTube search links.</small>
      </footer>
    </div>
  );
}
