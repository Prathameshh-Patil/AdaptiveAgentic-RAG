import uuid
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from dotenv import load_dotenv
load_dotenv()

import models
import database
import auth
from graph.graph import app as graph_app

app = FastAPI(title="Adaptive Agentic RAG API")

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for production hybrid setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    conversationId: Optional[str] = None

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
    conversationId: str

class UserCreate(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: Any

# --- Auth Endpoints ---

@app.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(form_data: LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- History Endpoints ---

@app.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Conversation).filter(models.Conversation.user_id == current_user.id).order_by(models.Conversation.created_at.desc()).all()

@app.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    conv = db.query(models.Conversation).filter(models.Conversation.id == conv_id, models.Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return db.query(models.Message).filter(models.Message.conversation_id == conv_id).order_by(models.Message.created_at.asc()).all()

@app.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    conv = db.query(models.Conversation).filter(models.Conversation.id == conv_id, models.Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.query(models.Message).filter(models.Message.conversation_id == conv_id).delete()
    db.delete(conv)
    db.commit()
    return {"status": "deleted"}

# --- Chat Endpoint ---

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Process a chat message through the LangGraph workflow.
    """
    try:
        # Handle Conversation initialization
        conv_id = request.conversationId or str(uuid.uuid4())
        db_conv = db.query(models.Conversation).filter(models.Conversation.id == conv_id).first()
        
        if not db_conv:
            db_conv = models.Conversation(
                id=conv_id,
                user_id=current_user.id,
                title=request.question[:50] + "..." if len(request.question) > 50 else request.question
            )
            db.add(db_conv)
            db.commit()

        if current_user.credits < 0.05:
            raise HTTPException(status_code=402, detail="Insufficient credits. Please top up.")
        
        current_user.credits -= 0.05
        db.commit()

        # Save User Message
        user_msg = models.Message(
            id=str(uuid.uuid4()),
            conversation_id=conv_id,
            role="user",
            content=request.question
        )
        db.add(user_msg)

        # Invoke the graph with the user's question
        result = graph_app.invoke({"question": request.question})
        
        # Extract the response text
        if isinstance(result, dict):
            content = result.get("generation", result.get("answer", str(result)))
        else:
            content = str(result)
            
        # Extract documents to pass to the frontend SourcePanel
        sources_data: List[Source] = []
        citations: List[str] = []
        
        if isinstance(result, dict) and "documents" in result:
            docs = result["documents"]
            for i, doc in enumerate(docs):
                doc_content = getattr(doc, "page_content", str(doc))
                doc_metadata = getattr(doc, "metadata", {})
                
                if isinstance(doc, dict):
                    doc_content = doc.get("page_content", str(doc))
                    doc_metadata = doc.get("metadata", {})
                
                url = doc_metadata.get("source", "")
                title = doc_metadata.get("title", "")
                if not title:
                    title = url.split("/")[-1] if url else f"Document {i+1}"
                if not title:
                    title = "Retrieved Source"
                
                snippet = doc_content[:150] + "..." if len(doc_content) > 150 else doc_content
                
                sources_data.append(Source(
                    id=str(uuid.uuid4()),
                    title=title,
                    url=url if url.startswith("http") else None,
                    snippet=snippet,
                    relevanceScore=None
                ))
                citations.append(title)
                
        citations = list(dict.fromkeys(citations))

        # Save AI Message
        ai_msg = models.Message(
            id=str(uuid.uuid4()),
            conversation_id=conv_id,
            role="ai",
            content=content,
            sources=[s.dict() for s in sources_data]
        )
        db.add(ai_msg)
        db.commit()

        return ChatResponse(
            id=ai_msg.id,
            role="ai",
            content=content,
            citations=citations,
            sources=sources_data,
            conversationId=conv_id
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return ChatResponse(
            id=str(uuid.uuid4()),
            role="error",
            content=f"An error occurred: {str(e)}",
            citations=[],
            sources=[],
            conversationId=request.conversationId or "error"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
