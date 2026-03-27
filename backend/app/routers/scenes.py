"""Scene, sample, and sensor data endpoints."""

import os
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from app.config import Settings
from app.schemas.responses import (
    LidarResponse,
    QualityResponse,
    SampleDetailResponse,
    SceneResponse,
    SceneSampleResponse,
)
from app.services.nuscenes_service import NuScenesService

router = APIRouter(prefix="/api")


# ── Dependency injection ──────────────────────────────────────────


@lru_cache()
def _get_settings() -> Settings:
    return Settings()


@lru_cache()
def _get_service() -> NuScenesService:
    settings = _get_settings()
    return NuScenesService(
        dataroot=settings.nuscenes_dataroot,
        version=settings.nuscenes_version,
    )



# ── Scene endpoints ──────────────────────────────────────────────


@router.get("/scenes", response_model=list[SceneResponse])
def list_scenes(svc: NuScenesService = Depends(_get_service)):
    """Return all scenes with basic metadata."""
    return svc.list_scenes()


@router.get(
    "/scenes/{scene_token}/samples",
    response_model=list[SceneSampleResponse],
)
def list_scene_samples(
    scene_token: str,
    svc: NuScenesService = Depends(_get_service),
):
    """Return ordered list of samples for a scene."""
    try:
        return svc.list_scene_samples(scene_token)
    except KeyError:
        raise HTTPException(404, f"Scene {scene_token} not found")


# ── Sample (frame) endpoints ─────────────────────────────────────


@router.get("/samples/{sample_token}", response_model=SampleDetailResponse)
def get_sample_detail(
    sample_token: str,
    svc: NuScenesService = Depends(_get_service),
):
    """Return full detail for a single sample: sensors, annotations, nav links."""
    try:
        return svc.get_sample_detail(sample_token)
    except KeyError:
        raise HTTPException(404, f"Sample {sample_token} not found")


@router.get("/samples/{sample_token}/camera/{channel}")
def get_camera_image(
    sample_token: str,
    channel: str,
    svc: NuScenesService = Depends(_get_service),
):
    """Serve a camera image file for the given sample and channel."""
    try:
        path = svc.get_camera_image_path(sample_token, channel)
    except KeyError:
        raise HTTPException(404, f"Camera data not found for {channel}")
    if not os.path.exists(path):
        raise HTTPException(500, f"Image file missing on disk: {path}")
    return FileResponse(path, media_type="image/jpeg")


@router.get("/samples/{sample_token}/lidar", response_model=LidarResponse)
def get_lidar_points(
    sample_token: str,
    max_points: int = Query(40000, ge=1, le=200000),
    svc: NuScenesService = Depends(_get_service),
):
    """Return LiDAR point cloud as JSON. Downsampled to max_points."""
    try:
        return svc.get_lidar_points(sample_token, max_points=max_points)
    except KeyError:
        raise HTTPException(404, "LiDAR data not found")


# ── Quality inspection ───────────────────────────────────────────


@router.get(
    "/samples/{sample_token}/quality",
    response_model=QualityResponse,
)
def inspect_quality(
    sample_token: str,
    svc: NuScenesService = Depends(_get_service),
):
    """Run data quality checks on a sample and return structured result."""
    try:
        return svc.inspect_quality(sample_token)
    except KeyError:
        raise HTTPException(404, f"Sample {sample_token} not found")
