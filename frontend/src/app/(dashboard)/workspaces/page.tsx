"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Plus, Trash2, Pencil, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useFolders } from "@/hooks/useFolders";
import type { Workspace } from "@/types/workspace";

export default function WorkspacesPage() {
  const { workspaces, isLoading, loadWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } = useWorkspaces();
  const { createFolder, deleteFolder } = useFolders();

  const [workspaceModal, setWorkspaceModal] = useState<"create" | { edit: Workspace } | null>(null);
  const [folderModal, setFolderModal] = useState<{ workspaceId: string; workspaceName: string } | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [folderName, setFolderName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const openCreateWorkspace = () => {
    setWorkspaceName("");
    setWorkspaceDescription("");
    setWorkspaceModal("create");
  };

  const openEditWorkspace = (workspace: Workspace) => {
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.description || "");
    setWorkspaceModal({ edit: workspace });
  };

  const saveWorkspace = async () => {
    if (!workspaceName.trim()) return;
    setIsSaving(true);
    try {
      if (workspaceModal === "create") {
        await createWorkspace(workspaceName.trim(), workspaceDescription.trim() || undefined);
      } else if (workspaceModal && typeof workspaceModal === "object") {
        await updateWorkspace(workspaceModal.edit.id, {
          name: workspaceName.trim(),
          description: workspaceDescription.trim() || null,
        });
        await loadWorkspaces();
      }
      setWorkspaceModal(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async (id: string, name: string) => {
    if (!confirm(`Delete workspace "${name}"? Folders will be unlinked but kept.`)) return;
    await deleteWorkspace(id);
  };

  const saveFolder = async () => {
    if (!folderModal || !folderName.trim()) return;
    setIsSaving(true);
    try {
      await createFolder(folderName.trim(), folderModal.workspaceId);
      await loadWorkspaces();
      setFolderModal(null);
      setFolderName("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFolder = async (folderId: string, folderLabel: string) => {
    if (!confirm(`Delete folder "${folderLabel}"? Documents will become unfiled.`)) return;
    await deleteFolder(folderId);
    await loadWorkspaces();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">Workspaces</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink-muted)]">
            Organize document libraries into workspaces and folders. Use folders on the Documents page to filter and move files.
          </p>
        </div>
        <Button onClick={openCreateWorkspace} className="gap-2">
          <Plus size={16} />
          New workspace
        </Button>
      </div>

      {isLoading && workspaces.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[2rem]" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[rgba(26,24,20,0.12)] bg-[var(--cream)] p-16 text-center">
          <Layers className="mb-4 h-10 w-10 text-[var(--ink-faint)]" />
          <p className="font-bold text-[var(--ink)]">No workspaces yet</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--ink-muted)]">
            Create a workspace for a matter, client, or team project—then add folders for contracts, policies, or research.
          </p>
          <Button onClick={openCreateWorkspace} className="mt-6 gap-2">
            <Plus size={16} />
            Create workspace
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--ink)]">{workspace.name}</h2>
                  {workspace.description && (
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{workspace.description}</p>
                  )}
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--ink-faint)]">
                    {workspace.folders?.length ?? workspace._count?.folders ?? 0} folders
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEditWorkspace(workspace)}
                    className="rounded-lg p-2 text-[var(--ink-faint)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
                    aria-label={`Edit ${workspace.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWorkspace(workspace.id, workspace.name)}
                    className="rounded-lg p-2 text-[var(--ink-faint)] hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${workspace.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {(workspace.folders || []).map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between rounded-xl border border-[rgba(26,24,20,0.08)] bg-[var(--cream)] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen size={16} className="text-brand-600" />
                      <span className="text-sm font-semibold text-[var(--ink)]">{folder.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">
                        {folder._count?.documents ?? 0} docs
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFolder(folder.id, folder.name)}
                        className="text-[var(--ink-faint)] hover:text-red-600"
                        aria-label={`Delete folder ${folder.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => setFolderModal({ workspaceId: workspace.id, workspaceName: workspace.name })}
              >
                <Plus size={14} />
                Add folder
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={workspaceModal !== null}
        onClose={() => setWorkspaceModal(null)}
        title={workspaceModal === "create" ? "Create workspace" : "Edit workspace"}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setWorkspaceModal(null)}>Cancel</Button>
            <Button onClick={saveWorkspace} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="e.g. Q1 Contract Review" />
          <Input label="Description (optional)" value={workspaceDescription} onChange={(e) => setWorkspaceDescription(e.target.value)} placeholder="Short note for your team" />
        </div>
      </Modal>

      <Modal
        isOpen={folderModal !== null}
        onClose={() => setFolderModal(null)}
        title={folderModal ? `Add folder to ${folderModal.workspaceName}` : "Add folder"}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setFolderModal(null)}>Cancel</Button>
            <Button onClick={saveFolder} disabled={isSaving}>{isSaving ? "Saving..." : "Create folder"}</Button>
          </div>
        }
      >
        <Input label="Folder name" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. MSAs" />
      </Modal>
    </div>
  );
}
