import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restockApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Trash2, Package } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
};

const RestockPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [restockItem, setRestockItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const { data: queue, isLoading } = useQuery({
    queryKey: ['restock-queue'],
    queryFn: () => restockApi.getQueue().then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['restock-stats'],
    queryFn: () => restockApi.getStats().then(r => r.data),
  });

  const restockMut = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { quantity: number; notes?: string } }) => restockApi.restock(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-queue'] });
      queryClient.invalidateQueries({ queryKey: ['restock-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product restocked' });
      setRestockItem(null);
      setQuantity('');
      setNotes('');
    },
    onError: (err: any) => toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }),
  });

  const removeMut = useMutation({
    mutationFn: (productId: string) => restockApi.removeFromQueue(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-queue'] });
      queryClient.invalidateQueries({ queryKey: ['restock-stats'] });
      toast({ title: 'Removed from queue' });
    },
    onError: (err: any) => toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }),
  });

  const items = Array.isArray(queue) ? queue : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restock Queue</h1>
        <p className="text-muted-foreground">Manage product restocking priorities</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.totalInQueue ?? 0}</div><p className="text-xs text-muted-foreground">Total in Queue</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-destructive">{stats.highPriority ?? 0}</div><p className="text-xs text-muted-foreground">High Priority</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-warning">{stats.mediumPriority ?? 0}</div><p className="text-xs text-muted-foreground">Medium Priority</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-success">{stats.lowPriority ?? 0}</div><p className="text-xs text-muted-foreground">Low Priority</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !items.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mb-2" /><p>Restock queue is empty</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => {
                  const product = item.product || item;
                  const productId = product.id || item.productId;
                  return (
                    <TableRow key={productId}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.stock ?? item.stock ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColors[item.priority] || ''}>{item.priority || 'MEDIUM'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog open={restockItem?.productId === productId || restockItem?.id === productId} onOpenChange={(o) => { if (!o) { setRestockItem(null); setQuantity(''); setNotes(''); } }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setRestockItem(item)}>
                                <RefreshCw className="h-3 w-3 mr-1" />Restock
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Restock {product.name}</DialogTitle></DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2"><Label>Quantity</Label><Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" /></div>
                                <div className="space-y-2"><Label>Notes (optional)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Restock notes" /></div>
                                <DialogFooter>
                                  <Button onClick={() => restockMut.mutate({ productId, data: { quantity: parseInt(quantity), notes: notes || undefined } })} disabled={!quantity || restockMut.isPending}>
                                    {restockMut.isPending ? 'Restocking...' : 'Confirm Restock'}
                                  </Button>
                                </DialogFooter>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Remove from Queue</AlertDialogTitle><AlertDialogDescription>Remove this product from the restock queue?</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeMut.mutate(productId)} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RestockPage;
