import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';

export interface CreatorCapData {
  principal: Principal;
  creatorMarketCap: bigint;
}

export function useGetCreatorCapRanking() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CreatorCapData[]>({
    queryKey: ['creatorCapRanking'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const rankings = await actor.getCreatorCapRanking();
      
      return rankings.map(([principal, creatorMarketCap]) => ({
        principal,
        creatorMarketCap,
      }));
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
}

export function useGetCallerCreatorCap() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['callerCreatorCap'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const rankings = await actor.getCreatorCapRanking();
      const callerPrincipal = identity.getPrincipal().toString();
      
      const callerEntry = rankings.find(
        ([principal]) => principal.toString() === callerPrincipal
      );
      
      return callerEntry ? callerEntry[1] : 0n;
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
    staleTime: 30000,
  });
}
