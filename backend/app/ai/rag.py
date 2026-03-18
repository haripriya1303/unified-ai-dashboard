"""RAG: embed query, retrieve chunks, build prompt, call LLM, return answer + sources."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models.document import Document
from app.db.models.document_chunk import DocumentChunk
#from app.ai.embeddings import embed_text
#from app.ai.llm import chat_completion
from sentence_transformers import SentenceTransformer
from groq import AsyncGroq
import os

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

groq_client = AsyncGroq(
    api_key=os.getenv("GROQ_API_KEY")
)

async def chat_completion(system: str, user: str):
    settings = get_settings()
    completion = await groq_client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.2
    )

    return completion.choices[0].message.content

TOP_K = 5


async def rag_query(session: AsyncSession, user_id: str, query: str) -> tuple[str, list[dict]]:
    """
    Run RAG: embed query, vector search, build context, LLM, return (answer, sources).
    sources = list of { "title": str, "url": str }.
    """
    if not query.strip():
        return "Please ask a question about your workspace.", []

    query_embedding = await embed_text(query)
    if not query_embedding:
        return _fallback_answer(query), []

    stmt = (
        select(DocumentChunk)
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(Document.user_id == user_id, DocumentChunk.embedding.isnot(None))
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(TOP_K)
    )
    result = await session.execute(stmt)
    chunks = result.scalars().all()

    if not chunks:
        return _fallback_answer(query), []

    context_parts = []
    sources = []
    seen_urls = set()
    for c in chunks:
        context_parts.append(c.content)
        title = (c.source + " — " + (c.url or "document"))[:80]
        url = c.url or "#"
        if url not in seen_urls:
            seen_urls.add(url)
            sources.append({"title": title, "url": url})

    context = "\n\n".join(context_parts)
    system = (
        "You are an AI assistant for a unified workspace dashboard. "
        "Answer the user's question using only the following context from their workspace. "
        "If the context does not contain relevant information, say so briefly. "
        "Keep answers concise and actionable."
    )
    user_message = f"Context:\n{context}\n\nQuestion: {query}"
    answer = await chat_completion(system, user_message)
    return answer, sources

async def embed_text(text: str):
    try:
        embedding = model.encode(text)
        return embedding.tolist()
    except Exception:
        return None

def _fallback_answer(query: str) -> str:
    return (
        f"I don't have any workspace documents indexed yet to answer \"{query}\". "
        "Connect integrations (Slack, GitHub, Notion, etc.) so I can search your content."
    )
