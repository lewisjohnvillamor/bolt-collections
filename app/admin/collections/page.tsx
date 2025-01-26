'use client';

import { CollectionsTable } from '@/components/admin/collections/CollectionsTable';
import { Card } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';

export default function CollectionsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Collections</h1>
        <p className="text-muted-foreground">Manage your product collections</p>
      </div>
      <Card>
        <CollectionsTable />
      </Card>
      <Toaster />
    </div>
  );
}