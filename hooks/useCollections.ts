'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Collection } from '@/types/collection';

export default function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/collections`);
        if (response.data && Array.isArray(response.data.collections)) {
          setCollections(response.data.collections);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return { collections, loading, error };
}