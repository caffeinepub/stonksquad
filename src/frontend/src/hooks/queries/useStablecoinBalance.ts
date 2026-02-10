import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useGetStablecoinBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['balance', 'USDC'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBalance('USDC');
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
