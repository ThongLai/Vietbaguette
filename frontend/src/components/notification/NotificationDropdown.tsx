import { useState, useRef, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_SIZE = 20;

const NotificationDropdown = () => {
  const { notifications, setNotifications, fetchMoreNotifications } = useNotification();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track read status for notifications (by index)
  const [read, setRead] = useState<boolean[]>(() => notifications.map(() => false));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Sync read state if notifications change
  useEffect(() => {
    setRead((prev) => {
      if (notifications.length > prev.length) {
        return [...prev, ...Array(notifications.length - prev.length).fill(false)];
      } else if (notifications.length < prev.length) {
        return prev.slice(0, notifications.length);
      }
      return prev;
    });
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = (idx: number) => {
    setRead((prev) => prev.map((r, i) => (i === idx ? true : r)));
  };

  // Load more notifications
  const handleLoadMore = async () => {
    setLoading(true);
    const prevLength = notifications.length;
    await fetchMoreNotifications();
    setLoading(false);
    setHasMore(notifications.length - prevLength === PAGE_SIZE);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)}>
        <Bell className="h-5 w-5" />
        {read.filter((r) => !r).length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
            {read.filter((r) => !r).length}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b font-bold flex items-center justify-between">
            <span>Notifications</span>
            <Link to="/dashboard/notifications" className="text-xs text-blue-600 hover:underline">See all</Link>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications yet.</div>
          ) : (
            <>
              <ul>
                {notifications.slice(0, 10).map((notif, idx) => (
                  <li key={idx} className={`p-3 border-b last:border-b-0 flex items-start gap-2 ${!read[idx] ? 'font-bold bg-blue-50 dark:bg-blue-900' : ''}`}>
                    {!read[idx] && <span className="mt-1 mr-1 h-2 w-2 rounded-full bg-blue-500 inline-block" />}
                    <div className="flex-1">
                      <div>{notif.type.replace(/_/g, " ")}</div>
                      <div className="text-sm font-normal">{notif.content}</div>
                      {notif.orderId && (
                        <div className="text-xs text-gray-500">Order ID: {notif.orderId}</div>
                      )}
                    </div>
                    {!read[idx] && (
                      <button
                        className="ml-2 text-xs text-blue-600 hover:underline"
                        onClick={() => markAsRead(idx)}
                      >
                        Mark as read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {hasMore && (
                <Button
                  className="w-full mt-2"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
