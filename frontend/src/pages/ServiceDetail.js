import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { ArrowLeft, User, DollarSign, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const ServiceDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`${API_URL}/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setService(response.data);
    } catch (error) {
      toast.error('Failed to load service');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/services/${id}/book`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Service booked! Order created.');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to book service');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) return null;

  const isOwner = service.creator_id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-4xl mx-auto px-4 py-8">
        <Link to="/services">
          <Button variant="ghost" data-testid="back-btn" className="mb-6 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
          </Button>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold font-outfit text-primary-foreground mb-4" data-testid="service-title">
                {service.title}
              </h1>
              {service.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(service.rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{service.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({service.rating_count} reviews)</span>
                </div>
              )}
            </div>
            <div className="text-right ml-4">
              <div className="text-4xl font-bold font-outfit text-primary" data-testid="service-price">${service.price}</div>
              <p className="text-xs text-muted-foreground mt-1">15% commission applies</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold font-outfit mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed" data-testid="service-description">{service.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <User className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Offered by</p>
                <p className="font-semibold" data-testid="creator-name">{service.creator_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">You'll pay</p>
                <p className="font-semibold">${service.price}</p>
              </div>
            </div>
          </div>

          {!isOwner && (
            <Button
              onClick={handleBook}
              disabled={actionLoading}
              data-testid="book-service-btn"
              className="w-full h-12 rounded-full btn-primary text-lg font-semibold"
            >
              {actionLoading ? 'Booking...' : 'Book This Service'}
            </Button>
          )}

          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-muted-foreground">This is your service. You cannot book your own service.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ServiceDetail;
