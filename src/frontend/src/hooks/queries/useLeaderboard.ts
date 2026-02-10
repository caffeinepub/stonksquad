import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { Principal } from '@icp-sdk/core/principal';

export interface LeaderboardEntry {
  principal: Principal;
  creatorMarketCap: bigint;
  rank: number;
}

export function useGetLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const rankings = await actor.getCreatorCapRanking();
      
      // Transform backend data into frontend-friendly format with rank numbers
      return rankings.map(([principal, creatorMarketCap], index) => ({
        principal,
        creatorMarketCap,
        rank: index + 1,
      }));
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
}
