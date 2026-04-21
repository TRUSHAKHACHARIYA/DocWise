import { useState } from "react";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";

export interface AdminStats {
  userCount: number;
  docCount: number;
  chatCount: number;
  messageCount: number;
  activeUsers: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  docCount: number;
  chatCount: number;
}

export interface GrowthData {
  history: {
    date: string;
    users: number;
    documents: number;
    messages: number;
  }[];
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  targetId: string | null;
  targetType: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (err) {
      toast.error("Error", "Failed to load admin stats.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrowthData = async () => {
    try {
      const response = await api.get("/admin/analytics/growth");
      setGrowthData(response.data);
    } catch (err) {
      console.error("Failed to load growth data", err);
    }
  };

  const fetchUsers = async (search = "", page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/users?search=${search}&page=${page}`);
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (err) {
      toast.error("Error", "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (search = "", page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/logs?search=${search}&page=${page}`);
      setLogs(response.data.logs);
      setTotalLogs(response.data.total);
    } catch (err) {
      toast.error("Error", "Failed to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, data: Partial<AdminUser>) => {
    try {
      await api.patch(`/admin/users/${id}`, data);
      toast.success("Success", "User updated successfully.");
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    } catch (err) {
      toast.error("Error", "Failed to update user.");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Success", "User deleted successfully.");
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      toast.error("Error", "Failed to delete user.");
    }
  };

  return {
    stats,
    growthData,
    users,
    logs,
    totalUsers,
    totalLogs,
    isLoading,
    fetchStats,
    fetchGrowthData,
    fetchUsers,
    fetchLogs,
    updateUser,
    deleteUser
  };
}
