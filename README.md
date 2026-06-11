# DocuMind AI - Project Walkthrough

I have successfully built **DocuMind AI**, a powerful Document Intelligence Platform leveraging Retrieval-Augmented Generation (RAG). This project is highly valuable for your resume because it demonstrates expertise in building full-stack applications with state-of-the-art LLMs, vector databases, and modern UI/UX design.

## Architecture

1. **Backend (FastAPI)**: Found in `/backend`. Handles file parsing, chunking, and orchestrates the AI logic.
2. **Vector DB (ChromaDB)**: Stores document embeddings locally.
3. **AI Orchestration (LangChain & Google Gemini)**: Uses LangChain to create the RAG pipeline. It retrieves relevant document context and feeds it to the `gemini-1.5-pro` model to answer queries based solely on the uploaded document.
4. **Frontend (Next.js)**: Found in `/frontend`. A stunning, dark-mode React interface with drag-and-drop file uploading and an interactive chat window, styled beautifully with custom CSS and Framer Motion animations.

## How to Run It

To showcase this locally, follow these steps:

### 1. Start the Backend
Open a terminal and run the following commands:
```bash
cd /home/naga/Downloads/genai/backend
source venv/bin/activate
```

> [!IMPORTANT]
> You must create a `.env` file in the `backend` directory with your Gemini API key:
> `GEMINI_API_KEY="your_api_key_here"`

Then, start the server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend
Open a **new** terminal and run:
```bash
cd /home/naga/Downloads/genai/frontend
npm run dev
```

### 3. Use the App
- Open your browser to [http://localhost:3000](http://localhost:3000).
- Drag and drop any PDF into the upload zone.
- Wait for it to process, and then start asking it questions! The AI will cite its sources directly from the document.

## Resume Bullet Points

When you add this to your resume, here are a few high-impact bullet points you can use:
- **Architected and developed** a full-stack Retrieval-Augmented Generation (RAG) platform using Next.js and FastAPI, enabling users to interactively query complex PDF documents.
- **Implemented an AI pipeline** with LangChain and Google Gemini, utilizing ChromaDB for high-dimensional vector embeddings and semantic search.
- **Designed a responsive frontend** using React, Vanilla CSS, and Framer Motion, featuring seamless drag-and-drop document ingestion and real-time chat capabilities.
