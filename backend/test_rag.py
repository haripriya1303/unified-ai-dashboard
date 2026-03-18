
import asyncio
from app.db.session import async_session_factory
from app.ai.rag import rag_query
import os

async def test():
    async with async_session_factory() as s:
        try:
            answer, sources = await rag_query(s, 'dev-user', 'What are my tasks?')
            print(f"Answer: {answer}")
            print(f"Sources: {sources}")
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
