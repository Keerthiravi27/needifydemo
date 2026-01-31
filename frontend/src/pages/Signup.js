import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { User, Mail, Lock, School, Phone } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    phone: '',
    terms_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.college) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!formData.terms_accepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl">
              N
            </div>
          </Link>
          <h1 className="text-4xl font-bold font-outfit text-primary-foreground mb-2">Join Needify</h1>
          <p className="text-muted-foreground">Create your account and start connecting</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  data-testid="signup-name-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="signup-email-input"
                  placeholder="your.email@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  data-testid="signup-password-input"
                  placeholder="Create a strong password"
                  value={formData.password}
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
                  data-testid="signup-college-input"
                  placeholder="Your College Name"
                  value={formData.college}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Phone (Optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  data-testid="signup-phone-input"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                data-testid="signup-terms-checkbox"
                checked={formData.terms_accepted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, terms_accepted: checked })
                }
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I accept the{' '}
                <Link to="/terms" className="text-primary font-semibold hover:underline">
                  Terms & Conditions
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              data-testid="signup-submit-btn"
              disabled={loading}
              className="w-full h-12 rounded-full btn-primary text-lg font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" data-testid="signup-to-login-link" className="text-primary font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
