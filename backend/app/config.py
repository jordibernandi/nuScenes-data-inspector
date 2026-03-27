"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    nuscenes_dataroot: str = "/data/nuscenes"
    nuscenes_version: str = "v1.0-mini"

    model_config = {"env_prefix": "", "env_file": ".env"}
