"""
nuScenes Data Inspector — Backend API

Provides REST endpoints for browsing scenes/frames, serving sensor data,
and running data quality inspections on the nuScenes dataset.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import scenes

app = FastAPI(
    title="nuScenes Data Inspector API",
    version="1.0.0",
    description="API for browsing and inspecting nuScenes multi-sensor data",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenes.router)
