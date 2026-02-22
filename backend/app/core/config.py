"""OA 系统配置管理模块。

使用 pydantic-settings 从环境变量 / .env 文件加载配置。
"""

from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """全局配置项，自动从 .env 文件读取。"""

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 数据库
    database_url: str = "postgresql+asyncpg://oa_admin:oa_password@localhost:5432/oa_db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "change-this-to-a-random-secret-key-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # 应用
    app_name: str = "OA协同办公系统"
    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"

    # 默认管理员
    admin_username: str = "admin"
    admin_password: str = "admin123"

    @property
    def cors_origin_list(self) -> list[str]:
        """将逗号分隔的 CORS 源转为列表。"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """获取全局配置单例。"""
    return Settings()
