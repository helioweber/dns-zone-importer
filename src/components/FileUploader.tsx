
import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseDnsZoneFile } from '@/utils/parser';

interface FileUploaderProps {
  onParsedData: (data: any) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onParsedData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const text = await file.text();
      const result = parseDnsZoneFile(text);
      
      setFile(file);
      setSuccess(true);
      onParsedData(result);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar o arquivo');
    } finally {
      setLoading(false);
      setIsDragging(false);
    }
  }, [onParsedData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  }, [processFile]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetFileUpload = () => {
    setFile(null);
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onParsedData(null);
  };

  return (
    <Card className={`p-6 transition-all ease-in-out duration-250 ${isDragging ? 'border-primary border-2' : ''} animate-scale-in`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-250 
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'} 
          hover:border-primary/40 hover:bg-primary/5
        `}
        onClick={file ? undefined : triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.zone"
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center space-y-3 py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Processando arquivo...</p>
          </div>
        ) : file && success ? (
          <div className="flex flex-col items-center space-y-3 py-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-lg">{file.name}</p>
              <p className="text-muted-foreground text-sm">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={resetFileUpload} className="mt-2">
              <X className="mr-2 h-4 w-4" />
              Remover
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3 py-8">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Arraste um arquivo ou clique para selecionar</p>
              <p className="text-muted-foreground text-sm mt-1">
                Suporta arquivos .txt e .zone
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium">Erro</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUploader;
