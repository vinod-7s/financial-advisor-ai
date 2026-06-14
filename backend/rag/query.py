import os
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# OPTIMIZATION: Load the model once globally into system RAM on server initialization.
# This prevents expensive, slow disk reads every time a user types a chat question.
_embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def search_pdf(query: str, k: int = 4):
    try:
        # 1. Sanitize the incoming search query
        clean_query = query.strip()
        if not clean_query:
            return {"context": "", "sources": []}

        # 2. Check if the vector directory exists before initializing database queries
        db_path = "backend/chroma_db"
        if not os.path.exists(db_path) or not os.listdir(db_path):
            return {
                "context": "No documents have been uploaded or indexed yet.",
                "sources": []
            }

        # 3. Connect to the local vector storage database
        # FIX: Swapped 'embedding_function' for 'embedding' to perfectly match the ingestion structure
        db = Chroma(
    persist_directory=db_path,
    embedding_function=_embeddings
)

        # 4. FIX: Correctly indented the k-nearest neighbor similarity vector search
        docs = db.similarity_search(clean_query, k=k)

        if not docs:
            return {
                "context": "No matching reference text segments were found in the database.",
                "sources": []
            }

        # 5. Extract and stringify document segment texts smoothly
        context = "\n\n--- Document Segment ---\n\n".join(
            [doc.page_content.strip() for doc in docs if hasattr(doc, "page_content")]
        )

        # 6. Securely parse source tracking metadata
        sources = []
        for doc in docs:
            if hasattr(doc, "metadata") and doc.metadata:
                # Strip absolute directory prefixes if present to keep the UI view clean
                raw_source = doc.metadata.get("source", "Unknown")
                clean_source = os.path.basename(raw_source) if raw_source != "Unknown" else "Unknown"
                
                if clean_source not in sources:
                    sources.append(clean_source)

        return {
            "context": context,
            "sources": sources
        }

    except Exception as e:
        print(f"DATABASE RECONNAISSANCE SEARCH FAULT: {e}")
        return {
            "context": f"Error running vector document query: {str(e)}",
            "sources": []
        }
        
    finally:
        # Explicitly tear down db references to drop file-level locks on SQLite
        if 'db' in locals():
            del db