import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from model import embed_model

load_dotenv()

persist_directory = "./.chroma"
collection_name = "rag-chroma"

urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    # "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    # "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
]


def ingest_documents():
    """Load, split, and store documents in the vector store."""
    print(f"---INGESTING DOCUMENTS FROM {len(urls)} URLS---")
    docs = [WebBaseLoader(url).load() for url in urls]
    docs_list = [item for sublist in docs for item in sublist]

    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=250, chunk_overlap=0
    )
    doc_splits = text_splitter.split_documents(docs_list)
    print(f"---GENERATED {len(doc_splits)} DOCUMENT CHUNKS---")

    # Create vector store with documents in batches to avoid rate limits
    print("---CREATING VECTOR STORE (THIS MAY TAKE A MINUTE DUE TO RATE LIMITING)---")
    
    # Initialize Chroma with the first batch
    batch_size = 50
    first_batch = doc_splits[:batch_size]
    
    vectorstore = Chroma.from_documents(
        documents=first_batch,
        collection_name=collection_name,
        embedding=embed_model,
        persist_directory=persist_directory
    )
    
    # Add remaining batches with a delay
    import time
    for i in range(batch_size, len(doc_splits), batch_size):
        print(f"---ADDING BATCH {i//batch_size + 1}/{(len(doc_splits)-1)//batch_size + 1}---")
        batch = doc_splits[i:i+batch_size]
        vectorstore.add_documents(batch)
        print("---SLEEPING TO AVOID RATE LIMIT---")
        time.sleep(25) # Wait 25 seconds between batches to avoid 429

        
    print("---INGESTION COMPLETE---")
    return vectorstore


# Check if vector store exists, if not, we can't create a retriever easily without ingest
if os.path.exists(persist_directory):
    vectorstore = Chroma(
        collection_name=collection_name,
        embedding_function=embed_model,
        persist_directory=persist_directory
    )
else:
    # If it doesn't exist, we might need to ingest first
    # For now, we'll initialize an empty one or handle it in retrieve node
    vectorstore = None

if vectorstore:
    retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
else:
    retriever = None

if __name__ == "__main__":
    ingest_documents()