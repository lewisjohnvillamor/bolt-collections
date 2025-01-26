'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import { Collection } from '@/types/collection';
import { ProductNode } from '@/types/product';

interface Rule {
  field: 'productType' | 'vendor' | 'tags' | 'priceRange';
  condition: 'is_equal_to' | 'is_not_equal_to' | 'is_greater_than' | 'is_less_than';
  value: string;
}

export default function EditCollectionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [collectionType, setCollectionType] = useState<'manual' | 'automated'>('manual');
  const [rules, setRules] = useState<Rule[]>([]);
  const [products, setProducts] = useState<ProductNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/collections/id/${id}`);
        const collection: Collection = response.data.collection;

        setTitle(collection.name);
        setDescription(collection.description || '');
        setSeoTitle(collection.seoTitle || '');
        setSeoDescription(collection.seoDescription || '');
        setIsVisible(collection.isVisible);
        
        // Handle rules if they exist
        if (collection.rules) {
          setCollectionType('automated');
          const formattedRules: Rule[] = [];
          const rules = collection.rules;

          if (rules.productType) {
            formattedRules.push({ field: 'productType', condition: 'is_equal_to', value: rules.productType });
          }
          if (rules.vendor) {
            formattedRules.push({ field: 'vendor', condition: 'is_equal_to', value: rules.vendor });
          }
          if (rules.tags) {
            rules.tags.forEach((tag: string) => {
              formattedRules.push({ field: 'tags', condition: 'is_equal_to', value: tag });
            });
          }
          if (rules.priceRange) {
            if (rules.priceRange.min) {
              formattedRules.push({ 
                field: 'priceRange', 
                condition: 'is_greater_than', 
                value: rules.priceRange.min.toString() 
              });
            }
            if (rules.priceRange.max) {
              formattedRules.push({ 
                field: 'priceRange', 
                condition: 'is_less_than', 
                value: rules.priceRange.max.toString() 
              });
            }
          }
          setRules(formattedRules);
        }

        // Fetch products if they exist
        if (collection.products && collection.products.length > 0) {
          const productsData = await Promise.all(
            collection.products.map(async (productGid) => {
              try {
                // Extract the numeric ID from the GID
                const productIdNumber = productGid.split('/').pop();
                console.log('Fetching product:', productIdNumber);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/${productIdNumber}`);
                console.log('Product data:', response.data);
                return response.data.product;
              } catch (error) {
                console.error(`Error fetching product ${productGid}:`, error);
                toast.error(`Failed to load product ${productGid}`);
                return null;
              }
            })
          );
          console.log('All products data:', productsData);
          setProducts(productsData.filter((p): p is ProductNode => p !== null));
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        toast.error('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

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

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/collections/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Collection updated successfully');
      router.push('/admin/collections');
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Collection</h1>
        <p className="text-muted-foreground">Update collection details</p>
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
              <h2 className="text-xl font-semibold mb-4">Products</h2>
              {products.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <p className="text-muted-foreground">No products in this collection</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      {product.images.edges[0]?.node ? (
                        <img
                          src={product.images.edges[0].node.url}
                          alt={product.images.edges[0].node.altText || product.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-2">{product.title}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Type:</span> {product.productType || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Vendor:</span> {product.vendor || 'N/A'}
                        </p>
                        {product.variants.edges[0]?.node && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Price:</span> $
                            {parseFloat(product.variants.edges[0].node.price).toFixed(2)}
                          </p>
                        )}
                        {product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{product.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="destructive" size="sm">Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline">Add Products</Button>
              </div>
              )}
            </Card>
    

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
        <Button onClick={handleSubmit}>Save Changes</Button>
      </div>
    </div>
  );
}