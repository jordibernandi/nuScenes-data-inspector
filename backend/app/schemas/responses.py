"""Pydantic response models for all API endpoints."""

from __future__ import annotations

from pydantic import BaseModel


# ── Scenes ────────────────────────────────────────────────────────


class SceneResponse(BaseModel):
    token: str
    name: str
    description: str
    nbr_samples: int


class SceneSampleResponse(BaseModel):
    token: str
    timestamp: int
    index: int


# ── Sample detail ─────────────────────────────────────────────────


class SensorData(BaseModel):
    token: str
    filename: str
    timestamp: int
    is_key_frame: bool


class SampleDetailResponse(BaseModel):
    token: str
    timestamp: int
    prev: str | None
    next: str | None
    sensors: dict[str, SensorData]
    annotation_count: int


# ── LiDAR ─────────────────────────────────────────────────────────


class LidarBounds(BaseModel):
    x: list[float]
    y: list[float]
    z: list[float]


class LidarResponse(BaseModel):
    total_points_raw: int
    points_returned: int
    bounds: LidarBounds
    points: list[list[float]]


# ── Quality inspection ────────────────────────────────────────────


class TimestampDeviation(BaseModel):
    channel: str
    deviation_ms: float


class QualityCheckResult(BaseModel):
    name: str
    label: str
    status: str
    detail: str
    # Sensor completeness fields
    present: int | None = None
    expected: int | None = None
    # Annotation fields
    count: int | None = None
    # Timestamp sync fields
    deviations: list[TimestampDeviation] | None = None


class QualityResponse(BaseModel):
    status: str
    checks: list[QualityCheckResult]
