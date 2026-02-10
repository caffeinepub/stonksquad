import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { OrderSide } from '../../backend';

interface PlaceOrderParams {
  symbol: string;
  side: OrderSide;
  price: number;
  quantity: bigint;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, side, price, quantity }: PlaceOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(symbol, side, price, quantity);
    },
    onSuccess: (_, variables) => {
      // Invalidate order book queries for this symbol
      queryClient.invalidateQueries({ queryKey: ['orderBook', variables.symbol] });
      // Invalidate balance queries
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
