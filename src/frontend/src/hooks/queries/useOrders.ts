import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { OrderSide } from '../../backend';

interface PlaceOrderParams {
  symbol: string;
  side: OrderSide;
  price: number;
  quantity: bigint;
}

interface PlaceMarketOrderParams {
  symbol: string;
  side: OrderSide;
  amountToSpend: bigint;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, side, price, quantity }: PlaceOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      
      // Validate and normalize symbol
      const normalizedSymbol = symbol.trim();
      if (!normalizedSymbol) throw new Error('Invalid symbol');
      
      return actor.placeOrder(normalizedSymbol, side, price, quantity);
    },
    onSuccess: (_, variables) => {
      // Invalidate order book queries for this symbol
      queryClient.invalidateQueries({ queryKey: ['orderBook', variables.symbol] });
      // Invalidate balance queries
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      // Invalidate stablecoin balance
      queryClient.invalidateQueries({ queryKey: ['stablecoinBalance'] });
      // Invalidate leaderboard (market cap may have changed)
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      // Invalidate price history
      queryClient.invalidateQueries({ queryKey: ['priceHistory', variables.symbol] });
    },
    onError: (error) => {
      // Propagate meaningful errors to UI
      console.error('Order placement failed:', error);
    },
  });
}

export function usePlaceMarketOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, side, amountToSpend }: PlaceMarketOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      
      // Validate and normalize symbol
      const normalizedSymbol = symbol.trim();
      if (!normalizedSymbol) throw new Error('Invalid symbol');
      
      if (amountToSpend <= 0n) throw new Error('Amount must be positive');
      
      return actor.placeMarketOrder(normalizedSymbol, side, amountToSpend);
    },
    onSuccess: (_, variables) => {
      // Invalidate order book queries for this symbol
      queryClient.invalidateQueries({ queryKey: ['orderBook', variables.symbol] });
      // Invalidate balance queries
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      // Invalidate stablecoin balance
      queryClient.invalidateQueries({ queryKey: ['stablecoinBalance'] });
      // Invalidate leaderboard (market cap may have changed)
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      // Invalidate price history
      queryClient.invalidateQueries({ queryKey: ['priceHistory', variables.symbol] });
    },
    onError: (error) => {
      // Propagate meaningful errors to UI
      console.error('Market order placement failed:', error);
    },
  });
}
