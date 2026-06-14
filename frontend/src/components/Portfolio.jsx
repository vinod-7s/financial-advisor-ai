import { useState } from "react";
import { getStock } from "../services/api";

export default function Portfolio() {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState([]);

  const addHolding = async () => {
    const formattedSymbol = symbol.trim().toUpperCase();
    const parsedQty = Number(qty);

    // 1. Validation checks
    if (!formattedSymbol || isNaN(parsedQty) || parsedQty <= 0) {
      alert("Please enter a valid ticker symbol and positive quantity.");
      return;
    }

    setLoading(true);

    try {
      const res = await getStock(formattedSymbol);
      const stock = res.data;

      // Handle cases where the API call succeeds but returns an error object/missing price
      if (!stock || stock.error || stock.price === undefined || stock.price === "N/A") {
        alert(`Could not retrieve a valid price for ticker: ${formattedSymbol}`);
        setLoading(false);
        return;
      }

      const freshPrice = Number(stock.price);

      setPortfolio((prevPortfolio) => {
        // FIX: Check if the asset already exists inside your active holdings list
        const existingHoldingIndex = prevPortfolio.findIndex(
          (item) => item.symbol === formattedSymbol
        );

        if (existingHoldingIndex > -1) {
          // If found, copy the array immutably and aggregate quantities / update price
          const updatedPortfolio = [...prevPortfolio];
          updatedPortfolio[existingHoldingIndex] = {
            ...updatedPortfolio[existingHoldingIndex],
            qty: updatedPortfolio[existingHoldingIndex].qty + parsedQty,
            price: freshPrice, // Update to current market valuation price
          };
          return updatedPortfolio;
        } else {
          // If it's a completely new stock position, append it safely
          return [
            ...prevPortfolio,
            {
              symbol: formattedSymbol,
              qty: parsedQty,
              price: freshPrice,
            },
          ];
        }
      });

      // Clear input controls
      setSymbol("");
      setQty("");
    } catch (err) {
      console.error("Failed to add tracking position to active portfolio:", err);
      alert("Error reaching server. Please check ticker symbol validity.");
    } finally {
      setLoading(false);
    }
  };

  // Helper calculation wrapper with parsing guards to ensure total value never outputs NaN
  const totalValue = portfolio.reduce((sum, item) => {
    const itemPrice = typeof item.price === "number" ? item.price : 0;
    return sum + item.qty * itemPrice;
  }, 0);

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "15px" }}>💼 Portfolio Tracker</h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          placeholder="AAPL"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          style={{
            padding: "8px 12px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            outline: "none",
            width: "120px"
          }}
        />

        <input
          type="number" // Restricts native browser input structures
          min="1"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            outline: "none",
            width: "80px"
          }}
        />

        <button
          onClick={addHolding}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: loading ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {portfolio.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {portfolio.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #f3f4f6",
                fontSize: "14px"
              }}
            >
              <div>
                <strong style={{ fontSize: "15px" }}>{item.symbol}</strong>
                <span style={{ color: "#666", marginLeft: "10px" }}>{item.qty} shares</span>
              </div>
              <div>
                <span style={{ color: "#666", marginRight: "15px" }}>Price: ${item.price.toFixed(2)}</span>
                <strong style={{ color: "#111" }}>Value: ${(item.qty * item.price).toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#888", fontStyle: "italic", fontSize: "14px" }}>No active assets tracked. Add some holdings above.</p>
      )}

      <div
        style={{
          marginTop: "20px",
          paddingTop: "15px",
          borderTop: "2px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span style={{ fontWeight: "bold", color: "#4b5563" }}>Total Portfolio Value:</span>
        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#16a34a" }}>
          ${totalValue.toFixed(2)}
        </span>
      </div>
    </div>
  );
}