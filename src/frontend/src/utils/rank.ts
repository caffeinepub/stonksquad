/**
 * Rank tier system based on creator market cap (total market cap of coins created by the user).
 * Provides tier names, styling hints, and badge references for gamification.
 */

export interface RankTier {
  name: string;
  minCreatorCap: number;
  color: string;
  glowClass: string;
  badgeIndex: number;
  description: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    name: 'INITIATE',
    minCreatorCap: 0,
    color: 'text-muted-foreground',
    glowClass: '',
    badgeIndex: 0,
    description: 'Building foundation',
  },
  {
    name: 'OPERATOR',
    minCreatorCap: 5000,
    color: 'text-chart-2',
    glowClass: '',
    badgeIndex: 1,
    description: 'Establishing presence',
  },
  {
    name: 'SPECIALIST',
    minCreatorCap: 15000,
    color: 'text-chart-3',
    glowClass: '',
    badgeIndex: 2,
    description: 'Proven creator',
  },
  {
    name: 'ELITE',
    minCreatorCap: 50000,
    color: 'text-chart-4',
    glowClass: 'rank-glow-bronze',
    badgeIndex: 3,
    description: 'Market force',
  },
  {
    name: 'MASTER',
    minCreatorCap: 150000,
    color: 'text-chart-5',
    glowClass: 'rank-glow-silver',
    badgeIndex: 4,
    description: 'Dominant creator',
  },
  {
    name: 'LEGEND',
    minCreatorCap: 500000,
    color: 'text-primary',
    glowClass: 'rank-glow-gold',
    badgeIndex: 5,
    description: 'Absolute control',
  },
];

export function getRankTier(creatorCap: number): RankTier {
  // Find the highest tier the user qualifies for
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (creatorCap >= RANK_TIERS[i].minCreatorCap) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}

export function getNextRankTier(currentCreatorCap: number): RankTier | null {
  const currentTier = getRankTier(currentCreatorCap);
  const currentIndex = RANK_TIERS.findIndex(t => t.name === currentTier.name);
  
  if (currentIndex < RANK_TIERS.length - 1) {
    return RANK_TIERS[currentIndex + 1];
  }
  
  return null;
}

export function getRankProgress(creatorCap: number): number {
  const currentTier = getRankTier(creatorCap);
  const nextTier = getNextRankTier(creatorCap);
  
  if (!nextTier) {
    return 100; // Max rank achieved
  }
  
  const tierRange = nextTier.minCreatorCap - currentTier.minCreatorCap;
  const progress = creatorCap - currentTier.minCreatorCap;
  
  return Math.min(100, Math.max(0, (progress / tierRange) * 100));
}
