import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Star, Mail, Phone, School, Edit, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <Avatar className="w-24 h-24 border-4 border-green-100">
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-3xl font-bold">
                {user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold font-outfit text-primary-foreground mb-2" data-testid="profile-name">
                {user.name}
              </h1>
              {user.rating > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(user.rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold" data-testid="profile-rating">{user.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({user.rating_count} reviews)</span>
                </div>
              )}
              <Link to="/profile/edit">
                <Button data-testid="edit-profile-btn" className="btn-primary rounded-full mt-2">
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold" data-testid="profile-email">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <School className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">College</p>
                <p className="font-semibold" data-testid="profile-college">{user.college}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Phone className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold" data-testid="profile-phone">{user.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Link to={`/ratings/${user.id}`}>
              <Button
                variant="outline"
                data-testid="view-ratings-btn"
                className="w-full h-12 rounded-xl border-green-200 hover:bg-green-50"
              >
                <Star className="w-4 h-4 mr-2" /> View My Ratings
              </Button>
            </Link>
            <Link to="/admin">
              <Button
                variant="outline"
                data-testid="admin-dashboard-btn"
                className="w-full h-12 rounded-xl border-green-200 hover:bg-green-50"
              >
                <Shield className="w-4 h-4 mr-2" /> Admin Dashboard
              </Button>
            </Link>
          </div>

          {/* Member Since */}
          <div className="mt-8 pt-6 border-t border-green-100 text-center">
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
