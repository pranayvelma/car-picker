export default function Result({ result }) {
  if (!result) return null;

  const { make, model, year, title, extract, pageUrl } = result;
  const qBase = `${year ? year + " " : ""}${make} ${model}`.trim();

  // helpful YouTube search links
  const ytLinks = [
    { label: "Review", q: `${qBase} review` },
    { label: "Test drive", q: `${qBase} test drive` },
    { label: "Walkaround", q: `${qBase} walkaround` },
    { label: "Specs", q: `${qBase} specs` },
  ];

  return (
    <section className="result">
      <h2>{title}</h2>
      <p className="summary">{extract}</p>
      <p>
        Read more on Wikipedia:{" "}
        <a href={pageUrl} target="_blank" rel="noopener noreferrer">
          {pageUrl}
        </a>
      </p>

      <div className="youtube-links">
        <h3>Watch videos</h3>
        <ul>
          {ytLinks.map((l) => (
            <li key={l.label}>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(l.q)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label}: "{l.q}"
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
