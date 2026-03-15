import asyncio
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import get_settings

async def main():
    engine = create_async_engine(get_settings().database_url)
    async with engine.begin() as conn:
        await conn.execute(sa.text("DROP TABLE IF EXISTS alembic_version;"))
    print("Dropped alembic_version table.")

if __name__ == "__main__":
    asyncio.run(main())
