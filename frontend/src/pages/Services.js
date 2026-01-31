import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Services = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [allRes, myRes] = await Promise.all([
        axios.get(`${API_URL}/services`, { headers }),
        axios.get(`${API_URL}/services/my/created`, { headers }),
      ]);
      setServices(allRes.data);
      setMyServices(myRes.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const ServiceCard = ({ service }) => (
    <Link
      to={`/services/${service.id}`}
      data-testid={`service-card-${service.id}`}
      className="block bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold font-outfit text-primary-foreground mb-2">{service.title}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{service.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold font-outfit text-primary">${service.price}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground">by {service.creator_name}</span>
        {service.rating > 0 && (
          <span className="flex items-center gap-1 text-xs">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{service.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({service.rating_count})</span>
          </span>
        )}
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading services...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-primary-foreground mb-2" data-testid="services-heading">
              Campus Services
            </h1>
            <p className="text-muted-foreground">Browse and book student services</p>
          </div>
          <Link to="/services/create">
            <Button data-testid="create-service-button" className="btn-primary rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Create Service
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white border border-green-100 p-1 rounded-xl">
            <TabsTrigger value="all" data-testid="tab-all-services" className="rounded-lg">
              <ShoppingBag className="w-4 h-4 mr-2" /> All Services ({services.length})
            </TabsTrigger>
            <TabsTrigger value="mine" data-testid="tab-my-services" className="rounded-lg">
              My Services ({myServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {services.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No services available</p>
              </div>
            ) : (
              services.map((service) => <ServiceCard key={service.id} service={service} />)
            )}
          </TabsContent>

          <TabsContent value="mine" className="space-y-4">
            {myServices.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't created any services yet</p>
                <Link to="/services/create">
                  <Button data-testid="create-first-service-btn" className="btn-primary rounded-full">
                    Create Your First Service
                  </Button>
                </Link>
              </div>
            ) : (
              myServices.map((service) => <ServiceCard key={service.id} service={service} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Services;
