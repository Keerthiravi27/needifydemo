import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="hidden md:block sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2" data-testid="header-logo">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl">
              N
            </div>
            <span className="text-2xl font-bold font-outfit text-primary-foreground">Needify</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/home"
              data-testid="nav-home-desktop"
              className={`font-medium transition-colors ${
                location.pathname === '/home' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link
              to="/gigs"
              data-testid="nav-gigs-desktop"
              className={`font-medium transition-colors ${
                location.pathname.startsWith('/gigs') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Gigs
            </Link>
            <Link
              to="/services"
              data-testid="nav-services-desktop"
              className={`font-medium transition-colors ${
                location.pathname.startsWith('/services') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Services
            </Link>
            <Link
              to="/orders"
              data-testid="nav-orders-desktop"
              className={`font-medium transition-colors ${
                location.pathname === '/orders' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Orders
            </Link>
            <Link
              to="/notifications"
              data-testid="nav-notifications-desktop"
              className="relative text-muted-foreground hover:text-primary transition-colors"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <Link
              to="/profile"
              data-testid="nav-profile-desktop"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-primary font-semibold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="logout-button"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
