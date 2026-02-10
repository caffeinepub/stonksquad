import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useGetBalance(symbol: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['balance', symbol],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBalance(symbol);
    },
    enabled: !!actor && !actorFetching && !!symbol,
    retry: false,
  });
}
