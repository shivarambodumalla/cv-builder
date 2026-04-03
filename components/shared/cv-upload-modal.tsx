"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";

interface CvUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 5 * 1024 * 1024;

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function CvUploadModal({ open, onOpenChange }: CvUploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setFile(null);
    setPastedText("");
    setTitle("");
    setError("");
    setDragOver(false);
  }, []);

  function validateFile(f: File): string | null {
    const ext = getExtension(f.name);
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(f.type)) {
      return "Only PDF, DOC, and DOCX files are supported";
    }
    if (f.size > MAX_SIZE) {
      return "File size must be under 5MB";
    }
    return null;
  }

  function handleFile(f: File) {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.(pdf|docx?|doc)$/i, ""));
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.set("title", title || "Untitled CV");

    if (tab === "upload") {
      if (!file) {
        setError("Select a file");
        setSubmitting(false);
        return;
      }
      formData.set("file", file);
    } else {
      if (!pastedText.trim()) {
        setError("Paste your CV text");
        setSubmitting(false);
        return;
      }
      formData.set("text", pastedText);
    }

    const res = await fetch("/api/cv/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    reset();
    onOpenChange(false);
    router.push(`/resume/${data.cv_id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (submitting) return;
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New CV</DialogTitle>
          <DialogDescription>Upload a file or paste your CV text.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cv-title">Title</Label>
            <Input
              id="cv-title"
              placeholder="e.g. Software Engineer CV"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>

          <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); }}>
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1" disabled={submitting}>
                Upload File
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex-1" disabled={submitting}>
                Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <div
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
                onClick={() => !submitting && fileInputRef.current?.click()}
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                {file ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{file.name}</p>
                    {!submitting && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setError("");
                        }}
                        className="rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to select
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, DOC, DOCX — max 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="paste">
              <Textarea
                placeholder="Paste your CV text here..."
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={submitting}
              />
            </TabsContent>
          </Tabs>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
              <p className="flex-1 text-sm text-destructive">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 rounded-full p-0.5 hover:bg-destructive/20"
              >
                <X className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Analysing..." : "Analyse CV"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
