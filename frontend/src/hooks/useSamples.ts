import { useQuery } from "@tanstack/react-query";
import { fetchSceneSamples } from "../api/client";

export function useSamples(sceneToken: string | null) {
  return useQuery({
    queryKey: ["samples", sceneToken],
    queryFn: () => fetchSceneSamples(sceneToken!),
    enabled: !!sceneToken,
  });
}
