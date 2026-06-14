import { useState, useEffect } from "react";

export default function WatchList() {
  const [symbol, setSymbol] = useState("");

  const [watchlist, setWatchlist] =
    useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(
      "watchlist"
    );

    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "watchlist",
      JSON.stringify(watchlist)
    );
  }, [watchlist]);

  const addStock = () => {
    if (!symbol) return;

    setWatchlist([
      ...watchlist,
      symbol.toUpperCase(),
    ]);

    setSymbol("");
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      <h3>⭐ Watchlist</h3>

      <input
        value={symbol}
        onChange={(e) =>
          setSymbol(e.target.value)
        }
      />

      <button onClick={addStock}>
        Add
      </button>

      <ul>
        {watchlist.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}