import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Trophy, FileText, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", console.error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.user.id)
        .eq("read", false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({ title: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "drill_prescription":
        return <Trophy className="h-5 w-5 text-purple-600" />;
      case "coach_note":
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/40"
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              You're all caught up! Notifications from your coach will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <Card 
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-purple-50 border-purple-200" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-medium ${!notification.read ? "text-purple-700" : ""}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <Badge variant="default" className="bg-purple-600 text-xs ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.body}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()} at{" "}
                        {new Date(notification.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {notification.link && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
