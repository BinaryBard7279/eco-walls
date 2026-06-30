from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Async database setup
async_engine = create_async_engine(settings.async_database_url, echo=False)
async_session_maker = async_sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)

# Sync database setup (useful for seeding and migrations)
sync_engine = create_engine(settings.sync_database_url, echo=False)
sync_session_maker = sessionmaker(sync_engine, expire_on_commit=False)

async def get_async_db():
    async with async_session_maker() as session:
        yield session
