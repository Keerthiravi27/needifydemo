import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Ratings = () => {
  const { userId } = useParams();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [userRes, ratingsRes] = await Promise.all([
        axios.get(`${API_URL}/users/${userId}`, { headers }),
        axios.get(`${API_URL}/ratings/user/${userId}`, { headers }),
      ]);
      setUser(userRes.data);
      setRatings(ratingsRes.data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-4xl mx-auto px-4 py-8">
        <Link to="/profile">
          <Button variant="ghost" data-testid="back-btn" className="mb-6 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
          </Button>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          {/* User Info */}
          {user && (
            <div className="mb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <h1 className="text-3xl font-bold font-outfit text-primary-foreground mb-2" data-testid="user-name">
                {user.name}'s Ratings
              </h1>
              {user.rating > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(user.rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold" data-testid="average-rating">{user.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({user.rating_count} reviews)</span>
                </div>
              )}
            </div>
          )}

          {/* Ratings List */}
          {ratings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No ratings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  data-testid={`rating-card-${rating.id}`}
                  className="p-6 rounded-2xl border border-green-100 bg-green-50/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-lg">{rating.from_user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < rating.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-bold" data-testid={`rating-value-${rating.id}`}>{rating.rating}</span>
                    </div>
                  </div>
                  {rating.review && (
                    <p className="text-muted-foreground leading-relaxed" data-testid={`rating-review-${rating.id}`}>
                      "{rating.review}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Ratings;
