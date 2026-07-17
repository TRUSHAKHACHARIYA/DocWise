import { create } from "zustand";
import type { Organization, OrgMember } from "@/types/organization";
import api from "@/lib/api";
import { toast } from "./toastStore";

interface OrgStore {
  organizations: Organization[];
  currentOrg: Organization | null;
  members: OrgMember[];
  isLoading: boolean;

  fetchOrganizations: () => Promise<void>;
  setCurrentOrg: (org: Organization | null) => void;
  createOrganization: (name: string) => Promise<Organization>;
  updateOrganization: (orgId: string, data: { name?: string }) => Promise<void>;
  deleteOrganization: (orgId: string) => Promise<void>;
  fetchMembers: (orgId: string) => Promise<void>;
  inviteMember: (orgId: string, email: string, role?: "ADMIN" | "MEMBER") => Promise<void>;
  updateMemberRole: (orgId: string, membershipId: string, role: "ADMIN" | "MEMBER") => Promise<void>;
  removeMember: (orgId: string, membershipId: string) => Promise<void>;
  leaveOrganization: (orgId: string) => Promise<void>;
}

export const useOrgStore = create<OrgStore>((set, get) => ({
  organizations: [],
  currentOrg: null,
  members: [],
  isLoading: false,

  fetchOrganizations: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/organizations");
      set({ organizations: res.data.organizations });
    } catch (error: any) {
      toast.error("Failed to load organizations", error.response?.data?.error);
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentOrg: (org) => set({ currentOrg: org }),

  createOrganization: async (name: string) => {
    const res = await api.post("/organizations", { name });
    const org = res.data.organization;
    set((state) => ({ organizations: [...state.organizations, org] }));
    toast.success("Organization created", `${name} is ready.`);
    return org;
  },

  updateOrganization: async (orgId, data) => {
    const res = await api.patch(`/organizations/${orgId}`, data);
    set((state) => ({
      organizations: state.organizations.map((o) =>
        o.id === orgId ? { ...o, ...res.data.organization } : o
      ),
      currentOrg: state.currentOrg?.id === orgId
        ? { ...state.currentOrg, ...res.data.organization }
        : state.currentOrg,
    }));
    toast.success("Updated", "Organization updated.");
  },

  deleteOrganization: async (orgId) => {
    await api.delete(`/organizations/${orgId}`);
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== orgId),
      currentOrg: state.currentOrg?.id === orgId ? null : state.currentOrg,
    }));
    toast.success("Deleted", "Organization deleted.");
  },

  fetchMembers: async (orgId) => {
    const res = await api.get(`/organizations/${orgId}/members`);
    set({ members: res.data.members });
  },

  inviteMember: async (orgId, email, role = "MEMBER") => {
    const res = await api.post(`/organizations/${orgId}/members`, { email, role });
    set((state) => ({ members: [...state.members, res.data.member] }));
    toast.success("Member invited", `${email} has been invited.`);
  },

  updateMemberRole: async (orgId, membershipId, role) => {
    const res = await api.patch(`/organizations/${orgId}/members/${membershipId}`, { role });
    set((state) => ({
      members: state.members.map((m) =>
        m.membershipId === membershipId ? { ...m, role: res.data.member.role } : m
      ),
    }));
    toast.success("Role updated", "Member role has been changed.");
  },

  removeMember: async (orgId, membershipId) => {
    await api.delete(`/organizations/${orgId}/members/${membershipId}`);
    set((state) => ({
      members: state.members.filter((m) => m.membershipId !== membershipId),
    }));
    toast.success("Member removed", "The member has been removed.");
  },

  leaveOrganization: async (orgId) => {
    await api.delete(`/organizations/${orgId}/leave`);
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== orgId),
      currentOrg: state.currentOrg?.id === orgId ? null : state.currentOrg,
    }));
    toast.success("Left organization", "You have left the organization.");
  },
}));
