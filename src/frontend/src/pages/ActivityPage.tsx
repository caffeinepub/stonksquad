import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Trophy, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ActivityPage() {
  // Placeholder data - would be fetched from backend in real implementation
  const topProfiles: Array<{ symbol: string; name: string; lastPrice: number; change: number }> = [];
  const recentTrades: Array<{ symbol: string; price: number; quantity: number; timestamp: string }> = [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Activity & Leaderboard 📊</h1>
        <p className="text-muted-foreground text-lg">Track the most active profiles and recent trades</p>
      </div>

      {/* Top Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-chart-1" />
            Top Performing Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProfiles.length === 0 ? (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>No trading activity yet. Start trading to see the leaderboard!</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Last Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProfiles.map((profile, index) => (
                  <TableRow key={profile.symbol}>
                    <TableCell className="font-bold">#{index + 1}</TableCell>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{profile.symbol}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{profile.lastPrice.toFixed(2)} SQD</TableCell>
                    <TableCell>
                      <Badge variant={profile.change >= 0 ? 'default' : 'destructive'}>
                        {profile.change >= 0 ? '+' : ''}
                        {profile.change.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-2" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>No recent trades. Be the first to make a trade!</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline">{trade.symbol}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{trade.price.toFixed(2)} SQD</TableCell>
                    <TableCell>{trade.quantity}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{trade.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
