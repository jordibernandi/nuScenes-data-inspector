import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchSampleDetail } from "../api/client";

export function useSampleDetail(sampleToken: string | null) {
  return useQuery({
    queryKey: ["sampleDetail", sampleToken],
    queryFn: () => fetchSampleDetail(sampleToken!),
    enabled: !!sampleToken,
    placeholderData: keepPreviousData,
  });
}
