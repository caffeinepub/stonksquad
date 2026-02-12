import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { MarketCapTrendPoint } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetMarketCapTrend(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketCapTrendPoint[]>({
    queryKey: ['marketCapTrend', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) throw new Error('Actor or principal not available');
      return actor.getMarketCapTrend(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
}
