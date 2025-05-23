import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const NotificationContext = createContext<any>(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Move fetchNotifications outside useEffect
  const fetchNotifications = async (limit = 20) => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const backendUrl = import.meta.env.VITE_API_URL?.replace(/"/g, "");
      const response = await fetch(`${backendUrl}/api/auth/notifications?limit=${limit}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up WebSocket for real-time notifications
    const backendUrl = import.meta.env.VITE_API_URL?.replace(/"/g, "");
    const socketInstance = io(backendUrl, { transports: ["websocket"] });
    setSocket(socketInstance);

    socketInstance.on("orderNotification", (data) => {
      setNotifications((prev) => {
        // Avoid duplicates by id
        if (prev.some((n) => n.id === data.id)) return prev;
        return [data, ...prev];
      });
      // Optionally: play sound, show toast, etc.
      // Example: window.alert(data.content);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fetch more notifications (for pagination)
  const fetchMoreNotifications = async (limit = 20) => {
    if (notifications.length === 0) return [];
    const last = notifications[notifications.length - 1];
    const before = last.createdAt;
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const backendUrl = import.meta.env.VITE_API_URL?.replace(/"/g, "");
      const response = await fetch(
        `${backendUrl}/api/auth/notifications?limit=${limit}&before=${encodeURIComponent(before)}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications((prev) => [...prev, ...data.filter((n: any) => !prev.some((p) => p.id === n.id))]);
        return data;
      }
    } catch (error) {
      // handle error
    }
    return [];
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, fetchMoreNotifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
