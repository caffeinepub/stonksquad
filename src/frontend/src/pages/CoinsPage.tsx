import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCoinsDirectory } from '../hooks/queries/useCoinsDirectory';
import { Search, Users, TrendingUp, AlertCircle } from 'lucide-react';

export default function CoinsPage() {
  const { data: directory, isLoading, isError } = useCoinsDirectory();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const coins = directory ? Array.from(directory.values()) : [];
  
  const filteredCoins = coins.filter(
    ({ profile, coin }) =>
      profile?.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoinClick = (symbol: string) => {
    navigate({ to: '/coins/$symbol', params: { symbol } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load coins directory. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-primary/10 pb-6">
        <h1 className="text-4xl font-black font-display tracking-tight mb-2 text-foreground">
          Asset Directory
        </h1>
        <p className="text-muted-foreground text-lg font-mono">
          Browse {coins.length} active profiles
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search profiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 border terminal-border font-mono"
        />
      </div>

      {/* Coins Grid */}
      {filteredCoins.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoins.map(({ coin, profile }) => (
            <Card
              key={coin.symbol}
              className="border terminal-border hover:terminal-glow cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => handleCoinClick(coin.symbol)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="font-display text-xl">{profile?.displayName || coin.name}</span>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-mono">Asset ID:</span>
                  <span className="font-mono font-bold text-accent">{coin.symbol}</span>
                </div>
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border terminal-border">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-mono">
              {searchQuery ? 'No profiles match your search' : 'No profiles available'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
