'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface Rule {
  field: 'productType' | 'vendor' | 'tags' | 'priceRange';
  condition: 'is_equal_to' | 'is_not_equal_to' | 'is_greater_than' | 'is_less_than';
  value: string;
}

export default function CreateCollectionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [collectionType, setCollectionType] = useState<'manual' | 'automated'>('manual');
  const [rules, setRules] = useState<Rule[]>([{ field: 'productType', condition: 'is_equal_to', value: '' }]);
  const router = useRouter();

  const addRule = () => {
    setRules([...rules, { field: 'productType', condition: 'is_equal_to', value: '' }]);
  };

  const updateRule = (index: number, key: keyof Rule, value: string) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [key]: value };
    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim()) {
        toast.error('Title is required');
        return;
      }

      const formData = new FormData();
      formData.append('name', title);
      formData.append('description', description);
      formData.append('seoTitle', seoTitle);
      formData.append('seoDescription', seoDescription);
      formData.append('isVisible', String(isVisible));
      formData.append('collectionType', collectionType);
      
      if (collectionType === 'automated') {
        formData.append('rules', JSON.stringify(rules));
      }
      
      if (image) {
        formData.append('image', image);
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/collections`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Collection created successfully');
      router.push('/admin/collections');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Collection</h1>
        <p className="text-muted-foreground">Create a new product collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Collection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your collection"
                  rows={4}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Collection Type</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="manual"
                  checked={collectionType === 'manual'}
                  onChange={() => setCollectionType('manual')}
                  className="h-4 w-4"
                />
                <label htmlFor="manual">Manual - Add products one by one</label>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="automated"
                  checked={collectionType === 'automated'}
                  onChange={() => setCollectionType('automated')}
                  className="h-4 w-4"
                />
                <label htmlFor="automated">Automated - Based on conditions</label>
              </div>
            </div>
          </Card>

          {collectionType === 'automated' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Conditions</h2>
              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(index, 'field', e.target.value as Rule['field'])}
                      className="flex-1 rounded-md border p-2"
                    >
                      <option value="productType">Product Type</option>
                      <option value="vendor">Vendor</option>
                      <option value="tags">Tags</option>
                      <option value="priceRange">Price Range</option>
                    </select>
                    <select
                      value={rule.condition}
                      onChange={(e) => updateRule(index, 'condition', e.target.value as Rule['condition'])}
                      className="flex-1 rounded-md border p-2"
                    >
                      <option value="is_equal_to">is equal to</option>
                      <option value="is_not_equal_to">is not equal to</option>
                      <option value="is_greater_than">is greater than</option>
                      <option value="is_less_than">is less than</option>
                    </select>
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRule(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button onClick={addRule} variant="outline">
                  Add Condition
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SEO Title</label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SEO Description</label>
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="SEO Description"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Visibility</h2>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="visibility"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="visibility">Visible on website</label>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Collection Image</h2>
            <ImageUpload setImage={setImage} />
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.push('/admin/collections')}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Collection</Button>
      </div>
    </div>
  );
}