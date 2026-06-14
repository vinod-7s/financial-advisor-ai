import concurrent.futures
import asyncio
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Build a persistent thread pool to handle heavy matrix maths without locking the async loop
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)

def _sync_ingest_worker(pdf_path: str):
    """
    Internal synchronous worker function running safely inside an independent 
    thread to execute chunking, embedding generation, and database updates.
    """
    db = None
    try:
        # 1. Load the target PDF document file safely
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()
        
        if not docs:
            return "Error: The provided PDF file is empty or unreadable."

        # 2. Slice text segments into overlapping context window chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = splitter.split_documents(docs)

        # 3. Initialize embedding weights configuration
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        # 4. Generate embeddings and save to database
        for chunk in chunks:
          chunk.metadata["source"] = pdf_path

        db = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory="backend/chroma_db"
        )

        return "PDF indexed successfully"

    except Exception as e:
        print(f"INGESTION WORKER CRASH: {e}")
        return f"Error during indexing pipeline execution: {str(e)}"
        
    finally:
        # FIX: Explicitly delete db reference to close open SQLite file handles
        # and prevent 'database is locked' errors on subsequent uploads.
        if db is not None:
            del db

async def ingest_pdf(pdf_path: str) -> str:
    """
    Main asynchronous pipeline entry-point. Offloads the heavy embedding 
    calculations to a thread pool so your FastAPI application can continue 
    serving real-time chat requests.
    """
    loop = asyncio.get_running_loop()
    # Execute the synchronous worker function cleanly within a separate background thread
    result = await loop.run_in_executor(_executor, _sync_ingest_worker, pdf_path)
    return result