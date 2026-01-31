import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Gigs = () => {
  const { token } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [myPostedGigs, setMyPostedGigs] = useState([]);
  const [myAcceptedGigs, setMyAcceptedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [allRes, postedRes, acceptedRes] = await Promise.all([
        axios.get(`${API_URL}/gigs?status=open`, { headers }),
        axios.get(`${API_URL}/gigs/my/posted`, { headers }),
        axios.get(`${API_URL}/gigs/my/accepted`, { headers }),
      ]);
      setGigs(allRes.data);
      setMyPostedGigs(postedRes.data);
      setMyAcceptedGigs(acceptedRes.data);
    } catch (error) {
      console.error('Failed to fetch gigs:', error);
      toast.error('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const GigCard = ({ gig }) => (
    <Link
      to={`/gigs/${gig.id}`}
      data-testid={`gig-card-${gig.id}`}
      className="block bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold font-outfit text-primary-foreground mb-2">{gig.title}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{gig.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold font-outfit text-primary">${gig.price}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="bg-green-100 text-primary px-3 py-1 rounded-full text-xs font-medium">
          {gig.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {getStatusIcon(gig.status)}
          <span className="capitalize">{gig.status}</span>
        </span>
        <span className="text-xs text-muted-foreground">by {gig.poster_name}</span>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-primary-foreground mb-2" data-testid="gigs-heading">
              Campus Gigs
            </h1>
            <p className="text-muted-foreground">Find opportunities or post your own</p>
          </div>
          <Link to="/gigs/post">
            <Button data-testid="post-gig-button" className="btn-primary rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Post Gig
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white border border-green-100 p-1 rounded-xl">
            <TabsTrigger value="all" data-testid="tab-all-gigs" className="rounded-lg">
              <Briefcase className="w-4 h-4 mr-2" /> All Gigs ({gigs.length})
            </TabsTrigger>
            <TabsTrigger value="posted" data-testid="tab-my-posted" className="rounded-lg">
              My Posted ({myPostedGigs.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" data-testid="tab-my-accepted" className="rounded-lg">
              My Accepted ({myAcceptedGigs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {gigs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No open gigs available</p>
              </div>
            ) : (
              gigs.map((gig) => <GigCard key={gig.id} gig={gig} />)
            )}
          </TabsContent>

          <TabsContent value="posted" className="space-y-4">
            {myPostedGigs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't posted any gigs yet</p>
                <Link to="/gigs/post">
                  <Button data-testid="post-first-gig-btn" className="btn-primary rounded-full">
                    Post Your First Gig
                  </Button>
                </Link>
              </div>
            ) : (
              myPostedGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {myAcceptedGigs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You haven't accepted any gigs yet</p>
              </div>
            ) : (
              myAcceptedGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Gigs;
