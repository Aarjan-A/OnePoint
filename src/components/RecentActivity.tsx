import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Clock, CheckCircle, User, FileText } from 'lucide-react';

interface Activity {
  id: string;
  type: 'need_created' | 'need_completed' | 'provider_accepted' | 'profile_updated';
  title: string;
  description: string;
  timestamp: Date;
}

export default function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch recent needs as activities
    const fetchActivities = async () => {
      const { data: needs } = await supabase
        .from('needs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (needs) {
        const activityList: Activity[] = needs.map((need) => ({
          id: need.id,
          type: need.status === 'completed' ? 'need_completed' : 'need_created',
          title: need.title,
          description: `${need.category} - ${need.status}`,
          timestamp: new Date(need.created_at),
        }));
        setActivities(activityList);
      }
    };

    fetchActivities();
  }, [user]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'need_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'provider_accepted':
        return <User className="w-4 h-4 text-accent" />;
      case 'profile_updated':
        return <FileText className="w-4 h-4 text-primary" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-4 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 uppercase">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
