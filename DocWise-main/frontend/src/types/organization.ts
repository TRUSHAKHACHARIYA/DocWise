export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  createdAt: string;
  updatedAt: string;
  myRole: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
  documentCount: number;
  chatSessionCount: number;
}

export interface OrgMember {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  membershipId: string;
  createdAt: string;
}

export interface OrgMembership {
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}
