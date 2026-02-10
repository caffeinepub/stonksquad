import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CoinsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Placeholder: In a real implementation, this would fetch from backend
  const profiles: Array<{ symbol: string; name: string; owner: string }> = [];

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">People 👥</h1>
        <p className="text-muted-foreground text-lg">Browse and trade with all members</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search profiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            No profiles available yet. Be the first to create your profile!
          </AlertDescription>
        </Alert>
      ) : filteredProfiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No profiles match your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.symbol} className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{profile.name}</span>
                  <Badge variant="outline">{profile.symbol}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="text-xs font-mono truncate">{profile.owner}</p>
                </div>
                <Button
                  onClick={() => navigate({ to: '/coins/$symbol', params: { symbol: profile.symbol } })}
                  className="w-full"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
