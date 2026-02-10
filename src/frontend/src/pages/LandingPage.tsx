import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Zap, ArrowRight, Trophy, Target } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import { useEffect } from 'react';
import CyberBackground from '../components/layout/CyberBackground';

export default function LandingPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

  const handleGetStarted = () => {
    if (identity) {
      navigate({ to: '/dashboard' });
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Trading Background */}
      <CyberBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-primary/10 backdrop-blur-md sticky top-0 z-50 bg-background/95 terminal-glow">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/elite-emblem-stoic.dim_512x512.png"
                alt="StonkSquad"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold font-display tracking-tight text-foreground">
                STONKSQUAD
              </span>
            </div>
            <Button
              onClick={handleGetStarted}
              disabled={isLoggingIn}
              size="lg"
              className="font-semibold terminal-glow"
            >
              {isLoggingIn ? 'Connecting...' : identity ? 'Enter Platform' : 'Get Started'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
            <div className="inline-block">
              <img
                src="/assets/generated/elite-emblem-stoic.dim_512x512.png"
                alt="Elite Emblem"
                className="h-32 w-auto mx-auto mb-6 animate-pulse-glow"
              />
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight leading-tight text-foreground">
              Dominate the Social Market
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Launch your coins. Build market cap. Rankings reflect what you create, not what you hold.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                size="lg"
                className="text-lg px-8 py-6 font-bold terminal-glow"
              >
                {isLoggingIn ? 'Connecting...' : 'Start Trading'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 font-semibold terminal-border"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border terminal-border bg-card/50 backdrop-blur-sm hover:terminal-glow transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-display">Creator Market Cap</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your rank is determined by the total market cap of the coins you've launched. Create value, climb the leaderboard.
                </p>
              </CardContent>
            </Card>

            <Card className="border terminal-border bg-card/50 backdrop-blur-sm hover:terminal-glow transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-display">Social Trading</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Trade coins backed by real people. Every profile becomes a tradeable asset with transparent order books.
                </p>
              </CardContent>
            </Card>

            <Card className="border terminal-border bg-card/50 backdrop-blur-sm hover:terminal-glow transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-2xl font-bold font-display">Real-Time Markets</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Place buy and sell orders instantly. Watch the market move in real-time as traders discover price.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="border-2 terminal-border bg-card/50 backdrop-blur-sm terminal-glow">
            <CardContent className="py-16 text-center space-y-6">
              <Trophy className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-4xl md:text-5xl font-black font-display">
                Ready to Compete?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the elite creators building market cap and dominating the rankings.
              </p>
              <Button
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                size="lg"
                className="text-lg px-8 py-6 font-bold terminal-glow"
              >
                {isLoggingIn ? 'Connecting...' : 'Launch Your Coin'}
                <Target className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-primary/10 backdrop-blur-sm bg-background/90">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>© {new Date().getFullYear()} StonkSquad</span>
                <span>•</span>
                <span>
                  Built with ❤️ using{' '}
                  <a
                    href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                      typeof window !== 'undefined' ? window.location.hostname : 'stonksquad'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors font-medium"
                  >
                    caffeine.ai
                  </a>
                </span>
              </div>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiX className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
