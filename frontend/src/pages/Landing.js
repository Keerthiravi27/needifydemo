import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, ShoppingBag, Star, Users } from 'lucide-react';
import { Button } from '../components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl">
                N
              </div>
              <span className="text-3xl font-bold font-outfit text-primary-foreground">Needify</span>
            </div>
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="ghost" data-testid="landing-login-btn" className="rounded-full">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button data-testid="landing-signup-btn" className="btn-primary rounded-full px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold font-outfit text-primary-foreground leading-tight mb-6">
                Campus Gigs & Services,
                <span className="text-primary"> Simplified</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Connect with fellow students for gigs, services, and opportunities right on your campus. 
                Build your skills, earn money, and grow your network.
              </p>
              <Link to="/signup">
                <Button data-testid="hero-cta-btn" className="btn-primary rounded-full px-8 py-6 text-lg">
                  Join Needify <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1758270705482-cee87ea98738?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Students working"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold font-outfit text-center mb-12 text-primary-foreground">
          Why Choose Needify?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-green-100 bg-white shadow-sm hover:shadow-md transition-all duration-300" data-testid="feature-card-1">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-outfit mb-3">Post & Accept Gigs</h3>
            <p className="text-muted-foreground leading-relaxed">
              Need help with a task? Post a gig. Want to earn? Accept gigs that match your skills.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-green-100 bg-white shadow-sm hover:shadow-md transition-all duration-300" data-testid="feature-card-2">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-outfit mb-3">Offer Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              Showcase your talents! List your services and let others book your expertise.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-green-100 bg-white shadow-sm hover:shadow-md transition-all duration-300" data-testid="feature-card-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-outfit mb-3">Build Your Reputation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get rated and reviewed. Build trust and credibility within the campus community.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-green-400 to-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold font-outfit mb-2">1000+</div>
              <div className="text-green-50 text-lg">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold font-outfit mb-2">500+</div>
              <div className="text-green-50 text-lg">Gigs Completed</div>
            </div>
            <div>
              <div className="text-5xl font-bold font-outfit mb-2">200+</div>
              <div className="text-green-50 text-lg">Services Offered</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Users className="w-16 h-16 text-primary mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-6 text-primary-foreground">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join hundreds of students already using Needify to find opportunities and grow their skills.
        </p>
        <Link to="/signup">
          <Button data-testid="footer-cta-btn" className="btn-primary rounded-full px-8 py-6 text-lg">
            Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-green-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Needify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
