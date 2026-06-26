export interface Workspace {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { folders: number };
  folders?: Folder[];
}

export interface Folder {
  id: string;
  userId: string;
  workspaceId?: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: { documents: number };
  workspace?: { id: string; name: string } | null;
}
