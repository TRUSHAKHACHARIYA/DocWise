"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, LayoutGrid, List, FileText } from "lucide-react";
import UploadZone from "@/components/documents/UploadZone";
import DocumentCard from "@/components/documents/DocumentCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/useDocuments";

export default function DocumentsPage() {
  const { documents, loadDocuments, deleteDocument, deleteBulk, isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ids: string[] }>({
    isOpen: false,
    ids: []
  });

  useEffect(() => {
    loadDocuments();
  }, []);

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
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">Your Knowledge Base</h2>
          <p className="text-slate-500 font-medium mt-1">
            {isLoading ? "Fetching library..." : "Upload and manage the documents you want DocWise to know about."}
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
          <div className="flex items-center justify-between bg-brand-50 dark:bg-zinc-900 border border-brand-100 dark:border-brand-500/20 p-4 rounded-2xl animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg border border-brand-100 dark:border-brand-500/20 shadow-sm">
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
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search your documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-bold text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex border border-slate-200 dark:border-zinc-800 rounded-xl p-1 bg-slate-50 dark:bg-zinc-800">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === 'grid' ? "bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                )}
              >
                <List size={18} />
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all ml-auto sm:ml-0">
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
  );
}
