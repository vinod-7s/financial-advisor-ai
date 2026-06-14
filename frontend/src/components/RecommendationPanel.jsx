import { useState } from "react";
import axios from "axios";

export default function RecommendationPanel() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const getRecommendations = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          question: query,
        }
      );

      setResult(res.data.response);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      <h3>📈 AI Stock Recommendations</h3>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Best AI stocks"
      />

      <button
        onClick={getRecommendations}
        style={{ marginLeft: "10px" }}
      >
        Ask AI
      </button>

      {result && (
        <div style={{ marginTop: "15px" }}>
          {result}
        </div>
      )}
    </div>
  );
}