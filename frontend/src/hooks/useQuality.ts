import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchQuality } from "../api/client";

export function useQuality(sampleToken: string | null) {
  return useQuery({
    queryKey: ["quality", sampleToken],
    queryFn: () => fetchQuality(sampleToken!),
    enabled: !!sampleToken,
    placeholderData: keepPreviousData,
  });
}
