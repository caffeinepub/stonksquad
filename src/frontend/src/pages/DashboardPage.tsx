import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCallerUserProfile } from '../hooks/queries/useUserProfile';
import { useGetBalance } from '../hooks/queries/useBalances';
import { TrendingUp, Wallet, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserAssetSymbol } from '../utils/assetSymbols';

export default function DashboardPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: sqdBalance, isLoading: sqdLoading, error: sqdError } = useGetBalance('SQD');
  const userSymbol = userProfile ? getUserAssetSymbol(userProfile.username) : '';
  const { data: ownBalance, isLoading: ownBalanceLoading } = useGetBalance(userSymbol);

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
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">
          Welcome back, {userProfile?.displayName || 'Trader'}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">Your personal dashboard</p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* SQD Balance */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SQD Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sqdLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : sqdError ? (
              <p className="text-sm text-destructive">Error loading balance</p>
            ) : (
              <div className="text-3xl font-bold">{sqdBalance?.toString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Trading credits</p>
          </CardContent>
        </Card>

        {/* Own Balance */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Shares</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ownBalanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold">{ownBalance?.toString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs">
                {userSymbol}
              </Badge>
            </p>
          </CardContent>
        </Card>

        {/* Portfolio Value Placeholder */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Display Name</p>
            <p className="text-lg font-semibold">{userProfile?.displayName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p className="text-lg font-semibold">{userProfile?.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bio</p>
            <p className="text-lg">{userProfile?.bio || 'No bio yet'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Your Identifier</p>
            <Badge variant="secondary" className="text-sm font-mono">
              {userSymbol}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name Status</p>
            <Badge variant="default" className="text-sm">
              Confirmed
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Ready to trade? Head to the <strong>People</strong> page to browse profiles and start placing orders!
        </AlertDescription>
      </Alert>
    </div>
  );
}
