"""
NuScenes service layer.

Encapsulates all interaction with the nuScenes SDK and implements
data quality inspection logic.
"""

from __future__ import annotations

import os
from typing import Any

import numpy as np
from nuscenes.nuscenes import NuScenes


# Expected sensor channels in a complete nuScenes sample
EXPECTED_CAMERAS = [
    "CAM_FRONT",
    "CAM_FRONT_RIGHT",
    "CAM_FRONT_LEFT",
    "CAM_BACK",
    "CAM_BACK_LEFT",
    "CAM_BACK_RIGHT",
]
EXPECTED_LIDARS = ["LIDAR_TOP"]
EXPECTED_RADARS = [
    "RADAR_FRONT",
    "RADAR_FRONT_LEFT",
    "RADAR_FRONT_RIGHT",
    "RADAR_BACK_LEFT",
    "RADAR_BACK_RIGHT",
]
ALL_EXPECTED_CHANNELS = EXPECTED_CAMERAS + EXPECTED_LIDARS + EXPECTED_RADARS

# Maximum acceptable timestamp deviation from key-frame (microseconds)
TIMESTAMP_TOLERANCE_US = 100_000  # 100 ms


class NuScenesService:
    """Thin service wrapper around the nuScenes devkit."""

    def __init__(self, dataroot: str, version: str = "v1.0-mini"):
        print(f"Loading nuScenes {version} from {dataroot} …")
        self.nusc = NuScenes(version=version, dataroot=dataroot, verbose=True)
        self.dataroot = dataroot

    # ── Scenes ───────────────────────────────────────────────────

    def list_scenes(self) -> list[dict[str, Any]]:
        scenes = []
        for s in self.nusc.scene:
            scenes.append(
                {
                    "token": s["token"],
                    "name": s["name"],
                    "description": s["description"],
                    "nbr_samples": s["nbr_samples"],
                }
            )
        return scenes

    def list_scene_samples(self, scene_token: str) -> list[dict[str, Any]]:
        scene = self.nusc.get("scene", scene_token)
        samples: list[dict[str, Any]] = []
        sample_token = scene["first_sample_token"]
        index = 0
        while sample_token:
            sample = self.nusc.get("sample", sample_token)
            samples.append(
                {
                    "token": sample["token"],
                    "timestamp": sample["timestamp"],
                    "index": index,
                }
            )
            sample_token = sample["next"]
            index += 1
        return samples

    # ── Sample detail ────────────────────────────────────────────

    def get_sample_detail(self, sample_token: str) -> dict[str, Any]:
        sample = self.nusc.get("sample", sample_token)

        # Collect sensor channels present in this sample
        sensors: dict[str, Any] = {}
        for channel, sd_token in sample["data"].items():
            sd = self.nusc.get("sample_data", sd_token)
            sensors[channel] = {
                "token": sd_token,
                "filename": sd["filename"],
                "timestamp": sd["timestamp"],
                "is_key_frame": sd["is_key_frame"],
            }

        annotation_count = len(sample["anns"])

        return {
            "token": sample["token"],
            "timestamp": sample["timestamp"],
            "prev": sample["prev"] or None,
            "next": sample["next"] or None,
            "sensors": sensors,
            "annotation_count": annotation_count,
        }

    # ── Camera ───────────────────────────────────────────────────

    def get_camera_image_path(self, sample_token: str, channel: str) -> str:
        sample = self.nusc.get("sample", sample_token)
        if channel not in sample["data"]:
            raise KeyError(channel)
        sd_token = sample["data"][channel]
        sd = self.nusc.get("sample_data", sd_token)
        return os.path.join(self.dataroot, sd["filename"])

    # ── LiDAR ────────────────────────────────────────────────────

    def get_lidar_points(
        self, sample_token: str, max_points: int = 40000
    ) -> dict[str, Any]:
        sample = self.nusc.get("sample", sample_token)
        lidar_token = sample["data"].get("LIDAR_TOP")
        if not lidar_token:
            raise KeyError("LIDAR_TOP")

        sd = self.nusc.get("sample_data", lidar_token)
        pcl_path = os.path.join(self.dataroot, sd["filename"])

        # nuScenes LiDAR: float32 binary with x, y, z, intensity, ring_index
        points = np.fromfile(pcl_path, dtype=np.float32).reshape(-1, 5)

        # Downsample if needed
        if len(points) > max_points:
            indices = np.random.choice(len(points), max_points, replace=False)
            points = points[indices]

        # Normalize Z for frontend coloring
        z = points[:, 2]
        z_min, z_max = z.min(), z.max()
        z_range = z_max - z_min if z_max > z_min else 1.0
        z_norm = (z - z_min) / z_range

        result = []
        for i in range(len(points)):
            result.append(
                [
                    round(float(points[i, 0]), 3),  # x
                    round(float(points[i, 1]), 3),  # y
                    round(float(points[i, 2]), 3),  # z
                    round(float(points[i, 3]), 3),  # intensity
                    round(float(z_norm[i]), 3),     # z_normalized (0-1)
                ]
            )

        return {
            "total_points_raw": int(len(np.fromfile(pcl_path, dtype=np.float32)) / 5),
            "points_returned": len(result),
            "bounds": {
                "x": [round(float(points[:, 0].min()), 2), round(float(points[:, 0].max()), 2)],
                "y": [round(float(points[:, 1].min()), 2), round(float(points[:, 1].max()), 2)],
                "z": [round(float(z_min), 2), round(float(z_max), 2)],
            },
            "points": result,
        }

    # ── Quality inspection ───────────────────────────────────────

    def inspect_quality(self, sample_token: str) -> dict[str, Any]:
        sample = self.nusc.get("sample", sample_token)
        checks: list[dict[str, Any]] = []

        checks.append(self._check_sensor_completeness(sample))
        checks.append(self._check_timestamp_sync(sample))
        checks.append(self._check_annotations(sample))
        checks.append(self._check_files_exist(sample))

        # Overall status: worst of all checks
        statuses = [c["status"] for c in checks]
        if "FAIL" in statuses:
            overall = "FAIL"
        elif "WARNING" in statuses:
            overall = "WARNING"
        else:
            overall = "PASS"

        return {"status": overall, "checks": checks}

    def _check_sensor_completeness(self, sample: dict) -> dict[str, Any]:
        present = set(sample["data"].keys())
        expected = set(ALL_EXPECTED_CHANNELS)
        missing = expected - present
        extra = present - expected

        if missing:
            status = "FAIL" if len(missing) > 2 else "WARNING"
            detail = f"Missing channels: {', '.join(sorted(missing))}"
        else:
            status = "PASS"
            detail = f"All {len(expected)} expected channels present"

        if extra:
            detail += f" (+{len(extra)} extra)"

        return {
            "name": "sensor_completeness",
            "label": "Sensor Completeness",
            "status": status,
            "detail": detail,
            "present": len(present),
            "expected": len(expected),
        }

    def _check_timestamp_sync(self, sample: dict) -> dict[str, Any]:
        key_ts = sample["timestamp"]
        deviations: list[dict[str, Any]] = []

        for channel, sd_token in sample["data"].items():
            sd = self.nusc.get("sample_data", sd_token)
            deviation_us = abs(sd["timestamp"] - key_ts)
            deviation_ms = deviation_us / 1000.0
            deviations.append(
                {
                    "channel": channel,
                    "deviation_ms": round(deviation_ms, 2),
                }
            )

        over_threshold = [
            d for d in deviations if d["deviation_ms"] > TIMESTAMP_TOLERANCE_US / 1000
        ]

        if over_threshold:
            worst = max(over_threshold, key=lambda d: d["deviation_ms"])
            status = "WARNING"
            detail = (
                f"{len(over_threshold)} channel(s) exceed {TIMESTAMP_TOLERANCE_US // 1000}ms threshold. "
                f"Worst: {worst['channel']} at {worst['deviation_ms']}ms"
            )
        else:
            max_dev = max(deviations, key=lambda d: d["deviation_ms"])
            status = "PASS"
            detail = (
                f"All channels within {TIMESTAMP_TOLERANCE_US // 1000}ms. "
                f"Max deviation: {max_dev['channel']} at {max_dev['deviation_ms']}ms"
            )

        return {
            "name": "timestamp_sync",
            "label": "Timestamp Synchronization",
            "status": status,
            "detail": detail,
            "deviations": sorted(deviations, key=lambda d: -d["deviation_ms"]),
        }

    def _check_annotations(self, sample: dict) -> dict[str, Any]:
        count = len(sample["anns"])
        if count == 0:
            status = "WARNING"
            detail = "No annotations for this frame"
        else:
            status = "PASS"
            detail = f"{count} annotation(s) present"

        return {
            "name": "annotations",
            "label": "Annotation Availability",
            "status": status,
            "detail": detail,
            "count": count,
        }

    def _check_files_exist(self, sample: dict) -> dict[str, Any]:
        missing_files: list[str] = []
        total = 0

        for channel, sd_token in sample["data"].items():
            sd = self.nusc.get("sample_data", sd_token)
            filepath = os.path.join(self.dataroot, sd["filename"])
            total += 1
            if not os.path.exists(filepath):
                missing_files.append(channel)

        if missing_files:
            status = "FAIL"
            detail = f"{len(missing_files)} file(s) missing on disk: {', '.join(missing_files)}"
        else:
            status = "PASS"
            detail = f"All {total} sensor files present on disk"

        return {
            "name": "file_integrity",
            "label": "File Integrity",
            "status": status,
            "detail": detail,
        }
