import os
import uuid
from typing import List, Optional, Any, Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from dotenv import load_dotenv
load_dotenv()

from graph.graph import app as graph_app

app = FastAPI(title="Adaptive Agentic RAG API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

class Source(BaseModel):
    id: str
    title: str
    url: Optional[str] = None
    snippet: str
    relevanceScore: Optional[float] = None

class ChatResponse(BaseModel):
    id: str
    role: str = "ai"
    content: str
    citations: List[str] = []
    sources: List[Source] = []

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Process a chat message through the LangGraph workflow.
    """
    try:
        # Invoke the graph with the user's question
        result = graph_app.invoke({"question": request.question})
        
        # Extract the response text
        if isinstance(result, dict):
            content = result.get("generation", result.get("answer", str(result)))
        else:
            content = str(result)
            
        # Extract documents to pass to the frontend SourcePanel
        sources: List[Source] = []
        citations: List[str] = []
        
        if isinstance(result, dict) and "documents" in result:
            docs = result["documents"]
            for i, doc in enumerate(docs):
                # Handle both dicts and LangChain Document objects
                doc_content = getattr(doc, "page_content", str(doc))
                doc_metadata = getattr(doc, "metadata", {})
                
                # If it's a dict
                if isinstance(doc, dict):
                    doc_content = doc.get("page_content", str(doc))
                    doc_metadata = doc.get("metadata", {})
                
                url = doc_metadata.get("source", "")
                title = doc_metadata.get("title", "")
                if not title:
                    # Fallback title
                    title = url.split("/")[-1] if url else f"Document {i+1}"
                if not title:
                    title = "Retrieved Source"
                
                # Format a snippet (first 150 chars)
                snippet = doc_content[:150] + "..." if len(doc_content) > 150 else doc_content
                
                sources.append(Source(
                    id=str(uuid.uuid4()),
                    title=title,
                    url=url if url.startswith("http") else None,
                    snippet=snippet,
                    relevanceScore=None # Could extract from metadata if available
                ))
                citations.append(title)
                
        # Filter duplicates in citations
        citations = list(dict.fromkeys(citations))

        return ChatResponse(
            id=str(uuid.uuid4()),
            role="ai",
            content=content,
            citations=citations,
            sources=sources
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return ChatResponse(
            id=str(uuid.uuid4()),
            role="error",
            content=f"An error occurred: {str(e)}",
            citations=[],
            sources=[]
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.1", port=8000, reload=True)
