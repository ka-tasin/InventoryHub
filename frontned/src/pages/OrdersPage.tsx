import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, productsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, XCircle, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
};

const OrdersPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll().then(r => r.data),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Order created' });
      setCreateOpen(false);
      setCustomerName('');
      setOrderItems([]);
    },
    onError: (err: any) => toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Order status updated' });
    },
    onError: (err: any) => toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Order cancelled' });
    },
    onError: (err: any) => toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' }),
  });

  const productList = Array.isArray(products) ? products : [];
  const allOrders = Array.isArray(orders) ? orders : [];
  const filtered = allOrders.filter((o: any) => {
    const matchesSearch = o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.orderNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addItem = () => setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setOrderItems(orderItems.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...orderItems];
    (updated[i] as any)[field] = value;
    if (field === 'productId') {
      const prod = productList.find((p: any) => p.id === value);
      if (prod) updated[i].unitPrice = Number(prod.price);
    }
    setOrderItems(updated);
  };

  const orderTotal = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const nextStatus: Record<string, string> = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'SHIPPED',
    SHIPPED: 'DELIVERED',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setCustomerName(''); setOrderItems([]); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Order</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Order</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2"><Label>Customer Name</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" /></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
                </div>
                {orderItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={item.productId} onValueChange={(v) => updateItem(i, 'productId', v)}>
                        <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                        <SelectContent>
                          {productList.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="number" min={1} className="w-20" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} />
                    <span className="text-sm text-muted-foreground w-20 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                {orderItems.length > 0 && (
                  <div className="text-right font-semibold pt-2 border-t">Total: ${orderTotal.toFixed(2)}</div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => createMut.mutate({ customerName, items: orderItems })} disabled={!customerName || !orderItems.length || createMut.isPending}>
                {createMut.isPending ? 'Creating...' : 'Create Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !filtered.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-2" /><p>No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.orderNumber || `#${o.id?.slice(0, 8)}`}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>{Number(o.totalPrice || 0).toFixed(2)}৳</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[o.status] || ''}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{o.createdAt ? format(new Date(o.createdAt), 'MMM d, yyyy') : '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog open={viewOrder?.id === o.id} onOpenChange={(open) => { if (!open) setViewOrder(null); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setViewOrder(o)}><Eye className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Order {o.orderNumber || `#${o.id?.slice(0, 8)}`}</DialogTitle></DialogHeader>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-muted-foreground">Customer:</span> {o.customerName}</div>
                                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusColors[o.status] || ''}>{o.status}</Badge></div>
                                <div><span className="text-muted-foreground">Total:</span> {Number(o.totalPrice || 0).toFixed(2)}৳</div>
                                <div><span className="text-muted-foreground">Date:</span> {o.createdAt ? format(new Date(o.createdAt), 'MMM d, yyyy') : '—'}</div>
                              </div>
                              {o.items?.length > 0 && (
                                <div>
                                  <Label className="text-sm">Items</Label>
                                  <div className="mt-1 space-y-1">
                                    {o.items.map((item: any, i: number) => (
                                      <div key={i} className="flex justify-between text-sm border rounded-md p-2">
                                        <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                                        <span>${(Number(item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {nextStatus[o.status] && (
                          <Button variant="outline" size="sm" onClick={() => updateStatusMut.mutate({ id: o.id, status: nextStatus[o.status] })}>
                            → {nextStatus[o.status]}
                          </Button>
                        )}
                        {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><XCircle className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Cancel Order</AlertDialogTitle><AlertDialogDescription>Cancel this order? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Keep</AlertDialogCancel><AlertDialogAction onClick={() => cancelMut.mutate(o.id)} className="bg-destructive text-destructive-foreground">Cancel Order</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
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

export default OrdersPage;
