import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { PricePoint } from '../../backend';

export function usePriceHistory(symbol: string | undefined, maxPoints?: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PricePoint[]>({
    queryKey: ['priceHistory', symbol, maxPoints],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!symbol) throw new Error('Symbol is required');
      
      const normalizedSymbol = symbol.trim();
      if (!normalizedSymbol) throw new Error('Invalid symbol');
      
      return actor.getPriceHistory(normalizedSymbol, maxPoints ? BigInt(maxPoints) : null);
    },
    enabled: !!actor && !actorFetching && !!symbol,
    refetchInterval: 10000, // Refetch every 10 seconds for near real-time updates
    retry: 1,
  });
}
