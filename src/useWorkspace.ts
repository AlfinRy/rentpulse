import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sampleWorkspace, type SamplePulse, type SampleWorkspace } from "./sample";

/**
 * Resource hook for the sample workspace.
 *
 * Loads the bundled example data through TanStack Query so loading, error,
 * and cache-invalidation behavior match the shape the live Convex adapter
 * will have later. The small delay models network latency; nothing here
 * contacts a server.
 */
async function loadWorkspace(): Promise<SampleWorkspace> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return sampleWorkspace;
}

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: loadWorkspace,
  });
}

export type NewPulseInput = {
  label: string;
  city: string;
  query: string;
  budgetMax: number;
  currency: string;
  email: string;
};

/** Creates a pulse in local sample state. No server, no scan, no email. */
export function useCreatePulse() {
  const queryClient = useQueryClient();
  return (input: NewPulseInput) => {
    queryClient.setQueryData<SampleWorkspace>(["workspace"], (prev) => {
      if (!prev) return prev;
      const pulse: SamplePulse = {
        ...input,
        id: `p-local-${crypto.randomUUID().slice(0, 8)}`,
        minScore: 70,
        active: true,
      };
      return { ...prev, pulses: [...prev.pulses, pulse] };
    });
  };
}
