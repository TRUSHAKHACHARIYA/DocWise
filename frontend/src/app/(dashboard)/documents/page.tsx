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
  const { documents, loadDocuments, deleteDocument, isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteModal.id) {
      await deleteDocument(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
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
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search your documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-bold"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'list' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={18} />
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all ml-auto sm:ml-0">
            <Filter size={16} />
            Filter
          </button>
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
            <DocumentCard key={doc.id} document={doc} onDelete={handleDeleteClick} />
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
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Document?"
        description="This action cannot be undone. This document and all related vectors will be permanently removed from our servers."
        variant="danger"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false, id: null })}>
              Keep Document
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100" 
              onClick={confirmDelete}
            >
              Confirm Delete
            </Button>
          </div>
        }
      />
    </div>
  );
}
