import { Outlet, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/queries/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import { User, LogOut, LayoutDashboard, Users, Activity, Menu, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import CyberBackground from './CyberBackground';

export default function AppShell() {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'People', icon: Users, path: '/coins' },
    { label: 'Activity', icon: Activity, path: '/activity' },
    { label: 'Deposit', icon: ArrowDownToLine, path: '/deposit' },
    { label: 'Withdraw', icon: ArrowUpFromLine, path: '/withdraw' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Trading Background */}
      <CyberBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-primary/10 backdrop-blur-md sticky top-0 z-50 bg-background/95 terminal-glow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
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

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => navigate({ to: item.path })}
                    className="font-mono text-sm"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="terminal-border font-mono">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {userProfile?.displayName || 'USER'}
                      </span>
                      <Menu className="h-4 w-4 ml-2 md:hidden" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 terminal-border">
                    <DropdownMenuLabel className="font-mono">
                      {userProfile?.displayName || 'User'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                      {navItems.map((item) => (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => navigate({ to: item.path })}
                          className="font-mono"
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>

                    <DropdownMenuItem onClick={handleLogout} className="font-mono text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-primary/10 mt-20 backdrop-blur-sm bg-background/90">
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
