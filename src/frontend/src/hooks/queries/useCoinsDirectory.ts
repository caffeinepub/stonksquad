import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useGetAllUserProfiles } from './useUserProfile';
import type { UserProfile, Coin } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';

/**
 * Builds a coin directory from backend capabilities (creator coins + symbols).
 * Returns a map of symbol -> { coin, creator, profile } for safe resolution.
 */
export function useCoinsDirectory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: profiles } = useGetAllUserProfiles();

  return useQuery({
    queryKey: ['coinsDirectory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      const coinsWithMarketCaps = await actor.getCreatorCoinsWithMarketCaps();
      
      const directory = new Map<string, { coin: Coin; creator: Principal; profile: UserProfile | null }>();
      
      for (const [creator, coins] of coinsWithMarketCaps) {
        const profile = profiles?.find(p => p.username === coins[0]?.symbol) || null;
        
        for (const coin of coins) {
          directory.set(coin.symbol, { coin, creator, profile });
        }
      }
      
      return directory;
    },
    enabled: !!actor && !actorFetching && !!profiles,
  });
}

/**
 * Resolves a coin/creator/profile by symbol for Coin Detail page.
 * Returns null if the symbol cannot be resolved.
 */
export function useCoinBySymbol(symbol: string | undefined) {
  const { data: directory, isLoading } = useCoinsDirectory();

  return useQuery({
    queryKey: ['coinBySymbol', symbol],
    queryFn: async () => {
      if (!symbol || !directory) return null;
      
      const entry = directory.get(symbol);
      if (!entry) return null;
      
      return entry;
    },
    enabled: !!symbol && !!directory,
    retry: false,
  });
}
