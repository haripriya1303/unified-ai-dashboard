import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.config import get_settings
from app.db.models.user import User
from app.db.models.task import Task
from app.db.models.message import Message
from app.db.models.document import Document
from app.db.models.document_chunk import DocumentChunk
from app.ai.embeddings import embed_text

from dotenv import load_dotenv

async def main():
    load_dotenv()
    settings = get_settings()
    engine = create_async_engine(settings.database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    dev_user_id = "dev-user"
    
    async with async_session() as session:
        # Create user if not exists
        user = await session.execute(select(User).where(User.id == dev_user_id))
        user = user.scalar_one_or_none()
        if not user:
            user = User(id=dev_user_id, email="dev@example.com", name="Dev User")
            session.add(user)
            await session.commit()
            
        print("User verified.")

        # Insert some Tasks
        task1 = Task(id=str(uuid.uuid4()), user_id=dev_user_id, title="Fix hydration error in Auth flow", status="todo", priority="medium")
        task2 = Task(id=str(uuid.uuid4()), user_id=dev_user_id, title="Review Q3 API Documentation", status="in-progress", priority="high")
        session.add_all([task1, task2])

        # Insert some Messages
        msg1 = Message(id=str(uuid.uuid4()), user_id=dev_user_id, sender="Sarah", content="Can you review the PR for the new onboarding flow?", source="slack")
        msg2 = Message(id=str(uuid.uuid4()), user_id=dev_user_id, sender="GitHub", content="CI pipeline passed for feature/auth-redesign", source="github")
        session.add_all([msg1, msg2])
        
        # Insert a Document & Chunk for RAG testing
        doc1 = Document(id=str(uuid.uuid4()), user_id=dev_user_id, source="notion", title="Q4 Roadmap", content="The main focus for Q4 is performance improvements and the new embedding features.")
        session.add(doc1)
        await session.flush()
        
        # Embed it
        chunk_text = "The main focus for Q4 is performance improvements and the new embedding features."
        embedding = await embed_text(chunk_text)
        
        chunk1 = DocumentChunk(
            id=str(uuid.uuid4()),
            document_id=doc1.id,
            content=chunk_text,
            embedding=embedding,
            source="notion",
            url="http://notion.so/roadmap"
        )
        session.add(chunk1)
        
        await session.commit()
        print("Mock test data inserted successfully.")

if __name__ == "__main__":
    asyncio.run(main())
