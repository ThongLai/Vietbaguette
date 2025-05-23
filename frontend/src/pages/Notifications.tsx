import { useNotification } from "@/contexts/NotificationContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Notifications = () => {
  const { notifications, fetchMoreNotifications } = useNotification();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoadMore = async () => {
    setLoading(true);
    await fetchMoreNotifications(20);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <span className="sr-only">Back</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Button>
          <h2 className="text-2xl font-bold flex-1 text-center flex items-center gap-2 justify-center">
            Notifications
            <span className="inline-block min-w-[1.5em] px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white align-middle">
              {notifications.length}
            </span>
          </h2>
          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>
        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 min-h-[300px]">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notif, idx) => (
                <li key={notif.id || idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 shadow flex flex-col gap-1 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm">{notif.type.replace(/_/g, " ")}</span>
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 text-base">{notif.content}</div>
                  {notif.orderId && (
                    <div className="text-xs text-gray-500">Order ID: {notif.orderId}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-center mt-6">
          <Button
            className="w-full max-w-xs"
            onClick={handleLoadMore}
            disabled={loading}
            variant="secondary"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
