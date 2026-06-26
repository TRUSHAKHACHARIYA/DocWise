"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Plus, LayoutGrid, List, FileText, Trash2, FolderOpen, FolderInput } from "lucide-react";
import UploadZone from "@/components/documents/UploadZone";
import DocumentCard from "@/components/documents/DocumentCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/useDocuments";
import { useFolders } from "@/hooks/useFolders";
import type { Folder } from "@/types/workspace";

type FolderFilter = "all" | "unfiled" | string;

export default function DocumentsPage() {
  const { documents, loadDocuments, deleteDocument, deleteBulk, moveDocumentsToFolder, isLoading } = useDocuments();
  const { folders, loadFolders } = useFolders();
  const [searchQuery, setSearchQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<FolderFilter>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ids: string[] }>({
    isOpen: false,
    ids: []
  });

  const reloadOptions = useMemo(() => {
    if (folderFilter === "unfiled") return { unfiled: true };
    if (folderFilter !== "all") return { folderId: folderFilter };
    return undefined;
  }, [folderFilter]);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    loadDocuments(true, reloadOptions);
  }, [folderFilter]);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredDocs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDocs.map(d => d.id));
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, ids: [id] });
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length > 0) {
      setDeleteModal({ isOpen: true, ids: selectedIds });
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.ids.length > 0) {
      if (deleteModal.ids.length === 1) {
        await deleteDocument(deleteModal.ids[0]);
      } else {
        await deleteBulk(deleteModal.ids);
        setSelectedIds([]);
      }
      setDeleteModal({ isOpen: false, ids: [] });
      await loadDocuments(false, reloadOptions);
    }
  };

  const confirmMove = async (folderId: string | null) => {
    await moveDocumentsToFolder(selectedIds, folderId, reloadOptions);
    setSelectedIds([]);
    setMoveModalOpen(false);
    await loadFolders();
  };

  const folderLabel = (filter: FolderFilter, list: Folder[]) => {
    if (filter === "all") return "All documents";
    if (filter === "unfiled") return "Unfiled";
    return list.find((f) => f.id === filter)?.name || "Folder";
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-6 rounded-[1.5rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[var(--ink-faint)]">Folders</p>
          <div className="space-y-1">
            {(["all", "unfiled"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFolderFilter(key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                  folderFilter === key
                    ? "bg-[var(--rust-light)] text-[var(--rust-dark)]"
                    : "text-[var(--ink-muted)] hover:bg-[var(--cream)]"
                )}
              >
                <FolderOpen size={16} />
                {key === "all" ? "All documents" : "Unfiled"}
              </button>
            ))}
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setFolderFilter(folder.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                  folderFilter === folder.id
                    ? "bg-[var(--rust-light)] text-[var(--rust-dark)]"
                    : "text-[var(--ink-muted)] hover:bg-[var(--cream)]"
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <FolderOpen size={16} />
                  {folder.name}
                </span>
                <span className="text-[10px] font-bold text-[var(--ink-faint)]">{folder._count?.documents ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">Your Knowledge Base</h2>
          <p className="text-slate-500 font-medium mt-1">
            {isLoading ? "Fetching library..." : `${folderLabel(folderFilter, folders)} — upload and organize your knowledge base.`}
          </p>
        </div>
        <Button 
          onClick={() => setShowUpload(!showUpload)} 
          className="gap-2 shadow-lg shadow-brand-200"
          size="lg"
        >
          <Plus size={20} />
          {showUpload ? "Collapse Upload" : "Add Documents"}
        </Button>
      </div>

      {/* Upload Zone (Expandable) */}
      {showUpload && (
        <div className="animate-slide-up">
          <UploadZone />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        {selectedIds.length > 0 && (
          <div className="animate-slide-up flex items-center justify-between rounded-2xl border border-[rgba(194,91,58,0.16)] bg-[var(--cream)] p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-[rgba(194,91,58,0.16)] bg-[var(--warm-white)] px-3 py-1 text-sm font-black uppercase tracking-widest text-[var(--rust-dark)] shadow-sm">
                {selectedIds.length} Selected
              </span>
              <button 
                onClick={selectAll}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors"
              >
                {selectedIds.length === filteredDocs.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleBulkDeleteClick}
              className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
              size="sm"
            >
              <Trash2 size={16} />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              onClick={() => setMoveModalOpen(true)}
              className="gap-2"
              size="sm"
            >
              <FolderInput size={16} />
              Move to folder
            </Button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-3 shadow-sm transition-colors duration-300 sm:flex-row">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" size={18} />
            <input 
              type="text"
              placeholder="Search your documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[rgba(194,91,58,0.12)] bg-[var(--cream)] px-4 py-2 pl-10 text-sm font-bold text-[var(--ink)] outline-none transition-all focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex rounded-xl border border-[rgba(26,24,20,0.10)] bg-[var(--cream)] p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === 'grid' ? "bg-[var(--warm-white)] text-[var(--rust-dark)] shadow-sm" : "text-[var(--ink-faint)] hover:text-[var(--ink-muted)]"
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-[var(--warm-white)] text-[var(--rust-dark)] shadow-sm" : "text-[var(--ink-faint)] hover:text-[var(--ink-muted)]"
                )}
              >
                <List size={18} />
              </button>
            </div>
            
            <button className="ml-auto flex items-center gap-2 rounded-xl border border-[rgba(26,24,20,0.10)] px-4 py-2 text-sm font-bold text-[var(--ink-muted)] transition-all hover:bg-[var(--cream)] sm:ml-0">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && documents.length === 0 ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className={cn("rounded-[2rem]", viewMode === 'grid' ? "aspect-square" : "h-20 w-full")} />
          ))}
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {filteredDocs.map((doc) => (
            <DocumentCard 
              key={doc.id} 
              document={doc} 
              onDelete={handleDeleteClick}
              isSelected={selectedIds.includes(doc.id)}
              onSelect={toggleSelection}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center group hover:border-brand-300 transition-colors">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 group-hover:bg-brand-50 group-hover:text-brand-300 transition-colors">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            {searchQuery ? "No matching files" : "Build your knowledge"}
          </h3>
          <p className="text-slate-500 font-medium max-w-xs mb-8 uppercase text-[10px] tracking-widest leading-relaxed">
            {searchQuery 
              ? `We couldn't find anything matching "${searchQuery}" in your current library.`
              : "Upload documents to start chatting with your private AI knowledge base."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowUpload(true)} className="gap-2 shadow-xl shadow-brand-100">
              <Plus size={18} />
              Upload Document
            </Button>
          )}
        </div>
      )}

      <Modal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title={`Move ${selectedIds.length} document(s)`}
        description="Choose a folder or move to unfiled."
        footer={
          <Button variant="secondary" onClick={() => setMoveModalOpen(false)}>Cancel</Button>
        }
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => confirmMove(null)}
            className="flex w-full items-center gap-2 rounded-xl border border-[rgba(26,24,20,0.10)] px-4 py-3 text-sm font-semibold hover:bg-[var(--cream)]"
          >
            <FolderOpen size={16} />
            Unfiled
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => confirmMove(folder.id)}
              className="flex w-full items-center gap-2 rounded-xl border border-[rgba(26,24,20,0.10)] px-4 py-3 text-sm font-semibold hover:bg-[var(--cream)]"
            >
              <FolderOpen size={16} />
              {folder.name}
            </button>
          ))}
          {folders.length === 0 && (
            <p className="text-sm text-[var(--ink-muted)]">Create folders in Workspaces first.</p>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, ids: [] })}
        title={deleteModal.ids.length > 1 ? `Delete ${deleteModal.ids.length} Documents?` : "Delete Document?"}
        description={deleteModal.ids.length > 1 
          ? `You are about to delete ${deleteModal.ids.length} documents. This action cannot be undone and will remove all associated AI context.` 
          : "This action cannot be undone. This document and all related vectors will be permanently removed from our servers."
        }
        variant="danger"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false, ids: [] })}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100" 
              onClick={confirmDelete}
            >
              Confirm {deleteModal.ids.length > 1 ? "Bulk Delete" : "Delete"}
            </Button>
          </div>
        }
      />
      </div>
    </div>
  );
}
