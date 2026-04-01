import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

const LowStockPage = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => productsApi.getLowStock().then(r => r.data),
  });

  const items = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-warning" />
          Low Stock Alerts
        </h1>
        <p className="text-muted-foreground">Products below their minimum threshold</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !items.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mb-2" />
              <p>All products are well stocked!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Threshold</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Deficit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{p.stock}</Badge>
                    </TableCell>
                    <TableCell>{p.minThreshold}</TableCell>
                    <TableCell>{p.category?.name || '—'}</TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {p.minThreshold - p.stock} units needed
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LowStockPage;
