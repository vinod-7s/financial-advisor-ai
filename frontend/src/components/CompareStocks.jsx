import { useState } from "react";
import { compareStocks } from "../services/api";

export default function CompareStocks() {
  const [symbol1, setSymbol1] = useState("NVDA");
  const [symbol2, setSymbol2] = useState("AMD");

  const [data, setData] = useState(null);

  const handleCompare = async () => {
    try {
      const res = await compareStocks(
        symbol1,
        symbol2
      );

      setData(res.data);
    } catch (err) {
      console.log(err);
    }
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
      <h3>📊 Compare Stocks</h3>

      <input
        value={symbol1}
        onChange={(e) =>
          setSymbol1(e.target.value.toUpperCase())
        }
        placeholder="Stock 1"
      />

      <input
        value={symbol2}
        onChange={(e) =>
          setSymbol2(e.target.value.toUpperCase())
        }
        placeholder="Stock 2"
        style={{ marginLeft: "10px" }}
      />

      <button
        onClick={handleCompare}
        style={{ marginLeft: "10px" }}
      >
        Compare
      </button>

      {data && (
        <table
          border="1"
          cellPadding="10"
          style={{
            marginTop: "15px",
            width: "100%",
          }}
        >
          <tbody>
            <tr>
              <td>Price</td>
              <td>{data.stock1.price}</td>
              <td>{data.stock2.price}</td>
            </tr>

            <tr>
              <td>Market Cap</td>
              <td>{data.stock1.market_cap}</td>
              <td>{data.stock2.market_cap}</td>
            </tr>

            <tr>
              <td>P/E Ratio</td>
              <td>{data.stock1.pe_ratio}</td>
              <td>{data.stock2.pe_ratio}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}