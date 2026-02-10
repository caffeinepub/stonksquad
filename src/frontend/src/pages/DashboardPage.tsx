import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useGetCallerUserProfile } from '../hooks/queries/useUserProfile';
import { useGetBalance } from '../hooks/queries/useBalances';
import { useGetStablecoinBalance } from '../hooks/queries/useStablecoinBalance';
import { useGetCallerCreatorCap } from '../hooks/queries/useCreatorCap';
import { TrendingUp, Wallet, User, Trophy, Target, ArrowUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserAssetSymbol } from '../utils/assetSymbols';
import { formatStablecoin } from '../utils/currency';
import { getRankTier, getNextRankTier, getRankProgress } from '../utils/rank';
import { RankBadge } from '../components/rank/RankBadge';

export default function DashboardPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: usdcBalance, isLoading: usdcBalanceLoading } = useGetStablecoinBalance();
  const { data: creatorCap, isLoading: creatorCapLoading } = useGetCallerCreatorCap();
  const userSymbol = userProfile ? getUserAssetSymbol(userProfile.username) : '';
  const { data: ownBalance, isLoading: ownBalanceLoading } = useGetBalance(userSymbol);

  const creatorCapNum = creatorCap ? Number(creatorCap) : 0;
  const currentTier = getRankTier(creatorCapNum);
  const nextTier = getNextRankTier(creatorCapNum);
  const rankProgress = getRankProgress(creatorCapNum);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="border-b border-primary/20 pb-6">
        <h1 className="text-4xl font-black font-display tracking-tight mb-2 text-primary">
          {userProfile?.displayName.toUpperCase() || 'USER'}
        </h1>
        <p className="text-muted-foreground text-lg font-mono">DASHBOARD</p>
      </div>

      {/* Rank Status Card */}
      <RankBadge tier={currentTier} variant="card" showDescription />

      {/* Rank Progress */}
      {nextTier && (
        <Card className="border-2 cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Target className="h-5 w-5 text-primary" />
              NEXT RANK: {nextTier.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={rankProgress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-mono">
                Current: {creatorCapNum.toLocaleString()} Cap
              </span>
              <span className="text-primary font-mono font-bold">
                Target: {nextTier.minCreatorCap.toLocaleString()} Cap
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.ceil(nextTier.minCreatorCap - creatorCapNum).toLocaleString()} market cap needed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Creator Market Cap */}
        <Card className="border-2 border-primary/30 cyber-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-medium uppercase tracking-wider">
              Creator Market Cap
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {creatorCapLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-black font-display text-primary">
                {creatorCapNum.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Total Cap</p>
          </CardContent>
        </Card>

        {/* Stablecoin Balance */}
        <Card className="border-2 cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-medium uppercase tracking-wider">
              Funds Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {usdcBalanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-black font-display">
                {formatStablecoin(usdcBalance || BigInt(0))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Available</p>
          </CardContent>
        </Card>

        {/* Own Asset Balance */}
        <Card className="border-2 cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-medium uppercase tracking-wider">
              Your Asset
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {ownBalanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-black font-display">{ownBalance?.toString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">
              {userSymbol || 'Loading...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 cyber-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            QUICK ACTIONS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="border-primary/30">
            <ArrowUp className="h-4 w-4 text-primary" />
            <AlertDescription className="font-mono text-sm">
              Navigate to <strong>People</strong> to view assets and execute trades.
            </AlertDescription>
          </Alert>
          <Alert className="border-accent/30">
            <Trophy className="h-4 w-4 text-accent" />
            <AlertDescription className="font-mono text-sm">
              Check <strong>Activity</strong> to view creator rankings by market cap.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
