import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RankTier } from '@/utils/rank';
import { Trophy, Zap } from 'lucide-react';

interface RankBadgeProps {
  tier: RankTier;
  variant?: 'compact' | 'full' | 'card';
  showDescription?: boolean;
}

export function RankBadge({ tier, variant = 'compact', showDescription = false }: RankBadgeProps) {
  if (variant === 'card') {
    return (
      <Card className={`border-2 cyber-border ${tier.glowClass} transition-all duration-300`}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/assets/generated/elite-emblem.dim_512x512.png"
                  alt="Elite Emblem"
                  className="h-16 w-16 object-contain"
                />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                  <Trophy className={`h-5 w-5 ${tier.color}`} />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
                  Rank Status
                </div>
                <div className={`text-2xl font-black font-display ${tier.color} tracking-tight`}>
                  {tier.name}
                </div>
              </div>
            </div>
          </div>
          {showDescription && (
            <p className="text-sm text-muted-foreground border-t border-border pt-3">
              {tier.description}
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="/assets/generated/elite-emblem.dim_512x512.png"
            alt="Elite Emblem"
            className="h-12 w-12 object-contain"
          />
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
            <Zap className={`h-4 w-4 ${tier.color}`} />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Rank
          </div>
          <div className={`text-lg font-black font-display ${tier.color}`}>
            {tier.name}
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <Badge
      variant="outline"
      className={`${tier.color} border-current font-mono font-bold tracking-wider px-3 py-1`}
    >
      <Trophy className="h-3 w-3 mr-1" />
      {tier.name}
    </Badge>
  );
}
