import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Notifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="page-container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-outfit text-primary-foreground mb-2" data-testid="notifications-heading">
            Notifications
          </h1>
          <p className="text-muted-foreground">Stay updated with your activity</p>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                data-testid={`notification-${notification.id}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  notification.read
                    ? 'bg-white border-green-100'
                    : 'bg-green-50 border-green-200 hover:bg-green-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`leading-relaxed ${
                      notification.read ? 'text-muted-foreground' : 'text-primary-foreground font-medium'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {notification.read && (
                    <Check className="w-5 h-5 text-green-500 ml-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
