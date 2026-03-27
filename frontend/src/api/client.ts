import type {
  LidarData,
  QualityResult,
  SampleDetail,
  Scene,
  SceneSample,
} from "../types/api";

const BASE = "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchScenes(): Promise<Scene[]> {
  return fetchJson<Scene[]>("/scenes");
}

export function fetchSceneSamples(sceneToken: string): Promise<SceneSample[]> {
  return fetchJson<SceneSample[]>(`/scenes/${sceneToken}/samples`);
}

export function fetchSampleDetail(sampleToken: string): Promise<SampleDetail> {
  return fetchJson<SampleDetail>(`/samples/${sampleToken}`);
}

export function fetchLidarPoints(
  sampleToken: string,
  maxPoints = 40000,
): Promise<LidarData> {
  return fetchJson<LidarData>(
    `/samples/${sampleToken}/lidar?max_points=${maxPoints}`,
  );
}

export function fetchQuality(sampleToken: string): Promise<QualityResult> {
  return fetchJson<QualityResult>(`/samples/${sampleToken}/quality`);
}

export function cameraImageUrl(
  sampleToken: string,
  channel: string,
): string {
  return `${BASE}/samples/${sampleToken}/camera/${channel}`;
}
