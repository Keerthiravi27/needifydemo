import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const categories = [
  'Tutoring', 'Design', 'Writing', 'Programming', 'Photography',
  'Event Help', 'Delivery', 'Moving', 'Cleaning', 'Other'
];

const PostGig = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/gigs`,
        { ...formData, price: parseFloat(formData.price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Gig posted successfully!');
      navigate('/gigs');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-3xl mx-auto px-4 py-8">
        <Link to="/gigs">
          <Button variant="ghost" data-testid="back-to-gigs-btn" className="mb-6 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gigs
          </Button>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          <h1 className="text-3xl font-bold font-outfit text-primary-foreground mb-6" data-testid="post-gig-heading">
            Post a New Gig
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Gig Title *
              </Label>
              <Input
                id="title"
                name="title"
                data-testid="gig-title-input"
                placeholder="e.g., Need help with calculus homework"
                value={formData.title}
                onChange={handleChange}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                data-testid="gig-description-input"
                placeholder="Describe what you need help with..."
                value={formData.description}
                onChange={handleChange}
                className="min-h-32 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger data-testid="gig-category-select" className="h-12 rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} data-testid={`category-${cat}`}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price" className="text-sm font-medium mb-2 block">
                Price ($) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                data-testid="gig-price-input"
                placeholder="e.g., 25.00"
                value={formData.price}
                onChange={handleChange}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> A 15% platform commission will be applied to this gig.
              </p>
            </div>

            <Button
              type="submit"
              data-testid="submit-gig-btn"
              disabled={loading}
              className="w-full h-12 rounded-full btn-primary text-lg font-semibold"
            >
              {loading ? 'Posting...' : 'Post Gig'}
            </Button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PostGig;
