import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# Load env file to get the exact db uri
load_dotenv(".env")
from app.config import get_settings

async def main():
    settings = get_settings()
    engine = create_async_engine(settings.database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    dev_user_id = "dev-user"
    
    async with async_session() as session:
        # We need to delete Tasks, Messages, Documents, DocumentChunks, and User
        await session.execute(text("DELETE FROM document_chunks;"))
        await session.execute(text("DELETE FROM documents;"))
        await session.execute(text("DELETE FROM messages;"))
        await session.execute(text("DELETE FROM tasks;"))
        await session.execute(text("DELETE FROM users WHERE id = 'dev-user';"))
        
        await session.commit()
        print("Mock test data removed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
