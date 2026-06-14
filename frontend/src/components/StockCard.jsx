export default function StockCard({ stock }) {
  if (!stock) return null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "15px",
        background: "#fff",
      }}
    >
      <h3>{stock.name}</h3>

      <p>
        <strong>Symbol:</strong> {stock.symbol}
      </p>

      <p>
        <strong>Price:</strong> ${stock.price}
      </p>

      <p>
        <strong>Sector:</strong> {stock.sector}
      </p>

      <p>
        <strong>P/E:</strong> {stock.pe_ratio}
      </p>
    </div>
  );
}