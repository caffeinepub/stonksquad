import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import { useEffect } from 'react';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/stonksquad-icon.dim_256x256.png" alt="StonkSquad" className="h-10 w-10" />
            <span className="text-2xl font-black tracking-tight">StonkSquad</span>
          </div>
          <Button onClick={handleGetStarted} disabled={isLoggingIn} size="lg" className="font-bold">
            {isLoggingIn ? 'Connecting...' : identity ? 'Go to Dashboard' : 'Get Started'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block">
            <img
              src="/assets/generated/stonksquad-logo.dim_512x512.png"
              alt="StonkSquad Logo"
              className="h-32 w-auto mx-auto mb-6"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Connect and Trade with <span className="text-chart-1">Your Squad</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create your profile, browse your friends, and trade shares with SQD credits. Build your social portfolio and connect with your community! 🚀
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button onClick={handleGetStarted} disabled={isLoggingIn} size="lg" className="text-lg px-8 py-6 font-bold">
              {isLoggingIn ? 'Connecting...' : 'Create Your Profile'}
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 rounded-2xl overflow-hidden border-4 border-border shadow-2xl max-w-5xl mx-auto">
          <img
            src="/assets/generated/stonksquad-hero.dim_1600x600.png"
            alt="StonkSquad Trading Platform"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="text-xl font-bold">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Every user gets their own unique identifier when they join. Your personal brand, ready to share and trade!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-bold">Trade & Connect</h3>
              <p className="text-muted-foreground">
                Place buy and sell orders using SQD credits. Watch the order book and connect with your community!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-bold">Instant Matching</h3>
              <p className="text-muted-foreground">
                Our order book matches trades instantly. When buy meets sell, the deal is done and balances update in real-time.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-4xl font-black text-center">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="h-12 w-12 rounded-full bg-chart-1 text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Sign Up & Create Profile</h3>
                <p className="text-muted-foreground">
                  Connect with Internet Identity and create your profile. Instantly receive your personal identifier and 1,000 SQD credits to start trading.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-12 w-12 rounded-full bg-chart-2 text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Browse Profiles</h3>
                <p className="text-muted-foreground">
                  Explore all the profiles on the platform. Check out order books, recent trades, and find interesting people to connect with.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-12 w-12 rounded-full bg-chart-4 text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Trade & Build</h3>
                <p className="text-muted-foreground">
                  Place buy and sell orders. When prices match, trades execute automatically. Build your portfolio and connect with your squad!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-black">Ready to Join the Squad?</h2>
          <p className="text-xl text-muted-foreground">
            Start trading today. Just your Internet Identity needed.
          </p>
          <Button onClick={handleGetStarted} disabled={isLoggingIn} size="lg" className="text-lg px-8 py-6 font-bold">
            {isLoggingIn ? 'Connecting...' : 'Get Started Now'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
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
                  className="hover:text-foreground transition-colors font-medium"
                >
                  caffeine.ai
                </a>
              </span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiX className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
