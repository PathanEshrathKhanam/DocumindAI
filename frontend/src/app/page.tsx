"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  return (
    <main className="container">
      <header className="header">
        <h1>DocuMind AI</h1>
        <p>Your intelligent document assistant. Upload a PDF and ask anything.</p>
      </header>

      <div className="main-layout">
        <UploadZone onUploadSuccess={() => setIsDocumentReady(true)} />
        <ChatInterface isActive={isDocumentReady} />
      </div>
    </main>
  );
}
