import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { useGetLeaderboard, type LeaderboardEntry } from '../hooks/queries/useLeaderboard';
import { useGetUserProfile } from '../hooks/queries/useUserProfile';
import { useGetMarketCapTrend } from '../hooks/queries/useMarketCapTrend';
import { RankBadge } from '../components/rank/RankBadge';
import { getRankTier } from '../utils/rank';
import { formatMarketCap } from '../utils/currency';
import { MarketCapSparkline } from '../components/trends/MarketCapSparkline';
import { MarketCapTrendDialog } from '../components/trends/MarketCapTrendDialog';

export default function ActivityPage() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-primary/10 pb-6">
        <h1 className="text-4xl font-black font-display tracking-tight mb-2 text-foreground">
          Creator Rankings
        </h1>
        <p className="text-muted-foreground text-lg font-mono">
          Ranked by total market cap of launched assets
        </p>
      </div>

      {/* Leaderboard Card */}
      <Card className="border terminal-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Trophy className="h-6 w-6 text-primary" />
            Top Creators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono">Rank</TableHead>
                  <TableHead className="font-mono">Creator</TableHead>
                  <TableHead className="font-mono">Tier</TableHead>
                  <TableHead className="font-mono text-right">Market Cap</TableHead>
                  <TableHead className="font-mono text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <LeaderboardRow key={entry.principal.toString()} entry={entry} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-mono">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No creators on the leaderboard yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(entry.principal);
  const { data: trendData, isLoading: trendLoading } = useGetMarketCapTrend(entry.principal);
  
  // Convert bigint to number for rank tier calculation
  const rankTier = getRankTier(Number(entry.creatorMarketCap));

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRowClass = (position: number) => {
    switch (position) {
      case 1:
        return 'rank-glow-gold';
      case 2:
        return 'rank-glow-silver';
      case 3:
        return 'rank-glow-bronze';
      default:
        return '';
    }
  };

  return (
    <TableRow className={getRowClass(entry.rank)}>
      <TableCell className="font-mono font-bold">
        <div className="flex items-center gap-2">
          {getRankIcon(entry.rank)}
          <span>#{entry.rank}</span>
        </div>
      </TableCell>
      <TableCell className="font-mono">
        {profileLoading ? (
          <Skeleton className="h-10 w-32" />
        ) : profile ? (
          <div>
            <div className="font-bold">{profile.displayName}</div>
            <div className="text-sm text-muted-foreground">@{profile.username}</div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Unknown User</div>
        )}
      </TableCell>
      <TableCell>
        <RankBadge tier={rankTier} variant="compact" />
      </TableCell>
      <TableCell className="font-mono font-bold text-right">
        {formatMarketCap(entry.creatorMarketCap)}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          {trendLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : trendData && trendData.length > 0 ? (
            <MarketCapTrendDialog
              data={trendData}
              isLoading={trendLoading}
              userName={profile?.displayName || 'User'}
              trigger={
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <MarketCapSparkline data={trendData} width={80} height={30} />
                </button>
              }
            />
          ) : (
            <span className="text-xs text-muted-foreground font-mono">No data</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
