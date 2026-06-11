import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Langchain imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="DocuMind AI API", version="1.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHROMA_PATH = "chroma_db"
UPLOAD_DIR = "uploaded_docs"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Gemini models
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2", google_api_key=api_key)
llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash", temperature=0.3, google_api_key=api_key)

def get_vector_store():
    return Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)

class ChatRequest(BaseModel):
    query: str

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Load the PDF
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_documents(docs)
        
        # Filter out empty chunks to prevent Chroma IndexError
        chunks = [chunk for chunk in chunks if chunk.page_content.strip()]
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract any readable text from the PDF.")
            
        # Store in ChromaDB
        db = get_vector_store()
        
        # Add chunks one by one to bypass the batch embedding bug in langchain-google-genai
        stored_count = 0
        for chunk in chunks:
            try:
                db.add_documents([chunk])
                stored_count += 1
            except Exception as e:
                print(f"Skipped a chunk: {e}")
                
        if stored_count == 0:
            raise HTTPException(status_code=500, detail="Failed to embed and store any chunks.")
        
        return {"message": "Document processed and stored successfully", "chunks_stored": stored_count}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/chat")
async def chat_with_document(request: ChatRequest):
    try:
        db = get_vector_store()
        retriever = db.as_retriever(search_kwargs={"k": 5})
        
        # System prompt for RAG
        system_prompt = (
            "You are an intelligent assistant designed to help users extract information from their documents. "
            "Use the following pieces of retrieved context to answer the question. "
            "If you don't know the answer based on the context, say that you don't know. "
            "Provide clear, concise, and helpful answers.\n\n"
            "Context: {context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        response = rag_chain.invoke({"input": request.query})
        
        # Extract sources
        sources = [doc.metadata.get("source", "Unknown") for doc in response.get("context", [])]
        unique_sources = list(set(sources))
        
        return {
            "answer": response["answer"],
            "sources": unique_sources
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during chat: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok"}
