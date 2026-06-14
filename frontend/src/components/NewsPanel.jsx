import { useEffect, useState } from "react";
import { getNews } from "../services/api";

export default function NewsPanel() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const res = await getNews();
      setNews(res.data);
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
      <h3>📰 Financial News</h3>

      {news.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: "15px",
          }}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            {item.title}
          </a>

          <p>{item.source.name}</p>
        </div>
      ))}
    </div>
  );
}