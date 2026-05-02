"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadZone({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Assuming FastAPI runs on 8000
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onUploadSuccess();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Failed to upload document. Make sure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="panel">
      <h2 style={{ marginBottom: "1rem", fontWeight: 600 }}>1. Upload Document</h2>
      
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`upload-zone ${isDragging ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".pdf"
              onChange={handleFileChange}
            />
            
            {file ? (
              <>
                <FileText className="upload-icon" />
                <p className="upload-text">{file.name}</p>
                <p className="upload-hint">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <Upload className="upload-icon" />
                <p className="upload-text">Click or drag a PDF here</p>
                <p className="upload-hint">Maximum file size 50MB</p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="upload-zone"
            style={{ borderColor: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.05)" }}
          >
            <CheckCircle style={{ color: "#10b981", width: "48px", height: "48px" }} />
            <p className="upload-text" style={{ color: "#10b981" }}>Upload Complete!</p>
            <p className="upload-hint">Document is ready for analysis.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: "1.5rem" }}>
        <button 
          className="btn" 
          onClick={handleUpload}
          disabled={!mounted || !file || isUploading || isSuccess}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={20} style={{ animation: "spin 1s linear infinite" }} />
              Processing...
            </>
          ) : (
            "Process Document"
          )}
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
