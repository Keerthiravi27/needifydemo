import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, Briefcase, ShoppingBag, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, gigsRes, servicesRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, { headers }),
        axios.get(`${API_URL}/admin/gigs`, { headers }),
        axios.get(`${API_URL}/admin/services`, { headers }),
        axios.get(`${API_URL}/admin/orders`, { headers }),
      ]);
      setUsers(usersRes.data);
      setGigs(gigsRes.data);
      setServices(servicesRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-outfit text-primary-foreground mb-2" data-testid="admin-heading">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm" data-testid="stat-total-users">
            <Users className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm" data-testid="stat-total-gigs">
            <Briefcase className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{gigs.length}</div>
            <div className="text-sm text-muted-foreground">Total Gigs</div>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm" data-testid="stat-total-services">
            <ShoppingBag className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{services.length}</div>
            <div className="text-sm text-muted-foreground">Total Services</div>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm" data-testid="stat-total-orders">
            <ClipboardList className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold font-outfit text-primary-foreground">{orders.length}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white border border-green-100 p-1 rounded-xl">
            <TabsTrigger value="users" data-testid="tab-users" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="gigs" data-testid="tab-gigs" className="rounded-lg">
              <Briefcase className="w-4 h-4 mr-2" /> Gigs
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services" className="rounded-lg">
              <ShoppingBag className="w-4 h-4 mr-2" /> Services
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders" className="rounded-lg">
              <ClipboardList className="w-4 h-4 mr-2" /> Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50 border-b border-green-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">College</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {users.map((user) => (
                      <tr key={user.id} data-testid={`user-row-${user.id}`} className="hover:bg-green-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.college}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.rating > 0 ? `⭐ ${user.rating.toFixed(1)} (${user.rating_count})` : 'No ratings'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gigs">
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50 border-b border-green-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Posted By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {gigs.map((gig) => (
                      <tr key={gig.id} data-testid={`gig-row-${gig.id}`} className="hover:bg-green-50/50">
                        <td className="px-6 py-4 text-sm font-medium">{gig.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="bg-green-100 text-primary px-2 py-1 rounded-full text-xs">{gig.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${gig.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            gig.status === 'open' ? 'bg-blue-100 text-blue-700' :
                            gig.status === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
                            gig.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {gig.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{gig.poster_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50 border-b border-green-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {services.map((service) => (
                      <tr key={service.id} data-testid={`service-row-${service.id}`} className="hover:bg-green-50/50">
                        <td className="px-6 py-4 text-sm font-medium">{service.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${service.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {service.rating > 0 ? `⭐ ${service.rating.toFixed(1)} (${service.rating_count})` : 'No ratings'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{service.creator_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(service.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50 border-b border-green-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {orders.map((order) => (
                      <tr key={order.id} data-testid={`order-row-${order.id}`} className="hover:bg-green-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{order.order_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${order.total_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${order.commission.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminDashboard;
