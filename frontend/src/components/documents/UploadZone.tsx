"use client";

import { useState, useRef } from "react";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/useDocuments";

interface UploadZoneProps {
  onUpload?: (files: File[]) => void;
}

export default function UploadZone({ onUpload }: UploadZoneProps) {
  const { uploadDocument } = useDocuments();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<{ file: File; progress: number; status: 'uploading' | 'complete' | 'error' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (newFiles: File[]) => {
    // Validate file types (PDF, DOCX, TXT)
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", `${file.name} is not supported. Use PDF, DOCX, or TXT.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File too large", `${file.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Track new files in UI
    const newEntries = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setFiles(prev => [...newEntries, ...prev]);

    // Upload each file
    for (const file of validFiles) {
      try {
        // Simplified progress emulation because axios.post in hook doesn't expose it yet
        // In a real scenario, we'd pass a callback to useDocuments
        await uploadDocument(file);
        
        setFiles(current => 
          current.map(f => f.file === file ? { ...f, progress: 100, status: 'complete' } : f)
        );
      } catch (err) {
        setFiles(current => 
          current.map(f => f.file === file ? { ...f, status: 'error' } : f)
        );
      }
    }

    if (onUpload) onUpload(validFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group overflow-hidden",
          isDragging 
            ? "border-brand-500 bg-brand-50/50 scale-[0.99]" 
            : "border-slate-200 bg-white hover:border-brand-400 hover:bg-slate-50/50"
        )}
      >
        {/* Animated Background Elements */}
        {isDragging && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        <div className={cn(
          "w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 transition-all group-hover:scale-110 group-hover:bg-brand-100 group-hover:text-brand-600",
          isDragging && "scale-110 bg-brand-100 text-brand-600"
        )}>
          <Upload size={32} />
        </div>

        <div className="text-center relative z-10">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {isDragging ? "Drop your files here" : "Click or drag to upload"}
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Support PDF, DOCX, and TXT (Max 10MB)
          </p>
        </div>
      </div>

      {/* Progress List */}
      {files.length > 0 && (
        <div className="grid gap-3">
          {files.map((item, index) => (
            <div 
              key={`${item.file.name}-${index}`}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 animate-slide-up shadow-sm"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                item.status === 'complete' ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-600"
              )}>
                <File size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-slate-900 truncate pr-4">{item.file.name}</p>
                  <span className="text-xs font-bold text-slate-500">
                    {item.status === 'uploading' ? `${Math.round(item.progress)}%` : item.status}
                  </span>
                </div>
                
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      item.status === 'complete' ? "bg-emerald-500" : "bg-brand-500"
                    )}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                {item.status === 'complete' ? (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : item.status === 'error' ? (
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                ) : null}
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
