import {
  getStock,
  getChart,
  getHistory,
  clearHistory
} from "./services/api";

import PdfLibrary from "./components/PdfLibrary";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import RecommendationPanel from "./components/RecommendationPanel";
import StockCard from "./components/StockCard";
import StockChart from "./components/StockChart";
import CompareStocks from "./components/CompareStocks";
import WatchList from "./components/WatchList";
import Portfolio from "./components/Portfolio";
import NewsPanel from "./components/NewsPanel";
import PDFUpload from "./components/PDFUpload";


export default function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("chat");
  const [symbol, setSymbol] = useState("AAPL");
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const messagesEndRef = useRef(null);

  // Initialize chats safely from localstorage
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("financial-ai-chats");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: Date.now(),
            title: "New Chat",
            messages: [],
          },
        ];
  });

  const [activeChat, setActiveChat] = useState(0);

  // Synchronize localStorage mutations
  useEffect(() => {
    localStorage.setItem("financial-ai-chats", JSON.stringify(chats));
  }, [chats]);

  // Handle smooth message window snapping auto-scrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chats, activeChat, loading]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    // FIX: Avoid using the stale 'chats.length' reference directly. 
    // Capturing the next array snapshot explicitly prevents index state errors.
    const completeNextChatsList = [...chats, newChat];
    setChats(completeNextChatsList);
    setActiveChat(completeNextChatsList.length - 1); 
  };

  const loadStock = async () => {
    if (!symbol.trim()) return;

    try {
      const stockRes = await getStock(symbol.trim());
      setStockData(stockRes.data);

      const chartRes = await getChart(symbol.trim());
      setChartData(chartRes.data);
    } catch (err) {
      console.error("Dashboard asset extraction error:", err);
    }
  };

  const askAI = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion("");
    setLoading(true);

    const updatedChats = chats.map((chat, idx) => {
      if (idx === activeChat) {
        return {
          ...chat,
          title: chat.messages.length === 0 ? currentQuestion.slice(0, 20) : chat.title,
          messages: [
            ...chat.messages,
            {
              role: "user",
              content: currentQuestion,
            },
          ],
        };
      }
      return chat;
    });

    setChats(updatedChats);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        question: currentQuestion,
      });

      setChats((prev) =>
        prev.map((chat, idx) => {
          if (idx === activeChat) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  role: "assistant",
                  content: res.data.response,
                },
              ],
            };
          }
          return chat;
        })
      );
    } catch (err) {
      console.error(err);
      setChats((prev) =>
        prev.map((chat, idx) => {
          if (idx === activeChat) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  role: "assistant",
                  content: "❌ Backend Error connecting to AI service.",
                },
              ],
            };
          }
          return chat;
        })
      );
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      askAI();
    }
  };
useEffect(() => {
  loadHistory();
}, []);

const loadHistory = async () => {
  try {
    const res = await getHistory();

    const messages = res.data.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    setChats([
      {
        id: Date.now(),
        title: "Previous Chat",
        messages
      }
    ]);

    setActiveChat(0);

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>
      {/* Sidebar Navigation Panel Layout */}
      <div
        style={{
          width: "260px",
          background: "#202123",
          color: "white",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      ><button
  onClick={async () => {
    await clearHistory();

    setChats([
      {
        id: Date.now(),
        title: "New Chat",
        messages: []
      }
    ]);

    setActiveChat(0);
  }}
>
  Clear History
</button>
        <button
          onClick={createNewChat}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            background: "transparent",
            border: "1px solid #444",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            textAlign: "left"
          }}
        >
          ➕ New Chat
        </button>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {chats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(index)}
              style={{
                padding: "12px 10px",
                marginBottom: "6px",
                cursor: "pointer",
                borderRadius: "6px",
                background: activeChat === index ? "#444654" : "transparent",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "14px"
              }}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel View Dashboard Workspace */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          background: "#f3f4f6",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
          <h2 style={{ marginTop: 0, marginBottom: "15px" }}>💹 Financial AI Agent Dashboard</h2>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                outline: "none"
              }}
            />

            <button
              onClick={loadStock}
              style={{
                padding: "10px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Load Stock
            </button>
          </div>
        </div>

        {/* Analytics Layout Grid Modules */}
        {stockData && <StockCard stock={stockData} />}
        {chartData.length > 0 && <StockChart data={chartData} />}

        <NewsPanel />
        <PDFUpload />
        <RecommendationPanel />
        <CompareStocks />
        <WatchList />
        <Portfolio />
   
<button onClick={() => setTab("chat")}>
  Chat
</button>

<button onClick={() => setTab("pdfs")}>
  PDFs
</button>
{tab === "pdfs" && (
  <div>
    PDF Library Coming Soon
  </div>
)}
        {/* AI Chat Area Module Component */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "15px" }}>🤖 Financial AI Assistant</h3>

          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto",
              marginBottom: "15px",
              paddingRight: "5px"
            }}
          >
            {chats[activeChat]?.messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "15px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <strong style={{ fontSize: "11px", color: "#666", marginBottom: "3px" }}>
                  {msg.role === "user" ? "You" : "AI"}:
                </strong>

                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    marginTop: "2px",
                    background: msg.role === "user" ? "#dbeafe" : "#f3f4f6",
                    color: "#111",
                    borderRadius: "10px",
                    fontSize: "14px",
                    lineHeight: "1.5"
                  }}
                >
                  {msg.role === "assistant" ? (
                    /* FIX: Relies cleanly on children prop structure */
                    <ReactMarkdown children={msg.content} />
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <p style={{ fontStyle: "italic", color: "#666", fontSize: "14px" }}>🤖 AI is thinking...</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Submission Panel Control Footer */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about stocks, finance, market trends..."
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                outline: "none"
              }}
            />

            <button
              onClick={askAI}
              style={{
                padding: "12px 24px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}