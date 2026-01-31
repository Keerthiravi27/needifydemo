import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, User, Mail, School, Phone } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const EditProfile = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    phone: '',
    picture: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        college: user.college || '',
        phone: user.phone || '',
        picture: user.picture || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.college) {
      toast.error('Name and college are required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-3xl mx-auto px-4 py-8">
        <Link to="/profile">
          <Button variant="ghost" data-testid="back-to-profile-btn" className="mb-6 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
          </Button>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          <h1 className="text-3xl font-bold font-outfit text-primary-foreground mb-6" data-testid="edit-profile-heading">
            Edit Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  data-testid="edit-name-input"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="college" className="text-sm font-medium mb-2 block">
                College *
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="college"
                  name="college"
                  data-testid="edit-college-input"
                  value={formData.college}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Phone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  data-testid="edit-phone-input"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email (Read-only)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 h-12 rounded-xl bg-gray-100"
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="save-profile-btn"
              disabled={loading}
              className="w-full h-12 rounded-full btn-primary text-lg font-semibold"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default EditProfile;
