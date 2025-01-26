'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Upload, Download, Plus, Filter, Search, ArrowUpDown, FileUp, Loader2 } from 'lucide-react';
import { Collection } from '@/types/collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function CollectionsTable() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [collectionsData, setCollectionsData] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleExportCSV = async () => {
    try {
      toast.loading('Exporting collections...');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/download/collections/export-csv`,
        {
          responseType: 'blob',
          timeout: 30000, // 30 second timeout
          headers: {
            Accept: 'text/csv',
          },
        }
      );
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'collections.csv');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Collections exported successfully');
    } catch (error) {
      console.error('Error exporting collections:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          toast.error('Export timed out. Please try again.');
        } else if (error.response?.status === 404) {
          toast.error('Export endpoint not found');
        } else if (error.response?.status === 500) {
          toast.error('Server error while exporting. Please try again later.');
        } else {
          toast.error(`Failed to export collections: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred while exporting');
      }
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setImportFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setImporting(true);
      setImportProgress(0);
      const formData = new FormData();
      formData.append('file', importFile);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/collections/import/bulk-upsert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data; boundary=' + Math.random().toString().substr(2),
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setImportProgress(progress);
        },
      });

      toast.success('Collections imported successfully');
      setIsImportModalOpen(false);
      setImportFile(null);
      // Refresh the collections list
      fetchCollections();
    } catch (error) {
      console.error('Error importing collections:', error);
      toast.error('Failed to import collections');
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setCsvFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', csvFile);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/collections/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data; boundary=' + Math.random().toString().substr(2),
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success('CSV file uploaded successfully');
      setIsUploadModalOpen(false);
      setCsvFile(null);
      // Refresh the collections list
      fetchCollections();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV file');
    } finally {
      setUploading(false);
    }
  };
  const [totalCollections, setTotalCollections] = useState<number | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/collections`, {
          params: { search: searchTerm },
        });
        
        if (response.data && Array.isArray(response.data.collections)) {
          setCollectionsData(response.data.collections);
          setTotalCollections(response.data.totalCollections || response.data.collections.length);
        } else {
          console.error('Invalid response format:', response.data);
          toast.error('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
        toast.error('Failed to load collections. Please try again later.');
        setError('Failed to load collections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [searchTerm]);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {totalCollections?.toLocaleString()} {totalCollections === 1 ? 'collection' : 'collections'}
          </span>
          <div className="relative flex-1 max-w-lg">
            <Input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
          >
            <FileUp className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Product CSV
          </Button>
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Collections CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to bulk import or update collections
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="import-file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-semibold text-gray-900">
                        {importFile ? importFile.name : 'Choose a CSV file'}
                      </span>
                      <input
                        id="import-file-upload"
                        name="import-file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={handleImportFile}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">CSV up to 10MB</p>
                  </div>
                  {importFile && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-500">{importFile.name}</span>
                      <button
                        onClick={() => setImportFile(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {importing && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="font-medium">{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground text-center">
                      Please wait while your file is being processed...
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">CSV Format Requirements:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>First row must contain column headers</li>
                    <li>Required columns: name, description, isVisible</li>
                    <li>Optional columns: seoTitle, seoDescription, sortOrder</li>
                    <li>Use comma (,) as delimiter</li>
                    <li>UTF-8 encoding</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsImportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className="min-w-[100px]"
                  >
                    {importing ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Importing...</span>
                      </div>
                    ) : (
                      'Import CSV'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/admin/collections/new" passHref>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create collection
            </Button>
          </Link>

          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Products CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to bulk import products to collections
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-semibold text-gray-900">
                        {csvFile ? csvFile.name : 'Choose a CSV file'}
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
                  {csvFile && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-500">{csvFile.name}</span>
                      <button
                        onClick={() => setCsvFile(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground text-center">
                      Please wait while your file is being processed...
                    </p>
                  </div>
                )}

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
                    onClick={() => setIsUploadModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!csvFile || uploading}
                    className="min-w-[100px]"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      'Upload CSV'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              {['Title', 'Products', 'Visibility', 'Sort Order', 'SEO Title', 'Created At'].map((header) => (
                <th key={header} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  {header}
                  <ArrowUpDown className="inline-block w-4 h-4 ml-1" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-4">
                    <Skeleton className="h-4 w-4" />
                  </td>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              collectionsData.map((collection) => (
                <tr key={collection.id} className="border-b">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="p-4">
                    <Link 
                      href={`/admin/collections/${collection._id}`}
                      className="font-medium hover:underline"
                    >
                      {collection.name}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {collection.products.length}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      collection.isVisible 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {collection.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {collection.sortOrder}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {collection.seoTitle}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}