import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchLidarPoints } from "../api/client";

export function useLidarPoints(sampleToken: string | null) {
  return useQuery({
    queryKey: ["lidar", sampleToken],
    queryFn: () => fetchLidarPoints(sampleToken!),
    enabled: !!sampleToken,
    placeholderData: keepPreviousData,
  });
}
