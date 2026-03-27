// ── Scenes ────────────────────────────────────────────────────────

export interface Scene {
  token: string;
  name: string;
  description: string;
  nbr_samples: number;
}

export interface SceneSample {
  token: string;
  timestamp: number;
  index: number;
}

// ── Sample detail ─────────────────────────────────────────────────

export interface SensorData {
  token: string;
  filename: string;
  timestamp: number;
  is_key_frame: boolean;
}

export interface SampleDetail {
  token: string;
  timestamp: number;
  prev: string | null;
  next: string | null;
  sensors: Record<string, SensorData>;
  annotation_count: number;
}

// ── LiDAR ─────────────────────────────────────────────────────────

export interface LidarBounds {
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

export interface LidarData {
  total_points_raw: number;
  points_returned: number;
  bounds: LidarBounds;
  points: number[][]; // [x, y, z, intensity, z_normalized]
}

// ── Quality inspection ────────────────────────────────────────────

export type QualityStatus = "PASS" | "WARNING" | "FAIL";

export interface TimestampDeviation {
  channel: string;
  deviation_ms: number;
}

export interface QualityCheck {
  name: string;
  label: string;
  status: QualityStatus;
  detail: string;
  present?: number;
  expected?: number;
  count?: number;
  deviations?: TimestampDeviation[];
}

export interface QualityResult {
  status: QualityStatus;
  checks: QualityCheck[];
}

// ── Camera channels ───────────────────────────────────────────────

export const CAMERA_CHANNELS = [
  "CAM_FRONT_LEFT",
  "CAM_FRONT",
  "CAM_FRONT_RIGHT",
  "CAM_BACK_LEFT",
  "CAM_BACK",
  "CAM_BACK_RIGHT",
] as const;

export type CameraChannel = (typeof CAMERA_CHANNELS)[number];
