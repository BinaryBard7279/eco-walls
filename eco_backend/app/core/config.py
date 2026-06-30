import os

class Settings:
    PROJECT_NAME: str = "ECO Walls Backend"
    
    @property
    def DB_USER(self) -> str:
        return os.getenv("DB_USER", "postgres")
        
    @property
    def DB_PASSWORD(self) -> str:
        return os.getenv("DB_PASSWORD", "1234")
        
    @property
    def DB_HOST(self) -> str:
        return os.getenv("DB_HOST", "127.0.0.1")
        
    @property
    def DB_PORT(self) -> str:
        return os.getenv("DB_PORT", "5432")
        
    @property
    def DB_NAME(self) -> str:
        return os.getenv("DB_NAME", "eco_db")

    @property
    def sync_database_url(self) -> str:
        test_url = os.getenv("TEST_DATABASE_URL")
        if test_url:
            return test_url.replace("postgresql+asyncpg://", "postgresql://")
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def async_database_url(self) -> str:
        test_url = os.getenv("TEST_DATABASE_URL")
        if test_url:
            if "postgresql+asyncpg://" not in test_url:
                return test_url.replace("postgresql://", "postgresql+asyncpg://")
            return test_url
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()

