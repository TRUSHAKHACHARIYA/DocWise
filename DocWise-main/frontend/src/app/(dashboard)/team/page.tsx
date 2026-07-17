"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Crown,
  UserMinus,
  Mail,
  Settings,
  FileText,
  MessageSquare,
  ChevronRight,
  Search,
  ArrowLeft,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toastStore";
import type { Organization, OrgMember } from "@/types/organization";

type View = "list" | "detail" | "members";

export default function TeamPage() {
  const { user } = useAuth();
  const {
    organizations,
    currentOrg,
    members,
    isLoading,
    fetchOrganizations,
    setCurrentOrg,
    createOrganization,
    deleteOrganization,
    fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveOrganization,
  } = useOrganization();

  const [view, setView] = useState<View>("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setIsCreating(true);
    try {
      const org = await createOrganization(newOrgName.trim());
      setNewOrgName("");
      setShowCreateModal(false);
      setCurrentOrg(org);
      setView("detail");
    } catch {
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectOrg = async (org: Organization) => {
    setCurrentOrg(org);
    await fetchMembers(org.id);
    setView("detail");
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentOrg) return;
    try {
      await inviteMember(currentOrg.id, inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      await fetchMembers(currentOrg.id);
    } catch {
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!currentOrg) return;
    try {
      await removeMember(currentOrg.id, membershipId);
      await fetchMembers(currentOrg.id);
    } catch {
    }
  };

  const handleRoleChange = async (membershipId: string, role: "ADMIN" | "MEMBER") => {
    if (!currentOrg) return;
    try {
      await updateMemberRole(currentOrg.id, membershipId, role);
      await fetchMembers(currentOrg.id);
    } catch {
    }
  };

  const handleLeaveOrg = async () => {
    if (!currentOrg) return;
    try {
      await leaveOrganization(currentOrg.id);
      setView("list");
    } catch {
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown size={14} className="text-amber-500" />;
      case "ADMIN":
        return <Shield size={14} className="text-blue-500" />;
      default:
        return <Users size={14} className="text-slate-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      OWNER: "bg-amber-50 text-amber-700 border-amber-200",
      ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
      MEMBER: "bg-slate-50 text-slate-600 border-slate-200",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
          styles[role as keyof typeof styles] || styles.MEMBER
        )}
      >
        {getRoleIcon(role)}
        {role}
      </span>
    );
  };

  // ─── List View ──────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              Teams
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Create organizations to collaborate with your team on documents and chats.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-[var(--rust)] text-white hover:bg-[var(--rust-dark)] rounded-2xl"
          >
            <Plus size={16} />
            New Organization
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgba(196,71,30,0.18)] focus:border-[var(--rust)] transition-all"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-[2rem] bg-slate-100" />
            ))}
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-black text-slate-300 uppercase tracking-widest">
              {searchQuery ? "No matches found" : "No organizations yet"}
            </p>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Create an organization to start collaborating with your team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrgs.map((org, i) => (
              <button
                key={org.id}
                onClick={() => handleSelectOrg(org)}
                className={cn(
                  "w-full text-left p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg transition-all group",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--rust-light)] to-[var(--cream)] flex items-center justify-center text-[var(--rust)] font-black text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">
                        {org.name}
                      </h3>
                      {getRoleBadge(org.myRole)}
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users size={12} />
                        {org.memberCount} member{org.memberCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText size={12} />
                        {org.documentCount} doc{org.documentCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={12} />
                        {org.chatSessionCount} chat{org.chatSessionCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewOrgName("");
          }}
          title="Create Organization"
          description="Set up a new organization to collaborate with your team."
          variant="brand"
          footer={
            <>
              <Button
                onClick={handleCreateOrg}
                loading={isCreating}
                className="bg-[var(--rust)] text-white hover:bg-[var(--rust-dark)]"
              >
                Create Organization
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewOrgName("");
                }}
              >
                Cancel
              </Button>
            </>
          }
        >
          <Input
            label="Organization Name"
            placeholder="Acme Legal Team"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            autoFocus
          />
        </Modal>
      </div>
    );
  }

  // ─── Detail View ────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setView("list");
            setCurrentOrg(null);
          }}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--rust-light)] to-[var(--cream)] flex items-center justify-center text-[var(--rust)] font-black text-xl">
              {currentOrg?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {currentOrg?.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                {currentOrg && getRoleBadge(currentOrg.myRole)}
                <span className="text-xs font-bold text-slate-400">
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
        {currentOrg?.myRole !== "OWNER" && (
          <Button
            variant="outline"
            onClick={handleLeaveOrg}
            className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <UserMinus size={14} />
            Leave
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-2">
        {[
          { id: "detail" as View, label: "Overview", icon: Settings },
          { id: "members" as View, label: "Members", icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all",
              view === tab.id
                ? "bg-[var(--rust-light)] text-[var(--rust-dark)]"
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {view === "members" && (
        <div className="space-y-6">
          {/* Invite Form */}
          {(currentOrg?.myRole === "OWNER" || currentOrg?.myRole === "ADMIN") && (
            <form onSubmit={handleInvite} className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Invite by email"
                  placeholder="teammate@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  icon={<Mail size={16} />}
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")}
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[rgba(196,71,30,0.18)]"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button
                type="submit"
                className="h-11 bg-[var(--rust)] text-white hover:bg-[var(--rust-dark)] rounded-xl"
              >
                <Plus size={16} className="mr-1" />
                Invite
              </Button>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-3">
            {members.map((member, i) => (
              <div
                key={member.membershipId}
                className="flex items-center gap-4 p-5 rounded-[1.5rem] border border-slate-100 bg-white hover:border-slate-200 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center font-black text-slate-600 text-sm shrink-0">
                  {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {member.name || "Unnamed User"}
                  </p>
                  <p className="text-xs font-medium text-slate-400 truncate">
                    {member.email}
                  </p>
                </div>
                {getRoleBadge(member.role)}
                <span className="text-[10px] font-bold text-slate-300 shrink-0">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
                {/* Actions (owner/admin only, can't modify yourself or owner) */}
                {(currentOrg?.myRole === "OWNER" || (currentOrg?.myRole === "ADMIN" && member.role !== "OWNER")) &&
                  member.membershipId !== currentOrg?.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      {currentOrg?.myRole === "OWNER" && member.role !== "OWNER" && (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.membershipId, e.target.value as "ADMIN" | "MEMBER")
                          }
                          className="text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--rust)]"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                        </select>
                      )}
                      {member.role !== "OWNER" && (
                        <button
                          onClick={() => handleRemoveMember(member.membershipId)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {view === "detail" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-[2rem] border border-slate-100 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Members
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{members.length}</p>
            </div>
            <div className="p-6 rounded-[2rem] border border-slate-100 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FileText size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Documents
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {currentOrg?.documentCount || 0}
              </p>
            </div>
            <div className="p-6 rounded-[2rem] border border-slate-100 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <MessageSquare size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Chat Sessions
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {currentOrg?.chatSessionCount || 0}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] border border-slate-100 bg-white">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">
              How It Works
            </h3>
            <div className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
              <p>
                When you create a document or chat while this organization is selected (via the{" "}
                <code className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-bold">
                  x-org-id
                </code>{" "}
                header), it becomes shared with all organization members.
              </p>
              <p>
                <strong>Owners</strong> can manage all settings and members.{" "}
                <strong>Admins</strong> can invite and remove members.{" "}
                <strong>Members</strong> can access shared documents and chats.
              </p>
              <p>
                Personal documents (created without an org context) remain private to you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
