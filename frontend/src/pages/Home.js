import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Briefcase, ShoppingBag, ClipboardList, TrendingUp, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Home = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    openGigs: 0,
    myActiveGigs: 0,
    totalOrders: 0,
    myServices: 0,
  });
  const [recentGigs, setRecentGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [gigsRes, myGigsRes, ordersRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/gigs?status=open`, { headers }),
        axios.get(`${API_URL}/gigs/my/posted`, { headers }),
        axios.get(`${API_URL}/orders`, { headers }),
        axios.get(`${API_URL}/services/my/created`, { headers }),
      ]);

      setStats({
        openGigs: gigsRes.data.length,
        myActiveGigs: myGigsRes.data.filter(g => g.status !== 'completed' && g.status !== 'cancelled').length,
        totalOrders: ordersRes.data.length,
        myServices: servicesRes.data.length,
      });

      setRecentGigs(gigsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-outfit text-primary-foreground mb-2" data-testid="home-welcome-heading">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">Here's what's happening on your campus today</p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-all duration-300" data-testid="stat-card-open-gigs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{stats.openGigs}</div>
            <div className="text-sm text-muted-foreground">Open Gigs</div>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-all duration-300" data-testid="stat-card-my-gigs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{stats.myActiveGigs}</div>
            <div className="text-sm text-muted-foreground">My Active Gigs</div>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-all duration-300" data-testid="stat-card-orders">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{stats.totalOrders}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-all duration-300" data-testid="stat-card-services">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{stats.myServices}</div>
            <div className="text-sm text-muted-foreground">My Services</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 text-white shadow-lg" data-testid="quick-action-post-gig">
            <Briefcase className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold font-outfit mb-2">Need Help with Something?</h3>
            <p className="mb-4 text-green-50">Post a gig and let skilled students help you out</p>
            <Link to="/gigs/post">
              <Button data-testid="post-gig-btn" variant="secondary" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" /> Post a Gig
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-8 shadow-sm hover:shadow-md transition-all duration-300" data-testid="quick-action-browse">
            <ShoppingBag className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-2xl font-bold font-outfit mb-2 text-primary-foreground">Offer Your Skills</h3>
            <p className="mb-4 text-muted-foreground">List your services and start earning today</p>
            <Link to="/services/create">
              <Button data-testid="create-service-btn" className="btn-primary rounded-full">
                <Plus className="w-4 h-4 mr-2" /> Create Service
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Gigs */}
        {recentGigs.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-outfit text-primary-foreground">Recent Gigs</h2>
              <Link to="/gigs">
                <Button variant="ghost" data-testid="view-all-gigs-btn" className="rounded-full">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentGigs.map((gig) => (
                <Link
                  key={gig.id}
                  to={`/gigs/${gig.id}`}
                  data-testid={`recent-gig-${gig.id}`}
                  className="block p-4 rounded-xl border border-green-100 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-primary-foreground mb-1">{gig.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{gig.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="bg-green-100 text-primary px-3 py-1 rounded-full font-medium">
                          {gig.category}
                        </span>
                        <span className="text-muted-foreground">by {gig.poster_name}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold font-outfit text-primary">${gig.price}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User Rating Card */}
        {user?.rating > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-outfit text-primary-foreground">Your Rating</h3>
                <p className="text-2xl font-bold text-primary">{user.rating.toFixed(1)} ⭐</p>
                <p className="text-sm text-muted-foreground">Based on {user.rating_count} reviews</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
