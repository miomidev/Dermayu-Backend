"use client";

import { useState, useEffect, useCallback } from "react";

export interface InAppNotification {
  id: string;
  type: "warning" | "info" | "success";
  category?: "weather" | "evacuation" | "system" | string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  href?: string;
}

const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: "notif-w-01",
    type: "warning",
    category: "weather",
    title: "Peringatan Dini Cuaca Ekstrem BMKG",
    message: "Potensi hujan lebat disertai angin kencang di pesisir Indramayu, Lohbener, dan Kandanghaur dalam 3 jam ke depan.",
    time: "10 mnt lalu",
    unread: true,
    href: "/warga/dashboard",
  },
  {
    id: "notif-w-02",
    type: "info",
    category: "weather",
    title: "Update Debit Muka Air Cimanuk",
    message: "TMA Bendung Rentang terpantau 2.85 m (Siaga Waspada). Pintu air otomatis dalam pengawasan satlak BPBD.",
    time: "25 mnt lalu",
    unread: true,
    href: "/warga/evakuasi",
  },
  {
    id: "notif-w-03",
    type: "info",
    category: "weather",
    title: "Prakiraan Cuaca Terkini",
    message: "Suhu rata-rata Indramayu 33°C, kelembapan 65% dengan awan tebal di pesisir utara.",
    time: "1 jam lalu",
    unread: false,
    href: "/warga/dashboard",
  },
];

const STORAGE_KEY = "dermayu_in_app_notifications";

export function useWeatherNotification() {
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {}
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      } catch {}
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}

