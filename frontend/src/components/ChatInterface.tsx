"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  sources?: string[];
};

export default function ChatInterface({ isActive }: { isActive: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Hi! I'm ready to answer questions about your document. What would you like to know?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  useEffect(() => setMounted(true), []);

  const handleSend = async () => {
    if (!input.trim() || !isActive || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Sorry, I encountered an error while trying to process your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="panel" style={{ opacity: isActive ? 1 : 0.5, transition: "opacity 0.3s ease" }}>
      <h2 style={{ marginBottom: "1rem", fontWeight: 600 }}>2. Chat with Document</h2>
      
      <div className="chat-container">
        <div className="messages">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message ${msg.role}`}
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  maxWidth: "90%",
                  padding: 0,
                  backgroundColor: "transparent",
                }}
              >
                <div style={{
                  backgroundColor: msg.role === "user" ? "var(--user-msg-bg)" : "var(--bot-msg-bg)",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div style={{
                  backgroundColor: msg.role === "user" ? "var(--user-msg-bg)" : "var(--bot-msg-bg)",
                  padding: "1rem",
                  borderRadius: "12px",
                  borderTopRightRadius: msg.role === "user" ? 0 : "12px",
                  borderTopLeftRadius: msg.role === "bot" ? 0 : "12px",
                }}>
                  <p>{msg.content}</p>
                  
                  {msg.sources && msg.sources.length > 0 && msg.sources[0] !== "Unknown" && (
                    <div className="sources">
                      <div style={{ marginBottom: "0.2rem" }}>Sources:</div>
                      {msg.sources.map((source, idx) => {
                        // Extract filename from path
                        const filename = source.split('/').pop() || source;
                        return (
                          <span key={idx} className="source-badge" title={source}>
                            {filename}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="message bot"
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                maxWidth: "90%",
                padding: 0,
                backgroundColor: "transparent",
              }}
            >
              <div style={{
                backgroundColor: "var(--bot-msg-bg)",
                padding: "0.5rem",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Bot size={20} />
              </div>
              <div style={{
                backgroundColor: "var(--bot-msg-bg)",
                padding: "1rem",
                borderRadius: "12px",
                borderTopLeftRadius: 0,
              }}>
                <Loader2 className="animate-spin" size={20} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-area">
          <input
            type="text"
            className="input-field"
            placeholder={isActive ? "Ask a question about your document..." : "Upload a document first..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!mounted || !isActive || isLoading}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!mounted || !isActive || isLoading || !input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
