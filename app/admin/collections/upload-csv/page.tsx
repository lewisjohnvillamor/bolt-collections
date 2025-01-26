'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import axios from 'axios';

export default function UploadCSVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/collections/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('CSV file uploaded successfully');
      router.push('/admin/collections');
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Products CSV</h1>
        <p className="text-muted-foreground">Upload a CSV file to bulk import products to collections</p>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-semibold text-gray-900">
                  {file ? file.name : 'Choose a CSV file'}
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">CSV up to 10MB</p>
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">CSV Format Requirements:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>First row must contain column headers</li>
              <li>Required columns: collection_id, product_id</li>
              <li>Optional columns: position</li>
              <li>Use comma (,) as delimiter</li>
              <li>UTF-8 encoding</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/collections')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}