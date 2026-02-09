'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: Accept;
  maxFiles?: number;
}

export function FileUploader({
  onFilesSelected,
  acceptedFileTypes = {},
  maxFiles = 1,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
        'border-muted-foreground/30 hover:border-primary/50',
        (isDragActive || isDragging) && 'border-primary bg-primary/10'
      )}
    >
      <input {...getInputProps()} ref={inputRef} />
      <div className="text-center">
        <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="mt-4 font-semibold text-foreground">
          {isDragActive ? 'Drop the file here ...' : 'Drag & drop file here, or click to select'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
            Supported formats: {Object.values(acceptedFileTypes).flat().join(', ')}
        </p>
      </div>
    </div>
  );
}
