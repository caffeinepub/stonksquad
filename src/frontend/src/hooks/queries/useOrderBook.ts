import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Order, OrderSide } from '../../backend';

export function useGetOrderBook(symbol: string, side: OrderSide, depth?: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orderBook', symbol, side, depth],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrderBook(symbol, side, depth ? BigInt(depth) : null);
    },
    enabled: !!actor && !actorFetching && !!symbol,
    refetchInterval: 5000, // Refetch every 5 seconds for near real-time updates
  });
}
