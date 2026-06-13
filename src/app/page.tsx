"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [matchedItems, setMatchedItems] = useState<string[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setStatus("loading");
    setMessage("");
    setMatchedItems([]);

    try {
      const res = await fetch(`/api/search?name=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok) {
        if (data.exists) {
          setStatus("success");
          setMessage(`✅ '${query}' 님은 명단에 존재합니다.`);
          if (data.matchedLines) setMatchedItems(data.matchedLines);
        } else {
          setStatus("error");
          setMessage(`❌ '${query}' 님을 찾을 수 없습니다.`);
        }
      } else {
        setStatus("error");
        setMessage(`오류 발생: ${data.error || "알 수 없는 오류"}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("서버와 통신하는 중 문제가 발생했습니다.");
    }
  };

  const handleClear = () => {
    setQuery("");
    setStatus("idle");
    setMessage("");
    setMatchedItems([]);
  };

  return (
    <>
      <main className="container">
        <h1 className="logo">Tool Protector</h1>
        
        <form className="search-container" onSubmit={handleSearch}>
          <div className={`search-input-wrapper ${query ? 'active' : ''}`}>
            <svg className="search-icon" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            </svg>
            <input 
              type="text" 
              className="search-input" 
              placeholder="명단에서 확인할 이름을 입력하세요" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="button-container">
            <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
              {status === "loading" ? <div className="loading" /> : "명단 확인"}
            </button>
            <button type="button" className="btn" onClick={handleClear}>
              초기화
            </button>
          </div>
        </form>

        {status === "success" && (
          <div className="result-card result-success" style={{ flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
            <div>{message}</div>
            {matchedItems.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                {matchedItems.map((item, index) => (
                  <div key={index} style={{ fontSize: "0.95rem", color: "#3c4043", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", width: "100%", wordBreak: "keep-all", border: "1px solid #e8eaed" }}>
                    👉 <strong>{item}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="result-card result-error">
            {message}
          </div>
        )}
      </main>
      <footer>
        &copy; 2026 Tool Protector. Powered by Notion API.
      </footer>
    </>
  );
}
